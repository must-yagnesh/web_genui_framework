#!/usr/bin/env python3
"""
Web-Controlled Gen UI App Framework - Real-Time Sync Bridge Server
Zero external dependencies (uses Python standard library).
Provides:
- Static asset serving for Web Control Dashboard
- REST API for updating and querying active UI schema
- Server-Sent Events (SSE) stream for instant (<100ms) live updates to Android/Flutter devices
- Telemetry endpoint for client health & crash-prevention reporting
"""

import os
import sys
import json
import time
import socket
import threading
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# Global State
SERVER_PORT = 8080
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DASHBOARD_DIR = os.path.join(BASE_DIR, "web_dashboard")

# Active Schema State
current_schema_lock = threading.Lock()
schema_version = 1
active_schema = {
    "version": schema_version,
    "timestamp": int(time.time()),
    "screen_id": "home_feed",
    "theme": {
        "primary_color": "#4F46E5",
        "background_color": "#0F172A",
        "surface_color": "#1E293B",
        "text_primary": "#F8FAFC",
        "text_secondary": "#94A3B8",
        "accent_color": "#10B981"
    },
    "header": {
        "title": "Crypto & Multi-Asset Hub",
        "subtitle": "Live Web-Controlled Dynamic View",
        "show_back_button": False,
        "action_icon": "notifications"
    },
    "components": [
        {
            "id": "promo_banner_1",
            "type": "banner",
            "title": "Instant Web-to-App Sync Active",
            "message": "Change properties on the Web Dashboard and click Apply to update this screen in real-time.",
            "badge": "LIVE SYNC",
            "style": "gradient",
            "color": "#4F46E5"
        },
        {
            "id": "metric_grid_1",
            "type": "metric_row",
            "metrics": [
                {
                    "label": "Total Balance",
                    "value": "$48,920.45",
                    "change": "+8.4%",
                    "is_positive": True
                },
                {
                    "label": "24h Rewards",
                    "value": "+$142.10",
                    "change": "+3.1%",
                    "is_positive": True
                }
            ]
        },
        {
            "id": "card_feature_1",
            "type": "card",
            "title": "High Yield Staking Tier",
            "description": "Earn up to 14.2% APY with multi-chain auto-compound. Protected by GenUI Guard.",
            "badge": "POPULAR",
            "action_text": "Deposit Now",
            "action_id": "action_deposit"
        },
        {
            "id": "action_primary_1",
            "type": "button",
            "text": "Explore All Vaults",
            "variant": "primary",
            "action_id": "action_explore"
        }
    ]
}

# Connected SSE Clients (thread-safe queue/writers)
sse_clients = []
sse_lock = threading.Lock()

# Telemetry Log
telemetry_events = []
telemetry_lock = threading.Lock()

def get_local_ip():
    """Retrieve local LAN IP so real Android devices on WiFi can connect easily."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def broadcast_schema_update(new_schema):
    """Push the newly applied schema to all connected SSE clients."""
    global schema_version, active_schema
    with current_schema_lock:
        schema_version += 1
        new_schema["version"] = schema_version
        new_schema["timestamp"] = int(time.time())
        active_schema = new_schema

    payload_str = f"event: schema_update\ndata: {json.dumps(active_schema)}\n\n"
    payload_bytes = payload_str.encode("utf-8")

    with sse_lock:
        dead_clients = []
        for client_wfile in sse_clients:
            try:
                client_wfile.write(payload_bytes)
                client_wfile.flush()
            except Exception:
                dead_clients.append(client_wfile)
        for dead in dead_clients:
            sse_clients.remove(dead)
        print(f"[SyncServer] Broadcasted v{schema_version} to {len(sse_clients)} client(s).")


class GenUiSyncHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DASHBOARD_DIR, **kwargs)

    def end_headers(self):
        # Enable CORS for local testing and cross-origin Web & Emulator connections
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Cache-Control")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/status":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            with sse_lock:
                active_subs = len(sse_clients)
            status = {
                "status": "online",
                "version": schema_version,
                "subscribers": active_subs,
                "local_ip": get_local_ip(),
                "android_emulator_url": "http://10.0.2.2:8080",
                "timestamp": int(time.time())
            }
            self.wfile.write(json.dumps(status).encode("utf-8"))
            return

        elif path == "/api/schema/current":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Cache-Control", "no-cache")
            self.end_headers()
            with current_schema_lock:
                data = json.dumps(active_schema)
            self.wfile.write(data.encode("utf-8"))
            return

        elif path == "/api/stream":
            # Server-Sent Events (SSE) real-time streaming endpoint
            self.send_response(200)
            self.send_header("Content-Type", "text/event-stream")
            self.send_header("Cache-Control", "no-cache")
            self.send_header("Connection", "keep-alive")
            self.end_headers()

            # Send initial current schema immediately
            with current_schema_lock:
                initial_msg = f"event: schema_update\ndata: {json.dumps(active_schema)}\n\n"
            try:
                self.wfile.write(initial_msg.encode("utf-8"))
                self.wfile.flush()
            except Exception:
                return

            # Register client connection
            with sse_lock:
                sse_clients.append(self.wfile)
                print(f"[SyncServer] New SSE subscriber connected. Total: {len(sse_clients)}")

            # Keep connection alive with periodic heartbeats
            try:
                while True:
                    time.sleep(15)
                    heartbeat = f": heartbeat {int(time.time())}\n\n"
                    self.wfile.write(heartbeat.encode("utf-8"))
                    self.wfile.flush()
            except (ConnectionResetError, BrokenPipeError):
                pass
            finally:
                with sse_lock:
                    if self.wfile in sse_clients:
                        sse_clients.remove(self.wfile)
                print(f"[SyncServer] SSE subscriber disconnected. Total: {len(sse_clients)}")
            return

        elif path == "/api/telemetry":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            with telemetry_lock:
                data = json.dumps(telemetry_events[-50:])
            self.wfile.write(data.encode("utf-8"))
            return

        # Serve Web Control Dashboard files by default
        return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/schema/apply":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            try:
                new_schema = json.loads(body)
            except Exception as e:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": f"Invalid JSON: {str(e)}"}).encode("utf-8"))
                return

            broadcast_schema_update(new_schema)

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            resp = {
                "success": True,
                "version": schema_version,
                "timestamp": int(time.time()),
                "message": "Schema successfully broadcasted to all connected clients."
            }
            self.wfile.write(json.dumps(resp).encode("utf-8"))
            return

        elif path == "/api/telemetry":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            try:
                event = json.loads(body)
                event["server_timestamp"] = int(time.time())
                with telemetry_lock:
                    telemetry_events.append(event)
                    if len(telemetry_events) > 200:
                        telemetry_events.pop(0)
            except Exception as e:
                pass

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"logged": True}).encode("utf-8"))
            return

        self.send_response(404)
        self.end_headers()


def run_server(port=SERVER_PORT):
    local_ip = get_local_ip()
    server_address = ("", port)
    httpd = ThreadingHTTPServer(server_address, GenUiSyncHandler)
    print("=" * 70)
    print(f"🚀 Web-Controlled Gen UI Sync Server running on port {port}")
    print(f"👉 Web Control Dashboard: http://localhost:{port}/")
    print(f"👉 Local Machine (macOS):  http://localhost:{port}/api/stream")
    print(f"👉 Android Emulator URL:   http://10.0.2.2:{port}/api/stream")
    print(f"👉 Real Android Device:    http://{local_ip}:{port}/api/stream")
    print("=" * 70)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.server_close()

if __name__ == "__main__":
    port = SERVER_PORT
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass
    run_server(port)

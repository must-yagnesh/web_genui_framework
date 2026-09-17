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

# Active Screen & Multi-Screen Registry State
current_schema_lock = threading.Lock()
schema_version = 1
active_screen_id = "home"

# Initial state: only the current Home screen, as requested!
home_schema = {
    "version": schema_version,
    "timestamp": int(time.time()),
    "screen_id": "home",
    "screen_name": "Home Feed",
    "route": "/",
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
            "action_id": "action_explore",
            "custom_dart_code": "ScaffoldMessenger.of(context).showSnackBar(\n  SnackBar(\n    content: Text('Exploring all vaults!'),\n    backgroundColor: Color(0xFF4F46E5),\n  ),\n);"
        }
    ]
}

screens = {
    "home": home_schema
}
active_schema = home_schema

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

def broadcast_schema_update(new_schema, target_screen_id=None):
    """Push schema update and full screens bundle to all connected SSE clients."""
    global schema_version, active_schema, active_screen_id, screens
    with current_schema_lock:
        schema_version += 1
        new_schema["version"] = schema_version
        new_schema["timestamp"] = int(time.time())

        s_id = target_screen_id or new_schema.get("screen_id") or active_screen_id
        new_schema["screen_id"] = s_id
        screens[s_id] = new_schema

        if s_id == active_screen_id or s_id == "home":
            active_schema = new_schema

        bundle_payload = {
            "version": schema_version,
            "timestamp": int(time.time()),
            "active_screen_id": active_screen_id,
            "screens": screens
        }

    update_str = f"event: schema_update\ndata: {json.dumps(new_schema)}\n\n"
    bundle_str = f"event: screens_bundle\ndata: {json.dumps(bundle_payload)}\n\n"
    payload_bytes = (update_str + bundle_str).encode("utf-8")

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
        print(f"[SyncServer] Broadcasted v{schema_version} ({s_id}) to {len(sse_clients)} client(s).")


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
                "timestamp": int(time.time()),
                "screen_count": len(screens),
                "active_screen_id": active_screen_id
            }
            self.wfile.write(json.dumps(status).encode("utf-8"))
            return

        elif path == "/api/screens":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Cache-Control", "no-cache")
            self.end_headers()
            with current_schema_lock:
                screen_list = [
                    {
                        "id": sid,
                        "name": s.get("screen_name", s.get("header", {}).get("title", sid)),
                        "route": s.get("route", "/" if sid == "home" else f"/{sid}"),
                        "title": s.get("header", {}).get("title", sid),
                        "component_count": len(s.get("components", []))
                    }
                    for sid, s in screens.items()
                ]
                resp = {
                    "active_screen_id": active_screen_id,
                    "screens": screens,
                    "screen_list": screen_list
                }
                data = json.dumps(resp)
            self.wfile.write(data.encode("utf-8"))
            return

        elif path == "/api/schema/current":
            query = parse_qs(parsed.query)
            target = query.get("screen", [None])[0]

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Cache-Control", "no-cache")
            self.end_headers()

            with current_schema_lock:
                target_schema = None
                if target:
                    clean_target = target.strip()
                    if clean_target in screens:
                        target_schema = screens[clean_target]
                    else:
                        for s in screens.values():
                            if s.get("route") == clean_target:
                                target_schema = s
                                break
                if not target_schema:
                    target_schema = screens.get(active_screen_id, active_schema)
                data = json.dumps(target_schema)

            self.wfile.write(data.encode("utf-8"))
            return

        elif path == "/api/stream":
            # Server-Sent Events (SSE) real-time streaming endpoint
            self.send_response(200)
            self.send_header("Content-Type", "text/event-stream")
            self.send_header("Cache-Control", "no-cache")
            self.send_header("Connection", "keep-alive")
            self.end_headers()

            # Send initial screens bundle & active schema immediately
            with current_schema_lock:
                bundle_payload = {
                    "version": schema_version,
                    "timestamp": int(time.time()),
                    "active_screen_id": active_screen_id,
                    "screens": screens
                }
                initial_bundle = f"event: screens_bundle\ndata: {json.dumps(bundle_payload)}\n\n"
                initial_msg = f"event: schema_update\ndata: {json.dumps(active_schema)}\n\n"

            try:
                self.wfile.write((initial_bundle + initial_msg).encode("utf-8"))
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
        global active_screen_id
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/schema/apply":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            try:
                payload = json.loads(body)
            except Exception as e:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": f"Invalid JSON: {str(e)}"}).encode("utf-8"))
                return

            # Support direct schema or wrapped schema
            new_schema = payload.get("schema", payload)
            target_sid = payload.get("screen_id") or new_schema.get("screen_id") or active_screen_id
            new_schema["screen_id"] = target_sid

            broadcast_schema_update(new_schema, target_screen_id=target_sid)

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            resp = {
                "success": True,
                "screen_id": target_sid,
                "version": schema_version,
                "timestamp": int(time.time()),
                "message": f"Screen '{target_sid}' successfully updated and broadcasted."
            }
            self.wfile.write(json.dumps(resp).encode("utf-8"))
            return

        elif path == "/api/screens/create":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            try:
                data = json.loads(body)
            except Exception as e:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": f"Invalid JSON: {str(e)}"}).encode("utf-8"))
                return

            raw_name = data.get("name", "New Screen").strip()
            raw_id = data.get("id", "").strip().lower()
            if not raw_id:
                raw_id = "".join(c if c.isalnum() else "_" for c in raw_name.lower()).strip("_")
            if not raw_id:
                raw_id = f"screen_{int(time.time()) % 10000}"

            raw_route = data.get("route", "").strip()
            if not raw_route:
                raw_route = f"/{raw_id}"
            elif not raw_route.startswith("/"):
                raw_route = f"/{raw_route}"

            template = data.get("template", "form")

            # Create starter components based on selected template
            if template == "form":
                starter_components = [
                    {
                        "id": f"{raw_id}_banner",
                        "type": "banner",
                        "title": raw_name,
                        "message": "Enter your details below to submit.",
                        "style": "gradient",
                        "color": "#4F46E5"
                    },
                    {
                        "id": f"{raw_id}_input_name",
                        "type": "textfield",
                        "label": "Full Name",
                        "hint": "e.g. Alex Morgan",
                        "padding": 6
                    },
                    {
                        "id": f"{raw_id}_input_email",
                        "type": "textfield",
                        "label": "Email Address",
                        "hint": "alex@example.com",
                        "padding": 6
                    },
                    {
                        "id": f"{raw_id}_btn_submit",
                        "type": "button",
                        "text": "Submit Information",
                        "variant": "primary",
                        "custom_dart_code": f"final email = GenUiFormRegistry.instance.getValue('email');\nif (email.isEmpty || !email.contains('@')) {{\n  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Please enter a valid email!'), backgroundColor: Colors.red));\n  return;\n}}\nScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Successfully saved for \$email!'), backgroundColor: Colors.green));"
                    }
                ]
            elif template == "card" or template == "feed":
                starter_components = [
                    {
                        "id": f"{raw_id}_banner",
                        "type": "banner",
                        "title": raw_name,
                        "message": "Dynamic Generative Screen managed from Web Console.",
                        "badge": "DYNAMIC",
                        "color": "#10B981"
                    },
                    {
                        "id": f"{raw_id}_card_1",
                        "type": "card",
                        "title": "Feature Spotlight",
                        "description": "This screen was generated dynamically from the web console. Edit components in real-time.",
                        "action_text": "Learn More"
                    },
                    {
                        "id": f"{raw_id}_back_btn",
                        "type": "button",
                        "text": "Go Back",
                        "variant": "outline",
                        "custom_dart_code": "Navigator.pop(context);"
                    }
                ]
            elif template == "checkout":
                starter_components = [
                    {
                        "id": f"{raw_id}_summary_card",
                        "type": "card",
                        "title": "Order Summary",
                        "description": "Total Amount: $79.00 USD (Includes Free Shipping)",
                        "badge": "PENDING"
                    },
                    {
                        "id": f"{raw_id}_coupon",
                        "type": "textfield",
                        "label": "Promo / Coupon Code",
                        "hint": "e.g. SAVE20",
                        "padding": 6
                    },
                    {
                        "id": f"{raw_id}_btn_pay",
                        "type": "button",
                        "text": "Confirm & Pay ($79.00)",
                        "variant": "primary",
                        "custom_dart_code": "ScaffoldMessenger.of(context).showSnackBar(\n  SnackBar(content: Text('Payment Confirmed! Thank you.'), backgroundColor: Color(0xFF10B981)),\n);"
                    }
                ]
            else: # blank
                starter_components = [
                    {
                        "id": f"{raw_id}_card_intro",
                        "type": "card",
                        "title": raw_name,
                        "description": "Add new components from the Component Palette on the left.",
                        "action_text": "Edit in Web Console"
                    }
                ]

            new_screen = {
                "version": schema_version + 1,
                "timestamp": int(time.time()),
                "screen_id": raw_id,
                "screen_name": raw_name,
                "route": raw_route,
                "theme": {
                    "primary_color": "#4F46E5",
                    "background_color": "#0F172A",
                    "surface_color": "#1E293B",
                    "text_primary": "#F8FAFC",
                    "text_secondary": "#94A3B8",
                    "accent_color": "#10B981"
                },
                "header": {
                    "title": raw_name,
                    "subtitle": f"Route: {raw_route}",
                    "show_back_button": True,
                    "action_icon": "more_vert"
                },
                "components": starter_components
            }

            active_screen_id = raw_id
            broadcast_schema_update(new_screen, target_screen_id=raw_id)

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "screen": new_screen, "active_screen_id": raw_id}).encode("utf-8"))
            return

        elif path == "/api/screens/delete":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            try:
                data = json.loads(body)
            except Exception as e:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": f"Invalid JSON: {str(e)}"}).encode("utf-8"))
                return

            del_id = data.get("id")
            if not del_id or del_id == "home":
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Cannot delete default Home screen."}).encode("utf-8"))
                return

            with current_schema_lock:
                if del_id in screens:
                    del screens[del_id]
                if active_screen_id == del_id:
                    active_screen_id = "home"

            broadcast_schema_update(screens["home"], target_screen_id="home")

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "deleted_id": del_id, "active_screen_id": active_screen_id}).encode("utf-8"))
            return

        elif path == "/api/screens/switch":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            try:
                data = json.loads(body)
            except Exception:
                data = {}

            target_id = data.get("id")
            if target_id and target_id in screens:
                active_screen_id = target_id
                target_screen = screens[target_id]
                broadcast_schema_update(target_screen, target_screen_id=target_id)
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "active_screen_id": target_id, "screen": target_screen}).encode("utf-8"))
                return
            else:
                self.send_response(404)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": f"Screen '{target_id}' not found."}).encode("utf-8"))
                return
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

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
import urllib.request
import urllib.error
import ssl

# Ensure emoji in log output never crashes the server on cp1252 consoles (Windows)
for _stream in (sys.stdout, sys.stderr):
    if hasattr(_stream, "reconfigure"):
        try:
            _stream.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass

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
        },
        {
            "id": "btn_contact_us",
            "type": "button",
            "text": "📞 Contact Us",
            "variant": "outline",
            "action_id": "open_contact",
            "custom_dart_code": "Navigator.pushNamed(context, '/contact');"
        },
        {
            "id": "btn_feedback_review",
            "type": "button",
            "text": "⭐ Feedback & Review",
            "variant": "outline",
            "action_id": "open_feedback",
            "custom_dart_code": "Navigator.pushNamed(context, '/feedback');"
        }
    ]
}

# Contact Us screen: opened from the Home "Contact Us" button.
# The submit button carries a `success_dialog` so the app shows a confirmation
# dialog with a "Back to Home Screen" action after the submission is stored.
contact_schema = {
    "version": schema_version,
    "timestamp": int(time.time()),
    "screen_id": "contact",
    "screen_name": "Contact Us",
    "route": "/contact",
    "theme": {
        "primary_color": "#0284C7",
        "background_color": "#0F172A",
        "surface_color": "#1E293B",
        "text_primary": "#F8FAFC",
        "text_secondary": "#94A3B8",
        "accent_color": "#10B981"
    },
    "header": {
        "title": "Contact Us",
        "subtitle": "We usually reply within 24 hours",
        "show_back_button": True,
        "action_icon": "support_agent"
    },
    "components": [
        {"id": "contact_header", "type": "text", "text": "Get in touch", "font_size": 20, "is_bold": True, "align": "center", "padding": 6},
        {"id": "contact_sub", "type": "text", "text": "Tell us how we can help and our team will reach out.", "font_size": 13, "is_bold": False, "align": "center", "padding": 2},
        {
            "id": "contact_name",
            "type": "textfield",
            "label": "Full Name",
            "hint": "e.g. Alex Morgan",
            "padding": 6,
            "validation": {
                "required": True,
                "error_message": "Please enter your full name"
            }
        },
        {
            "id": "contact_email",
            "type": "textfield",
            "label": "Email Address",
            "hint": "alex@example.com",
            "padding": 6,
            "validation": {
                "required": True,
                "type": "email",
                "error_message": "Please enter a valid email address"
            }
        },
        {
            "id": "contact_phone",
            "type": "textfield",
            "label": "Phone Number",
            "hint": "+1 555 0100",
            "padding": 6
        },
        {
            "id": "contact_subject",
            "type": "textfield",
            "label": "Subject",
            "hint": "What is this about?",
            "padding": 6
        },
        {
            "id": "contact_message",
            "type": "textfield",
            "label": "Message",
            "hint": "Describe your request in detail...",
            "max_lines": 4,
            "padding": 6,
            "validation": {
                "required": True,
                "error_message": "Please describe your request"
            }
        },
        {
            "id": "contact_callback",
            "type": "switch",
            "label": "Request a callback",
            "subtitle": "We will phone you on the number above",
            "is_checked": False,
            "padding": 4
        },
        {
            "id": "btn_submit_contact",
            "type": "button",
            "text": "Submit Contact Request",
            "variant": "primary",
            "action_type": "api_call",
            "api_config": {
                "url": "/api/submissions",
                "method": "POST",
                "headers": {
                    "Content-Type": "application/json"
                },
                "body_mapping": {
                    "fullName": "contact_name",
                    "email": "contact_email",
                    "phone": "contact_phone",
                    "subject": "contact_subject",
                    "message": "contact_message",
                    "requestCallback": "contact_callback"
                },
                "static_body": {
                    "form_type": "contact_us",
                    "source": "mobile_app"
                },
                "validate_fields": ["contact_name", "contact_email", "contact_message"],
                "on_success": {
                    "type": "dialog",
                    "title": "Message Sent!",
                    "message": "Thank you for contacting us. Your request has been received and our support team will get back to you within 24 hours.",
                    "button_text": "Back to Home Screen",
                    "navigate_to": "/"
                },
                "on_error": {
                    "type": "snackbar",
                    "message": "Failed to send message. Please check connection."
                }
            }
        }
    ]
}

# Feedback & Review screen: opened from the Home "Feedback & Review" button.
feedback_schema = {
    "version": schema_version,
    "timestamp": int(time.time()),
    "screen_id": "feedback",
    "screen_name": "Feedback & Review",
    "route": "/feedback",
    "theme": {
        "primary_color": "#D97706",
        "background_color": "#0F172A",
        "surface_color": "#1E293B",
        "text_primary": "#F8FAFC",
        "text_secondary": "#94A3B8",
        "accent_color": "#10B981"
    },
    "header": {
        "title": "Customer Review & Feedback",
        "subtitle": "Dynamic Multi-Input Form",
        "show_back_button": True,
        "action_icon": "star"
    },
    "components": [
        {"id": "fb_header", "type": "text", "text": "How was your experience?", "font_size": 20, "is_bold": True, "align": "center", "padding": 6},
        {"id": "fb_sub", "type": "text", "text": "Your feedback helps us continuously improve", "font_size": 13, "is_bold": False, "align": "center", "padding": 2},
        {
            "id": "fb_rating_row",
            "type": "row",
            "main_axis_alignment": "spaceAround",
            "children": [
                {"id": "fb_chip_fair", "type": "chip", "label": "⭐ Fair", "is_selected": False},
                {"id": "fb_chip_good", "type": "chip", "label": "⭐⭐⭐ Good", "is_selected": False},
                {"id": "fb_chip_excellent", "type": "chip", "label": "⭐⭐⭐⭐⭐ Excellent", "is_selected": True}
            ]
        },
        {
            "id": "fb_author",
            "type": "textfield",
            "label": "Your Name or Handle",
            "hint": "e.g. Alex Morgan",
            "padding": 6,
            "validation": {
                "required": True,
                "error_message": "Please enter your name or handle"
            }
        },
        {
            "id": "fb_comments",
            "type": "textfield",
            "label": "Your Detailed Feedback",
            "hint": "What did you enjoy most, or what can we improve?",
            "max_lines": 3,
            "padding": 6,
            "validation": {
                "required": True,
                "error_message": "Please write your review comments"
            }
        },
        {"id": "fb_public", "type": "switch", "label": "Post as Public Review", "subtitle": "Allow displaying on community wall", "is_checked": True, "padding": 4},
        {
            "id": "btn_submit_feedback",
            "type": "button",
            "text": "Submit Customer Feedback",
            "variant": "primary",
            "action_type": "api_call",
            "api_config": {
                "url": "/api/submissions",
                "method": "POST",
                "headers": {
                    "Content-Type": "application/json"
                },
                "body_mapping": {
                    "author": "fb_author",
                    "comments": "fb_comments",
                    "isPublic": "fb_public"
                },
                "static_body": {
                    "form_type": "customer_feedback",
                    "source": "mobile_app"
                },
                "validate_fields": ["fb_author", "fb_comments"],
                "on_success": {
                    "type": "dialog",
                    "title": "Thanks for your feedback!",
                    "message": "Your review has been submitted successfully. We read every piece of feedback and use it to make the app better for everyone.",
                    "button_text": "Back to Home Screen",
                    "navigate_to": "/"
                }
            }
        }
    ]
}

super_save_dashboard_schema = {
    "version": schema_version,
    "timestamp": int(time.time()),
    "screen_id": "super_save_dashboard",
    "screen_name": "Super Save Dashboard",
    "route": "/super_save_dashboard",
    "theme": {
        "primary_color": "#10B981",
        "background_color": "#0F172A",
        "surface_color": "#1E293B",
        "text_primary": "#F8FAFC",
        "text_secondary": "#94A3B8",
        "accent_color": "#4F46E5"
    },
    "header": {
        "title": "Super Save Dynamic Campaign",
        "subtitle": "Live Web-Controlled Section",
        "show_back_button": False,
        "action_icon": "campaign"
    },
    "components": [
        {
            "id": "ss_promo_banner",
            "type": "banner",
            "title": "⚡ Live Web-Controlled Dynamic Card",
            "message": "This section is rendered dynamically from the Web Console without any static code in the mobile app.",
            "badge": "SUPER SAVE LIVE",
            "style": "gradient",
            "color": "#10B981"
        }
    ]
}

product_detail_schema = {
    "version": schema_version,
    "timestamp": int(time.time()),
    "screen_id": "product_detail",
    "screen_name": "Product Detail",
    "route": "/product-detail",
    "theme": {
        "primary_color": "#4F46E5",
        "background_color": "#0F172A",
        "surface_color": "#1E293B",
        "text_primary": "#F8FAFC",
        "text_secondary": "#94A3B8",
        "accent_color": "#10B981"
    },
    "header": {
        "title": "Product Detail",
        "subtitle": "Live Cloud Synchronized View",
        "show_back_button": True,
        "action_icon": "shopping_cart"
    },
    "data_source": {
        "url": "/api/mock/products/1",
        "method": "GET"
    },
    "components": [
        {
            "id": "p_img",
            "type": "image",
            "height": 190,
            "image_url": "{{thumbnail}}",
            "border_radius": 14
        },
        {
            "id": "p_title",
            "type": "text",
            "text": "{{title}}",
            "font_size": 20,
            "is_bold": True,
            "padding": 4
        },
        {
            "id": "p_price",
            "type": "text",
            "text": "${{price}} USD • Rating: {{rating}} ⭐",
            "font_size": 15,
            "color": "#10B981",
            "is_bold": True,
            "padding": 2
        },
        {
            "id": "p_desc",
            "type": "text",
            "text": "{{description}}",
            "font_size": 13,
            "color": "#94A3B8",
            "padding": 4
        },
        {
            "id": "p_features",
            "type": "list_view",
            "data_path": "features",
            "item_template": {
                "id": "p_item_feat",
                "type": "listtile",
                "title": "{{item.name}}",
                "subtitle": "{{item.detail}}",
                "leading_icon": "check"
            }
        },
        {
            "id": "p_buy_btn",
            "type": "button",
            "text": "Add to Cart (${{price}})",
            "action_type": "api_call",
            "api_config": {
                "url": "/api/submissions",
                "method": "POST",
                "body_mapping": {
                    "product": "title",
                    "amount": "price"
                },
                "on_success": {
                    "action": "dialog",
                    "title": "Added to Cart!",
                    "message": "Item was dynamically added via Cloud API."
                }
            }
        }
    ]
}

user_directory_schema = {
    "version": schema_version,
    "timestamp": int(time.time()),
    "screen_id": "user_directory",
    "screen_name": "User Listing",
    "route": "/users",
    "theme": {
        "primary_color": "#4F46E5",
        "background_color": "#0F172A",
        "surface_color": "#1E293B",
        "text_primary": "#F8FAFC",
        "text_secondary": "#94A3B8",
        "accent_color": "#10B981"
    },
    "header": {
        "title": "Team & User Directory",
        "subtitle": "Real-Time Cloud Feed",
        "show_back_button": True,
        "action_icon": "search"
    },
    "data_source": {
        "url": "/api/mock/users",
        "method": "GET",
        "pagination": {
            "mode": "page",
            "page_param": "page",
            "limit_param": "limit",
            "default_limit": 5,
            "data_path": "users"
        }
    },
    "components": [
        {
            "id": "u_banner",
            "type": "banner",
            "title": "Live User Directory",
            "message": "Loaded dynamically from Cloud API with infinite scroll pagination.",
            "badge": "PAGINATED",
            "color": "#4F46E5"
        },
        {
            "id": "u_list",
            "type": "list_view",
            "data_path": "users",
            "item_template": {
                "id": "u_tile",
                "type": "listtile",
                "title": "{{item.name}}",
                "subtitle": "{{item.email}}",
                "leading_image": "{{item.avatar}}",
                "leading_icon": "person",
                "trailing_text": "{{item.role}}",
                "action_id": "user_click"
            }
        },
        {
            "id": "u_add_btn",
            "type": "button",
            "text": "Submit Form / Action",
            "variant": "secondary",
            "action_id": "open_user_form"
        }
    ]
}

screens = {
    "home": home_schema,
    "super_save_dashboard": super_save_dashboard_schema,
    "contact": contact_schema,
    "feedback": feedback_schema,
    "product_detail": product_detail_schema,
    "user_directory": user_directory_schema
}
active_schema = home_schema

# Connected SSE Clients (thread-safe queue/writers)
sse_clients = []
sse_lock = threading.Lock()

# Telemetry Log
telemetry_events = []
telemetry_lock = threading.Lock()

# Form Submission Store (in-memory array of every submitted form)
# Populated by POST /api/submissions from the Flutter app and the Web Simulator.
# Viewed on the "Shows Submission" page: http://localhost:8080/submissions
submissions = []
submissions_lock = threading.Lock()
submission_counter = 0


def _normalize_fields(raw_fields):
    """Accept fields as a list of {id,label,value} or a {key: value} dict and
    always return a list of {id, label, value} entries."""
    normalized = []
    if isinstance(raw_fields, dict):
        for key, value in raw_fields.items():
            normalized.append({"id": str(key), "label": str(key), "value": value})
    elif isinstance(raw_fields, list):
        for item in raw_fields:
            if isinstance(item, dict):
                field_id = str(item.get("id") or item.get("label") or "field")
                normalized.append({
                    "id": field_id,
                    "label": str(item.get("label") or field_id),
                    "value": item.get("value", "")
                })
    return normalized


def store_submission(payload):
    """Append a submission record to the in-memory array and return it."""
    global submission_counter
    now = time.time()
    with submissions_lock:
        submission_counter += 1

        # Extract fields from payload: support nested fields, values, or top-level mapped keys
        raw_fields = payload.get("fields") or payload.get("values")
        if not raw_fields:
            meta_keys = {"source", "screen_id", "screen_title", "action_id", "timestamp", "version", "form_type"}
            raw_fields = {k: v for k, v in payload.items() if k not in meta_keys}

        record = {
            "id": submission_counter,
            "submitted_at": int(now),
            "submitted_at_iso": time.strftime("%Y-%m-%dT%H:%M:%S", time.localtime(now)),
            "screen_id": str(payload.get("screen_id") or "contact"),
            "screen_title": str(payload.get("screen_title") or payload.get("screen_id") or "Dynamic Form"),
            "action_id": str(payload.get("action_id") or "api_call"),
            "source": str(payload.get("source") or "flutter_app"),
            "fields": _normalize_fields(raw_fields),
        }
        submissions.append(record)
        total = len(submissions)
    print(f"[SyncServer] Stored submission #{record['id']} from {record['source']} ({record['screen_id']}). Total: {total}")
    return record, total

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
        # Dashboard assets are edited live; never let the browser serve a stale app.js / style.css.
        if not self.path.startswith("/api/"):
            self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
            self.send_header("Pragma", "no-cache")
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

        elif path == "/api/proxy":
            query = parse_qs(parsed.query)
            target_url = query.get("url", [None])[0]
            if not target_url:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Missing 'url' query parameter"}).encode("utf-8"))
                return

            try:
                clean_url = target_url.strip()
                if clean_url.startswith("/"):
                    clean_url = f"http://127.0.0.1:{SERVER_PORT}{clean_url}"

                req = urllib.request.Request(
                    clean_url,
                    headers={
                        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                        "Accept": "application/json, text/plain, */*"
                    }
                )
                ssl_ctx = ssl.create_default_context()
                ssl_ctx.check_hostname = False
                ssl_ctx.verify_mode = ssl.CERT_NONE
                with urllib.request.urlopen(req, timeout=15, context=ssl_ctx) as response:
                    content_type = response.headers.get("Content-Type", "application/json")
                    body = response.read()
                    self.send_response(response.status)
                    self.send_header("Content-Type", content_type)
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    self.wfile.write(body)
                    return
            except urllib.error.HTTPError as he:
                err_body = he.read() if hasattr(he, "read") else b""
                self.send_response(he.code)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                if err_body:
                    self.wfile.write(err_body)
                else:
                    self.wfile.write(json.dumps({"error": f"HTTP {he.code}: {he.reason}"}).encode("utf-8"))
                return
            except Exception as e:
                self.send_response(502)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({"error": f"Proxy request failed: {str(e)}"}).encode("utf-8"))
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

        elif path == "/api/submissions":
            # Return every stored form submission (newest first)
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Cache-Control", "no-cache")
            self.end_headers()
            with submissions_lock:
                resp = {
                    "total": len(submissions),
                    "timestamp": int(time.time()),
                    "submissions": list(reversed(submissions)),
                }
                data = json.dumps(resp)
            self.wfile.write(data.encode("utf-8"))
            return

        elif path == "/submissions" or path == "/submissions/":
            # Friendly route for the "Shows Submission" page
            self.path = "/submissions.html"
            return super().do_GET()

        elif path == "/api/mock/products/1" or path == "/api/mock/product":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            product = {
                "id": 1,
                "title": "iPhone 15 Pro Max",
                "description": "Titanium design, A17 Pro chip, customizable Action button, and 48MP main camera with 5x optical zoom.",
                "price": 1199.00,
                "currency": "USD",
                "rating": 4.9,
                "stock": 34,
                "brand": "Apple",
                "category": "Smartphones",
                "thumbnail": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80",
                "features": [
                    {"name": "Display", "detail": "6.7\" Super Retina XDR OLED 120Hz"},
                    {"name": "Processor", "detail": "Apple A17 Pro (3nm)"},
                    {"name": "Camera", "detail": "48MP Main + 12MP Ultra-wide + 12MP 5x Telephoto"},
                    {"name": "Battery", "detail": "4,422 mAh with 29W fast charging"}
                ]
            }
            self.wfile.write(json.dumps(product).encode("utf-8"))
            return

        elif path == "/api/mock/users":
            query = parse_qs(parsed.query)
            try:
                page = int(query.get("page", [1])[0])
            except Exception:
                page = 1
            try:
                limit = int(query.get("limit", [5])[0])
            except Exception:
                limit = 5

            all_users = [
                {"id": 1, "name": "Sarah Connor", "email": "sarah.connor@sky.net", "role": "Lead Security Engineer", "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80", "department": "Cyber Defense"},
                {"id": 2, "name": "Alex Mercer", "email": "alex.m@biotech.org", "role": "Principal Architect", "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80", "department": "Core Infrastructure"},
                {"id": 3, "name": "Elena Rostova", "email": "elena.r@quantum.ai", "role": "AI Research Scientist", "avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80", "department": "GenAI Systems"},
                {"id": 4, "name": "Marcus Vance", "email": "m.vance@fintech.io", "role": "VP of Mobile Engineering", "avatar": "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80", "department": "Product Delivery"},
                {"id": 5, "name": "Aria Chen", "email": "aria.chen@cloudpulse.dev", "role": "Staff Flutter Engineer", "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", "department": "Frontend Platform"},
                {"id": 6, "name": "David Kim", "email": "david.k@matrix.net", "role": "Site Reliability Engineer", "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", "department": "Cloud Operations"},
                {"id": 7, "name": "Maya Patel", "email": "maya.p@designlabs.co", "role": "Senior UI/UX Designer", "avatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80", "department": "Design Systems"},
                {"id": 8, "name": "James Wilson", "email": "j.wilson@devops.org", "role": "Security Compliance Officer", "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80", "department": "Governance"},
                {"id": 9, "name": "Chloe Bennett", "email": "chloe.b@solis.tech", "role": "Data Platform Architect", "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80", "department": "Big Data"},
                {"id": 10, "name": "Lucas Wright", "email": "lucas.w@apex.io", "role": "Lead Mobile QA Engineer", "avatar": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80", "department": "Quality Assurance"},
            ]
            start_idx = max(0, (page - 1) * limit)
            end_idx = start_idx + limit
            sliced = all_users[start_idx:end_idx]

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            resp = {
                "page": page,
                "limit": limit,
                "total": len(all_users),
                "has_more": end_idx < len(all_users),
                "users": sliced
            }
            self.wfile.write(json.dumps(resp).encode("utf-8"))
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
                        "padding": 6,
                        "validation": {
                            "required": True,
                            "error_message": "Full Name is required"
                        }
                    },
                    {
                        "id": f"{raw_id}_input_email",
                        "type": "textfield",
                        "label": "Email Address",
                        "hint": "alex@example.com",
                        "padding": 6,
                        "validation": {
                            "required": True,
                            "type": "email",
                            "error_message": "Please enter a valid email address"
                        }
                    },
                    {
                        "id": f"{raw_id}_btn_submit",
                        "type": "button",
                        "text": "Submit Information",
                        "variant": "primary",
                        "action_type": "api_call",
                        "api_config": {
                            "url": "/api/submissions",
                            "method": "POST",
                            "headers": {
                                "Content-Type": "application/json"
                            },
                            "body_mapping": {
                                "name": f"{raw_id}_input_name",
                                "email": f"{raw_id}_input_email"
                            },
                            "static_body": {
                                "screen_id": raw_id,
                                "screen_title": raw_name
                            },
                            "validate_fields": [f"{raw_id}_input_name", f"{raw_id}_input_email"],
                            "on_success": {
                                "type": "dialog",
                                "title": "Information Saved!",
                                "message": f"Details for {raw_name} have been submitted to cloud API.",
                                "button_text": "Back to Home Screen",
                                "navigate_to": "/"
                            }
                        }
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

        elif path == "/api/submissions":
            # Store a form submission from the Flutter app or Web Simulator
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8", errors="replace")
            try:
                payload = json.loads(body)
                if not isinstance(payload, dict):
                    raise ValueError("Submission body must be a JSON object")
            except Exception as e:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": f"Invalid JSON: {str(e)}"}).encode("utf-8"))
                return

            record, total = store_submission(payload)

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            resp = {
                "success": True,
                "id": record["id"],
                "total": total,
                "submission": record,
                "message": f"Submission #{record['id']} stored. View all at /submissions",
            }
            self.wfile.write(json.dumps(resp).encode("utf-8"))
            return

        elif path == "/api/submissions/clear":
            with submissions_lock:
                cleared = len(submissions)
                submissions.clear()
            print(f"[SyncServer] Cleared {cleared} stored submission(s).")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "cleared": cleared, "total": 0}).encode("utf-8"))
            return

        elif path == "/api/cloud-mock":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8", errors="replace")
            try:
                payload = json.loads(body)
            except Exception:
                payload = {"raw_body": body}

            if isinstance(payload, dict):
                payload.setdefault("screen_title", "External Cloud API Mock")
                payload.setdefault("action_id", "cloud_post")
                store_submission(payload)

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            resp = {
                "success": True,
                "status": "200_OK",
                "message": "Cloud API received payload successfully!",
                "timestamp": int(time.time()),
                "echo": payload
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
    print(f"👉 Shows Submission Page:  http://localhost:{port}/submissions")
    print(f"👉 Submissions API:        http://localhost:{port}/api/submissions")
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

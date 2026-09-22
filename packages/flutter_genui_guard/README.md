# flutter_genui_guard 🛡️

High-performance, fault-tolerant **Web-Controlled Generative UI (GenUI) Framework for Flutter**.

Enables dynamic UI generation, remote layout updates, reactive form submission, and safe action execution directly from a web control console—with a **0% runtime crash guarantee**.

---

## 🚀 Quick Start & Installation

You can add `flutter_genui_guard` to **any real Flutter project** using one of three ways:

### Option 1: Git Dependency (Recommended for teams)
Add to your project's `pubspec.yaml`:
```yaml
dependencies:
  flutter:
    sdk: flutter
  flutter_genui_guard:
    git:
      url: https://github.com/your-org/web_genui_framework.git
      path: packages/flutter_genui_guard
```

### Option 2: Local Path Dependency (Monorepo)
```yaml
dependencies:
  flutter:
    sdk: flutter
  flutter_genui_guard:
    path: ../web_genui_framework/packages/flutter_genui_guard
```

### Option 3: Direct Vendor Copy
Copy the `packages/flutter_genui_guard` folder directly into your app (e.g. at `package/flutter_genui_guard`):
```yaml
dependencies:
  flutter_genui_guard:
    path: package/flutter_genui_guard
```

Then run:
```bash
flutter pub get
```

---

## 📖 Usage Guide

### 1. Drop-in Dynamic Section (`GenUiContainer`)
Embed a live, remotely-controlled UI section directly inside an existing screen (ListView, Column, or Dashboard):

```dart
import 'package:flutter/material.dart';
import 'package:flutter_genui_guard/genui_guard.dart';

class MyDashboardScreen extends StatelessWidget {
  const MyDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My App')),
      body: ListView(
        children: const [
          // Your existing static widgets
          Text('Welcome Back!'),

          // ⚡ Dynamic Web-Controlled Section:
          GenUiContainer(
            screenId: 'dashboard_promos',
            padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
          ),
        ],
      ),
    );
  }
}
```

### 2. Full Dynamic Screen Route (`DynamicScreen`)
Generate entire pages dynamically driven from the Web Console:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_genui_guard/genui_guard.dart';

MaterialPageRoute(
  builder: (ctx) => const DynamicScreen(route: '/exclusive-deals'),
);
```

### 3. Initialize Server URL for Real Devices & Emulators
In your screen `initState()` or `main()`:

```dart
// For real device testing on local Wi-Fi:
GenUiSyncClient.defaultServerUrl = 'http://192.168.1.4:8080';

// For Android emulator:
// GenUiSyncClient.defaultServerUrl = 'http://10.0.2.2:8080';
```

---

## 📶 Android Real Device Network Setup

### Cleartext Traffic (Required for Local HTTP)
Android 9+ (API 28+) blocks non-HTTPS connections by default. To connect to your local development machine via HTTP:

In `android/app/src/main/AndroidManifest.xml`:
```xml
<application
    android:name=".App"
    android:usesCleartextTraffic="true"
    ...>
```

---

## 🧱 Supported Components

- **Containers & Stacks**: `container`, `stack`, `layout_column`, `layout_row`, `card`
- **Safe Primitives**: `text`, `image`, `icon`, `divider`, `spacer`
- **Interactive Controls**: `button`, `text_field`, `chip`, `switch`, `checkbox`, `radio`, `list_tile`
- **Status & Metrics**: `banner`, `metric_row`

---

## 🛡️ Fault Tolerance & Crash Prevention

- **Schema Guard**: Validates incoming AST schema and sanitizes malformed/hallucinated tags into safe fallbacks.
- **Error Boundaries**: Isolates broken elements so sibling widgets render unhindered.
- **Safe Dart Executor**: Executes dynamic event scripts without calling unwhitelisted APIs or blocking the UI thread.

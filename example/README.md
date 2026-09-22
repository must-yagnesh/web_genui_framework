# GenUI Framework Example App 📱

This is the standalone demonstration app for [`flutter_genui_guard`](../packages/flutter_genui_guard).

It showcases both integration modes:
1. **Embedded Container Mode (`GenUiContainer`)**: A dynamic section embedded inside a native Flutter screen with static cards and widgets.
2. **Full Dynamic Page Mode (`DynamicScreen`)**: A 100% remote-controlled screen powered by live Web Dashboard schemas.

---

## ⚙️ Configuration (`lib/config.dart`)

All server connection URLs and API settings are centrally located in:
👉 [`lib/config.dart`](lib/config.dart)

```dart
class GenUiConfig {
  // Set your Mac/PC LAN IP for real devices or 10.0.2.2 for emulator
  static const String syncServerUrl = 'http://192.168.1.4:8080';

  // Cloud API base URL for form submissions
  static const String apiBaseUrl = 'http://192.168.1.4:8080/api';
  ...
}
```

### Supported IP Presets:
- **Real Android Device (Wi-Fi)**: Use your Mac's LAN IP, e.g. `http://192.168.1.4:8080` (device and Mac must be on the same Wi-Fi).
- **Android Emulator**: `http://10.0.2.2:8080`
- **iOS Simulator / macOS / Web**: `http://localhost:8080`

---

## 🚀 How to Run

### 1. Start the Sync Server
```bash
cd ../sync_server
python3 server.py
```

### 2. Run the App
```bash
# In this directory:
flutter pub get
flutter run
```

### 3. Open the Web Dashboard
Open `http://localhost:8080` in your browser. Edit components or add new screens to see instant live updates in the app!

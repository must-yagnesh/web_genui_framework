import 'package:flutter_genui_guard/genui_guard.dart';
import 'screens/demo_screens.dart';

/// Centralized Configuration for the GenUI Example App.
///
/// Edit this file to change your Sync Server host IP, port,
/// or Cloud API endpoints for testing on different devices.
class GenUiConfig {
  /// 🌐 Real-Time Sync Server URL (Python Bridge Server)
  ///
  /// Choose the appropriate URL for your target device:
  /// - Real Android Device (Wi-Fi): Use your Mac/PC local LAN IP (e.g. 'http://192.168.1.4:8080')
  /// - Android Emulator: 'http://10.0.2.2:8080'
  /// - iOS Simulator / macOS / Web: 'http://localhost:8080'
  static const String syncServerUrl = 'http://192.168.1.4:8080';

  /// 🔌 Cloud API Base URL (for form submissions and backend REST calls)
  static const String apiBaseUrl = 'http://192.168.1.4:8080/api';

  /// One-step framework initialization called in main() before runApp()
  static void initialize() {
    // 1. Set global default server URL for live SSE stream and schema syncing
    GenUiSyncClient.defaultServerUrl = syncServerUrl;

    // 2. Set base URL for REST API calls
    GenUiApiClient.setBaseUrl(apiBaseUrl);

    // 3. (Optional) Provide dynamic Auth Token for secured endpoints
    GenUiApiClient.setAuthTokenProvider(() => 'dev_mock_token_abc123');

    // 4. (Optional) Inject user context for path parameter interpolation (e.g. /users/{userId})
    GenUiApiClient.setUserContext({
      'userId': 'usr_9842',
      'email': 'developer@example.com',
    });

    // 5. Connect custom demo bottom sheet handler
    GenUiDartExecutor.customBottomSheetHandler = (ctx, code) {
      showCustomDemoBottomSheet(ctx);
    };
  }
}

import 'package:flutter/foundation.dart';
import 'package:flutter_genui_guard/genui_guard.dart';
import 'screens/demo_screens.dart';

/// Centralized Configuration for the GenUI Example App.
///
/// Automatically routes traffic to the correct host based on runtime platform:
/// - Android Emulator: 'http://10.0.2.2:8080' (accesses Mac localhost via virtual router)
/// - Real Android Device (Wi-Fi): Mac LAN IP (e.g. 'http://192.168.1.11:8080')
/// - iOS Simulator / macOS / Web: 'http://127.0.0.1:8080'
class GenUiConfig {
  /// Optional manual override (e.g. 'http://192.168.1.11:8080' for real phone on Wi-Fi)
  static String? customServerUrl;

  /// 🌐 Real-Time Sync Server URL (Python Bridge Server)
  static String get syncServerUrl {
    if (customServerUrl != null && customServerUrl!.isNotEmpty) {
      return customServerUrl!;
    }
    if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
      // 10.0.2.2 is the official loopback interface to host machine from Android Emulator
      return 'http://10.0.2.2:8080';
    }
    return 'http://127.0.0.1:8080';
  }

  /// 🔌 Cloud API Base URL (for form submissions and backend REST calls)
  static String get apiBaseUrl => '$syncServerUrl/api';

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

    // 5. Keep customServerUrl in sync with global changes across screens
    GenUiSyncClient.onServerUrlChanged.listen((newUrl) {
      customServerUrl = newUrl;
    });

    // 6. Connect custom demo bottom sheet handler
    GenUiDartExecutor.customBottomSheetHandler = (ctx, code) {
      showCustomDemoBottomSheet(ctx);
    };
  }
}

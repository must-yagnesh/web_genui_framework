import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../models/ui_schema.dart';
import '../validator/schema_validator.dart';
import 'api_client.dart';
import 'screen_registry.dart';

/// Real-time Sync Client for receiving live UI schema updates from the Web Console
class GenUiSyncClient {
  final String serverBaseUrl;
  final StreamController<UiSchema> _schemaStreamController =
      StreamController<UiSchema>.broadcast();

  bool _isConnected = false;
  bool _isDisposed = false;
  http.Client? _streamingClient;

  String _activeServerUrl;

  Timer? _discoveryTimer;
  Timer? _reconnectTimer;

  static String? _customDefaultServerUrl;

  /// Default sync server URL for development:
  /// Automatically uses 10.0.2.2:8080 on Android Emulator, and 127.0.0.1:8080 on Desktop/Web/iOS.
  static String get defaultServerUrl {
    if (_customDefaultServerUrl != null && _customDefaultServerUrl!.isNotEmpty) {
      return _customDefaultServerUrl!;
    }
    if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:8080';
    }
    return 'http://127.0.0.1:8080';
  }

  static set defaultServerUrl(String url) {
    _customDefaultServerUrl = url;
  }

  /// Last server base URL that answered successfully. Shared so other
  /// clients (e.g. form submissions from non-syncing screens) can reuse it.
  static String? lastDiscoveredUrl;

  /// Global StreamController broadcasting server URL changes to all screens & containers
  static final StreamController<String> _serverUrlStreamController =
      StreamController<String>.broadcast();

  /// Stream of server URL changes triggered from any connection dialog or config update
  static Stream<String> get onServerUrlChanged => _serverUrlStreamController.stream;

  /// Global setter that updates the server URL for ALL screens, containers, and API clients simultaneously
  static void updateGlobalServerUrl(String newUrl) {
    final clean = newUrl.trim();
    if (clean.isEmpty) return;
    final normalized = clean.endsWith('/') ? clean.substring(0, clean.length - 1) : clean;

    defaultServerUrl = normalized;
    lastDiscoveredUrl = normalized;
    GenUiApiClient.setBaseUrl(normalized.endsWith('/api') ? normalized : '$normalized/api');
    _serverUrlStreamController.add(normalized);
    debugPrint('[GenUiSync] Global sync server URL updated across ALL screens: $normalized');
  }

  /// Universal connection configuration dialog that can be invoked from any screen
  static void showConnectionDialog(BuildContext context) {
    final controller = TextEditingController(text: defaultServerUrl);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: const Row(
          children: [
            Icon(Icons.wifi, color: Color(0xFF818CF8), size: 20),
            SizedBox(width: 8),
            Text('Sync Server Connection', style: TextStyle(color: Colors.white, fontSize: 16)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Changes the sync host globally across ALL screens & containers:',
              style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12.0),
            ),
            const SizedBox(height: 10.0),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: [
                ActionChip(
                  backgroundColor: const Color(0xFF0F172A),
                  side: const BorderSide(color: Color(0xFF4F46E5)),
                  label: const Text('10.0.2.2 (Emulator)', style: TextStyle(color: Color(0xFF818CF8), fontSize: 11)),
                  onPressed: () => controller.text = 'http://10.0.2.2:8080',
                ),
                ActionChip(
                  backgroundColor: const Color(0xFF0F172A),
                  side: const BorderSide(color: Color(0xFF10B981)),
                  label: const Text('192.168.1.5 (LAN Host)', style: TextStyle(color: Color(0xFF34D399), fontSize: 11)),
                  onPressed: () => controller.text = 'http://192.168.1.5:8080',
                ),
                ActionChip(
                  backgroundColor: const Color(0xFF0F172A),
                  side: const BorderSide(color: Color(0xFF334155)),
                  label: const Text('localhost (Desktop)', style: TextStyle(color: Color(0xFFE2E8F0), fontSize: 11)),
                  onPressed: () => controller.text = 'http://127.0.0.1:8080',
                ),
              ],
            ),
            const SizedBox(height: 12.0),
            TextField(
              controller: controller,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                labelText: 'Host Server URL',
                labelStyle: const TextStyle(color: Color(0xFF94A3B8)),
                filled: true,
                fillColor: const Color(0xFF0F172A),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8.0)),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF4F46E5),
              foregroundColor: Colors.white,
            ),
            onPressed: () {
              final val = controller.text.trim();
              Navigator.pop(ctx);
              if (val.isNotEmpty) {
                updateGlobalServerUrl(val);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Connected globally to $val'),
                    backgroundColor: const Color(0xFF10B981),
                    duration: const Duration(seconds: 2),
                  ),
                );
              }
            },
            child: const Text('Apply Globally'),
          ),
        ],
      ),
    );
  }

  GenUiSyncClient({
    String? serverBaseUrl,
  }) : _activeServerUrl = serverBaseUrl ?? defaultServerUrl,
       serverBaseUrl = serverBaseUrl ?? defaultServerUrl;

  Stream<UiSchema> get schemaStream => _schemaStreamController.stream;
  bool get isConnected => _isConnected;
  String get activeUrl => _activeServerUrl;

  /// Start the live sync listener with automatic reconnect
  void start() {
    _isDisposed = false;
    _initAndConnect();
  }

  Future<void> _initAndConnect() async {
    await _discoverAndFetchSchema();
    _connectStream();
  }

  /// Try candidate URLs concurrently to automatically find the working sync host
  Future<void> _discoverAndFetchSchema() async {
    if (_isDisposed) return;
    final Set<String> candidateHosts = {
      if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) ...[
        'http://10.0.2.2:8080',
        defaultServerUrl,
        'http://10.0.2.2:8080',
        'http://localhost:8080',
        'http://10.0.3.2:8080',
      ] else ...[
        defaultServerUrl,
        'http://127.0.0.1:8080',
        'http://localhost:8080',
        'http://10.0.2.2:8080',
      ],
      _activeServerUrl,
      serverBaseUrl,
    };

    final completer = Completer<bool>();
    _discoveryTimer?.cancel();
    _discoveryTimer = Timer(const Duration(milliseconds: 2000), () {
      if (!completer.isCompleted) completer.complete(false);
    });

    for (final host in candidateHosts) {
      if (_isDisposed) break;
      http
          .get(Uri.parse('$host/api/schema/current'))
          .timeout(const Duration(milliseconds: 1800))
          .then((response) {
        if (!_isDisposed && !completer.isCompleted && response.statusCode == 200) {
          _activeServerUrl = host;
          lastDiscoveredUrl = host;
          debugPrint('[GenUiSync] Discovered live sync host at $_activeServerUrl');
          final result = GenUiSchemaValidator.validateAndSanitize(response.body);
          GenUiScreenRegistry.instance.registerScreen(result.sanitizedSchema);
          _schemaStreamController.add(result.sanitizedSchema);
          completer.complete(true);
        }
      }).catchError((_) {
        // Host unreachable, try others
      });
    }

    await completer.future;
    _discoveryTimer?.cancel();
    _discoveryTimer = null;
  }

  /// Stop the listener and clean up resources
  void dispose() {
    _isDisposed = true;
    _discoveryTimer?.cancel();
    _discoveryTimer = null;
    _reconnectTimer?.cancel();
    _reconnectTimer = null;
    _streamingClient?.close();
    if (!_schemaStreamController.isClosed) {
      _schemaStreamController.close();
    }
  }

  /// Persistent Server-Sent Events (SSE) stream listener
  Future<void> _connectStream() async {
    while (!_isDisposed) {
      try {
        final uri = Uri.parse('$_activeServerUrl/api/stream');
        _streamingClient = http.Client();
        final request = http.Request('GET', uri)
          ..headers['Accept'] = 'text/event-stream'
          ..headers['Cache-Control'] = 'no-cache';

        final streamedResponse = await _streamingClient!.send(request);
        _isConnected = true;
        debugPrint('[GenUiSync] Connected to live SSE stream at $_activeServerUrl');

        StringBuffer buffer = StringBuffer();

        await for (String chunk in streamedResponse.stream.transform(utf8.decoder)) {
          if (_isDisposed) break;
          buffer.write(chunk);
          String content = buffer.toString();

          // SSE messages end with double newline
          while (content.contains('\n\n')) {
            final splitIndex = content.indexOf('\n\n');
            final message = content.substring(0, splitIndex).trim();
            content = content.substring(splitIndex + 2);
            buffer = StringBuffer(content);

            if (message.isNotEmpty) {
              _processSseMessage(message);
            }
          }
        }
      } catch (e) {
        _isConnected = false;
        if (!_isDisposed) {
          debugPrint('[GenUiSync] SSE stream dropped ($e). Re-discovering sync host...');
          await _discoverAndFetchSchema();
        }
      } finally {
        _streamingClient?.close();
      }

      if (!_isDisposed) {
        final delayCompleter = Completer<void>();
        _reconnectTimer = Timer(const Duration(seconds: 2), () {
          if (!delayCompleter.isCompleted) delayCompleter.complete();
        });
        await delayCompleter.future;
        _reconnectTimer = null;
      }
    }
  }

  void _processSseMessage(String message) {
    try {
      final lines = message.split('\n');
      String? eventType;
      String? dataPayload;

      for (final line in lines) {
        if (line.startsWith('event:')) {
          eventType = line.substring(6).trim();
        } else if (line.startsWith('data:')) {
          dataPayload = line.substring(5).trim();
        }
      }

      if (dataPayload == null || dataPayload.isEmpty) return;

      if (eventType == 'screens_bundle') {
        debugPrint('[GenUiSync] Received live multi-screen bundle from Web Console');
        final decoded = json.decode(dataPayload);
        if (decoded is Map<String, dynamic>) {
          GenUiScreenRegistry.instance.updateFromBundle(decoded);
        }
      } else if (eventType == 'schema_update') {
        debugPrint('[GenUiSync] Received live schema update from Web Dashboard');
        final result = GenUiSchemaValidator.validateAndSanitize(dataPayload);
        GenUiScreenRegistry.instance.registerScreen(result.sanitizedSchema);
        _schemaStreamController.add(result.sanitizedSchema);
      }
    } catch (e) {
      debugPrint('[GenUiSync] Error processing SSE payload: $e');
    }
  }

  /// Dispatch render performance telemetry back to server
  Future<void> sendTelemetry(Map<String, dynamic> telemetryData) async {
    try {
      final uri = Uri.parse('$serverBaseUrl/api/telemetry');
      await http.post(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: json.encode(telemetryData),
      );
    } catch (_) {}
  }
}

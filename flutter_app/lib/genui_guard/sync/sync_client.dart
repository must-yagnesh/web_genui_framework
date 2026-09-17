import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../models/ui_schema.dart';
import '../validator/schema_validator.dart';

/// Real-time Sync Client for receiving live UI schema updates from the Web Console
class GenUiSyncClient {
  final String serverBaseUrl;
  final StreamController<UiSchema> _schemaStreamController =
      StreamController<UiSchema>.broadcast();

  bool _isConnected = false;
  bool _isDisposed = false;
  http.Client? _streamingClient;

  String _activeServerUrl;

  GenUiSyncClient({
    String serverBaseUrl = 'http://localhost:8080',
  }) : _activeServerUrl = serverBaseUrl,
       serverBaseUrl = serverBaseUrl;

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
    final Set<String> candidateHosts = {
      if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) ...[
        'http://10.0.2.2:8080',
        'http://localhost:8080',
        'http://192.168.1.11:8080',
        'http://10.0.3.2:8080',
      ] else ...[
        'http://localhost:8080',
        'http://127.0.0.1:8080',
        'http://192.168.1.11:8080',
      ],
      _activeServerUrl,
      serverBaseUrl,
    };

    final completer = Completer<bool>();

    for (final host in candidateHosts) {
      if (_isDisposed) return;
      http
          .get(Uri.parse('$host/api/schema/current'))
          .timeout(const Duration(milliseconds: 1800))
          .then((response) {
        if (!_isDisposed && !completer.isCompleted && response.statusCode == 200) {
          _activeServerUrl = host;
          debugPrint('[GenUiSync] Discovered live sync host at $_activeServerUrl');
          final result = GenUiSchemaValidator.validateAndSanitize(response.body);
          _schemaStreamController.add(result.sanitizedSchema);
          completer.complete(true);
        }
      }).catchError((_) {
        // Host unreachable, try others
      });
    }

    await Future.any([
      completer.future,
      Future.delayed(const Duration(milliseconds: 2000), () => false),
    ]);
  }

  /// Stop the listener and clean up resources
  void dispose() {
    _isDisposed = true;
    _streamingClient?.close();
    _schemaStreamController.close();
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
        debugPrint('[GenUiSync] SSE stream dropped ($e). Re-discovering sync host...');
        await _discoverAndFetchSchema();
      } finally {
        _streamingClient?.close();
      }

      if (!_isDisposed) {
        await Future.delayed(const Duration(seconds: 2));
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

      if (eventType == 'schema_update' && dataPayload != null && dataPayload.isNotEmpty) {
        debugPrint('[GenUiSync] Received live schema update from Web Dashboard');
        final result = GenUiSchemaValidator.validateAndSanitize(dataPayload);
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

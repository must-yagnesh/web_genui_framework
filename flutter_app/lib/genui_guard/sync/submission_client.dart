import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../state/form_registry.dart';
import 'sync_client.dart';

/// Result of a form submission attempt against the local Sync Server.
class GenUiSubmissionResult {
  final bool synced;
  final int? id;
  final int? total;
  final String? error;

  const GenUiSubmissionResult({
    required this.synced,
    this.id,
    this.total,
    this.error,
  });
}

/// Sends validated form data to the Sync Server's `POST /api/submissions`
/// endpoint so it can be reviewed on the "Shows Submission" web page
/// (`http://localhost:8080/submissions`).
///
/// The server keeps every submission in an in-memory array; nothing is
/// persisted to disk, which is intentional for the local demo workflow.
class GenUiSubmissionClient {
  GenUiSubmissionClient._();

  static const Duration _timeout = Duration(seconds: 4);

  /// Snapshot the current [GenUiFormRegistry] values as a list of
  /// `{id, label, value}` entries. Password-like fields are masked so raw
  /// secrets never leave the device. Pass [onlyIds] to limit the snapshot to
  /// the fields belonging to one screen.
  static List<Map<String, dynamic>> buildFieldsFromRegistry({Iterable<String>? onlyIds}) {
    final registry = GenUiFormRegistry.instance;
    final values = registry.getValues(onlyIds: onlyIds);
    return values.entries.map((entry) {
      final label = registry.getFieldLabel(entry.key);
      final isSecret = entry.key.toLowerCase().contains('pass') ||
          label.toLowerCase().contains('password');
      dynamic value = entry.value;
      if (isSecret) {
        value = (value?.toString() ?? '').isEmpty ? '' : '••••••••';
      }
      return <String, dynamic>{
        'id': entry.key,
        'label': label,
        'value': value,
      };
    }).toList();
  }

  /// Candidate base URLs, most likely first. The URL discovered by the live
  /// sync client is tried before the platform defaults.
  static List<String> _candidateUrls(String? preferredUrl) {
    final List<String> urls = [];
    void add(String? u) {
      if (u == null || u.isEmpty) return;
      if (!urls.contains(u)) urls.add(u);
    }

    add(preferredUrl);
    add(GenUiSyncClient.lastDiscoveredUrl);
    if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
      add('http://10.0.2.2:8080');
      add('http://localhost:8080');
    } else {
      add('http://localhost:8080');
      add('http://127.0.0.1:8080');
    }
    return urls;
  }

  /// POST a submission. Never throws; returns [GenUiSubmissionResult.synced]
  /// = false when no server could be reached.
  static Future<GenUiSubmissionResult> submit({
    required String screenId,
    required String screenTitle,
    required String actionId,
    List<Map<String, dynamic>>? fields,
    Iterable<String>? onlyIds,
    String source = 'flutter_app',
    String? serverUrl,
  }) async {
    final payload = <String, dynamic>{
      'source': source,
      'screen_id': screenId,
      'screen_title': screenTitle,
      'action_id': actionId,
      'fields': fields ?? buildFieldsFromRegistry(onlyIds: onlyIds),
    };
    final body = json.encode(payload);

    String? lastError;
    for (final base in _candidateUrls(serverUrl)) {
      try {
        final response = await http
            .post(
              Uri.parse('$base/api/submissions'),
              headers: {'Content-Type': 'application/json'},
              body: body,
            )
            .timeout(_timeout);

        if (response.statusCode == 200) {
          final decoded = json.decode(response.body);
          if (decoded is Map<String, dynamic> && decoded['success'] == true) {
            debugPrint('[GenUiSubmission] Stored submission #${decoded['id']} at $base');
            return GenUiSubmissionResult(
              synced: true,
              id: (decoded['id'] as num?)?.toInt(),
              total: (decoded['total'] as num?)?.toInt(),
            );
          }
        }
        lastError = 'HTTP ${response.statusCode} from $base';
      } catch (e) {
        lastError = e.toString();
      }
    }

    debugPrint('[GenUiSubmission] Could not reach sync server: $lastError');
    return GenUiSubmissionResult(synced: false, error: lastError);
  }
}

import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../models/ui_schema.dart';
import '../state/form_registry.dart';
import '../widgets/success_dialog.dart';
import 'sync_client.dart';

/// Result of a dynamic API execution
class GenUiApiResult {
  final bool success;
  final int statusCode;
  final dynamic data;
  final String? errorMessage;

  const GenUiApiResult({
    required this.success,
    this.statusCode = 0,
    this.data,
    this.errorMessage,
  });
}

/// Dynamic API Execution Client
///
/// Executes dynamic HTTP API calls configured completely from the Web Console.
/// No static API code or screen-specific endpoints are hardcoded in Flutter.
/// Any new screen, form, or cloud API endpoint works dynamically.
class GenUiApiClient {
  GenUiApiClient._();

  static const Duration _defaultTimeout = Duration(seconds: 10);

  /// Optional global base URL configured in Flutter code (e.g. 'https://api.mycompany.com')
  static String? _baseUrl;

  /// Optional static auth token passed from Flutter code (e.g. JWT token)
  static String? _authToken;

  /// Optional dynamic token provider function (e.g. () => authService.currentToken)
  static String? Function()? _authTokenProvider;

  /// Optional default headers injected into every request (e.g. X-App-Version, X-Tenant-Id)
  static final Map<String, String> _defaultHeaders = {};

  /// Optional user context data passed from Flutter code (e.g. {'userId': 'u123', 'email': 'user@example.com'})
  static final Map<String, dynamic> _userContext = {};

  /// Set the production or staging Base URL from Flutter code.
  /// When endpoints configured in Web Console start with '/' or are relative (e.g. '/v1/leads'),
  /// Flutter automatically prepends this Base URL.
  static void setBaseUrl(String? url) {
    if (url == null || url.trim().isEmpty) {
      _baseUrl = null;
    } else {
      final clean = url.trim();
      _baseUrl = clean.endsWith('/') ? clean.substring(0, clean.length - 1) : clean;
    }
  }

  static String? get baseUrl => _baseUrl;

  /// Set the user Auth Token from Flutter code (e.g. after login).
  /// Automatically attached as 'Authorization: Bearer <token>' unless explicitly overridden in schema.
  static void setAuthToken(String? token) {
    _authToken = token;
  }

  /// Register a dynamic Auth Token provider callback from Flutter code.
  static void setAuthTokenProvider(String? Function()? provider) {
    _authTokenProvider = provider;
  }

  /// Retrieve the active auth token
  static String? get authToken {
    if (_authTokenProvider != null) {
      return _authTokenProvider!();
    }
    return _authToken;
  }

  /// Set default headers from Flutter code (e.g. app version, device ID, tenant)
  static void setDefaultHeaders(Map<String, String> headers) {
    _defaultHeaders.clear();
    _defaultHeaders.addAll(headers);
  }

  static Map<String, String> get defaultHeaders => Map.unmodifiable(_defaultHeaders);

  /// Set active user context from Flutter code (e.g. userId, tenant, roles).
  /// These variables can be used in path variables like {userId} or automatically merged.
  static void setUserContext(Map<String, dynamic> user) {
    _userContext.clear();
    _userContext.addAll(user);
  }

  static Map<String, dynamic> get userContext => Map.unmodifiable(_userContext);

  /// Clear all session and auth data on user logout
  static void clearSession() {
    _authToken = null;
    _authTokenProvider = null;
    _userContext.clear();
  }

  /// Resolves candidate base URLs when relative URLs (e.g. `/v1/leads`) are supplied.
  /// If [baseUrl] is explicitly configured from Flutter, it takes highest precedence.
  static List<String> _candidateUrls(String? preferredUrl) {
    final List<String> urls = [];
    void add(String? u) {
      if (u == null || u.trim().isEmpty) return;
      final clean = u.trim().endsWith('/') ? u.trim().substring(0, u.trim().length - 1) : u.trim();
      if (!urls.contains(clean)) urls.add(clean);
    }

    // 1. Explicitly configured Flutter Base URL (e.g. https://api.mycompany.com)
    add(_baseUrl);

    // 2. Preferred URL if passed
    add(preferredUrl);

    // 3. Local sync server discovered URL for development hot-sync
    add(GenUiSyncClient.lastDiscoveredUrl);
    add(GenUiSyncClient.defaultServerUrl);

    // 4. Localhost dev fallbacks
    if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
      add('http://192.168.1.4:8080');
      add('http://10.0.2.2:8080');
      add('http://localhost:8080');
    } else {
      add('http://192.168.1.4:8080');
      add('http://localhost:8080');
      add('http://127.0.0.1:8080');
    }
    return urls;
  }

  /// Construct the dynamic payload map based on configured field mapping and form state
  static Map<String, dynamic> buildPayload({
    required ApiConfig config,
    Iterable<String>? onlyIds,
    String? screenId,
    String? screenTitle,
  }) {
    final registry = GenUiFormRegistry.instance;
    final Map<String, dynamic> payload = {};

    // 1. If explicit body_mapping is provided (apiKey -> fieldId)
    if (config.bodyMapping.isNotEmpty) {
      config.bodyMapping.forEach((apiKey, fieldId) {
        payload[apiKey] = registry.getValue(fieldId);
      });
    } else {
      // 2. Default: gather all scoped values from registry
      final allValues = registry.getValues(onlyIds: onlyIds);
      allValues.forEach((key, val) {
        payload[key] = val;
      });
    }

    // 3. Merge static body parameters (e.g. source, form_type, tenant_id)
    if (config.staticBody.isNotEmpty) {
      payload.addAll(config.staticBody);
    }

    return payload;
  }

  static bool _isBooleanOrSpecial(String fieldId) {
    return fieldId.toLowerCase().contains('terms') ||
        fieldId.toLowerCase().contains('check') ||
        fieldId.toLowerCase().contains('switch');
  }

  /// Execute a dynamic API call from a configured [ApiConfig]
  static Future<GenUiApiResult> executeApi({
    required BuildContext context,
    required ApiConfig config,
    Iterable<String>? screenFieldIds,
    List<ComponentNode>? components,
    String? screenId,
    String? screenTitle,
    String? serverBaseUrl,
    http.Client? httpClient,
  }) async {
    final client = httpClient ?? http.Client();
    final registry = GenUiFormRegistry.instance;

    // -------------------------------------------------------------
    // Step 1: Declarative Validation
    // -------------------------------------------------------------
    final List<String> validationErrors = [];

    // Validate explicitly listed fields in config.validateFields
    if (config.validateFields.isNotEmpty) {
      for (final fieldId in config.validateFields) {
        if (!registry.hasValue(fieldId)) {
          final label = registry.getFieldLabel(fieldId);
          validationErrors.add('$label is required');
        }
      }
    }

    // Validate component-level validation rules from schema
    if (components != null && components.isNotEmpty) {
      final compErrors = registry.validateComponents(components, onlyIds: screenFieldIds);
      for (final err in compErrors) {
        if (!validationErrors.contains(err)) {
          validationErrors.add(err);
        }
      }
    }

    if (validationErrors.isNotEmpty) {
      if (context.mounted) {
        _showErrorFeedback(
          context,
          'Validation Error: ${validationErrors.join(", ")}',
        );
      }
      return GenUiApiResult(
        success: false,
        errorMessage: validationErrors.join(', '),
      );
    }

    // -------------------------------------------------------------
    // Step 2: Build Dynamic Request Payload
    // -------------------------------------------------------------
    final Map<String, dynamic> payload = buildPayload(
      config: config,
      onlyIds: screenFieldIds,
      screenId: screenId,
      screenTitle: screenTitle,
    );

    // -------------------------------------------------------------
    // Step 3: Resolve Endpoint URL
    // -------------------------------------------------------------
    String rawUrl = config.url.trim();
    if (rawUrl.isEmpty) {
      const err = 'API configuration has no URL specified.';
      if (context.mounted) _showErrorFeedback(context, err);
      return const GenUiApiResult(success: false, errorMessage: err);
    }

    // Replace URL path parameters from payload and userContext (e.g. /users/{userId}/orders)
    payload.forEach((key, val) {
      if (rawUrl.contains('{$key}')) {
        rawUrl = rawUrl.replaceAll('{$key}', Uri.encodeComponent(val?.toString() ?? ''));
      }
    });
    _userContext.forEach((key, val) {
      if (rawUrl.contains('{$key}')) {
        rawUrl = rawUrl.replaceAll('{$key}', Uri.encodeComponent(val?.toString() ?? ''));
      }
    });

    List<String> candidateEndpoints = [];
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      candidateEndpoints.add(rawUrl);
    } else {
      // Relative URL: resolve against base URL candidates (baseUrl has highest priority)
      final cleanPath = rawUrl.startsWith('/') ? rawUrl : '/$rawUrl';
      for (final base in _candidateUrls(serverBaseUrl)) {
        candidateEndpoints.add('$base$cleanPath');
      }
    }

    // -------------------------------------------------------------
    // Step 4: Headers (Default headers + Auto Token + Schema headers)
    // -------------------------------------------------------------
    final Map<String, String> requestHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Inject default Flutter headers if set
    if (_defaultHeaders.isNotEmpty) {
      requestHeaders.addAll(_defaultHeaders);
    }

    // Auto-inject active Auth Token if available and not already set
    final activeToken = authToken;
    if (activeToken != null && activeToken.isNotEmpty && !requestHeaders.containsKey('Authorization')) {
      final authValue = activeToken.startsWith('Bearer ') ? activeToken : 'Bearer $activeToken';
      requestHeaders['Authorization'] = authValue;
    }

    // Schema headers configured from Web Console override defaults
    if (config.headers.isNotEmpty) {
      requestHeaders.addAll(config.headers);
    }

    // -------------------------------------------------------------
    // Step 5: Execute HTTP Request
    // -------------------------------------------------------------
    http.Response? response;
    String? lastError;

    for (final targetUrl in candidateEndpoints) {
      try {
        final uri = Uri.parse(targetUrl);
        final method = config.method.toUpperCase();

        if (method == 'GET') {
          // If query params are provided in payload for GET
          final queryUri = payload.isNotEmpty
              ? uri.replace(queryParameters: {
                  ...uri.queryParameters,
                  ...payload.map((k, v) => MapEntry(k, v?.toString() ?? '')),
                })
              : uri;
          response = await client.get(queryUri, headers: requestHeaders).timeout(_defaultTimeout);
        } else if (method == 'DELETE') {
          response = await client.delete(uri, headers: requestHeaders, body: json.encode(payload)).timeout(_defaultTimeout);
        } else if (method == 'PUT') {
          response = await client.put(uri, headers: requestHeaders, body: json.encode(payload)).timeout(_defaultTimeout);
        } else if (method == 'PATCH') {
          response = await client.patch(uri, headers: requestHeaders, body: json.encode(payload)).timeout(_defaultTimeout);
        } else {
          // Default POST
          response = await client.post(uri, headers: requestHeaders, body: json.encode(payload)).timeout(_defaultTimeout);
        }

        if (response.statusCode >= 200 && response.statusCode < 500) {
          // Successful connection established
          break;
        }
      } catch (e) {
        lastError = e.toString();
      }
    }

    // -------------------------------------------------------------
    // Step 6: Handle Response (0% Crash Guarantee)
    // -------------------------------------------------------------
    if (response == null) {
      final msg = config.onError?['message']?.toString() ??
          'Failed to reach API server: ${lastError ?? "Network error"}';
      if (context.mounted) {
        _showErrorFeedback(context, msg);
      }
      return GenUiApiResult(
        success: false,
        errorMessage: lastError ?? 'Connection error',
      );
    }

    final isSuccess = response.statusCode >= 200 && response.statusCode < 300;

    dynamic responseBody;
    try {
      responseBody = json.decode(response.body);
    } catch (_) {
      responseBody = response.body;
    }

    if (isSuccess) {
      if (config.resetFormOnSuccess) {
        registry.reset();
      }

      if (context.mounted) {
        _handleSuccessOutcome(context, config, responseBody);
      }

      return GenUiApiResult(
        success: true,
        statusCode: response.statusCode,
        data: responseBody,
      );
    } else {
      final errorMsg = config.onError?['message']?.toString() ??
          'API returned status ${response.statusCode}: ${response.body}';
      if (context.mounted) {
        _showErrorFeedback(context, errorMsg);
      }
      return GenUiApiResult(
        success: false,
        statusCode: response.statusCode,
        data: responseBody,
        errorMessage: errorMsg,
      );
    }
  }

  /// Show error snackbar with safety guard styling
  static void _showErrorFeedback(BuildContext context, String message) {
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.error_outline, color: Colors.white, size: 20),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                message,
                style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
              ),
            ),
          ],
        ),
        backgroundColor: const Color(0xFFEF4444),
        duration: const Duration(seconds: 4),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  /// Handle on_success outcome (Success Dialog, SnackBar, Navigation)
  static void _handleSuccessOutcome(
    BuildContext context,
    ApiConfig config,
    dynamic responseData,
  ) {
    final onSuccess = config.onSuccess;
    final outcomeType = onSuccess?['action']?.toString().toLowerCase() ??
        onSuccess?['type']?.toString().toLowerCase() ??
        (onSuccess?['title'] != null ? 'dialog' : 'snackbar');

    final navigateTo = onSuccess?['route']?.toString() ?? onSuccess?['navigate_to']?.toString();

    // 1. Success Dialog Outcome
    if (outcomeType == 'dialog' && onSuccess != null) {
      GenUiSuccessDialog.show(context, {
        'title': onSuccess['title']?.toString() ?? 'Success!',
        'message': onSuccess['message']?.toString() ?? 'Your request was processed successfully.',
        'button_text': onSuccess['button_text']?.toString() ?? 'Back to Home',
        'navigate_to': navigateTo ?? '/',
      });
      return;
    }

    // 2. Direct Navigation
    if (outcomeType == 'navigate' && navigateTo != null && navigateTo.isNotEmpty) {
      Navigator.pushNamed(context, navigateTo);
      return;
    }

    // 3. SnackBar Outcome
    final msg = onSuccess?['message']?.toString() ?? 'Operation completed successfully!';
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.check_circle_outline, color: Colors.white, size: 20),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                msg,
                style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
              ),
            ),
          ],
        ),
        backgroundColor: const Color(0xFF10B981),
        duration: const Duration(seconds: 4),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );

    // Optional navigate_to in addition to snackbar
    if (navigateTo != null && navigateTo.isNotEmpty && outcomeType != 'dialog') {
      Future.delayed(const Duration(milliseconds: 600), () {
        if (context.mounted) {
          Navigator.pushNamed(context, navigateTo);
        }
      });
    }
  }
}

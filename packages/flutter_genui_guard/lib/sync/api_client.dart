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
      add('http://10.0.2.2:8080');
      add('http://192.168.1.11:8080');
      add('http://localhost:8080');
    } else {
      add('http://127.0.0.1:8080');
      add('http://localhost:8080');
      add('http://192.168.1.11:8080');
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

  /// Resolves an API URL dynamically:
  /// - If the URL contains http:// or https://, base URL is completely ignored / forgotten for that specific call.
  ///   On Android, localhost / 127.0.0.1 is translated to emulator loopback (10.0.2.2).
  /// - If the URL is relative, joins with candidate base URLs, de-duplicating /api and prioritizing sync server mock.
  static List<String> resolveCandidateEndpoints(String rawUrl, {String? serverBaseUrl}) {
    final List<String> candidates = [];
    var clean = rawUrl.trim();
    if (clean.isEmpty) return candidates;

    // If URL doesn't start with http:// or https://, but looks like a full domain (e.g. jsonplaceholder.typicode.com/users)
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      final firstSlash = clean.indexOf('/');
      final hostPart = firstSlash != -1 ? clean.substring(0, firstSlash) : clean;
      if (hostPart.contains('.') && !hostPart.startsWith('localhost') && !hostPart.startsWith('10.') && !hostPart.startsWith('192.168.')) {
        clean = 'https://$clean';
      }
    }

    if (clean.startsWith('http://') || clean.startsWith('https://')) {
      // 1. Absolute URL: Base URL is forgotten for this specific API
      String effectiveUrl = clean;
      if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
        if (effectiveUrl.contains('localhost') || effectiveUrl.contains('127.0.0.1')) {
          effectiveUrl = effectiveUrl
              .replaceAll('http://localhost', 'http://10.0.2.2')
              .replaceAll('http://127.0.0.1', 'http://10.0.2.2');
        }
      }
      candidates.add(effectiveUrl);
    } else {
      // 2. Relative URL path
      final cleanPath = clean.startsWith('/') ? clean : '/$clean';

      // If it is a built-in sync server mock endpoint (e.g. /api/mock/products/1 or /api/mock/users)
      // prioritize the active sync server host directly
      if (cleanPath.startsWith('/api/mock')) {
        for (final syncHost in [serverBaseUrl, GenUiSyncClient.defaultServerUrl, GenUiSyncClient.lastDiscoveredUrl]) {
          if (syncHost != null && syncHost.isNotEmpty) {
            final cleanHost = syncHost.endsWith('/') ? syncHost.substring(0, syncHost.length - 1) : syncHost;
            final full = '$cleanHost$cleanPath';
            if (!candidates.contains(full)) candidates.add(full);
          }
        }
      }

      // Resolve against configured candidate base URLs (baseUrl, discoveredUrl, fallbacks)
      for (final base in _candidateUrls(serverBaseUrl)) {
        String joined;
        if (base.endsWith('/api') && cleanPath.startsWith('/api/')) {
          joined = '${base.substring(0, base.length - 4)}$cleanPath';
        } else {
          joined = '$base$cleanPath';
        }
        if (!candidates.contains(joined)) candidates.add(joined);
      }
    }
    return candidates;
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

    List<String> candidateEndpoints = resolveCandidateEndpoints(rawUrl, serverBaseUrl: serverBaseUrl);

    // -------------------------------------------------------------
    // Step 4: Headers (Default headers + Auto Token + Schema headers)
    // -------------------------------------------------------------
    final Map<String, String> requestHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Mobile; Android; Flutter; GenUI-Guard) AppleWebKit/537.36 (KHTML, like Gecko)',
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
    int? lastStatusCode;

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

        lastStatusCode = response.statusCode;
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
        statusCode: lastStatusCode ?? 0,
        errorMessage: lastError ?? 'Failed to reach API endpoint. Check network or server status.',
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

  /// Fetch screen data from an [ApiDataSource] configuration with optional pagination parameters.
  /// Returns parsed response (Map or List), or null if failed.
  static Future<dynamic> fetchDataSource({
    required ApiDataSource dataSource,
    int? page,
    int? pageSize,
    Map<String, dynamic>? extraParams,
    String? serverBaseUrl,
    http.Client? httpClient,
  }) async {
    final client = httpClient ?? http.Client();
    final bool shouldCloseClient = httpClient == null;

    try {
      // 1. Build URL and inject path variables / userContext
      String rawUrl = dataSource.url.trim();
      if (rawUrl.isEmpty) return null;

      _userContext.forEach((key, val) {
        if (rawUrl.contains('{$key}')) {
          rawUrl = rawUrl.replaceAll('{$key}', Uri.encodeComponent(val?.toString() ?? ''));
        }
      });

      // 2. Query parameters & pagination
      final Map<String, String> queryParams = {};
      if (dataSource.params.isNotEmpty) {
        dataSource.params.forEach((k, v) {
          if (v != null) queryParams[k] = v.toString();
        });
      }

      if (page != null && dataSource.pagination.enabled) {
        final pag = dataSource.pagination;
        final pageKey = pag.pageParam.isNotEmpty ? pag.pageParam : 'page';
        final limitKey = pag.limitParam.isNotEmpty ? pag.limitParam : 'limit';
        final limitVal = pageSize ?? pag.defaultLimit;

        if (pag.mode == 'offset') {
          // offset based: offset = (page - 1) * limit
          final offset = (page - 1) * limitVal;
          queryParams[pageKey] = offset.toString();
        } else {
          // page based
          queryParams[pageKey] = page.toString();
        }
        queryParams[limitKey] = limitVal.toString();
      }

      if (extraParams != null) {
        extraParams.forEach((k, v) {
          if (v != null) queryParams[k] = v.toString();
        });
      }

      // Resolve candidate endpoints
      List<String> candidateEndpoints = resolveCandidateEndpoints(rawUrl, serverBaseUrl: serverBaseUrl);

      // Base headers
      final Map<String, String> requestHeaders = {
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (Mobile; Android; Flutter; GenUI-Guard) AppleWebKit/537.36 (KHTML, like Gecko)',
      };
      if (_defaultHeaders.isNotEmpty) requestHeaders.addAll(_defaultHeaders);
      if (dataSource.headers.isNotEmpty) {
        requestHeaders.addAll(dataSource.headers);
      }

      // Collect sync hosts for potential proxy fallback if direct fetch fails on Android emulator
      final List<String> syncHosts = [];
      void addHost(String? h) {
        if (h == null || h.trim().isEmpty) return;
        final clean = h.trim().endsWith('/') ? h.trim().substring(0, h.trim().length - 1) : h.trim();
        if (!syncHosts.contains(clean)) syncHosts.add(clean);
      }
      addHost(serverBaseUrl);
      addHost(GenUiSyncClient.lastDiscoveredUrl);
      addHost(GenUiSyncClient.defaultServerUrl);
      if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
        addHost('http://10.0.2.2:8080');
        addHost('http://192.168.1.11:8080');
      } else {
        addHost('http://127.0.0.1:8080');
        addHost('http://localhost:8080');
      }

      for (final baseEndpoint in candidateEndpoints) {
        try {
          final uri = Uri.parse(baseEndpoint);
          final finalUri = queryParams.isEmpty
              ? uri
              : uri.replace(queryParameters: {
                  ...uri.queryParameters,
                  ...queryParams,
                });

          // Only attach default mock auth token if the target is our own server/localhost or if already in requestHeaders
          final endpointHeaders = Map<String, String>.from(requestHeaders);
          final isLocalOrOwnBackend = baseEndpoint.contains('10.0.2.2') ||
              baseEndpoint.contains('127.0.0.1') ||
              baseEndpoint.contains('localhost') ||
              (_baseUrl != null && baseEndpoint.startsWith(_baseUrl!));
          final activeToken = authToken;
          if (isLocalOrOwnBackend && activeToken != null && activeToken.isNotEmpty && !endpointHeaders.containsKey('Authorization')) {
            final authValue = activeToken.startsWith('Bearer ') ? activeToken : 'Bearer $activeToken';
            endpointHeaders['Authorization'] = authValue;
          }

          http.Response? response;
          final method = dataSource.method.toUpperCase();
          try {
            if (method == 'POST') {
              response = await client
                  .post(finalUri, headers: endpointHeaders)
                  .timeout(_defaultTimeout);
            } else {
              response = await client
                  .get(finalUri, headers: endpointHeaders)
                  .timeout(_defaultTimeout);
            }
          } catch (directErr) {
            debugPrint('[GenUiApiClient] Direct fetch error for $finalUri: $directErr');
          }

          debugPrint('[GenUiApiClient] fetchDataSource HTTP ${response?.statusCode} from $finalUri');
          if (response != null && response.statusCode >= 200 && response.statusCode < 300) {
            dynamic decoded = json.decode(utf8.decode(response.bodyBytes));
            if (dataSource.resultsPath.isNotEmpty && decoded is Map && decoded.containsKey(dataSource.resultsPath)) {
              decoded = decoded[dataSource.resultsPath];
            }
            return decoded;
          }

          // If direct fetch threw or returned non-200, attempt Sync Bridge Server Proxy fallback
          final isExternal = !baseEndpoint.contains('10.0.2.2') &&
              !baseEndpoint.contains('127.0.0.1') &&
              !baseEndpoint.contains('localhost');
          if (isExternal) {
            for (final syncHost in syncHosts) {
              try {
                final proxyUri = Uri.parse('$syncHost/api/proxy?url=${Uri.encodeComponent(finalUri.toString())}');
                debugPrint('[GenUiApiClient] Trying proxy fallback via: $proxyUri');
                final proxyResp = await client.get(proxyUri, headers: {
                  'Accept': 'application/json, text/plain, */*',
                  'User-Agent': 'Mozilla/5.0 (Mobile; Android; Flutter; GenUI-Guard) AppleWebKit/537.36',
                }).timeout(_defaultTimeout);
                if (proxyResp.statusCode >= 200 && proxyResp.statusCode < 300) {
                  dynamic decoded = json.decode(utf8.decode(proxyResp.bodyBytes));
                  if (dataSource.resultsPath.isNotEmpty && decoded is Map && decoded.containsKey(dataSource.resultsPath)) {
                    decoded = decoded[dataSource.resultsPath];
                  }
                  debugPrint('[GenUiApiClient] Proxy fallback succeeded for $finalUri!');
                  return decoded;
                }
              } catch (proxyErr) {
                debugPrint('[GenUiApiClient] Proxy fallback failed on $syncHost: $proxyErr');
              }
            }
          }
        } catch (e) {
          debugPrint('[GenUiApiClient] fetchDataSource failed for $baseEndpoint: $e');
        }
      }

      // If all candidates failed, use configured fallbackData if available
      if (dataSource.fallbackData.isNotEmpty) {
        debugPrint('[GenUiApiClient] Returning fallbackData for ${dataSource.url}');
        return dataSource.fallbackData;
      }

      return null;
    } finally {
      if (shouldCloseClient) {
        client.close();
      }
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

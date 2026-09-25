import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../models/ui_schema.dart';
import '../state/form_registry.dart';
import '../state/data_binding.dart';
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

  static const Duration _defaultTimeout = Duration(seconds: 30);

  /// Optional custom HTTP client (e.g. locator<AuthServices>().clientWithInterceptor)
  static http.Client? _customHttpClient;

  /// Optional global base URL configured in Flutter code (e.g. 'https://api.mycompany.com')
  static String? _baseUrl;

  /// Optional static auth token passed from Flutter code (e.g. JWT token)
  static String? _authToken;

  /// Optional dynamic token provider function (e.g. () async => authService.currentToken)
  static FutureOr<String?> Function()? _authTokenProvider;

  /// Optional default headers injected into every request (e.g. X-App-Version, X-Tenant-Id)
  static final Map<String, String> _defaultHeaders = {};

  /// Optional user context data passed from Flutter code (e.g. {'userId': 'u123', 'email': 'user@example.com'})
  static final Map<String, dynamic> _userContext = {};

  /// Optionally provide the app's native http.Client (e.g. locator<AuthServices>().clientWithInterceptor).
  /// This ensures identical networking engine, SSL certificate handling, connection pooling, and interceptors.
  static void setHttpClient(http.Client? client) {
    _customHttpClient = client;
  }

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

  /// Register a dynamic Auth Token provider callback from Flutter code (supports async).
  static void setAuthTokenProvider(FutureOr<String?> Function()? provider) {
    _authTokenProvider = provider;
  }

  /// Retrieve the active auth token synchronously (cached fallback)
  static String? get authToken => _authToken;

  /// Retrieve active auth token asynchronously (supports async token retrieval from Firebase)
  static Future<String?> getAuthToken() async {
    if (_authTokenProvider != null) {
      try {
        final token = await _authTokenProvider!();
        if (token != null && token.isNotEmpty) {
          _authToken = token;
          return token;
        }
      } catch (e) {
        debugPrint('[GenUiApiClient] Error getting token from provider: $e');
      }
    }
    return _authToken;
  }

  /// Set default headers from Flutter code (e.g. app version, device ID, tenant)
  static void setDefaultHeaders(Map<String, String> headers) {
    _defaultHeaders.clear();
    _defaultHeaders.addAll(headers);
  }

  static Map<String, String> get defaultHeaders => Map.unmodifiable(_defaultHeaders);

  static FutureOr<Map<String, dynamic>> Function()? _userContextProvider;

  /// Register a dynamic User Context provider callback from Flutter code (supports async).
  static void setUserContextProvider(FutureOr<Map<String, dynamic>> Function()? provider) {
    _userContextProvider = provider;
  }

  /// Retrieve active user context asynchronously (supports async user fetching)
  static Future<Map<String, dynamic>> getUserContext() async {
    final Map<String, dynamic> result = Map<String, dynamic>.from(_userContext);
    if (_userContextProvider != null) {
      try {
        final dynamicCtx = await _userContextProvider!();
        if (dynamicCtx.isNotEmpty) {
          result.addAll(dynamicCtx);
        }
      } catch (e) {
        debugPrint('[GenUiApiClient] Error getting user context from provider: $e');
      }
    }
    return result;
  }

  /// Replaces path variables like {userId}, {id}, {email} with case-insensitive and alias resolution
  static String _injectPathVariables(String rawUrl, Map<String, dynamic> context) {
    String url = rawUrl;
    context.forEach((key, val) {
      if (val != null) {
        final strVal = Uri.encodeComponent(val.toString());
        url = url.replaceAll('{$key}', strVal);
        url = url.replaceAll('{${key.toLowerCase()}}', strVal);
      }
    });

    final uid = context['userId'] ??
        context['user_id'] ??
        context['id'] ??
        context['uid'];
    if (uid != null) {
      final strUid = Uri.encodeComponent(uid.toString());
      for (final alias in ['userId', 'user_id', 'id', 'uid']) {
        url = url.replaceAll('{$alias}', strUid);
        url = url.replaceAll('{${alias.toLowerCase()}}', strUid);
      }
    }
    return url;
  }

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
    _userContextProvider = null;
    _userContext.clear();
  }

  /// Resolves candidate base URLs when relative URLs (e.g. `/v1/leads`) are supplied.
  /// If [overrideBaseUrl] is passed, it takes highest precedence.
  static List<String> _candidateUrls(String? preferredUrl, {String? overrideBaseUrl}) {
    final List<String> urls = [];
    void add(String? u) {
      if (u == null || u.trim().isEmpty) return;
      final clean = u.trim().endsWith('/') ? u.trim().substring(0, u.trim().length - 1) : u.trim();
      if (!urls.contains(clean)) urls.add(clean);
    }

    // 0. Explicit Override Base URL from schema (when use_base_url_in_app is true)
    if (overrideBaseUrl != null && overrideBaseUrl.trim().isNotEmpty) {
      add(overrideBaseUrl);
      return urls;
    }

    // 1. Explicitly configured Flutter Base URL (e.g. https://api.mycompany.com)
    if (_baseUrl != null && _baseUrl!.trim().isNotEmpty) {
      add(_baseUrl);
      return urls;
    }

    // 2. Preferred URL if passed
    add(preferredUrl);

    // 3. Local sync server discovered URL for development hot-sync
    add(GenUiSyncClient.lastDiscoveredUrl);
    add(GenUiSyncClient.defaultServerUrl);

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
  /// - If [overrideBaseUrl] is set (e.g. from schema when use_base_url_in_app is true), it is used as the single target base URL.
  /// - If the URL is already an absolute URL (starts with http:// or https://), it is used directly.
  /// - If the URL is relative and starts with /api/mock, the sync server is prioritized.
  /// - If the URL is relative, joins with Flutter's configured [_baseUrl] (e.g. EndPoints.baseUrl).
  static List<String> resolveCandidateEndpoints(
    String rawUrl, {
    String? serverBaseUrl,
    String? overrideBaseUrl,
  }) {
    final List<String> candidates = [];
    var clean = rawUrl.trim();
    if (clean.isEmpty) return candidates;

    // 0. If overrideBaseUrl is explicitly configured, use it directly as the single target base URL
    if (overrideBaseUrl != null && overrideBaseUrl.trim().isNotEmpty) {
      final baseClean = overrideBaseUrl.trim().endsWith('/')
          ? overrideBaseUrl.trim().substring(0, overrideBaseUrl.trim().length - 1)
          : overrideBaseUrl.trim();

      String pathPart = clean;
      if (clean.startsWith('http://') || clean.startsWith('https://')) {
        try {
          final parsed = Uri.parse(clean);
          pathPart = parsed.path + (parsed.hasQuery ? '?${parsed.query}' : '');
        } catch (_) {}
      }
      final cleanPath = pathPart.startsWith('/') ? pathPart : '/$pathPart';
      candidates.add('$baseClean$cleanPath');
      return candidates;
    }

    // 1. If clean is an absolute URL (starts with http:// or https://)
    if (clean.startsWith('http://') || clean.startsWith('https://')) {
      String effectiveUrl = clean;
      if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
        if (effectiveUrl.contains('localhost') || effectiveUrl.contains('127.0.0.1')) {
          effectiveUrl = effectiveUrl
              .replaceAll('http://localhost', 'http://10.0.2.2')
              .replaceAll('http://127.0.0.1', 'http://10.0.2.2');
        }
      }
      candidates.add(effectiveUrl);
      return candidates;
    }

    // 2. Relative URL path
    final cleanPath = clean.startsWith('/') ? clean : '/$clean';

    // 2a. If it is a built-in sync server mock endpoint (e.g. /api/mock/...)
    if (cleanPath.startsWith('/api/mock')) {
      for (final syncHost in [GenUiSyncClient.lastDiscoveredUrl, GenUiSyncClient.defaultServerUrl, serverBaseUrl]) {
        if (syncHost != null && syncHost.isNotEmpty) {
          final cleanHost = syncHost.endsWith('/') ? syncHost.substring(0, syncHost.length - 1) : syncHost;
          final full = '$cleanHost$cleanPath';
          if (!candidates.contains(full)) candidates.add(full);
        }
      }
      return candidates;
    }

    // 2b. If _baseUrl is configured from Flutter code (e.g. EndPoints.baseUrl)
    if (_baseUrl != null && _baseUrl!.isNotEmpty) {
      final baseClean = _baseUrl!.endsWith('/') ? _baseUrl!.substring(0, _baseUrl!.length - 1) : _baseUrl!;
      candidates.add('$baseClean$cleanPath');
      return candidates;
    }

    // 2c. Fallback only if no baseUrl was ever configured
    for (final base in _candidateUrls(serverBaseUrl, overrideBaseUrl: overrideBaseUrl)) {
      String joined;
      if (base.endsWith('/api') && cleanPath.startsWith('/api/')) {
        joined = '${base.substring(0, base.length - 4)}$cleanPath';
      } else {
        joined = '$base$cleanPath';
      }
      if (!candidates.contains(joined)) candidates.add(joined);
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
    final client = (!config.useHeadersInApp && _customHttpClient != null)
        ? _customHttpClient!
        : (httpClient ?? http.Client());
    final bool shouldCloseClient = client != _customHttpClient && httpClient == null;

    try {
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
      String rawUrl = config.endpoint.isNotEmpty ? config.endpoint : config.url.trim();
      if (rawUrl.isEmpty) rawUrl = config.url.trim();
      if (rawUrl.isEmpty) {
        const err = 'API configuration has no URL specified.';
        if (context.mounted) _showErrorFeedback(context, err);
        return const GenUiApiResult(success: false, errorMessage: err);
      }

      // Replace URL path parameters from payload and userContext (e.g. /users/{userId}/orders)
      final activeUserCtx = await getUserContext();
      final Map<String, dynamic> mergedCtx = {...activeUserCtx, ...payload};
      rawUrl = _injectPathVariables(rawUrl, mergedCtx);

      final String? overrideBaseUrl = (config.useBaseUrlInApp && config.baseUrl.isNotEmpty)
          ? config.baseUrl
          : null;

      List<String> candidateEndpoints = resolveCandidateEndpoints(
        rawUrl,
        serverBaseUrl: serverBaseUrl,
        overrideBaseUrl: overrideBaseUrl,
      );

      // -------------------------------------------------------------
      // Step 4: Headers (Default headers + Auto Token + Schema headers)
      // -------------------------------------------------------------
      final Map<String, String> requestHeaders = {
        'Accept': 'application/json, text/plain, */*',
      };
      if (config.method.toUpperCase() != 'GET') {
        requestHeaders['Content-Type'] = 'application/json';
      }

      // 1. If useHeadersInApp is enabled, apply headers configured from Web Console
      if (config.useHeadersInApp && config.headers.isNotEmpty) {
        requestHeaders.addAll(config.headers);
      }

      // 2. Auto-inject active Auth Token if not provided or if useHeadersInApp is false
      final activeToken = await getAuthToken();
      if (activeToken != null && activeToken.isNotEmpty && !requestHeaders.containsKey('Authorization')) {
        final authValue = activeToken.startsWith('Bearer ') ? activeToken : 'Bearer $activeToken';
        requestHeaders['Authorization'] = authValue;
      }

      // 3. Inject default Flutter headers if set (App-Version, App-Language)
      if (_defaultHeaders.isNotEmpty) {
        _defaultHeaders.forEach((k, v) {
          if (!requestHeaders.containsKey(k)) requestHeaders[k] = v;
        });
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

      // Attempt Proxy fallback if direct fetch threw or returned >= 500
      if (response == null || response.statusCode >= 500) {
        final List<String> syncHosts = [];
        void addHost(String? h) {
          if (h == null || h.trim().isEmpty) return;
          final clean = h.trim().endsWith('/') ? h.trim().substring(0, h.trim().length - 1) : h.trim();
          if (!syncHosts.contains(clean)) syncHosts.add(clean);
        }
        addHost(serverBaseUrl);
        addHost(GenUiSyncClient.lastDiscoveredUrl);
        addHost(GenUiSyncClient.defaultServerUrl);

        for (final targetUrl in candidateEndpoints) {
          final isExternal = !targetUrl.contains('10.0.2.2') &&
              !targetUrl.contains('127.0.0.1') &&
              !targetUrl.contains('localhost');
          if (isExternal) {
            for (final syncHost in syncHosts) {
              try {
                final proxyUri = Uri.parse('$syncHost/api/proxy');
                debugPrint('[GenUiApiClient] Trying executeApi proxy fallback via: $proxyUri for $targetUrl');
                final proxyPayload = json.encode({
                  'url': targetUrl,
                  'method': config.method.toUpperCase(),
                  'headers': requestHeaders,
                  if (config.method.toUpperCase() != 'GET' && payload.isNotEmpty) 'body': payload,
                });
                final proxyResp = await http.post(
                  proxyUri,
                  headers: {'Content-Type': 'application/json'},
                  body: proxyPayload,
                ).timeout(const Duration(seconds: 15));
                debugPrint('[GenUiApiClient] Proxy HTTP ${proxyResp.statusCode} for $targetUrl');
                if (proxyResp.statusCode >= 200 && proxyResp.statusCode < 500) {
                  response = proxyResp;
                  lastStatusCode = response.statusCode;
                  break;
                }
              } catch (proxyErr) {
                debugPrint('[GenUiApiClient] Proxy fallback failed on $syncHost: $proxyErr');
              }
            }
            if (response != null && response.statusCode >= 200 && response.statusCode < 500) {
              break;
            }
          }
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
    } finally {
      if (shouldCloseClient) {
        client.close();
      }
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
    final client = (!dataSource.useHeadersInApp && _customHttpClient != null)
        ? _customHttpClient!
        : (httpClient ?? http.Client());
    final bool shouldCloseClient = client != _customHttpClient && httpClient == null;

    try {
      // 1. Build URL and inject path variables / userContext
      String rawUrl = dataSource.endpoint.isNotEmpty ? dataSource.endpoint : dataSource.url.trim();
      if (rawUrl.isEmpty) rawUrl = dataSource.url.trim();
      if (rawUrl.isEmpty) return null;

      final activeUserCtx = await getUserContext();
      rawUrl = _injectPathVariables(rawUrl, activeUserCtx);

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

      final String? overrideBaseUrl = (dataSource.useBaseUrlInApp && dataSource.baseUrl.isNotEmpty)
          ? dataSource.baseUrl
          : null;

      // Resolve candidate endpoints
      List<String> candidateEndpoints = resolveCandidateEndpoints(
        rawUrl,
        serverBaseUrl: serverBaseUrl,
        overrideBaseUrl: overrideBaseUrl,
      );

      // Base headers
      final Map<String, String> requestHeaders = {
        'Accept': 'application/json, text/plain, */*',
      };
      if (dataSource.method.toUpperCase() != 'GET') {
        requestHeaders['Content-Type'] = 'application/json';
      }

      // 1. If useHeadersInApp is enabled, apply headers configured from Web Console
      if (dataSource.useHeadersInApp && dataSource.headers.isNotEmpty) {
        requestHeaders.addAll(dataSource.headers);
      }

      // 2. Auto-inject active Auth Token if not provided or if useHeadersInApp is false
      final activeToken = await getAuthToken();
      if (activeToken != null && activeToken.isNotEmpty && !requestHeaders.containsKey('Authorization')) {
        final authValue = activeToken.startsWith('Bearer ') ? activeToken : 'Bearer $activeToken';
        requestHeaders['Authorization'] = authValue;
      }

      // 3. Inject default Flutter headers if set (App-Version, App-Language)
      if (_defaultHeaders.isNotEmpty) {
        _defaultHeaders.forEach((k, v) {
          if (!requestHeaders.containsKey(k)) requestHeaders[k] = v;
        });
      }

      // Collect sync hosts for potential proxy fallback if direct fetch fails
      final List<String> syncHosts = [];
      void addHost(String? h) {
        if (h == null || h.trim().isEmpty) return;
        final clean = h.trim().endsWith('/') ? h.trim().substring(0, h.trim().length - 1) : h.trim();
        if (!syncHosts.contains(clean)) syncHosts.add(clean);
      }
      addHost(serverBaseUrl);
      addHost(GenUiSyncClient.lastDiscoveredUrl);
      addHost(GenUiSyncClient.defaultServerUrl);
      if (syncHosts.isEmpty) {
        if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
          addHost('http://10.0.2.2:8080');
        } else {
          addHost('http://127.0.0.1:8080');
        }
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

          final endpointHeaders = Map<String, String>.from(requestHeaders);

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
            if (dataSource.resultsPath.isNotEmpty) {
              final extracted = GenUiDataBinding.extractValue(decoded, dataSource.resultsPath);
              if (extracted != null) {
                decoded = extracted;
              }
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
                final proxyUri = Uri.parse('$syncHost/api/proxy');
                debugPrint('[GenUiApiClient] Trying proxy fallback via: $proxyUri for $finalUri');
                final proxyPayload = json.encode({
                  'url': finalUri.toString(),
                  'method': method,
                  'headers': endpointHeaders,
                  if (method != 'GET' && extraParams != null && extraParams.isNotEmpty) 'body': extraParams,
                });
                final proxyResp = await http.post(
                  proxyUri,
                  headers: {'Content-Type': 'application/json'},
                  body: proxyPayload,
                ).timeout(const Duration(seconds: 15));
                debugPrint('[GenUiApiClient] Proxy HTTP ${proxyResp.statusCode} for $finalUri');
                if (proxyResp.statusCode >= 200 && proxyResp.statusCode < 300) {
                  dynamic decoded = json.decode(utf8.decode(proxyResp.bodyBytes));
                  if (dataSource.resultsPath.isNotEmpty) {
                    final extracted = GenUiDataBinding.extractValue(decoded, dataSource.resultsPath);
                    if (extracted != null) {
                      decoded = extracted;
                    }
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

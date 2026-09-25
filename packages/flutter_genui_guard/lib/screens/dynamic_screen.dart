import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import '../genui_guard.dart';

class DynamicScreen extends StatefulWidget {
  final String? route;
  final String? screenId;
  final dynamic arguments;
  final bool? enableLiveSync;

  const DynamicScreen({
    super.key,
    this.route,
    this.screenId,
    this.arguments,
    this.enableLiveSync,
  });

  @override
  State<DynamicScreen> createState() => _DynamicScreenState();
}

class _DynamicScreenState extends State<DynamicScreen> {
  GenUiSyncClient? _syncClient;
  StreamSubscription? _screenRegistrySub;
  StreamSubscription? _globalUrlSub;
  UiSchema _currentSchema = UiSchema.empty();
  bool _isGuardedMode = true;
  String _serverUrl = '';
  int _lastRenderDurationMs = 0;
  final List<String> _isolatedErrors = [];
  String? _lastInterceptedAnomaly;

  // Dynamic Data Source & API State
  dynamic _screenData;
  bool _isDataLoading = false;
  bool _isPaginating = false;
  bool _isSubmitting = false;
  String? _submittingNodeId;
  int _currentPage = 1;
  bool _hasMore = true;
  final ScrollController _scrollController = ScrollController();
  String? _fetchError;

  bool get _shouldSync =>
      widget.enableLiveSync ??
      (widget.route == null || widget.route == '/' || widget.screenId == 'home');

  @override
  void initState() {
    super.initState();
    _initServerUrl();
    _scrollController.addListener(_onScroll);

    // 1. Preload from local screen registry if cached
    final cached = GenUiScreenRegistry.instance.getSchemaForRoute(widget.route ?? widget.screenId);
    if (cached != null) {
      _currentSchema = cached;
      if (_currentSchema.dataSource != null) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          _fetchScreenData();
        });
      }
    }

    // 2. Start sync client if this is the primary sync screen
    if (_shouldSync) {
      _syncClient = GenUiSyncClient(serverBaseUrl: _serverUrl);
      _syncClient!.schemaStream.listen((newSchema) {
        final isHome = widget.route == null || widget.route == '/' || widget.screenId == 'home';
        final matchesRoute = newSchema.route == widget.route || newSchema.screenId == widget.screenId || newSchema.screenId == widget.route?.replaceAll('/', '');
        if (matchesRoute || (isHome && (newSchema.route == '/' || newSchema.screenId == 'home'))) {
          _onSchemaUpdated(newSchema);
        }
      });
      _syncClient!.start();
    }

    // 3. Listen to multi-screen registry stream for reactive live updates
    _screenRegistrySub = GenUiScreenRegistry.instance.screensStream.listen((_) {
      final updated = GenUiScreenRegistry.instance.getSchemaForRoute(widget.route ?? widget.screenId);
      if (updated != null && mounted) {
        _onSchemaUpdated(updated);
      }
    });

    // 4. Listen to global server URL changes from any screen connection dialog
    _globalUrlSub = GenUiSyncClient.onServerUrlChanged.listen((newUrl) {
      if (mounted && _serverUrl != newUrl) {
        setState(() {
          _serverUrl = newUrl;
        });
        if (_shouldSync) {
          _syncClient?.dispose();
          _syncClient = GenUiSyncClient(serverBaseUrl: _serverUrl);
          _syncClient!.schemaStream.listen((newSchema) {
            final isHome = widget.route == null || widget.route == '/' || widget.screenId == 'home';
            final matchesRoute = newSchema.route == widget.route || newSchema.screenId == widget.screenId || newSchema.screenId == widget.route?.replaceAll('/', '');
            if (matchesRoute || (isHome && (newSchema.route == '/' || newSchema.screenId == 'home'))) {
              _onSchemaUpdated(newSchema);
            }
          });
          _syncClient!.start();
        }
        if (_currentSchema.dataSource != null) {
          _fetchScreenData(isRefresh: true);
        }
      }
    });
  }

  void _onScroll() {
    if (!_scrollController.hasClients) return;
    final maxScroll = _scrollController.position.maxScrollExtent;
    final currentScroll = _scrollController.position.pixels;
    if (maxScroll - currentScroll <= 200) {
      if (_currentSchema.dataSource?.pagination != null &&
          !_isDataLoading &&
          !_isPaginating &&
          _hasMore) {
        _fetchScreenData(isNextPage: true);
      }
    }
  }

  Future<void> _fetchScreenData({bool isRefresh = false, bool isNextPage = false}) async {
    final ds = _currentSchema.dataSource;
    if (ds == null) return;
    if (_isDataLoading || _isPaginating) return;
    if (isNextPage && !_hasMore) return;

    final targetPage = isNextPage ? (_currentPage + 1) : 1;

    setState(() {
      if (isNextPage) {
        _isPaginating = true;
      } else {
        _isDataLoading = true;
      }
    });

    try {
      final result = await GenUiApiClient.fetchDataSource(
        dataSource: ds,
        page: targetPage,
        pageSize: ds.pagination?.defaultLimit,
        serverBaseUrl: _syncClient?.activeUrl ?? _serverUrl,
      );

      if (!mounted) return;

      if (result == null) {
        setState(() {
          _isDataLoading = false;
          _isPaginating = false;
          if (isNextPage) {
            _hasMore = false;
          } else {
            _fetchError = ds.errorMessage.isNotEmpty
                ? ds.errorMessage
                : 'Unable to load data from ${ds.url}';
          }
        });
        return;
      }

      setState(() {
        _isDataLoading = false;
        _isPaginating = false;
        _fetchError = null;

        if (isNextPage) {
          _currentPage = targetPage;
          _mergeNextPageData(result);
        } else {
          _currentPage = 1;
          _hasMore = true;
          _screenData = result;
        }
      });
    } catch (e) {
      debugPrint('[DynamicScreen] Failed to fetch data source: $e');
      if (mounted) {
        setState(() {
          _isDataLoading = false;
          _isPaginating = false;
          _fetchError = ds.errorMessage.isNotEmpty
              ? ds.errorMessage
              : 'Unable to load data: $e';
        });
      }
    }
  }

  void _mergeNextPageData(dynamic newResult) {
    if (newResult == null) return;

    if (_screenData is List && newResult is List) {
      final list = _screenData as List;
      _screenData = [...list, ...newResult];
      if (newResult.isEmpty || newResult.length < (_currentSchema.dataSource?.pagination?.defaultLimit ?? 10)) {
        _hasMore = false;
      }
      return;
    }

    if (_screenData is Map && newResult is Map) {
      final targetKey = _currentSchema.dataSource?.pagination?.dataPath ?? '';
      String? arrayKey = targetKey.isNotEmpty ? targetKey : null;

      if (arrayKey == null) {
        for (final k in ['items', 'data', 'results', 'products', 'users', 'records']) {
          if (newResult[k] is List) {
            arrayKey = k;
            break;
          }
        }
      }

      if (arrayKey != null && newResult[arrayKey] is List) {
        final existingList = (_screenData as Map)[arrayKey];
        final addedList = newResult[arrayKey] as List;
        final mergedList = existingList is List ? [...existingList, ...addedList] : addedList;

        final updatedMap = Map<String, dynamic>.from(_screenData as Map);
        updatedMap[arrayKey] = mergedList;
        if (newResult['total'] != null) updatedMap['total'] = newResult['total'];
        if (newResult['skip'] != null) updatedMap['skip'] = newResult['skip'];
        _screenData = updatedMap;

        if (addedList.isEmpty || addedList.length < (_currentSchema.dataSource?.pagination?.defaultLimit ?? 10)) {
          _hasMore = false;
        }
        if (newResult['total'] is num && mergedList.length >= (newResult['total'] as num)) {
          _hasMore = false;
        }
      } else {
        _screenData = newResult;
      }
    }
  }

  void _initServerUrl() {
    _serverUrl = GenUiSyncClient.defaultServerUrl;
  }

  void _onSchemaUpdated(UiSchema newSchema) {
    final stopwatch = Stopwatch()..start();
    
    // Detect intercepted anomalies for visual telemetry
    String? detected;
    for (final c in newSchema.components) {
      final title = c.properties['title']?.toString() ?? '';
      final msg = c.properties['message']?.toString() ?? '';
      final desc = c.properties['description']?.toString() ?? '';
      final actionId = c.properties['action_id']?.toString() ?? '';
      final height = c.properties['height'];

      if (actionId == 'action_blocked_insecure' || actionId.startsWith('javascript:')) {
        detected = 'Blocked Insecure Protocol / XSS in Action Payload';
      } else if (c.properties['has_color_anomaly'] == true ||
          c.id.contains('bad_color') ||
          (c.properties['color'] != null && !GenUiSchemaValidator.isValidHexColor(c.properties['color']))) {
        detected = 'Malformed Color Hex Sanitized to Brand Token (#4F46E5)';
      } else if (c.properties['has_type_mismatch'] == true ||
          c.id.contains('type_err') ||
          (c.properties.containsKey('metrics') && c.properties['metrics'] is! List)) {
        detected = 'Type Mismatch Coerced (String to List<MetricItem>)';
      } else if (c.type == 'invalid' || c.type == 'truncated' || !SafeWidgetRegistry.supportedTypes.contains(c.type)) {
        detected = 'Contained Malformed / Hallucinated Component AST';
      } else if ((height is num && height < 0) || (c.properties['height_coerced'] == true)) {
        detected = 'Sanitized Negative/Zero Layout Height (Assertion Guard)';
      } else if (c.id.contains('text_bomb') ||
          title.length > 60 ||
          msg.length > 100 ||
          desc.length > 120 ||
          title.contains('OVERFLOW') ||
          title.contains('UNBOUNDED')) {
        detected = 'Clamped Text Overflow (RenderFlex Overflow Prevented)';
      }
    }

    final dataSourceChanged = newSchema.dataSource != null &&
        (_currentSchema.dataSource?.url != newSchema.dataSource?.url || _screenData == null);

    setState(() {
      _currentSchema = newSchema;
      _isolatedErrors.clear();
      _lastInterceptedAnomaly = detected;
      if (dataSourceChanged) {
        _screenData = null;
        _fetchError = null;
        _isDataLoading = true;
      }
    });
    stopwatch.stop();
    _lastRenderDurationMs = stopwatch.elapsedMilliseconds;

    if (dataSourceChanged) {
      _fetchScreenData(isRefresh: true);
    }
  }

  void _showConnectionDialog() {
    GenUiSyncClient.showConnectionDialog(context);
  }

  bool get _isPushedScreen =>
      widget.route != null && widget.route != '/' && widget.screenId != 'home';

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    _screenRegistrySub?.cancel();
    _globalUrlSub?.cancel();
    _syncClient?.dispose();
    // Pushed screens (Contact Us, Feedback & Review, ...) drop their form
    // values on close so the next visit starts clean and nothing leaks into
    // other screens' submissions. The Home screen keeps its state.
    if (_isPushedScreen) {
      GenUiFormRegistry.instance.removeFields(_screenFieldIds);
    }
    super.dispose();
  }

  void _handleExecute(ComponentNode node) async {
    // 1. If component or screen has a dynamic API configured, execute it dynamically
    final apiConfig = node.apiConfig ?? (node.properties['action_type'] == 'api_call' ? _currentSchema.apiConfig : null);
    if (apiConfig != null) {
      setState(() {
        _isSubmitting = true;
        _submittingNodeId = node.id;
      });
      try {
        await GenUiApiClient.executeApi(
          context: context,
          config: apiConfig,
          screenFieldIds: _screenFieldIds,
          components: _currentSchema.components,
          screenId: _currentSchema.screenId,
          screenTitle: _currentSchema.header.title.isNotEmpty ? _currentSchema.header.title : _currentSchema.screenName,
          serverBaseUrl: _syncClient?.activeUrl ?? _serverUrl,
        );
      } finally {
        if (mounted) {
          setState(() {
            _isSubmitting = false;
            _submittingNodeId = null;
          });
        }
      }
      return;
    }

    // 2. Custom Dart code snippet configured from Web Console
    final customCode = GenUiDartExecutor.extractCode(node);
    if (customCode != null && customCode.isNotEmpty) {
      GenUiDartExecutor.execute(
        context: context,
        code: customCode,
        node: node,
        isGuarded: _isGuardedMode,
      );
      return;
    }

    // 3. Declarative Success Dialog on button
    final successDialog = GenUiSuccessDialog.fromProperties(node.properties);
    if (successDialog != null) {
      GenUiSuccessDialog.show(context, successDialog);
      return;
    }

    // 4. Fallback to actionId
    final actionId = node.properties['action_id']?.toString() ?? 'action_default';
    _handleAction(actionId, node: node);
  }

  /// IDs of the fields rendered on this screen (used to scope validation and
  /// submission so values from other screens are never mixed in).
  Set<String> get _screenFieldIds => _currentSchema.allComponentIds;

  void _handleAction(String actionId, {ComponentNode? node}) {
    if (actionId.isEmpty || actionId == 'none') return;

    // Check if route navigation is specified in actionId (e.g. /contact or nav:/feedback)
    if (actionId.startsWith('/')) {
      Navigator.pushNamed(context, actionId);
      return;
    }
    if (actionId.startsWith('nav:') || actionId.startsWith('route:')) {
      final target = actionId.substring(actionId.indexOf(':') + 1).trim();
      Navigator.pushNamed(context, target.startsWith('/') ? target : '/$target');
      return;
    }

    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Triggered Action: "$actionId"'),
        duration: const Duration(seconds: 2),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = _currentSchema.theme;
    final header = _currentSchema.header;

    return Scaffold(
      backgroundColor: theme.backgroundColor,
      appBar: AppBar(
        backgroundColor: theme.surfaceColor,
        elevation: 0,
        leading: Navigator.canPop(context)
            ? IconButton(
                icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white, size: 20),
                onPressed: () => Navigator.maybePop(context),
              )
            : null,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              header.title.isNotEmpty ? header.title : (widget.route ?? 'Generative UI'),
              style: TextStyle(
                color: theme.textPrimary,
                fontSize: 16.0,
                fontWeight: FontWeight.w700,
              ),
            ),
            if (header.subtitle.isNotEmpty)
              Text(
                header.subtitle,
                style: TextStyle(
                  color: theme.textSecondary,
                  fontSize: 11.0,
                ),
              ),
          ],
        ),
        actions: [
          // Mode Toggle (Guarded vs Naive)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 6.0),
            child: Row(
              children: [
                Icon(
                  _isGuardedMode ? Icons.shield : Icons.gpp_bad,
                  color: _isGuardedMode ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                  size: 18.0,
                ),
                const SizedBox(width: 4.0),
                Text(
                  _isGuardedMode ? 'GUARDED' : 'NAIVE',
                  style: TextStyle(
                    color: _isGuardedMode ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                    fontSize: 10.0,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                Switch(
                  value: _isGuardedMode,
                  activeColor: const Color(0xFF10B981),
                  activeTrackColor: const Color(0xFF10B981).withOpacity(0.3),
                  inactiveThumbColor: const Color(0xFFEF4444),
                  inactiveTrackColor: const Color(0xFFEF4444).withOpacity(0.3),
                  onChanged: (val) {
                    setState(() {
                      _isGuardedMode = val;
                    });
                  },
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.settings_ethernet, color: Color(0xFF94A3B8)),
            tooltip: 'Sync Settings',
            onPressed: _showConnectionDialog,
          ),
        ],
      ),
      body: Column(
        children: [
          // Arguments Info Banner (if navigated with route arguments)
          if (widget.arguments != null)
            Container(
              margin: const EdgeInsets.fromLTRB(14.0, 8.0, 14.0, 2.0),
              padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 8.0),
              decoration: BoxDecoration(
                color: const Color(0xFF6366F1).withOpacity(0.15),
                borderRadius: BorderRadius.circular(8.0),
                border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.5)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.info_outline, color: Color(0xFF818CF8), size: 16.0),
                  const SizedBox(width: 8.0),
                  Expanded(
                    child: Text(
                      'Route Arguments: ${widget.arguments}',
                      style: const TextStyle(
                        color: Color(0xFFE0E7FF),
                        fontSize: 11.0,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          // Live Sync Status Banner
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 6.0),
            color: const Color(0xFF0F172A),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      width: 8.0,
                      height: 8.0,
                      decoration: BoxDecoration(
                        color: (_syncClient?.isConnected ?? true)
                            ? const Color(0xFF10B981)
                            : const Color(0xFFF59E0B),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 8.0),
                    Text(
                      (_syncClient?.isConnected ?? true)
                          ? 'Live Sync v${_currentSchema.version} • ${(_syncClient?.activeUrl ?? _serverUrl).replaceFirst("http://", "")}'
                          : 'Connecting to ${(_syncClient?.activeUrl ?? _serverUrl).replaceFirst("http://", "")}...',
                      style: const TextStyle(
                        color: Color(0xFF94A3B8),
                        fontSize: 11.0,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                Text(
                  'Render: ${_lastRenderDurationMs}ms | Nodes: ${_currentSchema.components.length}',
                  style: const TextStyle(
                    color: Color(0xFF64748B),
                    fontSize: 11.0,
                  ),
                ),
              ],
            ),
          ),

          // Live Guard Telemetry Banner (Visual proof of attack interception)
          if (_lastInterceptedAnomaly != null && _isGuardedMode)
            Container(
              margin: const EdgeInsets.fromLTRB(14.0, 8.0, 14.0, 2.0),
              padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 8.0),
              decoration: BoxDecoration(
                color: const Color(0xFF10B981).withOpacity(0.12),
                borderRadius: BorderRadius.circular(8.0),
                border: Border.all(color: const Color(0xFF10B981).withOpacity(0.4)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.shield_rounded, color: Color(0xFF10B981), size: 16.0),
                  const SizedBox(width: 8.0),
                  Expanded(
                    child: Text(
                      '🛡 Guard Active: $_lastInterceptedAnomaly',
                      style: const TextStyle(
                        color: Color(0xFF10B981),
                        fontSize: 11.0,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),

          if (_lastInterceptedAnomaly != null && !_isGuardedMode)
            Container(
              margin: const EdgeInsets.fromLTRB(14.0, 8.0, 14.0, 2.0),
              padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 8.0),
              decoration: BoxDecoration(
                color: const Color(0xFFEF4444).withOpacity(0.15),
                borderRadius: BorderRadius.circular(8.0),
                border: Border.all(color: const Color(0xFFEF4444).withOpacity(0.5)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.warning_amber_rounded, color: Color(0xFFEF4444), size: 16.0),
                  SizedBox(width: 8.0),
                  Expanded(
                    child: Text(
                      '💥 NAIVE UNPROTECTED: Layout Exception Triggered! (Flip to GUARDED to heal)',
                      style: TextStyle(
                        color: Color(0xFFFCA5A5),
                        fontSize: 11.0,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ],
              ),
            ),

          // Configured API Error Widget if GET fetch failed (set by admin in web console)
          if (_fetchError != null && _screenData == null && (_currentSchema.dataSource?.showErrorWidget ?? true))
            _buildConfiguredErrorWidget(_currentSchema.dataSource!, theme),

          // Dynamic Component Feed
          Expanded(
            child: _currentSchema.components.isEmpty
                ? Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const CircularProgressIndicator(),
                        const SizedBox(height: 16.0),
                        Text(
                          'Awaiting schema from Web Dashboard...\n($_serverUrl)',
                          textAlign: TextAlign.center,
                          style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12.0),
                        ),
                      ],
                    ),
                  )
                : _isDataLoading
                    ? _buildLoadingSkeleton(theme)
                    : RefreshIndicator(
                        color: theme.primaryColor,
                        backgroundColor: theme.surfaceColor,
                        onRefresh: () async {
                          if (_currentSchema.dataSource != null) {
                            await _fetchScreenData(isRefresh: true);
                          }
                        },
                        child: ListView.builder(
                          controller: _scrollController,
                          physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
                          padding: const EdgeInsets.all(14.0),
                          itemCount: _currentSchema.components.length,
                          itemBuilder: (context, index) {
                            final rawNode = _currentSchema.components[index];

                            // Prepare interpolation context with dynamic API data
                            final interpolationContext = GenUiDataBinding.buildInterpolationContext(_screenData);
                            if (_isPaginating) {
                              interpolationContext['is_paginating'] = true;
                            }

                            ComponentNode node = GenUiDataBinding.interpolateNode(rawNode, interpolationContext);

                            // Inject submit loader status into button nodes
                            if (_isSubmitting && (_submittingNodeId == null || node.id == _submittingNodeId || node.type == 'button')) {
                              final props = Map<String, dynamic>.from(node.properties);
                              props['is_submitting'] = true;
                              node = ComponentNode(
                                id: node.id,
                                type: node.type,
                                properties: props,
                                children: node.children,
                              );
                            }

                            return SafeWidgetRegistry.buildNode(
                              node: node,
                              theme: theme,
                              isGuarded: _isGuardedMode,
                              onExecute: _handleExecute,
                              onAction: _handleAction,
                              onError: (compId, err) {
                                if (!_isolatedErrors.contains(compId)) {
                                  _isolatedErrors.add(compId);
                                }
                              },
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  /// Shimmer loading skeleton displayed while screen data source is fetching
  Widget _buildLoadingSkeleton(ThemeConfig theme) {
    return ListView(
      padding: const EdgeInsets.all(16.0),
      children: [
        // Header card skeleton
        Container(
          height: 110,
          decoration: BoxDecoration(
            color: theme.surfaceColor,
            borderRadius: BorderRadius.circular(16.0),
            border: Border.all(color: theme.textSecondary.withOpacity(0.1)),
          ),
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 140,
                height: 16,
                decoration: BoxDecoration(
                  color: theme.textSecondary.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
              const SizedBox(height: 12),
              Container(
                width: double.infinity,
                height: 24,
                decoration: BoxDecoration(
                  color: theme.primaryColor.withOpacity(0.25),
                  borderRadius: BorderRadius.circular(6),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        // List item skeleton rows
        ...List.generate(4, (i) => Container(
          margin: const EdgeInsets.only(bottom: 10),
          height: 72,
          decoration: BoxDecoration(
            color: theme.surfaceColor,
            borderRadius: BorderRadius.circular(12.0),
            border: Border.all(color: theme.textSecondary.withOpacity(0.08)),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: theme.textSecondary.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 160,
                      height: 14,
                      decoration: BoxDecoration(
                        color: theme.textSecondary.withOpacity(0.25),
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      width: 100,
                      height: 11,
                      decoration: BoxDecoration(
                        color: theme.textSecondary.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        )),
        const SizedBox(height: 16),
        Center(
          child: SizedBox(
            width: 24,
            height: 24,
            child: CircularProgressIndicator(
              strokeWidth: 2.5,
              valueColor: AlwaysStoppedAnimation<Color>(theme.primaryColor),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildConfiguredErrorWidget(ApiDataSource ds, ThemeConfig theme) {
    final msg = ds.errorMessage.isNotEmpty
        ? ds.errorMessage
        : (_fetchError ?? 'Unable to load dynamic data from server');

    if (ds.errorWidgetType == 'card') {
      return Container(
        margin: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 10.0),
        padding: const EdgeInsets.all(16.0),
        decoration: BoxDecoration(
          color: theme.surfaceColor,
          borderRadius: BorderRadius.circular(12.0),
          border: Border.all(color: const Color(0xFFEF4444).withOpacity(0.5)),
        ),
        child: Row(
          children: [
            const Icon(Icons.error_outline_rounded, color: Color(0xFFEF4444), size: 24.0),
            const SizedBox(width: 12.0),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    msg,
                    style: TextStyle(
                      color: theme.textPrimary,
                      fontSize: 14.0,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  if (ds.url.isNotEmpty) ...[
                    const SizedBox(height: 4.0),
                    Text(
                      ds.url,
                      style: TextStyle(
                        color: theme.textSecondary,
                        fontSize: 11.0,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      );
    }

    // Default 'banner'
    return Container(
      margin: const EdgeInsets.fromLTRB(14.0, 8.0, 14.0, 4.0),
      padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 10.0),
      decoration: BoxDecoration(
        color: const Color(0xFFEF4444).withOpacity(0.12),
        borderRadius: BorderRadius.circular(8.0),
        border: Border.all(color: const Color(0xFFEF4444).withOpacity(0.35)),
      ),
      child: Row(
        children: [
          const Icon(Icons.info_outline_rounded, color: Color(0xFFEF4444), size: 18.0),
          const SizedBox(width: 8.0),
          Expanded(
            child: Text(
              msg,
              style: const TextStyle(
                color: Color(0xFFFCA5A5),
                fontSize: 12.0,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

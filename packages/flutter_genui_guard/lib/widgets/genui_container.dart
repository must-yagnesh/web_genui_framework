import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../boundary/error_boundary.dart';
import '../executor/dart_executor.dart';
import '../models/ui_schema.dart';
import '../registry/widget_registry.dart';
import '../sync/api_client.dart';
import '../sync/screen_registry.dart';
import '../sync/sync_client.dart';
import '../widgets/success_dialog.dart';

/// GenUiContainer
///
/// An embeddable container widget designed to drop into any existing Flutter screen,
/// ListView, or Column without requiring a Scaffold, AppBar, or static form logic.
///
/// All UI layout, form inputs, validation rules, and Cloud API calls are loaded
/// and managed 100% dynamically from the Web Console.
class GenUiContainer extends StatefulWidget {
  /// The unique screen or section identifier configured in the Web Console
  /// (e.g. 'super_save_dashboard', 'home', 'promo_banner').
  final String screenId;

  /// Custom sync server base URL (e.g. 'http://localhost:8080').
  /// If null, defaults to 10.0.2.2:8080 on Android Emulator and localhost:8080 on iOS/Desktop.
  final String? serverUrl;

  /// Outer padding for the rendered components.
  final EdgeInsetsGeometry? padding;

  /// Optional custom placeholder to show when no schema is loaded yet.
  /// Defaults to `SizedBox.shrink()` (invisible until schema arrives).
  final Widget? placeholder;

  /// Whether to show a subtle status indicator during live sync updates.
  final bool showLiveBadge;

  const GenUiContainer({
    super.key,
    this.screenId = 'super_save_dashboard',
    this.serverUrl,
    this.padding,
    this.placeholder,
    this.showLiveBadge = false,
  });

  @override
  State<GenUiContainer> createState() => _GenUiContainerState();
}

class _GenUiContainerState extends State<GenUiContainer> {
  GenUiSyncClient? _syncClient;
  StreamSubscription? _screenRegistrySub;
  StreamSubscription? _schemaSub;
  UiSchema _currentSchema = UiSchema.empty();
  String _activeServerUrl = '';
  final List<String> _isolatedErrors = [];

  @override
  void initState() {
    super.initState();
    _initServerUrl();

    // 1. Preload cached schema if already fetched
    final cached = GenUiScreenRegistry.instance.getSchemaForRoute(widget.screenId);
    if (cached != null && cached.components.isNotEmpty) {
      _currentSchema = cached;
    }

    // 2. Start Live Sync Client
    _startSyncClient();

    // 3. Listen to registry updates
    _screenRegistrySub = GenUiScreenRegistry.instance.screensStream.listen((_) {
      final updated = GenUiScreenRegistry.instance.getSchemaForRoute(widget.screenId);
      if (updated != null && mounted) {
        setState(() {
          _currentSchema = updated;
          _isolatedErrors.clear();
        });
      }
    });
  }

  void _initServerUrl() {
    if (widget.serverUrl != null && widget.serverUrl!.isNotEmpty) {
      _activeServerUrl = widget.serverUrl!;
      return;
    }
    _activeServerUrl = GenUiSyncClient.defaultServerUrl;
  }

  void _startSyncClient() {
    try {
      _syncClient = GenUiSyncClient(serverBaseUrl: _activeServerUrl);
      _schemaSub = _syncClient!.schemaStream.listen((newSchema) {
        final matches = newSchema.screenId == widget.screenId ||
            newSchema.route == widget.screenId ||
            newSchema.route == '/${widget.screenId}' ||
            (widget.screenId == 'super_save_dashboard' && (newSchema.screenId == 'home' || newSchema.route == '/'));

        if (matches && mounted) {
          setState(() {
            _currentSchema = newSchema;
            _isolatedErrors.clear();
          });
        }
      });
      _syncClient!.start();
    } catch (e) {
      debugPrint('[GenUiContainer] Sync client start warning: $e');
    }
  }

  @override
  void didUpdateWidget(covariant GenUiContainer oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.screenId != widget.screenId || oldWidget.serverUrl != widget.serverUrl) {
      _schemaSub?.cancel();
      _syncClient?.dispose();
      _initServerUrl();
      _startSyncClient();
    }
  }

  @override
  void dispose() {
    _schemaSub?.cancel();
    _screenRegistrySub?.cancel();
    _syncClient?.dispose();
    super.dispose();
  }

  Set<String> get _screenFieldIds => _currentSchema.allComponentIds;

  void _handleExecute(ComponentNode node) {
    try {
      // 1. Dynamic Cloud API
      final apiConfig = node.apiConfig ??
          (node.properties['action_type'] == 'api_call' ? _currentSchema.apiConfig : null);
      if (apiConfig != null) {
        GenUiApiClient.executeApi(
          context: context,
          config: apiConfig,
          screenFieldIds: _screenFieldIds,
          components: _currentSchema.components,
          screenId: _currentSchema.screenId,
          screenTitle: _currentSchema.header.title.isNotEmpty
              ? _currentSchema.header.title
              : _currentSchema.screenName,
          serverBaseUrl: _syncClient?.activeUrl ?? _activeServerUrl,
        );
        return;
      }

      // 2. Custom Dart Code Snippet
      final customCode = GenUiDartExecutor.extractCode(node);
      if (customCode != null && customCode.isNotEmpty) {
        GenUiDartExecutor.execute(
          context: context,
          code: customCode,
          node: node,
          isGuarded: true,
        );
        return;
      }

      // 3. Declarative Success Dialog
      final successDialog = GenUiSuccessDialog.fromProperties(node.properties);
      if (successDialog != null) {
        GenUiSuccessDialog.show(context, successDialog);
        return;
      }

      // 4. Action ID / Route Navigation
      final actionId = node.properties['action_id']?.toString() ?? '';
      _handleAction(actionId, node: node);
    } catch (e) {
      debugPrint('[GenUiContainer] Execute error caught safely: $e');
    }
  }

  void _handleAction(String actionId, {ComponentNode? node}) {
    if (actionId.isEmpty || actionId == 'none') return;

    if (actionId.startsWith('/') || actionId.startsWith('nav:') || actionId.startsWith('route:')) {
      final target = actionId.startsWith('/')
          ? actionId
          : actionId.substring(actionId.indexOf(':') + 1).trim();
      final routePath = target.startsWith('/') ? target : '/$target';

      try {
        Navigator.pushNamed(context, routePath);
      } catch (_) {
        debugPrint('[GenUiContainer] Navigation to $routePath handled safely.');
      }
      return;
    }

    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Action: "$actionId"'),
        duration: const Duration(seconds: 2),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_currentSchema.components.isEmpty) {
      return widget.placeholder ?? const SizedBox.shrink();
    }

    final theme = _currentSchema.theme;

    return GenUiErrorBoundary(
      node: ComponentNode(
        id: 'genui_container_${widget.screenId}',
        type: 'container',
        properties: const {},
      ),
      builder: (context) {
        return Padding(
          padding: widget.padding ?? const EdgeInsets.symmetric(horizontal: 20.0, vertical: 8.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
            if (widget.showLiveBadge)
              Padding(
                padding: const EdgeInsets.only(bottom: 6.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Container(
                      width: 6.0,
                      height: 6.0,
                      decoration: BoxDecoration(
                        color: (_syncClient?.isConnected ?? false)
                            ? const Color(0xFF10B981)
                            : const Color(0xFFF59E0B),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 4.0),
                    Text(
                      'Live GenUI v${_currentSchema.version}',
                      style: const TextStyle(
                        color: Color(0xFF94A3B8),
                        fontSize: 10.0,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ..._currentSchema.components.map((node) {
              return SafeWidgetRegistry.buildNode(
                node: node,
                theme: theme,
                isGuarded: true,
                onExecute: _handleExecute,
                onAction: _handleAction,
                onError: (compId, err) {
                  if (!_isolatedErrors.contains(compId)) {
                    _isolatedErrors.add(compId);
                  }
                },
              );
            }),
          ],
        ),
      );
      },
    );
  }
}

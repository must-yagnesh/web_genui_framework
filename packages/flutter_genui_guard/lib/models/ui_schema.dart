import 'package:flutter/material.dart';

/// Top-level Dynamic Screen Schema
class UiSchema {
  final int version;
  final int timestamp;
  final String screenId;
  final String screenName;
  final String route;
  final ThemeConfig theme;
  final HeaderConfig header;
  final List<ComponentNode> components;
  final ApiConfig? apiConfig;
  final ApiDataSource? dataSource;

  const UiSchema({
    required this.version,
    required this.timestamp,
    required this.screenId,
    this.screenName = 'Screen',
    this.route = '/',
    required this.theme,
    required this.header,
    required this.components,
    this.apiConfig,
    this.dataSource,
  });

  /// IDs of every component in this screen, including nested children.
  /// Used to scope form validation and submission to the current screen.
  Set<String> get allComponentIds {
    final Set<String> ids = {};
    void collect(List<ComponentNode> nodes) {
      for (final node in nodes) {
        ids.add(node.id);
        if (node.children.isNotEmpty) collect(node.children);
      }
    }

    collect(components);
    return ids;
  }

  factory UiSchema.empty() {
    return UiSchema(
      version: 0,
      timestamp: 0,
      screenId: 'default',
      screenName: 'Default Screen',
      route: '/',
      theme: ThemeConfig.fallback(),
      header: HeaderConfig.fallback(),
      components: const [],
      dataSource: null,
    );
  }

  factory UiSchema.fromMap(Map<String, dynamic> map) {
    final rawTheme = map['theme'];
    final theme = rawTheme is Map<String, dynamic>
        ? ThemeConfig.fromMap(rawTheme)
        : ThemeConfig.fallback();

    final rawHeader = map['header'];
    final header = rawHeader is Map<String, dynamic>
        ? HeaderConfig.fromMap(rawHeader)
        : HeaderConfig.fallback();

    final rawComponents = map['components'];
    final List<ComponentNode> components = [];

    if (rawComponents is List) {
      for (int i = 0; i < rawComponents.length; i++) {
        final item = rawComponents[i];
        if (item is Map<String, dynamic>) {
          components.add(ComponentNode.fromMap(item, fallbackId: 'comp_$i'));
        } else {
          // Wrap corrupted non-map item into an invalid node so error boundary catches it
          components.add(ComponentNode(
            id: 'corrupted_$i',
            type: 'invalid',
            properties: {'raw': item},
          ));
        }
      }
    }

    final rawScreenId = map['screen_id']?.toString() ?? 'unknown_screen';
    final rawScreenName = map['screen_name']?.toString() ?? (map['header'] is Map ? map['header']['title']?.toString() : null) ?? rawScreenId;
    final rawRoute = map['route']?.toString() ?? (rawScreenId == 'home' ? '/' : '/$rawScreenId');
    final apiConfig = ApiConfig.fromProperties(map);
    final dataSource = ApiDataSource.fromProperties(map);

    return UiSchema(
      version: _parseInt(map['version'], 1),
      timestamp: _parseInt(map['timestamp'], DateTime.now().millisecondsSinceEpoch),
      screenId: rawScreenId,
      screenName: rawScreenName,
      route: rawRoute,
      theme: theme,
      header: header,
      components: components,
      apiConfig: apiConfig,
      dataSource: dataSource,
    );
  }

  static int _parseInt(dynamic val, int fallback) {
    if (val is int) return val;
    if (val is num) return val.toInt();
    if (val is String) return int.tryParse(val) ?? fallback;
    return fallback;
  }
}

/// Theme Configuration with safe Color parsing & fallbacks
class ThemeConfig {
  final Color primaryColor;
  final Color backgroundColor;
  final Color surfaceColor;
  final Color textPrimary;
  final Color textSecondary;
  final Color accentColor;

  const ThemeConfig({
    required this.primaryColor,
    required this.backgroundColor,
    required this.surfaceColor,
    required this.textPrimary,
    required this.textSecondary,
    required this.accentColor,
  });

  factory ThemeConfig.fallback() {
    return const ThemeConfig(
      primaryColor: Color(0xFF4F46E5),
      backgroundColor: Color(0xFF0F172A),
      surfaceColor: Color(0xFF1E293B),
      textPrimary: Color(0xFFF8FAFC),
      textSecondary: Color(0xFF94A3B8),
      accentColor: Color(0xFF10B981),
    );
  }

  factory ThemeConfig.fromMap(Map<String, dynamic> map) {
    return ThemeConfig(
      primaryColor: parseHexColor(map['primary_color'], const Color(0xFF4F46E5)),
      backgroundColor: parseHexColor(map['background_color'], const Color(0xFF0F172A)),
      surfaceColor: parseHexColor(map['surface_color'], const Color(0xFF1E293B)),
      textPrimary: parseHexColor(map['text_primary'], const Color(0xFFF8FAFC)),
      textSecondary: parseHexColor(map['text_secondary'], const Color(0xFF94A3B8)),
      accentColor: parseHexColor(map['accent_color'], const Color(0xFF10B981)),
    );
  }
}

/// Screen Header Configuration
class HeaderConfig {
  final String title;
  final String subtitle;
  final bool showBackButton;
  final String actionIcon;

  const HeaderConfig({
    required this.title,
    required this.subtitle,
    required this.showBackButton,
    required this.actionIcon,
  });

  factory HeaderConfig.fallback() {
    return const HeaderConfig(
      title: 'Dynamic Feed',
      subtitle: 'Real-time UI Delivery',
      showBackButton: false,
      actionIcon: 'notifications',
    );
  }

  factory HeaderConfig.fromMap(Map<String, dynamic> map) {
    return HeaderConfig(
      title: map['title']?.toString() ?? 'Dynamic View',
      subtitle: map['subtitle']?.toString() ?? '',
      showBackButton: map['show_back_button'] == true,
      actionIcon: map['action_icon']?.toString() ?? 'notifications',
    );
  }
}

/// Generic Dynamic Component AST Node
class ComponentNode {
  final String id;
  final String type;
  final Map<String, dynamic> properties;
  final List<ComponentNode> children;

  const ComponentNode({
    required this.id,
    required this.type,
    required this.properties,
    this.children = const [],
  });

  factory ComponentNode.fromMap(Map<String, dynamic> map, {String fallbackId = 'comp'}) {
    final type = map['type']?.toString().toLowerCase().trim() ?? 'unknown';
    final id = map['id']?.toString() ?? '${fallbackId}_$type';
    final properties = Map<String, dynamic>.from(map);
    properties.remove('type');
    properties.remove('id');
    properties.remove('children');
    properties.remove('child');

    List<ComponentNode> children = [];
    final rawChildren = map['children'];
    if (rawChildren is List) {
      for (int i = 0; i < rawChildren.length; i++) {
        final child = rawChildren[i];
        if (child is Map<String, dynamic>) {
          children.add(ComponentNode.fromMap(child, fallbackId: '${id}_c$i'));
        }
      }
    } else if (map['child'] is Map<String, dynamic>) {
      children.add(ComponentNode.fromMap(map['child'] as Map<String, dynamic>, fallbackId: '${id}_child'));
    }

    return ComponentNode(
      id: id,
      type: type,
      properties: properties,
      children: children,
    );
  }

  /// Dynamic API configuration attached to this component (e.g. on click / submit)
  ApiConfig? get apiConfig => ApiConfig.fromProperties(properties);

  /// Item template for dynamic repeating collection components (e.g. list_view)
  ComponentNode? get itemTemplate {
    final raw = properties['item_template'] ?? properties['template'];
    if (raw is Map<String, dynamic>) return ComponentNode.fromMap(raw, fallbackId: '${id}_item');
    if (raw is Map) return ComponentNode.fromMap(Map<String, dynamic>.from(raw), fallbackId: '${id}_item');
    return null;
  }

  /// Data path for dynamic collections (e.g. 'users', 'products', or '' for root array)
  String get dataPath => properties['data_path']?.toString() ?? properties['items_path']?.toString() ?? '';

  /// Empty state message for collections
  String get emptyText => properties['empty_text']?.toString() ?? 'No items found';
}

/// Dynamic API Call Configuration configured from the Web Console
class ApiConfig {
  final String url;
  final String method; // GET, POST, PUT, DELETE, PATCH
  final Map<String, String> headers;
  final Map<String, String> bodyMapping; // apiKey -> fieldId
  final Map<String, dynamic> staticBody; // static payload values (e.g. source, form_type)
  final List<String> validateFields; // optional list of field IDs to validate
  final Map<String, dynamic>? onSuccess; // { type: 'dialog'|'snackbar'|'navigate', title, message, navigate_to }
  final Map<String, dynamic>? onError; // { type: 'snackbar'|'dialog', message }
  final bool resetFormOnSuccess;

  const ApiConfig({
    required this.url,
    this.method = 'POST',
    this.headers = const {},
    this.bodyMapping = const {},
    this.staticBody = const {},
    this.validateFields = const [],
    this.onSuccess,
    this.onError,
    this.resetFormOnSuccess = false,
  });

  factory ApiConfig.fromMap(Map<String, dynamic> map) {
    final rawHeaders = map['headers'];
    final Map<String, String> headers = {};
    if (rawHeaders is Map) {
      rawHeaders.forEach((k, v) => headers[k.toString()] = v?.toString() ?? '');
    }

    final rawMapping = map['body_mapping'] ?? map['mapping'] ?? map['field_mapping'];
    final Map<String, String> bodyMapping = {};
    if (rawMapping is Map) {
      rawMapping.forEach((k, v) => bodyMapping[k.toString()] = v?.toString() ?? '');
    }

    final rawStatic = map['static_body'] ?? map['static_params'];
    final Map<String, dynamic> staticBody = {};
    if (rawStatic is Map) {
      rawStatic.forEach((k, v) => staticBody[k.toString()] = v);
    }

    final rawValidate = map['validate_fields'];
    final List<String> validateFields = [];
    if (rawValidate is List) {
      for (final f in rawValidate) {
        if (f != null) validateFields.add(f.toString());
      }
    }

    return ApiConfig(
      url: map['url']?.toString() ?? '',
      method: (map['method']?.toString() ?? 'POST').toUpperCase().trim(),
      headers: headers,
      bodyMapping: bodyMapping,
      staticBody: staticBody,
      validateFields: validateFields,
      onSuccess: map['on_success'] is Map
          ? Map<String, dynamic>.from(map['on_success'])
          : null,
      onError: map['on_error'] is Map
          ? Map<String, dynamic>.from(map['on_error'])
          : null,
      resetFormOnSuccess: map['reset_form_on_success'] == true,
    );
  }

  static ApiConfig? fromProperties(Map<String, dynamic>? props) {
    if (props == null) return null;
    final raw = props['api_config'] ?? props['api'];
    if (raw is Map<String, dynamic>) return ApiConfig.fromMap(raw);
    if (raw is Map) return ApiConfig.fromMap(Map<String, dynamic>.from(raw));
    return null;
  }
}

/// Dynamic Pagination Configuration for Screen Data Sources
class ApiPaginationConfig {
  final bool enabled;
  final String pageParam; // e.g. 'page' or '_page'
  final String limitParam; // e.g. 'limit' or '_limit'
  final int pageSize;
  final int initialPage;
  final String mode; // 'page_number' or 'offset'
  final String dataPath;

  const ApiPaginationConfig({
    this.enabled = false,
    this.pageParam = 'page',
    this.limitParam = 'limit',
    this.pageSize = 10,
    this.initialPage = 1,
    this.mode = 'page_number',
    this.dataPath = '',
  });

  int get defaultLimit => pageSize;

  factory ApiPaginationConfig.fromMap(Map<String, dynamic> map) {
    return ApiPaginationConfig(
      enabled: map['enabled'] == true,
      pageParam: map['page_param']?.toString() ?? 'page',
      limitParam: map['limit_param']?.toString() ?? 'limit',
      pageSize: (map['default_limit'] ?? map['page_size'] ?? map['limit'] as num?)?.toInt() ?? 10,
      initialPage: (map['initial_page'] as num?)?.toInt() ?? 1,
      mode: map['mode']?.toString() ?? 'page_number',
      dataPath: map['data_path']?.toString() ?? '',
    );
  }

  Map<String, dynamic> toMap() => {
    'enabled': enabled,
    'page_param': pageParam,
    'limit_param': limitParam,
    'page_size': pageSize,
    'default_limit': defaultLimit,
    'initial_page': initialPage,
    'mode': mode,
    'data_path': dataPath,
  };
}

/// Dynamic Screen Data Source (GET API / Data Binding)
class ApiDataSource {
  final String url;
  final String method; // 'GET'
  final Map<String, String> headers;
  final Map<String, dynamic> queryParams;
  final String resultsPath; // e.g. 'data', 'users', 'products', or '' for root array/object
  final bool autoFetch;
  final ApiPaginationConfig pagination;
  final Map<String, dynamic> fallbackData;
  final bool showErrorWidget;
  final String errorMessage;
  final String errorWidgetType; // 'banner', 'card'

  const ApiDataSource({
    required this.url,
    this.method = 'GET',
    this.headers = const {},
    this.queryParams = const {},
    this.resultsPath = '',
    this.autoFetch = true,
    this.pagination = const ApiPaginationConfig(),
    this.fallbackData = const {},
    this.showErrorWidget = true,
    this.errorMessage = '',
    this.errorWidgetType = 'banner',
  });

  bool get hasUrl => url.trim().isNotEmpty;
  Map<String, dynamic> get params => queryParams;
  String get dataPath => resultsPath;

  factory ApiDataSource.fromMap(Map<String, dynamic> map) {
    final rawHeaders = map['headers'];
    final Map<String, String> headers = {};
    if (rawHeaders is Map) {
      rawHeaders.forEach((k, v) => headers[k.toString()] = v?.toString() ?? '');
    }

    final rawQuery = map['query_params'] ?? map['params'];
    final Map<String, dynamic> queryParams = {};
    if (rawQuery is Map) {
      rawQuery.forEach((k, v) => queryParams[k.toString()] = v);
    }

    final rawPagination = map['pagination'];
    final pagination = rawPagination is Map<String, dynamic>
        ? ApiPaginationConfig.fromMap(rawPagination)
        : (rawPagination is Map
            ? ApiPaginationConfig.fromMap(Map<String, dynamic>.from(rawPagination))
            : const ApiPaginationConfig());

    final rawFallback = map['fallback_data'] ?? map['mock_data'];
    final Map<String, dynamic> fallbackData = {};
    if (rawFallback is Map) {
      rawFallback.forEach((k, v) => fallbackData[k.toString()] = v);
    }

    return ApiDataSource(
      url: map['url']?.toString() ?? '',
      method: (map['method']?.toString() ?? 'GET').toUpperCase().trim(),
      headers: headers,
      queryParams: queryParams,
      resultsPath: map['results_path']?.toString() ?? map['root_path']?.toString() ?? '',
      autoFetch: map['auto_fetch'] != false,
      pagination: pagination,
      fallbackData: fallbackData,
      showErrorWidget: map['show_error_widget'] != false,
      errorMessage: map['error_message']?.toString() ?? '',
      errorWidgetType: map['error_widget_type']?.toString() ?? 'banner',
    );
  }

  Map<String, dynamic> toMap() => {
    'url': url,
    'method': method,
    'headers': headers,
    'query_params': queryParams,
    'results_path': resultsPath,
    'auto_fetch': autoFetch,
    'pagination': pagination.toMap(),
    'fallback_data': fallbackData,
    'show_error_widget': showErrorWidget,
    'error_message': errorMessage,
    'error_widget_type': errorWidgetType,
  };

  static ApiDataSource? fromProperties(Map<String, dynamic>? props) {
    if (props == null) return null;
    final raw = props['data_source'] ?? props['dataSource'] ?? props['fetch_api'];
    if (raw is Map<String, dynamic>) return ApiDataSource.fromMap(raw);
    if (raw is Map) return ApiDataSource.fromMap(Map<String, dynamic>.from(raw));
    return null;
  }
}


/// Robust Hex Color parser that never throws
Color parseHexColor(dynamic hexStr, Color fallback) {
  if (hexStr == null) return fallback;
  String str = hexStr.toString().replaceAll('#', '').trim();
  if (str.isEmpty) return fallback;

  try {
    if (str.length == 6) {
      str = 'FF$str';
    } else if (str.length == 3) {
      str = 'FF${str[0]}${str[0]}${str[1]}${str[1]}${str[2]}${str[2]}';
    } else if (str.length != 8) {
      return fallback;
    }
    final int? val = int.tryParse(str, radix: 16);
    if (val == null) return fallback;
    return Color(val);
  } catch (_) {
    return fallback;
  }
}

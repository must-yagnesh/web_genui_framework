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

  const UiSchema({
    required this.version,
    required this.timestamp,
    required this.screenId,
    this.screenName = 'Screen',
    this.route = '/',
    required this.theme,
    required this.header,
    required this.components,
  });

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

    return UiSchema(
      version: _parseInt(map['version'], 1),
      timestamp: _parseInt(map['timestamp'], DateTime.now().millisecondsSinceEpoch),
      screenId: rawScreenId,
      screenName: rawScreenName,
      route: rawRoute,
      theme: theme,
      header: header,
      components: components,
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

    List<ComponentNode> children = [];
    final rawChildren = map['children'];
    if (rawChildren is List) {
      for (int i = 0; i < rawChildren.length; i++) {
        final child = rawChildren[i];
        if (child is Map<String, dynamic>) {
          children.add(ComponentNode.fromMap(child, fallbackId: '${id}_c$i'));
        }
      }
    }

    return ComponentNode(
      id: id,
      type: type,
      properties: properties,
      children: children,
    );
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

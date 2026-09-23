import '../models/ui_schema.dart';

/// Purely generic dynamic data binding engine.
///
/// Resolves mustache-style `{{path}}` expressions against arbitrary API response maps
/// and nested data contexts without any hardcoded models or domain logic.
class GenUiDataBinding {
  GenUiDataBinding._();

  static final RegExp _mustacheRegex = RegExp(r'\{\{\s*([a-zA-Z0-9_\-\.]+)\s*\}\}');

  /// Extract a value from a nested map or list using dot-notation.
  /// Example: `extractValue(data, 'user.profile.avatar')`
  static dynamic extractValue(dynamic data, String path) {
    if (data == null) return null;
    final cleanPath = path.trim();
    if (cleanPath.isEmpty) return data;

    final parts = cleanPath.split('.');
    dynamic current = data;

    for (final part in parts) {
      if (current == null) return null;

      if (current is Map) {
        if (current.containsKey(part)) {
          current = current[part];
        } else if (part == 'length' || part == 'count') {
          current = current.length;
        } else {
          return null;
        }
      } else if (current is List) {
        if (part == 'length' || part == 'count') {
          current = current.length;
          continue;
        }
        final index = int.tryParse(part);
        if (index != null && index >= 0 && index < current.length) {
          current = current[index];
        } else {
          return null;
        }
      } else {
        return null;
      }
    }

    return current;
  }

  /// Interpolate a string template against a data context map.
  /// Example: `"Hello {{user.name}}, your balance is ${{wallet.balance}}"`
  static String interpolateString(String template, Map<String, dynamic> context) {
    if (!template.contains('{{')) return template;

    return template.replaceAllMapped(_mustacheRegex, (match) {
      final key = match.group(1);
      if (key == null) return '';

      // Direct match in context
      if (context.containsKey(key)) {
        final val = context[key];
        if (val == null) return '';
        if (val is List) return val.join(', ');
        return val.toString();
      }

      // Nested dot-notation match
      final val = extractValue(context, key);
      if (val == null) return '';
      if (val is List) return val.join(', ');
      return val.toString();
    });
  }

  /// Recursively resolves any dynamic tokens inside maps, lists, and primitives.
  static dynamic resolve(dynamic value, Map<String, dynamic> context) {
    if (value is String) {
      // Exact single token replacement preserves original data type (e.g. num, bool, List)
      final trimmed = value.trim();
      final exactMatch = RegExp(r'^\{\{\s*([a-zA-Z0-9_\-\.]+)\s*\}\}$').firstMatch(trimmed);
      if (exactMatch != null) {
        final key = exactMatch.group(1)!;
        final resolved = extractValue(context, key);
        if (resolved != null) return resolved;
      }
      return interpolateString(value, context);
    } else if (value is Map) {
      final Map<String, dynamic> result = {};
      value.forEach((k, v) {
        result[k.toString()] = resolve(v, context);
      });
      return result;
    } else if (value is List) {
      return value.map((item) => resolve(item, context)).toList();
    }
    return value;
  }

  /// Create a hydrated copy of a [ComponentNode] with all properties resolved
  /// against the provided [context] map.
  static ComponentNode interpolateNode(ComponentNode node, Map<String, dynamic> context) {
    final Map<String, dynamic> resolvedProps = {};
    node.properties.forEach((k, v) {
      resolvedProps[k] = resolve(v, context);
    });

    // For repeating list_view, if items is not explicitly resolved or is null,
    // extract from data_path or common root collection keys
    if (node.type == 'list_view' || node.type == 'listview') {
      if (resolvedProps['items'] == null || resolvedProps['items'] is! List) {
        final path = node.dataPath;
        if (path.isNotEmpty) {
          final extracted = extractValue(context, path);
          if (extracted is List) {
            resolvedProps['items'] = extracted;
          }
        } else if (context['items'] is List) {
          resolvedProps['items'] = context['items'];
        } else if (context['data'] is List) {
          resolvedProps['items'] = context['data'];
        } else if (context['results'] is List) {
          resolvedProps['items'] = context['results'];
        }
      }
    }

    final List<ComponentNode> resolvedChildren = node.children
        .map((child) => interpolateNode(child, context))
        .toList();

    return ComponentNode(
      id: node.id,
      type: node.type,
      properties: resolvedProps,
      children: resolvedChildren,
    );
  }
}

import '../models/ui_schema.dart';

/// Purely generic dynamic data binding engine.
///
/// Resolves mustache-style `{{path}}` expressions against arbitrary API response maps,
/// lists, and nested data contexts without any hardcoded models or domain logic.
class GenUiDataBinding {
  GenUiDataBinding._();

  static final RegExp _mustacheRegex = RegExp(r'\{\{\s*([a-zA-Z0-9_\-\.]+)\s*\}\}');

  /// Builds a normalized, highly resilient interpolation context from any raw API response.
  /// Handles both List and Map payloads, automatically exposes `item`, unpacks wrapper envelopes
  /// (`retRes`, `data`, `user`, `result`, etc.) to the root level, and sets collection aliases.
  static Map<String, dynamic> buildInterpolationContext(dynamic rawData) {
    if (rawData == null) return {};

    if (rawData is List) {
      final list = List<dynamic>.from(rawData);
      final Map<String, dynamic> context = {
        'items': list,
        'data': list,
        'results': list,
        'list': list,
      };

      if (list.isNotEmpty) {
        final first = list.first;
        if (first is Map) {
          final firstMap = Map<String, dynamic>.from(first);
          context['item'] = firstMap;
          firstMap.forEach((k, v) {
            context[k.toString()] = v;
          });
        } else {
          context['item'] = first;
          context['value'] = first;
        }

        for (int i = 0; i < list.length; i++) {
          context[i.toString()] = list[i];
          if (list[i] is Map) {
            (list[i] as Map).forEach((k, v) {
              context['$i.$k'] = v;
            });
          }
        }
      } else {
        context['item'] = <String, dynamic>{};
      }
      return context;
    }

    if (rawData is Map) {
      final Map<String, dynamic> context = {};
      rawData.forEach((k, v) => context[k.toString()] = v);

      const wrapperKeys = [
        'retRes',
        'data',
        'user',
        'result',
        'payload',
        'response',
        'item',
        'record',
        'body',
        'entity',
        'output',
        'detail',
        'details',
        'profile',
        'userInfo',
        'user_info'
      ];

      for (final wk in wrapperKeys) {
        if (context.containsKey(wk)) {
          final val = context[wk];
          if (val is Map) {
            // Unpack fields to root so {{name}}, {{nationality}}, etc. resolve directly
            val.forEach((k, v) {
              if (!context.containsKey(k.toString())) {
                context[k.toString()] = v;
              }
            });
            // If the wrapper map contains sub-wrappers (e.g. data.user or retRes.possible_participation)
            val.forEach((k, v) {
              if (v is Map) {
                v.forEach((subK, subV) {
                  if (!context.containsKey(subK.toString())) {
                    context[subK.toString()] = subV;
                  }
                });
              } else if (v is List && v.isNotEmpty && v.first is Map) {
                (v.first as Map).forEach((subK, subV) {
                  if (!context.containsKey(subK.toString())) {
                    context[subK.toString()] = subV;
                  }
                });
              }
            });
          } else if (val is List) {
            context['items'] ??= val;
            context['list'] ??= val;
            if (!context.containsKey('item') && val.isNotEmpty) {
              context['item'] = val.first;
              if (val.first is Map) {
                (val.first as Map).forEach((k, v) {
                  if (!context.containsKey(k.toString())) {
                    context[k.toString()] = v;
                  }
                });
              }
            }
          }
        }
      }

      // Ensure 'item' is always available even for single object responses
      if (!context.containsKey('item')) {
        for (final lk in ['items', 'data', 'results', 'list', 'super_save', 'records']) {
          if (context[lk] is List && (context[lk] as List).isNotEmpty) {
            context['item'] = (context[lk] as List).first;
            break;
          }
        }
        context['item'] ??= Map<String, dynamic>.from(context);
      }

      return context;
    }

    return {'value': rawData, 'item': rawData};
  }

  /// Extract a value from a nested map or list using dot-notation with robust fallbacks.
  /// Example: `extractValue(data, 'item.nationality')` or `extractValue(data, 'user.profile.avatar')`
  static dynamic extractValue(dynamic data, String path) {
    if (data == null) return null;
    final cleanPath = path.trim();
    if (cleanPath.isEmpty) return data;

    // 1. Try standard dot-notation traversal
    final directResult = _traverseDotNotation(data, cleanPath);
    if (directResult != null) return directResult;

    // 2. Intelligent item scope handling: e.g. path starts with 'item.'
    if (cleanPath.startsWith('item.')) {
      final remainder = cleanPath.substring(5).trim();
      if (remainder.isNotEmpty) {
        if (data is List && data.isNotEmpty) {
          final res = extractValue(data[0], remainder);
          if (res != null) return res;
        } else if (data is Map) {
          if (data.containsKey('item') && data['item'] != null) {
            final res = extractValue(data['item'], remainder);
            if (res != null) return res;
          }
          for (final lk in ['items', 'data', 'results', 'list']) {
            if (data[lk] is List && (data[lk] as List).isNotEmpty) {
              final res = extractValue((data[lk] as List)[0], remainder);
              if (res != null) return res;
            }
          }
          // Fallback: strip 'item.' and look directly in data
          final res = extractValue(data, remainder);
          if (res != null) return res;
        }
      }
    }

    // 3. Fallback for List data when path didn't start with 'item.' (e.g. {{nationality}})
    if (data is List && data.isNotEmpty) {
      final res = extractValue(data[0], cleanPath);
      if (res != null) return res;
    }

    // 4. Fallback for Map data: look inside known wrappers if not found at root
    if (data is Map) {
      const wrappers = [
        'retRes',
        'data',
        'user',
        'item',
        'result',
        'payload',
        'response',
        'detail',
        'details',
        'possible_participation',
      ];
      for (final wk in wrappers) {
        if (data.containsKey(wk) && data[wk] != null) {
          final res = extractValue(data[wk], cleanPath);
          if (res != null) return res;
        }
      }

      // 5. If path starts with a wrapper prefix that doesn't exist in data, strip prefix
      for (final pfx in ['data.', 'user.', 'retRes.', 'result.', 'payload.', 'item.']) {
        if (cleanPath.startsWith(pfx)) {
          final stripped = cleanPath.substring(pfx.length).trim();
          final res = extractValue(data, stripped);
          if (res != null) return res;
        }
      }
    }

    return null;
  }

  static dynamic _traverseDotNotation(dynamic data, String path) {
    final parts = path.split('.');
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
  /// Example: `"Hello {{item.name}}, your nationality is {{item.nationality}}"`
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

      // Nested dot-notation match with resilient fallbacks
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
  ///
  /// NOTE: For repeating collections (e.g. `list_view`), `item_template` is intentionally
  /// preserved WITHOUT premature interpolation so each row can resolve its own `item` scope.
  static ComponentNode interpolateNode(ComponentNode node, Map<String, dynamic> context) {
    final Map<String, dynamic> resolvedProps = {};
    node.properties.forEach((k, v) {
      if (k == 'item_template' || k == 'template') {
        // Crucial: preserve item_template unmodified for runtime row evaluation
        resolvedProps[k] = v;
      } else {
        resolvedProps[k] = resolve(v, context);
      }
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
        } else if (context['list'] is List) {
          resolvedProps['items'] = context['list'];
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

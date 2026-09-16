import 'dart:convert';
import '../models/ui_schema.dart';

/// Result returned after validating and sanitizing an LLM UI schema
class ValidationResult {
  final bool isValid;
  final UiSchema sanitizedSchema;
  final List<String> warnings;
  final int durationMs;

  const ValidationResult({
    required this.isValid,
    required this.sanitizedSchema,
    required this.warnings,
    required this.durationMs,
  });
}

/// High-speed, fault-tolerant Schema Validator and Sanitizer
class GenUiSchemaValidator {
  static const int maxTreeDepth = 8;
  static const int maxComponentCount = 100;

  /// Validate raw JSON string or Map, coerce types, and produce clean UiSchema
  static ValidationResult validateAndSanitize(dynamic input) {
    final stopwatch = Stopwatch()..start();
    final List<String> warnings = [];

    Map<String, dynamic> rawMap;
    if (input is String) {
      try {
        final decoded = json.decode(input);
        if (decoded is Map<String, dynamic>) {
          rawMap = decoded;
        } else {
          warnings.add('Root payload is not a JSON object. Using empty fallback.');
          stopwatch.stop();
          return ValidationResult(
            isValid: false,
            sanitizedSchema: UiSchema.empty(),
            warnings: warnings,
            durationMs: stopwatch.elapsedMilliseconds,
          );
        }
      } catch (e) {
        warnings.add('JSON syntax error: ${e.toString()}');
        stopwatch.stop();
        return ValidationResult(
          isValid: false,
          sanitizedSchema: UiSchema.empty(),
          warnings: warnings,
          durationMs: stopwatch.elapsedMilliseconds,
        );
      }
    } else if (input is Map<String, dynamic>) {
      rawMap = input;
    } else if (input is Map) {
      rawMap = Map<String, dynamic>.from(input);
    } else {
      warnings.add('Unsupported input type: ${input.runtimeType}');
      stopwatch.stop();
      return ValidationResult(
        isValid: false,
        sanitizedSchema: UiSchema.empty(),
        warnings: warnings,
        durationMs: stopwatch.elapsedMilliseconds,
      );
    }

    // 1. Sanitize Theme
    final themeMap = _sanitizeMap(rawMap['theme'], warnings, 'theme');
    
    // 2. Sanitize Header
    final headerMap = _sanitizeMap(rawMap['header'], warnings, 'header');

    // 3. Sanitize Components
    final rawComps = rawMap['components'];
    final List<ComponentNode> sanitizedComponents = [];

    if (rawComps is List) {
      final count = rawComps.length > maxComponentCount ? maxComponentCount : rawComps.length;
      if (rawComps.length > maxComponentCount) {
        warnings.add('Components truncated to max allowed ($maxComponentCount).');
      }

      for (int i = 0; i < count; i++) {
        final compRaw = rawComps[i];
        if (compRaw is Map) {
          final compMap = Map<String, dynamic>.from(compRaw);
          final sanitizedNode = _sanitizeComponentNode(compMap, 0, warnings, 'comp_$i');
          sanitizedComponents.add(sanitizedNode);
        } else {
          warnings.add('Component at index $i is not an object. Wrapped in safe fallback.');
          sanitizedComponents.add(ComponentNode(
            id: 'fallback_$i',
            type: 'invalid',
            properties: {'original': compRaw.toString()},
          ));
        }
      }
    } else {
      warnings.add('Missing or non-array components field in payload.');
    }

    final schema = UiSchema(
      version: _coerceInt(rawMap['version'], 1),
      timestamp: _coerceInt(rawMap['timestamp'], DateTime.now().millisecondsSinceEpoch),
      screenId: rawMap['screen_id']?.toString() ?? 'dynamic_screen',
      theme: ThemeConfig.fromMap(themeMap),
      header: HeaderConfig.fromMap(headerMap),
      components: sanitizedComponents,
    );

    stopwatch.stop();
    return ValidationResult(
      isValid: warnings.isEmpty,
      sanitizedSchema: schema,
      warnings: warnings,
      durationMs: stopwatch.elapsedMilliseconds,
    );
  }

  static ComponentNode _sanitizeComponentNode(
    Map<String, dynamic> rawNode,
    int depth,
    List<String> warnings,
    String defaultId,
  ) {
    if (depth >= maxTreeDepth) {
      warnings.add('Max tree depth ($maxTreeDepth) reached at node $defaultId. Truncating children.');
      return ComponentNode(
        id: defaultId,
        type: 'truncated',
        properties: {'reason': 'Max depth reached'},
      );
    }

    final String rawType = rawNode['type']?.toString().toLowerCase().trim() ?? 'unknown';
    final String id = rawNode['id']?.toString() ?? defaultId;
    
    // Copy and clean properties
    final Map<String, dynamic> props = Map<String, dynamic>.from(rawNode);
    props.remove('id');
    props.remove('type');
    props.remove('children');

    // Strings & Text Overflow Protection
    for (final textKey in ['title', 'message', 'description', 'text', 'badge']) {
      if (props.containsKey(textKey) && props[textKey] != null) {
        props[textKey] = _sanitizeString(props[textKey], warnings, textKey);
      }
    }

    // Dimension & Layout Protection (Prevent RenderFlex overflows and negative assertion errors)
    for (final dimKey in ['height', 'width', 'padding', 'elevation']) {
      if (props.containsKey(dimKey)) {
        props[dimKey] = _coercePositiveDouble(props[dimKey], dimKey == 'padding' ? 16.0 : 0.0, warnings, dimKey);
      }
    }

    if (props.containsKey('is_positive')) {
      props['is_positive'] = _coerceBool(props['is_positive'], true);
    }

    // Action Security Protection
    if (props.containsKey('action_id')) {
      props['action_id'] = _sanitizeActionId(props['action_id'], warnings);
    }
    // Color sanitization
    if (props.containsKey('color')) {
      final cVal = props['color'];
      if (cVal != null && !isValidHexColor(cVal)) {
        warnings.add('[Style Shield] Malformed color "$cVal" sanitized to brand token.');
        props['has_color_anomaly'] = true;
        props['raw_color_value'] = cVal.toString();
        props['color'] = '#4F46E5';
      }
    }

    // Sanitize Metrics array if present
    if (props.containsKey('metrics')) {
      final mRaw = props['metrics'];
      if (mRaw is List) {
        final List<Map<String, dynamic>> cleanMetrics = [];
        for (final m in mRaw) {
          if (m is Map) {
            cleanMetrics.add({
              'label': _sanitizeString(m['label'] ?? 'Metric', warnings, 'label', maxLen: 80),
              'value': _sanitizeString(m['value'] ?? '0', warnings, 'value', maxLen: 80),
              'change': _sanitizeString(m['change'] ?? '', warnings, 'change', maxLen: 80),
              'is_positive': _coerceBool(m['is_positive'], true),
            });
          }
        }
        props['metrics'] = cleanMetrics;
      } else {
        warnings.add('[Type Shield] Non-array metrics property ($mRaw). Coerced to safe single metric.');
        props['has_type_mismatch'] = true;
        props['metrics_raw_value'] = mRaw?.toString() ?? 'null';
        props['metrics'] = <Map<String, dynamic>>[
          {
            'label': 'Coerced Metric',
            'value': mRaw != null ? (mRaw.toString().length > 15 ? '${mRaw.toString().substring(0, 15)}...' : mRaw.toString()) : 'Safe Fallback',
            'change': '+100% Fixed',
            'is_positive': true,
          },
          {
            'label': 'Type Safety',
            'value': 'Guarded',
            'change': '0% Crash',
            'is_positive': true,
          }
        ];
      }
    }

    // Sanitize Children recursively
    final List<ComponentNode> cleanChildren = [];
    if (rawNode['children'] is List) {
      final cList = rawNode['children'] as List;
      for (int i = 0; i < cList.length; i++) {
        final cItem = cList[i];
        if (cItem is Map) {
          cleanChildren.add(_sanitizeComponentNode(
            Map<String, dynamic>.from(cItem),
            depth + 1,
            warnings,
            '${id}_child_$i',
          ));
        }
      }
    }

    return ComponentNode(
      id: id,
      type: rawType,
      properties: props,
      children: cleanChildren,
    );
  }

  static Map<String, dynamic> _sanitizeMap(dynamic val, List<String> warnings, String fieldName) {
    if (val is Map<String, dynamic>) return val;
    if (val is Map) return Map<String, dynamic>.from(val);
    warnings.add('Field "$fieldName" was not an object. Using defaults.');
    return <String, dynamic>{};
  }

  static int _coerceInt(dynamic val, int fallback) {
    if (val is int) return val;
    if (val is num) return val.toInt();
    if (val is String) {
      final parsed = int.tryParse(val.replaceAll(RegExp(r'[^0-9\-]'), ''));
      if (parsed != null) return parsed;
    }
    return fallback;
  }

  static double _coerceDouble(dynamic val, double fallback) {
    if (val is double) return val;
    if (val is num) return val.toDouble();
    if (val is String) {
      final clean = val.replaceAll(RegExp(r'[^0-9\.\-]'), '');
      final parsed = double.tryParse(clean);
      if (parsed != null) return parsed;
    }
    return fallback;
  }

  static bool _coerceBool(dynamic val, bool fallback) {
    if (val is bool) return val;
    if (val is num) return val != 0;
    if (val is String) {
      final s = val.toLowerCase().trim();
      if (s == 'true' || s == '1' || s == 'yes') return true;
      if (s == 'false' || s == '0' || s == 'no') return false;
    }
    return fallback;
  }

  static String _sanitizeString(dynamic val, List<String> warnings, String field, {int maxLen = 350}) {
    if (val == null) return '';
    String str = val.toString();
    
    // Check for null bytes or script injection
    if (str.contains('\x00') || str.contains('<script') || str.contains('javascript:')) {
      warnings.add('[Security Shield] Malicious injection characters stripped from "$field".');
      str = str.replaceAll('\x00', '').replaceAll(RegExp(r'<script.*?>.*?</script>', caseSensitive: false), '');
    }

    // Layout overflow prevention (protects RenderFlex)
    if (str.length > maxLen) {
      warnings.add('[Layout Shield] Runaway text in "$field" (${str.length} chars) clamped to $maxLen.');
      str = '${str.substring(0, maxLen)}...';
    }
    return str;
  }

  static double _coercePositiveDouble(dynamic val, double fallback, List<String> warnings, String field, {double maxVal = 1000.0}) {
    final d = _coerceDouble(val, fallback);
    if (d.isNaN || d.isInfinite || d < 0) {
      warnings.add('[Dimension Shield] Invalid/negative "$field" ($val) coerced to safe positive bound ($fallback).');
      return fallback;
    }
    if (d > maxVal) {
      warnings.add('[Dimension Shield] Over-sized "$field" ($d) clamped to max ($maxVal).');
      return maxVal;
    }
    return d;
  }

  static String _sanitizeActionId(dynamic val, List<String> warnings) {
    if (val == null) return 'action_default';
    final str = val.toString().trim();
    final lower = str.toLowerCase();
    if (lower.startsWith('javascript:') || lower.startsWith('file:') || lower.startsWith('data:') || lower.contains('eval(')) {
      warnings.add('[Security Shield] Blocked insecure action protocol: "$str".');
      return 'action_blocked_insecure';
    }
    return str;
  }

  static bool isValidHexColor(dynamic val) {
    if (val == null) return false;
    final str = val.toString().replaceAll('#', '').trim();
    if (str.length != 6 && str.length != 8 && str.length != 3) return false;
    return RegExp(r'^[0-9a-fA-F]+$').hasMatch(str);
  }
}

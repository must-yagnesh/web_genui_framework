import 'package:flutter/material.dart';

/// Lightweight Form State Registry for dynamically rendered GenUI components.
/// Tracks TextEditingControllers, values, and validation errors by component ID.
class GenUiFormRegistry {
  static final GenUiFormRegistry instance = GenUiFormRegistry._internal();
  GenUiFormRegistry._internal();

  final Map<String, TextEditingController> _controllers = {};
  final Map<String, dynamic> _customValues = {};
  final Map<String, String> _fieldLabels = {};

  /// Retrieve or create a controller for a dynamic input field
  TextEditingController getController(String id, {String? label, String initialText = ''}) {
    if (label != null) {
      _fieldLabels[id] = label;
    }
    return _controllers.putIfAbsent(id, () => TextEditingController(text: initialText));
  }

  /// Store a non-text value (e.g. checkbox boolean, switch state, radio selection)
  void setValue(String id, dynamic value, {String? label}) {
    if (label != null) {
      _fieldLabels[id] = label;
    }
    _customValues[id] = value;
  }

  /// Get the user-facing label for a field
  String getFieldLabel(String id) {
    return _fieldLabels[id] ?? id;
  }

  /// Retrieve a specific field's string value by ID, partial name, or label
  String getValue(String keyOrId) {
    final query = keyOrId.toLowerCase().trim();

    // 1. Exact match in text controllers
    if (_controllers.containsKey(keyOrId)) {
      return _controllers[keyOrId]!.text.trim();
    }

    // 2. Exact match in custom values
    if (_customValues.containsKey(keyOrId)) {
      return _customValues[keyOrId]?.toString().trim() ?? '';
    }

    // 3. Partial or case-insensitive match on controller ID or label
    for (final entry in _controllers.entries) {
      final id = entry.key.toLowerCase();
      final label = (_fieldLabels[entry.key] ?? '').toLowerCase();
      if (id == query || id.contains(query) || label == query || label.contains(query)) {
        return entry.value.text.trim();
      }
    }

    // 4. Partial match on custom values
    for (final entry in _customValues.entries) {
      final id = entry.key.toLowerCase();
      final label = (_fieldLabels[entry.key] ?? '').toLowerCase();
      if (id == query || id.contains(query) || label == query || label.contains(query)) {
        return entry.value?.toString().trim() ?? '';
      }
    }

    return '';
  }

  /// Check if a field exists and has non-empty text
  bool hasValue(String keyOrId) => getValue(keyOrId).isNotEmpty;

  /// Check if a field value is a valid email address
  bool isValidEmail(String keyOrId) {
    final val = getValue(keyOrId);
    if (val.isEmpty) return false;
    return val.contains('@') && val.contains('.');
  }

  /// Retrieve all current field values as a Map.
  /// Pass [onlyIds] to restrict the result to the fields of one screen.
  Map<String, dynamic> getValues({Iterable<String>? onlyIds}) {
    final Set<String>? filter = onlyIds?.toSet();
    final Map<String, dynamic> result = {};
    _controllers.forEach((key, controller) {
      if (filter == null || filter.contains(key)) {
        result[key] = controller.text.trim();
      }
    });
    _customValues.forEach((key, val) {
      if (filter == null || filter.contains(key)) {
        result[key] = val;
      }
    });
    return result;
  }

  /// Check if any registered field is empty.
  /// Returns a list of error messages (e.g. "Email Address cannot be empty").
  /// Pass [onlyIds] to validate just the fields of one screen.
  List<String> validateNonEmpty({Iterable<String>? onlyIds}) {
    final Set<String>? filter = onlyIds?.toSet();
    final List<String> errors = [];
    _controllers.forEach((id, controller) {
      if (filter != null && !filter.contains(id)) return;
      if (controller.text.trim().isEmpty) {
        final label = getFieldLabel(id);
        errors.add('$label cannot be empty');
      }
    });
    return errors;
  }

  /// Validate a single field by ID against a declarative validation config rule map
  String? validateFieldRule(String id, Map<String, dynamic> rule) {
    final label = getFieldLabel(id);
    final val = getValue(id);
    final customError = rule['error_message']?.toString();

    // 1. Required validation
    final isRequired = rule['required'] == true;
    if (isRequired) {
      // Checkbox or non-text boolean check
      if (_customValues.containsKey(id)) {
        final customVal = _customValues[id];
        if (customVal != true) {
          return customError ?? '$label is required';
        }
      } else if (val.isEmpty) {
        return customError ?? '$label cannot be empty';
      }
    }

    // If field is optional and empty, skip format validation
    if (val.isEmpty) return null;

    // 2. Type validation
    final vType = (rule['type']?.toString() ?? '').toLowerCase();
    if (vType == 'email' || rule['is_email'] == true) {
      final emailRegex = RegExp(r'^[\w\.\-]+@[\w\-]+(\.[\w\-]+)+$');
      if (!emailRegex.hasMatch(val)) {
        return customError ?? 'Please enter a valid email address for $label';
      }
    } else if (vType == 'phone' || rule['is_phone'] == true) {
      final digits = val.replaceAll(RegExp(r'\D'), '');
      if (digits.length < 7) {
        return customError ?? 'Please enter a valid phone number for $label';
      }
    } else if (vType == 'number' || rule['is_number'] == true) {
      if (num.tryParse(val) == null) {
        return customError ?? '$label must be a valid number';
      }
    }

    // 3. Min length validation
    final minLen = rule['min_length'] is num ? (rule['min_length'] as num).toInt() : null;
    if (minLen != null && val.length < minLen) {
      return customError ?? '$label must be at least $minLen characters';
    }

    // 4. Max length validation
    final maxLen = rule['max_length'] is num ? (rule['max_length'] as num).toInt() : null;
    if (maxLen != null && val.length > maxLen) {
      return customError ?? '$label cannot exceed $maxLen characters';
    }

    // 5. Custom Regex pattern validation
    final pattern = rule['pattern']?.toString() ?? rule['regex']?.toString();
    if (pattern != null && pattern.isNotEmpty) {
      try {
        final reg = RegExp(pattern);
        if (!reg.hasMatch(val)) {
          return customError ?? '$label format is invalid';
        }
      } catch (_) {}
    }

    return null;
  }

  /// Validate a collection of components with declarative validation properties.
  /// Traverses nested children (rows, columns).
  List<String> validateComponents(Iterable<dynamic> components, {Iterable<String>? onlyIds}) {
    final List<String> errors = [];
    final Set<String>? filter = onlyIds?.toSet();

    void checkNode(dynamic node) {
      if (node == null) return;
      final String? id = node.id?.toString();
      final Map<String, dynamic>? props = node.properties is Map ? Map<String, dynamic>.from(node.properties) : null;
      final List<dynamic>? children = node.children is List ? node.children : null;

      if (id != null && (filter == null || filter.contains(id)) && props != null) {
        // Direct validation property on the component
        final rawValidation = props['validation'];
        Map<String, dynamic>? validation;
        if (rawValidation is Map) {
          validation = Map<String, dynamic>.from(rawValidation);
        } else if (props['required'] == true) {
          validation = {
            'required': true,
            if (props['error_message'] != null) 'error_message': props['error_message'],
          };
        }

        if (validation != null) {
          final err = validateFieldRule(id, validation);
          if (err != null) {
            errors.add(err);
          }
        }
      }

      if (children != null && children.isNotEmpty) {
        for (final child in children) {
          checkNode(child);
        }
      }
    }

    for (final comp in components) {
      checkNode(comp);
    }
    return errors;
  }

  /// Remove (and dispose) the fields with the given IDs. Used when a pushed
  /// dynamic screen is closed so its values do not leak into other screens.
  void removeFields(Iterable<String> ids) {
    for (final id in ids) {
      final controller = _controllers.remove(id);
      controller?.dispose();
      _customValues.remove(id);
      _fieldLabels.remove(id);
    }
  }

  /// Reset all form controllers
  void reset() {
    for (final controller in _controllers.values) {
      controller.clear();
    }
  }

  /// Clear all registered controllers and state
  void clear() {
    for (final controller in _controllers.values) {
      controller.dispose();
    }
    _controllers.clear();
    _customValues.clear();
    _fieldLabels.clear();
  }

  /// Clear all registered controllers and state
  void dispose() => clear();
}

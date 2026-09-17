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

  /// Retrieve all current field values as a Map
  Map<String, dynamic> getValues() {
    final Map<String, dynamic> result = {};
    _controllers.forEach((key, controller) {
      result[key] = controller.text.trim();
    });
    _customValues.forEach((key, val) {
      result[key] = val;
    });
    return result;
  }

  /// Check if any registered field is empty.
  /// Returns a list of error messages (e.g. "Email Address cannot be empty").
  List<String> validateNonEmpty() {
    final List<String> errors = [];
    _controllers.forEach((id, controller) {
      if (controller.text.trim().isEmpty) {
        final label = getFieldLabel(id);
        errors.add('$label cannot be empty');
      }
    });
    return errors;
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

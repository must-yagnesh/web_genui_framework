import 'dart:async';
import 'package:flutter/foundation.dart';
import '../models/ui_schema.dart';
import '../validator/schema_validator.dart';

/// Global in-memory registry of all dynamic screens created and managed in the Web Console.
class GenUiScreenRegistry {
  static final GenUiScreenRegistry instance = GenUiScreenRegistry._internal();
  GenUiScreenRegistry._internal();

  final Map<String, UiSchema> _screensById = {};
  final Map<String, UiSchema> _screensByRoute = {};
  final StreamController<Map<String, UiSchema>> _screensUpdateController =
      StreamController<Map<String, UiSchema>>.broadcast();

  Stream<Map<String, UiSchema>> get screensStream => _screensUpdateController.stream;

  /// Check if a route is managed dynamically by the web console
  bool hasRoute(String? route) {
    if (route == null || route.isEmpty) return false;
    final clean = _normalizeRoute(route);
    if (_screensByRoute.containsKey(clean)) return true;
    final id = clean.replaceAll('/', '');
    return _screensById.containsKey(id);
  }

  /// Check if a screen ID is registered
  bool hasScreenId(String screenId) => _screensById.containsKey(screenId);

  /// Get the UI schema for a given route or screenId
  UiSchema? getSchemaForRoute(String? route) {
    if (route == null || route.isEmpty) return _screensById['home'];
    final clean = _normalizeRoute(route);
    if (_screensByRoute.containsKey(clean)) {
      return _screensByRoute[clean];
    }
    final rawId = clean.replaceAll('/', '');
    if (_screensById.containsKey(rawId)) {
      return _screensById[rawId];
    }
    return null;
  }

  /// Get schema directly by screen ID
  UiSchema? getSchemaById(String screenId) => _screensById[screenId];

  /// Register or update a single screen schema
  void registerScreen(UiSchema schema) {
    final screenId = schema.screenId.isNotEmpty ? schema.screenId : 'home';
    final route = schema.route.isNotEmpty
        ? _normalizeRoute(schema.route)
        : (screenId == 'home' ? '/' : '/$screenId');

    _screensById[screenId] = schema;
    _screensByRoute[route] = schema;
    _screensUpdateController.add(Map.unmodifiable(_screensByRoute));
  }

  /// Update all screens from a multi-screen bundle received from sync server
  void updateFromBundle(Map<String, dynamic> bundle) {
    final screensMap = bundle['screens'];
    if (screensMap is Map) {
      screensMap.forEach((key, screenData) {
        try {
          final result = GenUiSchemaValidator.validateAndSanitize(screenData);
          final schema = result.sanitizedSchema;
          final sId = schema.screenId.isNotEmpty ? schema.screenId : key.toString();
          final route = schema.route.isNotEmpty
              ? _normalizeRoute(schema.route)
              : (sId == 'home' ? '/' : '/$sId');

          _screensById[sId] = schema;
          _screensByRoute[route] = schema;
        } catch (e) {
          debugPrint('[GenUiScreenRegistry] Failed to sanitize screen $key: $e');
        }
      });
      _screensUpdateController.add(Map.unmodifiable(_screensByRoute));
    }
  }

  /// Normalize route string (e.g. "profile" -> "/profile")
  static String _normalizeRoute(String r) {
    var route = r.trim();
    if (!route.startsWith('/')) {
      route = '/$route';
    }
    return route;
  }

  /// Get all registered screen routes
  List<String> get registeredRoutes => List.unmodifiable(_screensByRoute.keys);

  /// Clear the registry (useful for testing)
  void clear() {
    _screensById.clear();
    _screensByRoute.clear();
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_genui_guard_app/genui_guard/genui_guard.dart';

void main() {
  group('flutter_genui_guard Unit Tests', () {
    test('Schema validator safely coerces malformed strings to numbers', () {
      final payload = {
        'version': '42',
        'components': [
          {
            'id': 'test_1',
            'type': 'banner',
            'padding': '32.5px',
            'title': 'Test Title'
          }
        ]
      };

      final result = GenUiSchemaValidator.validateAndSanitize(payload);
      expect(result.sanitizedSchema.version, 42);
      expect(result.sanitizedSchema.components.length, 1);
      expect(result.sanitizedSchema.components[0].properties['padding'], 32.5);
    });

    test('Schema validator handles corrupt and truncated JSON gracefully', () {
      const corruptJson = '{ "version": 1, "components": [ { "id": "incomplete"';
      final result = GenUiSchemaValidator.validateAndSanitize(corruptJson);

      expect(result.isValid, false);
      expect(result.sanitizedSchema.components.isEmpty, true);
      expect(result.warnings.isNotEmpty, true);
    });

    test('SafeWidgetRegistry builds fallback widget for hallucinated widget tag', () {
      const alienNode = ComponentNode(
        id: 'alien_1',
        type: 'QuantumLaserCard',
        properties: {'power': 9000},
      );

      final widget = SafeWidgetRegistry.buildNode(
        node: alienNode,
        theme: ThemeConfig.fallback(),
        isGuarded: true,
      );

      expect(widget, isA<GenUiErrorBoundary>());
    });

    testWidgets('GenUiFallbackWidget renders without throwing', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: GenUiFallbackWidget(
              componentId: 'fuzz_1',
              componentType: 'unknown_card',
              errorMessage: 'Safely isolated layout fault',
            ),
          ),
        ),
      );

      expect(find.textContaining('Guarded Component'), findsOneWidget);
      expect(find.textContaining('Safely isolated'), findsOneWidget);
    });

    test('Schema validator clamps runaway text overflow strings to prevent RenderFlex crash', () {
      final hugeText = 'A' * 1200;
      final payload = {
        'version': 1,
        'components': [
          {'id': 'c_bomb', 'type': 'banner', 'title': hugeText}
        ]
      };
      final result = GenUiSchemaValidator.validateAndSanitize(payload);
      final sanitizedTitle = result.sanitizedSchema.components[0].properties['title'] as String;
      expect(sanitizedTitle.length <= 355, true);
      expect(sanitizedTitle.endsWith('...'), true);
      expect(result.warnings.any((w) => w.contains('Layout Shield')), true);
    });

    test('Schema validator clamps negative layout dimensions and NaN', () {
      final payload = {
        'version': 1,
        'components': [
          {'id': 'c_dim', 'type': 'card', 'height': -150.0, 'padding': 'NaN'}
        ]
      };
      final result = GenUiSchemaValidator.validateAndSanitize(payload);
      final height = result.sanitizedSchema.components[0].properties['height'];
      final padding = result.sanitizedSchema.components[0].properties['padding'];
      expect(height, 0.0);
      expect(padding, 16.0);
      expect(result.warnings.any((w) => w.contains('Dimension Shield')), true);
    });

    test('Schema validator strips malicious script tags and blocks javascript: action URIs', () {
      final payload = {
        'version': 1,
        'components': [
          {
            'id': 'c_sec',
            'type': 'button',
            'text': '<script>alert("pwned")</script>Click Here',
            'action_id': 'javascript:eval("malicious")'
          }
        ]
      };
      final result = GenUiSchemaValidator.validateAndSanitize(payload);
      final text = result.sanitizedSchema.components[0].properties['text'] as String;
      final actionId = result.sanitizedSchema.components[0].properties['action_id'] as String;
      expect(text.contains('<script>'), false);
      expect(actionId, 'action_blocked_insecure');
      expect(result.warnings.any((w) => w.contains('Security Shield')), true);
    });
  });
}

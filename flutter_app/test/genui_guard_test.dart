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

    test('Schema validator sanitizes malformed color hex to brand token', () {
      final payload = {
        'version': 1,
        'components': [
          {
            'id': 'c_color',
            'type': 'banner',
            'title': 'Bad Color Test',
            'color': '#ZZ9900X'
          }
        ]
      };
      final result = GenUiSchemaValidator.validateAndSanitize(payload);
      final comp = result.sanitizedSchema.components[0];
      expect(comp.properties['color'], '#4F46E5');
      expect(comp.properties['has_color_anomaly'], true);
      expect(comp.properties['raw_color_value'], '#ZZ9900X');
      expect(result.warnings.any((w) => w.contains('[Style Shield]')), true);
    });

    test('Schema validator coerces non-array metrics string into safe typed list', () {
      final payload = {
        'version': 1,
        'components': [
          {
            'id': 'c_type',
            'type': 'metric_row',
            'metrics': 'not_an_array_string_value'
          }
        ]
      };
      final result = GenUiSchemaValidator.validateAndSanitize(payload);
      final comp = result.sanitizedSchema.components[0];
      expect(comp.properties['metrics'] is List, true);
      expect(comp.properties['has_type_mismatch'], true);
      expect(comp.properties['metrics_raw_value'], 'not_an_array_string_value');
      expect(result.warnings.any((w) => w.contains('[Type Shield]')), true);
    });

    test('SafeWidgetRegistry builds standard Flutter widgets safely', () {
      final widgets = [
        const ComponentNode(id: 'w_txt', type: 'text', properties: {'text': 'Hello World', 'font_size': 18.0, 'is_bold': true}),
        const ComponentNode(id: 'w_img', type: 'image', properties: {'image_url': 'https://example.com/img.png', 'height': 120.0}),
        const ComponentNode(id: 'w_tile', type: 'listtile', properties: {'title': 'Security Settings', 'subtitle': 'Configure 2FA', 'leading_icon': 'lock'}),
        const ComponentNode(id: 'w_chip', type: 'chip', properties: {'label': 'Verified', 'is_selected': true, 'icon': 'check'}),
        const ComponentNode(id: 'w_switch', type: 'switch', properties: {'label': 'Push Notifications', 'is_checked': true}),
        const ComponentNode(id: 'w_check', type: 'checkbox', properties: {'label': 'I agree', 'is_checked': false}),
        const ComponentNode(id: 'w_radio', type: 'radio', properties: {'label': 'Premium Tier', 'is_selected': true}),
        const ComponentNode(id: 'w_div', type: 'divider', properties: {'thickness': 2.0}),
        const ComponentNode(id: 'w_space', type: 'spacer', properties: {'height': 24.0}),
      ];

      for (final node in widgets) {
        expect(SafeWidgetRegistry.supportedTypes.contains(node.type), true);
        final built = SafeWidgetRegistry.buildNode(
          node: node,
          theme: ThemeConfig.fallback(),
          isGuarded: true,
        );
        expect(built, isNotNull);
      }
    });

    testWidgets('SafeWidgetRegistry renders Row and Column with recursive children', (WidgetTester tester) async {
      const containerNode = ComponentNode(
        id: 'col_main',
        type: 'column',
        properties: {},
        children: [
          ComponentNode(id: 't1', type: 'text', properties: {'text': 'Header'}),
          ComponentNode(
            id: 'row_1',
            type: 'row',
            properties: {},
            children: [
              ComponentNode(id: 'r_txt', type: 'text', properties: {'text': 'Row Item'}),
              ComponentNode(id: 'r_chip', type: 'chip', properties: {'label': 'Active'}),
            ],
          ),
          ComponentNode(id: 'd1', type: 'divider', properties: {'thickness': 1.0}),
        ],
      );

      final widget = SafeWidgetRegistry.buildNode(
        node: containerNode,
        theme: ThemeConfig.fallback(),
        isGuarded: true,
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: widget,
          ),
        ),
      );

      expect(find.text('Header'), findsOneWidget);
      expect(find.text('Row Item'), findsOneWidget);
      expect(find.text('Active'), findsOneWidget);
      expect(find.byType(Divider), findsOneWidget);
    });

    testWidgets('builds all 12 standard Flutter widgets inside Column and Row layout containers', (WidgetTester tester) async {
      final rawSchema = {
        'version': '1.0.0',
        'header': {'title': 'All Widgets Layout Test', 'subtitle': 'Testing Column and Row with all primitives'},
        'theme': {'primary_color': '#4F46E5'},
        'components': [
          {
            'id': 'main_col',
            'type': 'column',
            'main_axis_alignment': 'start',
            'cross_axis_alignment': 'stretch',
            'children': [
              {'id': 'c_txt', 'type': 'text', 'text': 'Dynamic Text In Column', 'font_size': 18, 'is_bold': true, 'align': 'left'},
              {'id': 'c_btn', 'type': 'button', 'text': 'Col Button', 'variant': 'primary'},
              {'id': 'c_input', 'type': 'textfield', 'label': 'Col Input', 'hint': 'Type something'},
              {'id': 'c_tile', 'type': 'listtile', 'title': 'Col ListTile', 'subtitle': 'Tile details', 'leading_icon': 'lock', 'trailing_text': 'OPEN'},
              {'id': 'c_switch', 'type': 'switch', 'label': 'Col Switch', 'is_checked': true},
              {'id': 'c_check', 'type': 'checkbox', 'label': 'Col Checkbox', 'is_checked': false},
              {'id': 'c_radio', 'type': 'radio', 'label': 'Col Radio', 'is_selected': true},
              {'id': 'c_icon', 'type': 'icon', 'icon': 'star', 'size': 24},
              {'id': 'c_div', 'type': 'divider', 'thickness': 2},
              {'id': 'c_space', 'type': 'spacer', 'height': 16},
              {
                'id': 'nested_row',
                'type': 'row',
                'main_axis_alignment': 'spaceBetween',
                'cross_axis_alignment': 'center',
                'children': [
                  {'id': 'r_chip', 'type': 'chip', 'label': 'Row Chip', 'icon': 'check', 'is_selected': true},
                  {'id': 'r_btn', 'type': 'button', 'text': 'Row Action', 'variant': 'outline'},
                  {'id': 'r_icon', 'type': 'icon', 'icon': 'heart', 'size': 20},
                ],
              },
            ],
          },
        ],
      };

      final validationResult = GenUiSchemaValidator.validateAndSanitize(rawSchema);
      expect(validationResult.sanitizedSchema.components.isNotEmpty, isTrue);

      final rootCol = validationResult.sanitizedSchema.components.first;
      final widget = SafeWidgetRegistry.buildNode(
        node: rootCol,
        theme: validationResult.sanitizedSchema.theme,
        isGuarded: true,
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(child: widget),
          ),
        ),
      );

      expect(find.text('Dynamic Text In Column'), findsOneWidget);
      expect(find.text('Col Button'), findsOneWidget);
      expect(find.text('Col Input'), findsOneWidget);
      expect(find.text('Col ListTile'), findsOneWidget);
      expect(find.text('Col Switch'), findsOneWidget);
      expect(find.text('Col Checkbox'), findsOneWidget);
      expect(find.text('Col Radio'), findsOneWidget);
      expect(find.text('Row Chip'), findsOneWidget);
      expect(find.text('Row Action'), findsOneWidget);
      expect(find.byType(Divider), findsOneWidget);
    });

    testWidgets('GenUiFormRegistry tracks and validates textfield inputs', (WidgetTester tester) async {
      GenUiFormRegistry.instance.clear();

      const emailNode = ComponentNode(
        id: 'input_email',
        type: 'textfield',
        properties: {'label': 'Email Address', 'hint': 'alex@example.com'},
      );
      const passwordNode = ComponentNode(
        id: 'input_password',
        type: 'textfield',
        properties: {'label': 'Password', 'is_password': true},
      );

      final theme = ThemeConfig.fallback();
      final emailWidget = SafeWidgetRegistry.buildNode(node: emailNode, theme: theme);
      final passWidget = SafeWidgetRegistry.buildNode(node: passwordNode, theme: theme);

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Column(children: [emailWidget, passWidget]),
          ),
        ),
      );

      // Initially both are empty
      var errors = GenUiFormRegistry.instance.validateNonEmpty();
      expect(errors.length, 2);
      expect(errors.first, 'Email Address cannot be empty');

      // Enter text into email field
      await tester.enterText(find.byType(TextField).first, 'user@domain.com');
      await tester.pump();

      errors = GenUiFormRegistry.instance.validateNonEmpty();
      expect(errors.length, 1);
      expect(errors.first, 'Password cannot be empty');

      // Enter password
      await tester.enterText(find.byType(TextField).last, 'secret123');
      await tester.pump();

      errors = GenUiFormRegistry.instance.validateNonEmpty();
      expect(errors.isEmpty, isTrue);

      final values = GenUiFormRegistry.instance.getValues();
      expect(values['input_email'], 'user@domain.com');
      expect(values['input_password'], 'secret123');
    });
  });
}


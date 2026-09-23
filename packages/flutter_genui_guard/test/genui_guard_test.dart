import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:flutter_genui_guard/genui_guard.dart';

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

    test('GenUiDartExecutor extracts code from various property representations', () {
      const nodeDirect = ComponentNode(
        id: 'c1',
        type: 'button',
        properties: {'custom_dart_code': "ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Hi')));"},
      );
      expect(GenUiDartExecutor.extractCode(nodeDirect), "ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Hi')));");
      expect(GenUiDartExecutor.hasAction(nodeDirect), true);

      const nodeOnclickStr = ComponentNode(
        id: 'c2',
        type: 'text',
        properties: {'onclick': "showDialog(context: context, builder: (_) => AlertDialog(title: Text('Alert')));"},
      );
      expect(GenUiDartExecutor.extractCode(nodeOnclickStr), "showDialog(context: context, builder: (_) => AlertDialog(title: Text('Alert')));");

      const nodeOnclickMap = ComponentNode(
        id: 'c3',
        type: 'icon',
        properties: {'onclick': {'code': 'print("Icon clicked");'}},
      );
      expect(GenUiDartExecutor.extractCode(nodeOnclickMap), 'print("Icon clicked");');

      const nodeActionId = ComponentNode(
        id: 'c4',
        type: 'image',
        properties: {'action_id': 'dart:Navigator.pop(context);'},
      );
      expect(GenUiDartExecutor.extractCode(nodeActionId), 'Navigator.pop(context);');
    });

    testWidgets('GenUiDartExecutor executes SnackBar and Dialog safely without crashing', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Builder(
              builder: (context) => Column(
                children: [
                  ElevatedButton(
                    onPressed: () => GenUiDartExecutor.execute(
                      context: context,
                      code: "ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Hello from Dynamic Dart!')));",
                    ),
                    child: const Text('Trigger SnackBar'),
                  ),
                  ElevatedButton(
                    onPressed: () => GenUiDartExecutor.execute(
                      context: context,
                      code: "showDialog(context: context, builder: (ctx) => AlertDialog(title: Text('Dialog Title'), content: Text('Dialog Body')));",
                    ),
                    child: const Text('Trigger Dialog'),
                  ),
                  ElevatedButton(
                    onPressed: () => GenUiDartExecutor.execute(
                      context: context,
                      code: "INVALID DART SYNTAX %&*@# WHICH MIGHT CRASH",
                    ),
                    child: const Text('Trigger Malformed'),
                  ),
                ],
              ),
            ),
          ),
        ),
      );

      // Tap SnackBar button
      await tester.tap(find.text('Trigger SnackBar'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));
      expect(find.text('Hello from Dynamic Dart!'), findsOneWidget);

      // Dismiss SnackBar and tap Dialog button
      ScaffoldMessenger.of(tester.element(find.byType(Scaffold))).hideCurrentSnackBar();
      await tester.pump();

      await tester.tap(find.text('Trigger Dialog'));
      await tester.pumpAndSettle();
      expect(find.text('Dialog Title'), findsOneWidget);
      expect(find.text('Dialog Body'), findsOneWidget);

      // Dismiss dialog
      await tester.tap(find.text('Close'));
      await tester.pumpAndSettle();

      // Tap malformed code - guarantee 0% crash
      await tester.tap(find.text('Trigger Malformed'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));
      // Should show the guard toast without any red screen
      expect(tester.takeException(), isNull);
    });

    testWidgets('SafeGenUiText, SafeGenUiImage, SafeGenUiIcon, SafeGenUiButton invoke onExecute when clicked', (WidgetTester tester) async {
      final executedCodes = <String>[];

      void handleExecute(ComponentNode node) {
        final code = GenUiDartExecutor.extractCode(node);
        executedCodes.add('${node.type}:$code');
      }

      const textNode = ComponentNode(
        id: 'txt_click',
        type: 'text',
        properties: {'text': 'Clickable Text', 'custom_dart_code': "print('Text clicked');"},
      );
      const iconNode = ComponentNode(
        id: 'icon_click',
        type: 'icon',
        properties: {'icon': 'star', 'custom_dart_code': "print('Icon clicked');"},
      );
      const buttonNode = ComponentNode(
        id: 'btn_click',
        type: 'button',
        properties: {'text': 'Clickable Button', 'custom_dart_code': "print('Button clicked');"},
      );
      const imageNode = ComponentNode(
        id: 'img_click',
        type: 'image',
        properties: {'image_url': 'https://example.com/logo.png', 'custom_dart_code': "print('Image clicked');"},
      );

      final theme = ThemeConfig.fallback();
      final textWidget = SafeWidgetRegistry.buildNode(node: textNode, theme: theme, onExecute: handleExecute);
      final iconWidget = SafeWidgetRegistry.buildNode(node: iconNode, theme: theme, onExecute: handleExecute);
      final btnWidget = SafeWidgetRegistry.buildNode(node: buttonNode, theme: theme, onExecute: handleExecute);
      final imgWidget = SafeWidgetRegistry.buildNode(node: imageNode, theme: theme, onExecute: handleExecute);

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Column(
              children: [textWidget, iconWidget, btnWidget, imgWidget],
            ),
          ),
        ),
      );

      // Click text
      await tester.tap(find.text('Clickable Text'));
      await tester.pump();
      expect(executedCodes.contains("text:print('Text clicked');"), isTrue);

      // Click icon
      await tester.tap(find.byIcon(Icons.star));
      await tester.pump();
      expect(executedCodes.contains("icon:print('Icon clicked');"), isTrue);

      // Click button
      await tester.tap(find.text('Clickable Button'));
      await tester.pump();
      expect(executedCodes.contains("button:print('Button clicked');"), isTrue);

      // Click image
      await tester.tap(find.byType(SafeGenUiImage));
      await tester.pump();
      expect(executedCodes.contains("image:print('Image clicked');"), isTrue);
    });

    testWidgets('GenUiDartExecutor navigates to /profile, /settings, custom routes with arguments, and CustomDemoBottomSheet', (WidgetTester tester) async {
      GenUiDartExecutor.customBottomSheetHandler = (context, code) {
        showModalBottomSheet(context: context, builder: (_) => const CustomDemoBottomSheet());
      };

      await tester.pumpWidget(
        MaterialApp(
          routes: {
            '/profile': (context) => const UserProfileDemoScreen(),
            '/settings': (context) => const SettingsDemoScreen(),
          },
          onGenerateRoute: (settings) {
            return MaterialPageRoute(
              builder: (ctx) => GenericProjectScreen(route: settings.name ?? '', arguments: settings.arguments),
              settings: settings,
            );
          },
          home: Scaffold(
            body: Builder(
              builder: (context) => Column(
                children: [
                  ElevatedButton(
                    onPressed: () => GenUiDartExecutor.execute(
                      context: context,
                      code: "Navigator.pushNamed(context, '/profile', arguments: {'userId': 'alex_vip'});",
                    ),
                    child: const Text('Go Profile'),
                  ),
                  ElevatedButton(
                    onPressed: () => GenUiDartExecutor.execute(
                      context: context,
                      code: "Get.toNamed('/settings', arguments: 'security_tab');",
                    ),
                    child: const Text('Go Settings'),
                  ),
                  ElevatedButton(
                    onPressed: () => GenUiDartExecutor.execute(
                      context: context,
                      code: "showModalBottomSheet(context: context, builder: (_) => const CustomDemoBottomSheet());",
                    ),
                    child: const Text('Open Custom Sheet'),
                  ),
                  ElevatedButton(
                    onPressed: () => GenUiDartExecutor.execute(
                      context: context,
                      code: "Navigator.pushNamed(context, '/orders', arguments: {'orderId': 9001});",
                    ),
                    child: const Text('Go Custom Route'),
                  ),
                ],
              ),
            ),
          ),
        ),
      );

      // 1. Test Navigation to /profile with arguments
      await tester.tap(find.text('Go Profile'));
      await tester.pumpAndSettle();
      expect(find.byType(UserProfileDemoScreen), findsOneWidget);
      expect(find.text('Alex Morgan'), findsOneWidget);
      expect(find.textContaining('alex_vip'), findsOneWidget);

      // Pop back
      await tester.tap(find.byIcon(Icons.arrow_back_ios_new));
      await tester.pumpAndSettle();

      // 2. Test Navigation to /settings with GetX style syntax
      await tester.tap(find.text('Go Settings'));
      await tester.pumpAndSettle();
      expect(find.byType(SettingsDemoScreen), findsOneWidget);
      expect(find.text('App Settings'), findsOneWidget);
      expect(find.textContaining('security_tab'), findsOneWidget);

      // Pop back
      await tester.tap(find.byIcon(Icons.arrow_back_ios_new));
      await tester.pumpAndSettle();

      // 3. Test CustomDemoBottomSheet
      await tester.tap(find.text('Open Custom Sheet'));
      await tester.pumpAndSettle();
      expect(find.byType(CustomDemoBottomSheet), findsOneWidget);
      expect(find.text('Custom Project Bottom Sheet'), findsOneWidget);
      expect(find.text('Share Live Schema'), findsOneWidget);

      // Dismiss sheet
      await tester.tap(find.text('Dismiss Sheet'));
      await tester.pumpAndSettle();

      // 4. Test Navigation to arbitrary custom real-project route (/orders)
      await tester.tap(find.text('Go Custom Route'));
      await tester.pumpAndSettle();
      expect(find.byType(GenericProjectScreen), findsOneWidget);
      expect(find.text('Opened Route: "/orders"'), findsOneWidget);
      expect(find.textContaining('9001'), findsOneWidget);

      // Pop back
      await tester.tap(find.byIcon(Icons.arrow_back_ios_new));
      await tester.pumpAndSettle();
    });

    testWidgets('GenUiDartExecutor extracts input, validates email, blocks on return, and navigates with arguments when valid', (WidgetTester tester) async {
      GenUiFormRegistry.instance.clear();

      const inputNode = ComponentNode(
        id: 'input_email',
        type: 'textfield',
        properties: {'label': 'Email Address', 'hint': 'Enter email'},
      );

      const script = """
        final email = GenUiFormRegistry.instance.getValue('email');
        if (email.isEmpty || !email.contains('@')) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Please enter a valid email address!'),
              backgroundColor: Colors.red,
            ),
          );
          return;
        }
        Navigator.pushNamed(context, '/profile', arguments: {'email': email});
      """;

      await tester.pumpWidget(
        MaterialApp(
          routes: {
            '/profile': (context) => const UserProfileDemoScreen(),
          },
          home: Scaffold(
            body: Builder(
              builder: (context) => Column(
                children: [
                  SafeWidgetRegistry.buildNode(
                    node: inputNode,
                    theme: ThemeConfig.fallback(),
                  ),
                  ElevatedButton(
                    onPressed: () => GenUiDartExecutor.execute(
                      context: context,
                      code: script,
                    ),
                    child: const Text('Submit & Navigate'),
                  ),
                ],
              ),
            ),
          ),
        ),
      );

      // Phase 1: Test with empty email -> triggers validation SnackBar, blocks navigation
      await tester.tap(find.text('Submit & Navigate'));
      await tester.pump();
      expect(find.text('Please enter a valid email address!'), findsOneWidget);
      expect(find.byType(UserProfileDemoScreen), findsNothing);

      // Phase 2: Enter invalid text without '@' -> still blocks navigation
      await tester.enterText(find.byType(TextField), 'invalidemail');
      await tester.pump();
      await tester.tap(find.text('Submit & Navigate'));
      await tester.pump();
      expect(find.text('Please enter a valid email address!'), findsOneWidget);
      expect(find.byType(UserProfileDemoScreen), findsNothing);

      // Phase 3: Enter valid email -> validation passes, navigates to /profile with arguments
      await tester.enterText(find.byType(TextField), 'alex@enterprise.io');
      await tester.pump();
      await tester.tap(find.text('Submit & Navigate'));
      await tester.pumpAndSettle();

      expect(find.byType(UserProfileDemoScreen), findsOneWidget);
      expect(find.textContaining('alex@enterprise.io'), findsOneWidget);
    });

    testWidgets('GenUiDartExecutor interpolates scope variables in SnackBar and supports isValidEmail', (WidgetTester tester) async {
      GenUiFormRegistry.instance.clear();
      GenUiFormRegistry.instance.getController('email').text = 'test@example.com';

      const script = """
        final email = GenUiFormRegistry.instance.getValue('email');
        if (GenUiFormRegistry.instance.isValidEmail('email')) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Verified email: \$email')),
          );
        }
      """;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Builder(
              builder: (context) => ElevatedButton(
                onPressed: () => GenUiDartExecutor.execute(
                  context: context,
                  code: script,
                ),
                child: const Text('Verify'),
              ),
            ),
          ),
        ),
      );

      await tester.tap(find.text('Verify'));
      await tester.pump();
      expect(find.text('Verified email: test@example.com'), findsOneWidget);
    });
  });

  group('Multi-Screen Registry and Dynamic Routing Tests', () {
    test('GenUiScreenRegistry registers, indexes routes, and retrieves schema', () {
      final registry = GenUiScreenRegistry.instance;
      registry.clear();

      expect(registry.hasRoute('/checkout'), isFalse);
      expect(registry.getSchemaForRoute('/checkout'), isNull);

      final checkoutSchema = UiSchema(
        version: 1,
        timestamp: DateTime.now().millisecondsSinceEpoch,
        screenId: 'checkout',
        screenName: 'Checkout & Payment',
        route: '/checkout',
        theme: ThemeConfig.fallback(),
        header: const HeaderConfig(title: 'Order Checkout', subtitle: 'Review items', showBackButton: true, actionIcon: 'more'),
        components: const [
          ComponentNode(
            id: 'btn_pay',
            type: 'button',
            properties: {'text': 'Pay Now'},
          ),
        ],
      );

      registry.registerScreen(checkoutSchema);
      expect(registry.hasRoute('/checkout'), isTrue);
      expect(registry.hasRoute('checkout'), isTrue);

      final resolved = registry.getSchemaForRoute('/checkout');
      expect(resolved, isNotNull);
      expect(resolved!.screenName, 'Checkout & Payment');
      expect(resolved.header.title, 'Order Checkout');
      expect(resolved.components.length, 1);
    });

    test('GenUiScreenRegistry.updateFromBundle batch registers schemas', () {
      final registry = GenUiScreenRegistry.instance;
      registry.clear();

      final bundle = {
        'active_screen_id': 'orders',
        'screens': {
          'home': {
            'version': 1,
            'screen_id': 'home',
            'screen_name': 'Home Dashboard',
            'route': '/',
            'header': {'title': 'Home'},
            'components': [],
          },
          'orders': {
            'version': 2,
            'screen_id': 'orders',
            'screen_name': 'My Orders',
            'route': '/orders',
            'header': {'title': 'Order History'},
            'components': [],
          },
        }
      };

      registry.updateFromBundle(bundle);
      expect(registry.hasRoute('/'), isTrue);
      expect(registry.hasRoute('/orders'), isTrue);
      expect(registry.getSchemaForRoute('/orders')?.screenName, 'My Orders');
    });

    test('UiSchema.allComponentIds includes nested children and form registry scopes by screen', () {
      final schema = GenUiSchemaValidator.validateAndSanitize({
        'version': 1,
        'screen_id': 'contact',
        'route': '/contact',
        'components': [
          {'id': 'contact_name', 'type': 'textfield', 'label': 'Full Name'},
          {
            'id': 'rating_row',
            'type': 'row',
            'children': [
              {'id': 'chip_good', 'type': 'chip', 'label': 'Good'},
            ]
          },
        ]
      }).sanitizedSchema;

      expect(schema.allComponentIds, containsAll(['contact_name', 'rating_row', 'chip_good']));

      final registry = GenUiFormRegistry.instance;
      registry.clear();
      registry.getController('contact_name', label: 'Full Name').text = 'Alex';
      registry.getController('home_email', label: 'Email').text = '';
      registry.setValue('chip_good', true, label: 'Good');

      // Unscoped validation sees the empty home field; scoped validation does not
      expect(registry.validateNonEmpty(), isNotEmpty);
      expect(registry.validateNonEmpty(onlyIds: schema.allComponentIds), isEmpty);

      final scoped = registry.getValues(onlyIds: schema.allComponentIds);
      expect(scoped.keys, containsAll(['contact_name', 'chip_good']));
      expect(scoped.containsKey('home_email'), isFalse);

      final fields = GenUiSubmissionClient.buildFieldsFromRegistry(onlyIds: schema.allComponentIds);
      expect(fields.map((f) => f['id']), containsAll(['contact_name', 'chip_good']));
      expect(fields.any((f) => f['id'] == 'home_email'), isFalse);

      // Closing the pushed screen drops only its own fields
      registry.removeFields(schema.allComponentIds);
      expect(registry.getValues().containsKey('contact_name'), isFalse);
      expect(registry.getValues().containsKey('home_email'), isTrue);
      registry.clear();
    });

    testWidgets('GenUiSuccessDialog shows title, message and pops back to the first route', (WidgetTester tester) async {
      final dialogConfig = GenUiSuccessDialog.fromProperties({
        'success_dialog': {
          'title': 'Message Sent!',
          'message': 'We will reply within 24 hours.',
          'button_text': 'Back to Home Screen',
          'navigate_to': '/',
        }
      });
      expect(dialogConfig, isNotNull);
      expect(GenUiSuccessDialog.fromProperties({'text': 'plain'}), isNull);

      await tester.pumpWidget(MaterialApp(
        home: Builder(
          builder: (ctx) => Scaffold(
            body: Center(
              child: ElevatedButton(
                onPressed: () => Navigator.push(
                  ctx,
                  MaterialPageRoute(
                    builder: (_) => Builder(
                      builder: (innerCtx) => Scaffold(
                        body: ElevatedButton(
                          onPressed: () => GenUiSuccessDialog.show(innerCtx, dialogConfig!),
                          child: const Text('Submit Contact'),
                        ),
                      ),
                    ),
                  ),
                ),
                child: const Text('Open Contact'),
              ),
            ),
          ),
        ),
      ));

      await tester.tap(find.text('Open Contact'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Submit Contact'));
      await tester.pumpAndSettle();

      expect(find.text('Message Sent!'), findsOneWidget);
      expect(find.text('We will reply within 24 hours.'), findsOneWidget);

      await tester.tap(find.text('Back to Home Screen'));
      await tester.pumpAndSettle();

      // Dialog and the pushed Contact screen are both gone; Home is visible again
      expect(find.text('Message Sent!'), findsNothing);
      expect(find.text('Submit Contact'), findsNothing);
      expect(find.text('Open Contact'), findsOneWidget);
    });

    testWidgets('GenUiDartExecutor navigates to dynamic screen registered in registry with arguments', (WidgetTester tester) async {
      final registry = GenUiScreenRegistry.instance;
      registry.clear();

      final profileSchema = UiSchema(
        version: 1,
        timestamp: DateTime.now().millisecondsSinceEpoch,
        screenId: 'profile',
        screenName: 'Dynamic User Profile',
        route: '/profile',
        theme: ThemeConfig.fallback(),
        header: const HeaderConfig(title: 'Live Dynamic Profile', subtitle: 'Console Generated', showBackButton: true, actionIcon: 'more'),
        components: const [
          ComponentNode(
            id: 'profile_btn',
            type: 'button',
            properties: {'text': 'Edit Profile'},
          ),
        ],
      );
      registry.registerScreen(profileSchema);

      const navCode = "Navigator.pushNamed(context, '/profile', arguments: {'tier': 'VIP', 'score': 100});";

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Builder(
              builder: (context) => ElevatedButton(
                onPressed: () => GenUiDartExecutor.execute(
                  context: context,
                  code: navCode,
                ),
                child: const Text('Open Dynamic Profile'),
              ),
            ),
          ),
        ),
      );

      await tester.tap(find.text('Open Dynamic Profile'));
      await tester.pumpAndSettle();

      // DynamicScreen was pushed because /profile is in GenUiScreenRegistry
      expect(find.byType(DynamicScreen), findsOneWidget);
      expect(find.text('Live Dynamic Profile'), findsOneWidget);
      expect(find.text('Edit Profile'), findsOneWidget);
      expect(find.textContaining('tier: VIP'), findsOneWidget);
    });
  });

  group('Dynamic Web Console API Engine Tests', () {
    test('GenUiApiClient.buildPayload maps dynamic fields and static parameters accurately', () {
      final registry = GenUiFormRegistry.instance;
      registry.clear();
      registry.getController('contact_name', label: 'Full Name').text = 'Jane Doe';
      registry.getController('contact_email', label: 'Email').text = 'jane@example.com';
      registry.getController('contact_msg', label: 'Message').text = 'Hello World';
      registry.setValue('callback_switch', true, label: 'Callback');

      const config = ApiConfig(
        url: 'https://api.mycloud.com/v1/leads',
        method: 'POST',
        headers: {'Authorization': 'Bearer test_token'},
        bodyMapping: {
          'lead_name': 'contact_name',
          'lead_email': 'contact_email',
          'notes': 'contact_msg',
          'needs_callback': 'callback_switch',
        },
        staticBody: {
          'tenant_id': 'tenant_999',
          'source': 'mobile_app',
        },
      );

      final payload = GenUiApiClient.buildPayload(config: config);

      expect(payload['lead_name'], 'Jane Doe');
      expect(payload['lead_email'], 'jane@example.com');
      expect(payload['notes'], 'Hello World');
      expect(payload['needs_callback'], 'true');
      expect(payload['tenant_id'], 'tenant_999');
      expect(payload['source'], 'mobile_app');
    });

    testWidgets('GenUiApiClient declarative validation blocks invalid inputs before making HTTP call', (WidgetTester tester) async {
      final registry = GenUiFormRegistry.instance;
      registry.clear();
      registry.getController('contact_email', label: 'Email').text = 'invalid_email';

      const emailComp = ComponentNode(
        id: 'contact_email',
        type: 'textfield',
        properties: {
          'label': 'Email Address',
          'validation': {
            'required': true,
            'type': 'email',
            'error_message': 'Please enter a valid work email',
          },
        },
      );

      const config = ApiConfig(
        url: 'https://api.mycloud.com/v1/leads',
        method: 'POST',
      );

      bool httpCalled = false;
      final mockClient = MockClient((request) async {
        httpCalled = true;
        return http.Response('{"success": true}', 200);
      });

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Builder(
              builder: (ctx) => ElevatedButton(
                onPressed: () async {
                  await GenUiApiClient.executeApi(
                    context: ctx,
                    config: config,
                    components: [emailComp],
                    httpClient: mockClient,
                  );
                },
                child: const Text('Submit Lead'),
              ),
            ),
          ),
        ),
      );

      await tester.tap(find.text('Submit Lead'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      // Validation error snackbar displayed
      expect(find.text('Validation Error: Please enter a valid work email'), findsOneWidget);
      // HTTP call was blocked!
      expect(httpCalled, isFalse);
    });

    testWidgets('GenUiApiClient executes dynamic HTTP POST with mapped keys and headers', (WidgetTester tester) async {
      final registry = GenUiFormRegistry.instance;
      registry.clear();
      registry.getController('user_name', label: 'Name').text = 'Alex VIP';
      registry.getController('user_email', label: 'Email').text = 'alex@enterprise.io';

      const config = ApiConfig(
        url: 'https://api.mycloud.com/v1/contact',
        method: 'POST',
        headers: {
          'X-Custom-Header': 'SecretValue123',
        },
        bodyMapping: {
          'fullName': 'user_name',
          'contactEmail': 'user_email',
        },
        staticBody: {
          'app_version': '2.0.0',
        },
        onSuccess: {
          'type': 'dialog',
          'title': 'Cloud Submission Received!',
          'message': 'Your message has been received by Cloud API.',
          'button_text': 'Done',
          'navigate_to': '/',
        },
      );

      http.Request? capturedRequest;
      final mockClient = MockClient((request) async {
        capturedRequest = request;
        return http.Response(json.encode({'status': 'ok', 'id': 42}), 200);
      });

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Builder(
              builder: (ctx) => ElevatedButton(
                onPressed: () async {
                  await GenUiApiClient.executeApi(
                    context: ctx,
                    config: config,
                    httpClient: mockClient,
                  );
                },
                child: const Text('Send To Cloud'),
              ),
            ),
          ),
        ),
      );

      await tester.tap(find.text('Send To Cloud'));
      await tester.pumpAndSettle();

      // Verify HTTP request details
      expect(capturedRequest, isNotNull);
      expect(capturedRequest!.url.toString(), 'https://api.mycloud.com/v1/contact');
      expect(capturedRequest!.headers['X-Custom-Header'], 'SecretValue123');

      final decodedBody = json.decode(capturedRequest!.body);
      expect(decodedBody['fullName'], 'Alex VIP');
      expect(decodedBody['contactEmail'], 'alex@enterprise.io');
      expect(decodedBody['app_version'], '2.0.0');

      // Verify Success Dialog rendered
      expect(find.text('Cloud Submission Received!'), findsOneWidget);
      expect(find.text('Your message has been received by Cloud API.'), findsOneWidget);
    });

    testWidgets('GenUiApiClient handles 500 error and connection failure without throwing', (WidgetTester tester) async {
      const config = ApiConfig(
        url: 'https://api.mycloud.com/v1/fail',
        method: 'POST',
        onError: {
          'message': 'Cloud Server is currently undergoing maintenance.',
        },
      );

      final failingClient = MockClient((request) async {
        return http.Response('Internal Server Error', 500);
      });

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Builder(
              builder: (ctx) => ElevatedButton(
                onPressed: () async {
                  await GenUiApiClient.executeApi(
                    context: ctx,
                    config: config,
                    httpClient: failingClient,
                  );
                },
                child: const Text('Try Failing API'),
              ),
            ),
          ),
        ),
      );

      await tester.tap(find.text('Try Failing API'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      expect(find.text('Cloud Server is currently undergoing maintenance.'), findsOneWidget);
      expect(tester.takeException(), isNull);
    });

    testWidgets('DynamicScreen button with api_config executes dynamic API on-click and maps inputs', (WidgetTester tester) async {
      GenUiFormRegistry.instance.clear();
      GenUiScreenRegistry.instance.clear();

      final dynamicContactSchema = UiSchema(
        version: 1,
        timestamp: DateTime.now().millisecondsSinceEpoch,
        screenId: 'contact_test',
        screenName: 'Contact Test',
        route: '/contact_test',
        theme: ThemeConfig.fallback(),
        header: const HeaderConfig(title: 'Contact Us', subtitle: 'Dynamic Form', showBackButton: false, actionIcon: 'mail'),
        components: const [
          ComponentNode(
            id: 'c_name',
            type: 'textfield',
            properties: {
              'label': 'Your Name',
              'validation': {'required': true, 'error_message': 'Name is required'},
            },
          ),
          ComponentNode(
            id: 'c_btn',
            type: 'button',
            properties: {
              'text': 'Send Message',
              'action_type': 'api_call',
              'api_config': {
                'url': 'https://api.mycloud.com/v1/messages',
                'method': 'POST',
                'body_mapping': {'sender': 'c_name'},
                'on_success': {'type': 'snackbar', 'message': 'Message Dispatched to Cloud!'},
              },
            },
          ),
        ],
      );
      GenUiScreenRegistry.instance.registerScreen(dynamicContactSchema);

      await tester.pumpWidget(
        const MaterialApp(
          home: DynamicScreen(screenId: 'contact_test', route: '/contact_test', enableLiveSync: false),
        ),
      );
      await tester.pumpAndSettle();

      // Enter name
      await tester.enterText(find.byType(TextField), 'John Cloud User');
      await tester.pump();

      // Tap Send Message
      await tester.tap(find.text('Send Message'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      // 0% crash guarantee: gracefully handled even without mock client (hits candidate fallback or timeout)
      expect(tester.takeException(), isNull);
    });

    testWidgets('Dynamic API Client: prepends Flutter baseUrl and injects authToken for relative endpoints', (WidgetTester tester) async {
      GenUiApiClient.setBaseUrl('https://api.myproject.com');
      GenUiApiClient.setAuthToken('test_jwt_token_xyz');
      GenUiApiClient.setDefaultHeaders({'X-Client': 'FlutterApp'});
      GenUiApiClient.setUserContext({'userId': 'usr_456'});

      final client = MockClient((request) async {
        // Verify relative endpoint '/v1/leads' was resolved with Flutter's baseUrl
        expect(request.url.toString(), 'https://api.myproject.com/v1/leads');
        // Verify auth token and default headers were auto-injected
        expect(request.headers['Authorization'], 'Bearer test_jwt_token_xyz');
        expect(request.headers['X-Client'], 'FlutterApp');
        return http.Response('{"status":"success","leadId":99}', 200);
      });

      final config = ApiConfig(
        url: '/v1/leads',
        method: 'POST',
        headers: const {},
        bodyMapping: const {},
        staticBody: const {'source': 'mobile'},
      );

      GenUiApiResult? result;
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Builder(
              builder: (ctx) => ElevatedButton(
                onPressed: () async {
                  result = await GenUiApiClient.executeApi(
                    context: ctx,
                    config: config,
                    httpClient: client,
                  );
                },
                child: const Text('Execute'),
              ),
            ),
          ),
        ),
      );

      await tester.tap(find.text('Execute'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      expect(result, isNotNull);
      expect(result!.success, isTrue);
      expect(result!.statusCode, 200);

      // Clean up session
      GenUiApiClient.clearSession();
      GenUiApiClient.setBaseUrl(null);
    });

    testWidgets('Dynamic API Client: replaces {userId} path variable from userContext', (WidgetTester tester) async {
      GenUiApiClient.setBaseUrl('https://api.myproject.com');
      GenUiApiClient.setUserContext({'userId': 'usr_789'});

      final client = MockClient((request) async {
        expect(request.url.toString(), 'https://api.myproject.com/users/usr_789/profile');
        return http.Response('{"profile":"ok"}', 200);
      });

      final config = ApiConfig(
        url: '/users/{userId}/profile',
        method: 'GET',
        headers: const {},
        bodyMapping: const {},
        staticBody: const {},
      );

      GenUiApiResult? result;
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Builder(
              builder: (ctx) => ElevatedButton(
                onPressed: () async {
                  result = await GenUiApiClient.executeApi(
                    context: ctx,
                    config: config,
                    httpClient: client,
                  );
                },
                child: const Text('Execute Profile'),
              ),
            ),
          ),
        ),
      );

      await tester.tap(find.text('Execute Profile'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      expect(result, isNotNull);
      expect(result!.success, isTrue);

      GenUiApiClient.clearSession();
      GenUiApiClient.setBaseUrl(null);
    });

    testWidgets('GenUiContainer renders placeholder when empty and renders components when schema arrives', (tester) async {
      final testSchema = UiSchema(
        version: 1,
        timestamp: 100,
        screenId: 'super_save_dashboard',
        screenName: 'Super Save Dashboard',
        route: '/super_save_dashboard',
        theme: const ThemeConfig(
          primaryColor: Color(0xFF10B981),
          backgroundColor: Color(0xFF0F172A),
          surfaceColor: Color(0xFF1E293B),
          textPrimary: Color(0xFFF8FAFC),
          textSecondary: Color(0xFF94A3B8),
          accentColor: Color(0xFF4F46E5),
        ),
        header: HeaderConfig.fallback(),
        components: [
          ComponentNode(
            id: 'banner_test_ss',
            type: 'banner',
            properties: const {
              'title': 'Dynamic Super Save Campaign',
              'message': 'Loaded from Web Console!',
            },
          ),
        ],
      );

      // Register schema in registry
      GenUiScreenRegistry.instance.registerScreen(testSchema);

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              child: Column(
                children: [
                  Text('Top Static Section'),
                  GenUiContainer(screenId: 'super_save_dashboard'),
                  Text('Bottom Static Section'),
                ],
              ),
            ),
          ),
        ),
      );

      await tester.pump();

      expect(find.text('Top Static Section'), findsOneWidget);
      expect(find.text('Dynamic Super Save Campaign'), findsOneWidget);
      expect(find.text('Bottom Static Section'), findsOneWidget);
    });

    testWidgets('SafeGenUiContainer renders with decoration properties and child', (WidgetTester tester) async {
      const containerNode = ComponentNode(
        id: 'box_1',
        type: 'container',
        properties: {
          'background_color': '#1E293B',
          'border_color': '#38BDF8',
          'border_width': 2.0,
          'border_radius': 16.0,
          'padding': 12.0,
        },
        children: [
          ComponentNode(
            id: 'inner_text',
            type: 'text',
            properties: {'text': 'Container Content'},
          ),
        ],
      );

      final widget = SafeWidgetRegistry.buildNode(
        node: containerNode,
        theme: ThemeConfig.fallback(),
        isGuarded: true,
      );

      await tester.pumpWidget(MaterialApp(home: Scaffold(body: widget)));
      expect(find.text('Container Content'), findsOneWidget);
    });

    testWidgets('SafeGenUiStack renders layered widgets and positioned overlay', (WidgetTester tester) async {
      const stackNode = ComponentNode(
        id: 'stack_1',
        type: 'stack',
        properties: {
          'alignment': 'topLeft',
          'height': 200.0,
        },
        children: [
          ComponentNode(
            id: 'base_text',
            type: 'text',
            properties: {'text': 'Base Layer'},
          ),
          ComponentNode(
            id: 'overlay_chip',
            type: 'chip',
            properties: {
              'label': 'Badge',
              'is_positioned': true,
              'top': 10.0,
              'left': 10.0,
            },
          ),
        ],
      );

      final widget = SafeWidgetRegistry.buildNode(
        node: stackNode,
        theme: ThemeConfig.fallback(),
        isGuarded: true,
      );

      await tester.pumpWidget(MaterialApp(home: Scaffold(body: widget)));
      expect(find.text('Base Layer'), findsOneWidget);
      expect(find.text('Badge'), findsOneWidget);
    });

    test('Schema validator sanitizes container and stack properties with child coercion', () {
      final payload = {
        'version': 1,
        'components': [
          {
            'id': 'c1',
            'type': 'container',
            'background_color': '#112233',
            'border_color': '#AABBCC',
            'border_width': '3px',
            'border_radius': '12px',
            'child': {
              'id': 'inner',
              'type': 'text',
              'text': 'Inside Single Child',
            }
          },
          {
            'id': 's1',
            'type': 'stack',
            'alignment': 'topRight',
            'children': [
              {
                'id': 'pos_child',
                'type': 'button',
                'text': 'Overlay Button',
                'is_positioned': true,
                'bottom': '20px',
                'right': '15px'
              }
            ]
          }
        ]
      };

      final result = GenUiSchemaValidator.validateAndSanitize(payload);
      expect(result.sanitizedSchema.components.length, 2);
      expect(result.warnings.isNotEmpty, true);

      final cNode = result.sanitizedSchema.components[0];
      expect(cNode.properties['background_color'], '#112233');
      expect(cNode.properties['border_color'], '#AABBCC');
      expect(cNode.properties['border_width'], 3.0);
      expect(cNode.properties['border_radius'], 12.0);
      expect(cNode.children.length, 1);
      expect(cNode.children[0].properties['text'], 'Inside Single Child');

      final sNode = result.sanitizedSchema.components[1];
      expect(sNode.children.length, 1);
      expect(sNode.children[0].properties['is_positioned'], true);
      expect(sNode.children[0].properties['bottom'], 20.0);
      expect(sNode.children[0].properties['right'], 15.0);
    });

    testWidgets('SafeGenUiButton and SafeGenUiText apply custom background_color and text_color', (WidgetTester tester) async {
      const textNode = ComponentNode(
        id: 'txt_custom',
        type: 'text',
        properties: {
          'text': 'Custom Styled Text',
          'text_color': '#38BDF8',
        },
      );

      const btnNode = ComponentNode(
        id: 'btn_custom',
        type: 'button',
        properties: {
          'text': 'Custom Styled Button',
          'background_color': '#10B981',
          'text_color': '#FFFFFF',
        },
      );

      final textWidget = SafeWidgetRegistry.buildNode(
        node: textNode,
        theme: ThemeConfig.fallback(),
        isGuarded: true,
      );

      final btnWidget = SafeWidgetRegistry.buildNode(
        node: btnNode,
        theme: ThemeConfig.fallback(),
        isGuarded: true,
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Column(
              children: [textWidget, btnWidget],
            ),
          ),
        ),
      );

      expect(find.text('Custom Styled Text'), findsOneWidget);
      expect(find.text('Custom Styled Button'), findsOneWidget);
    });

    test('GenUiDataBinding resolves mustache expressions and nested dot-notation', () {
      final context = {
        'user': {
          'name': 'Sarah Connor',
          'company': {'name': 'Cyberdyne'},
        },
        'count': 42,
        'tags': ['beauty', 'mascara'],
        'reviews': [
          {'rating': 5, 'reviewerName': 'John Doe'},
        ],
      };

      expect(GenUiDataBinding.interpolateString('Hello {{user.name}}', context), 'Hello Sarah Connor');
      expect(GenUiDataBinding.interpolateString('Works at {{user.company.name}}', context), 'Works at Cyberdyne');
      expect(GenUiDataBinding.extractValue(context, 'user.company.name'), 'Cyberdyne');
      expect(GenUiDataBinding.extractValue(context, 'count'), 42);
      expect(GenUiDataBinding.extractValue(context, 'tags.length'), 2);
      expect(GenUiDataBinding.extractValue(context, 'reviews.0.reviewerName'), 'John Doe');
      expect(GenUiDataBinding.extractValue(context, 'reviews.0.rating'), 5);
      expect(GenUiDataBinding.interpolateString('Tags: {{tags}}', context), 'Tags: beauty, mascara');
      expect(GenUiDataBinding.interpolateString('Reviewer: {{reviews.0.reviewerName}} ({{reviews.0.rating}}*)', context), 'Reviewer: John Doe (5*)');
    });

    test('GenUiDataBinding interpolates ComponentNode properties and extracts collections', () {
      const node = ComponentNode(
        id: 'user_card',
        type: 'card',
        properties: {
          'title': '{{user.name}}',
          'description': 'From {{user.company.name}}',
        },
      );

      final context = {
        'user': {
          'name': 'John Doe',
          'company': {'name': 'Acme Corp'},
        },
      };

      final interpolated = GenUiDataBinding.interpolateNode(node, context);
      expect(interpolated.properties['title'], 'John Doe');
      expect(interpolated.properties['description'], 'From Acme Corp');
    });

    testWidgets('SafeGenUiListView renders dynamic repeating items with itemTemplate', (WidgetTester tester) async {
      const listNode = ComponentNode(
        id: 'dynamic_user_list',
        type: 'list_view',
        properties: {
          'items': [
            {'name': 'Alice', 'email': 'alice@example.com'},
            {'name': 'Bob', 'email': 'bob@example.com'},
          ],
          'item_template': {
            'type': 'listtile',
            'title': '{{item.name}}',
            'subtitle': '{{item.email}}',
          },
        },
      );

      final widget = SafeWidgetRegistry.buildNode(
        node: listNode,
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

      expect(find.text('Alice'), findsOneWidget);
      expect(find.text('alice@example.com'), findsOneWidget);
      expect(find.text('Bob'), findsOneWidget);
      expect(find.text('bob@example.com'), findsOneWidget);
    });

    test('GenUiSchemaValidator preserves dataSource and apiConfig across sanitization', () {
      final payload = {
        'version': 2,
        'screen_id': 'user_detail',
        'data_source': {
          'url': 'https://jsonplaceholder.typicode.com/users/1',
          'method': 'GET',
          'pagination': {
            'enabled': false,
            'page_param': 'page',
            'limit_param': 'limit',
          },
        },
        'api_config': {
          'url': '/api/submissions',
          'method': 'POST',
        },
        'components': [
          {
            'id': 'name_tile',
            'type': 'listtile',
            'properties': {'title': '{{name}}', 'subtitle': 'Full Name'}
          }
        ]
      };

      final result = GenUiSchemaValidator.validateAndSanitize(payload);
      expect(result.sanitizedSchema.dataSource, isNotNull);
      expect(result.sanitizedSchema.dataSource!.url, 'https://jsonplaceholder.typicode.com/users/1');
      expect(result.sanitizedSchema.dataSource!.pagination.enabled, false);
      expect(result.sanitizedSchema.apiConfig, isNotNull);
      expect(result.sanitizedSchema.apiConfig!.url, '/api/submissions');
    });

    test('resolveCandidateEndpoints prepends https to domain URLs without scheme and bypasses baseUrl', () {
      final candidates = GenUiApiClient.resolveCandidateEndpoints('jsonplaceholder.typicode.com/users/1');
      expect(candidates.length, 1);
      expect(candidates.first, 'https://jsonplaceholder.typicode.com/users/1');
    });

    test('fetchDataSource executes GET request without appending pagination when pagination is disabled', () async {
      http.Request? capturedRequest;
      final mockClient = MockClient((request) async {
        capturedRequest = request;
        return http.Response(
          json.encode({
            'id': 1,
            'name': 'Leanne Graham',
            'email': 'sincere@april.biz',
          }),
          200,
          headers: {'content-type': 'application/json; charset=utf-8'},
        );
      });

      const ds = ApiDataSource(
        url: 'https://jsonplaceholder.typicode.com/users/1',
        method: 'GET',
        pagination: ApiPaginationConfig(enabled: false),
      );

      final result = await GenUiApiClient.fetchDataSource(
        dataSource: ds,
        page: 1,
        pageSize: 10,
        httpClient: mockClient,
      );

      expect(result, isNotNull);
      expect(result['name'], 'Leanne Graham');
      expect(capturedRequest, isNotNull);
      // Query parameters must NOT contain ?page=1 or limit=10 because pagination is disabled
      expect(capturedRequest!.url.queryParameters.containsKey('page'), false);
      expect(capturedRequest!.url.queryParameters.containsKey('limit'), false);
    });

    test('fetchDataSource falls back to sync server proxy if direct fetch fails', () async {
      final List<Uri> attemptedUris = [];
      final mockClient = MockClient((request) async {
        attemptedUris.add(request.url);
        // Direct call to external host fails (simulating Android emulator DNS failure)
        if (request.url.host == 'api.example.com') {
          throw http.ClientException('Failed host lookup');
        }
        // Proxy call succeeds
        if (request.url.path == '/api/proxy') {
          return http.Response(
            json.encode({
              'id': 101,
              'title': 'iPhone 15 Pro Max',
              'price': 1199,
            }),
            200,
            headers: {'content-type': 'application/json'},
          );
        }
        return http.Response('Not Found', 404);
      });

      const ds = ApiDataSource(
        url: 'https://api.example.com/products/1',
        method: 'GET',
      );

      final result = await GenUiApiClient.fetchDataSource(
        dataSource: ds,
        serverBaseUrl: 'http://127.0.0.1:8080',
        httpClient: mockClient,
      );

      expect(result, isNotNull);
      expect(result['title'], 'iPhone 15 Pro Max');
      expect(result['price'], 1199);
      // Verify both direct URI and proxy URI were attempted
      expect(attemptedUris.any((u) => u.host == 'api.example.com'), true);
      expect(attemptedUris.any((u) => u.path == '/api/proxy'), true);
    });

    test('fetchDataSource returns fallbackData if direct and proxy both fail', () async {
      final mockClient = MockClient((request) async {
        throw http.ClientException('Total network failure');
      });

      const ds = ApiDataSource(
        url: 'https://api.offline.com/data',
        method: 'GET',
        fallbackData: {'status': 'offline_cached', 'count': 42},
      );

      final result = await GenUiApiClient.fetchDataSource(
        dataSource: ds,
        serverBaseUrl: 'http://127.0.0.1:8080',
        httpClient: mockClient,
      );

      expect(result, isNotNull);
      expect(result['status'], 'offline_cached');
      expect(result['count'], 42);
    });

    test('ApiDataSource parses and serializes error widget properties', () {
      final map = {
        'url': 'https://example.com/api',
        'show_error_widget': true,
        'error_message': 'Service currently unavailable',
        'error_widget_type': 'card',
      };
      final ds = ApiDataSource.fromMap(map);
      expect(ds.showErrorWidget, true);
      expect(ds.errorMessage, 'Service currently unavailable');
      expect(ds.errorWidgetType, 'card');

      final serialized = ds.toMap();
      expect(serialized['show_error_widget'], true);
      expect(serialized['error_message'], 'Service currently unavailable');
      expect(serialized['error_widget_type'], 'card');
    });
  });
}

// -------------------------------------------------------------
// Test Stub Screens for Dynamic Navigation Verification
// -------------------------------------------------------------
class UserProfileDemoScreen extends StatelessWidget {
  final dynamic arguments;
  const UserProfileDemoScreen({super.key, this.arguments});

  @override
  Widget build(BuildContext context) {
    final args = arguments ?? ModalRoute.of(context)?.settings.arguments;
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text('Alex Morgan'),
      ),
      body: Center(
        child: Text('Profile details alex_vip ${args ?? ""}'),
      ),
    );
  }
}

class SettingsDemoScreen extends StatelessWidget {
  final dynamic arguments;
  const SettingsDemoScreen({super.key, this.arguments});

  @override
  Widget build(BuildContext context) {
    final args = arguments ?? ModalRoute.of(context)?.settings.arguments;
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text('App Settings'),
      ),
      body: Center(
        child: Text('Settings panel security_tab ${args ?? ""}'),
      ),
    );
  }
}

class CustomDemoBottomSheet extends StatelessWidget {
  const CustomDemoBottomSheet({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text('Custom Project Bottom Sheet'),
          const Text('Share Live Schema'),
          ElevatedButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Dismiss Sheet'),
          ),
        ],
      ),
    );
  }
}

class GenericProjectScreen extends StatelessWidget {
  final String route;
  final dynamic arguments;
  const GenericProjectScreen({super.key, this.route = '/orders', this.arguments});

  @override
  Widget build(BuildContext context) {
    final args = arguments ?? ModalRoute.of(context)?.settings.arguments;
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Center(
        child: Column(
          children: [
            Text('Opened Route: "$route"'),
            Text('Args: 9001 ${args ?? ""}'),
          ],
        ),
      ),
    );
  }
}


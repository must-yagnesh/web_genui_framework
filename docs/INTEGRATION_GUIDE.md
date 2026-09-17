# Developer Integration Guide: Production Flutter Applications

This guide provides step-by-step instructions for integrating the **Web-Controlled Generative UI App Framework (`flutter_genui_guard`)** into existing production Flutter applications.

---

## 1. Architectural Fit & Design Philosophy

The `flutter_genui_guard` package is designed as a **drop-in, non-invasive library**. It does not enforce an opinionated state management architecture, network client, or routing package. 

Whether your production app uses **Bloc, Riverpod, Provider, or GetX**, the Generative UI engine coexists alongside your existing codebase:
* **Standard native screens** remain untouched.
* **Dynamic routes** are intercepted by `onGenerateRoute` and resolved from `GenUiScreenRegistry`.
* **Custom domain widgets** (e.g. existing design system buttons, charts, cart items) can be registered into `SafeWidgetRegistry` in minutes.

---

## 2. Step-by-Step Integration

### Step 1: Copy `genui_guard` Module into Your Codebase

Copy the `lib/genui_guard/` folder into your Flutter app's `lib/` directory:

```
your_flutter_app/lib/
└── genui_guard/
    ├── genui_guard.dart         # Public barrel export
    ├── boundary/                # GenUiErrorBoundary (fault isolation)
    ├── executor/                # GenUiDartExecutor (safe Dart action engine)
    ├── models/                  # UiSchema, ThemeConfig, ComponentNode ASTs
    ├── registry/                # SafeWidgetRegistry (custom widget registration)
    ├── state/                   # GenUiFormRegistry (reactive form state)
    ├── sync/                    # GenUiSyncClient & GenUiScreenRegistry
    ├── validator/               # GenUiSchemaValidator (smart type coercion)
    └── widgets/                 # Production-safe built-in primitives & layouts
```

Alternatively, configure it as a local path dependency in your `pubspec.yaml`:
```yaml
dependencies:
  flutter:
    sdk: flutter
  flutter_genui_guard:
    path: ./packages/flutter_genui_guard
```

---

### Step 2: Configure Dynamic Routing in `main.dart`

To allow screens created in the Web Console (e.g., `/checkout`, `/promotions`, `/profile`) to mount automatically without compiling new code, hook into `MaterialApp.onGenerateRoute`:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_genui_guard/genui_guard.dart';
import 'screens/dynamic_screen.dart';
import 'screens/my_native_home_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Enterprise Flutter App',
      // Initial screen can be native or dynamic:
      home: const DynamicScreen(route: '/'),
      onGenerateRoute: (settings) {
        final routeName = settings.name ?? '';

        // 1. Prioritize console-generated dynamic routes:
        if (GenUiScreenRegistry.instance.hasRoute(routeName)) {
          return MaterialPageRoute(
            builder: (ctx) => DynamicScreen(
              route: routeName,
              arguments: settings.arguments,
            ),
            settings: settings,
          );
        }

        // 2. Fall back to your pre-existing compiled native screens:
        switch (routeName) {
          case '/native-home':
            return MaterialPageRoute(builder: (_) => const MyNativeHomeScreen());
          case '/native-settings':
            return MaterialPageRoute(builder: (_) => const MyNativeSettingsScreen());
          default:
            return null; // Triggers standard 404 or unknown route handler
        }
      },
    );
  }
}
```

---

### Step 3: Register Custom Enterprise Widgets

If you have proprietary UI components in your app (e.g. biometric buttons, interactive charts, payment SDK sheets), register them with `SafeWidgetRegistry`:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_genui_guard/genui_guard.dart';
import 'widgets/crypto_trading_chart.dart';
import 'widgets/checkout_payment_tile.dart';

void configureEnterpriseWidgets() {
  // Register a custom live trading chart
  SafeWidgetRegistry.register('crypto_chart', (node, theme) {
    final symbol = node.properties['symbol']?.toString() ?? 'BTC';
    final timeframe = node.properties['timeframe']?.toString() ?? '1D';
    return CryptoTradingChart(symbol: symbol, timeframe: timeframe);
  });

  // Register an e-commerce payment selector
  SafeWidgetRegistry.register('payment_tile', (node, theme) {
    final gateway = node.properties['gateway']?.toString() ?? 'stripe';
    final amount = (node.properties['amount'] as num?)?.toDouble() ?? 0.0;
    return CheckoutPaymentTile(gateway: gateway, amount: amount);
  });
}
```

Once registered, any Web Console user or LLM can include `"type": "crypto_chart"` or `"type": "payment_tile"` in their JSON AST, and Flutter will instantiate your native widget with strict boundary protection.

---

### Step 4: Accessing Dynamic Form State

When generative screens contain form elements (`textField`, `switch`, `checkbox`), user input is automatically captured in `GenUiFormRegistry`.

You can access these values from your native Flutter widgets or bloc controllers:

```dart
// Retrieve a validated input value anywhere in Flutter:
final userEmail = GenUiFormRegistry.instance.getValue('email');
final agreedToTerms = GenUiFormRegistry.instance.getValue('terms_agree');

// Programmatically set or clear form values:
GenUiFormRegistry.instance.setValue('email', 'vip@enterprise.com');
GenUiFormRegistry.instance.clear();
```

---

## 3. Integrating with State Management Frameworks

### Integrating with Bloc / Cubit
```dart
class CheckoutCubit extends Cubit<CheckoutState> {
  CheckoutCubit() : super(CheckoutInitial());

  void processGenerativeOrder() {
    final email = GenUiFormRegistry.instance.getValue('email');
    final coupon = GenUiFormRegistry.instance.getValue('coupon_code');
    
    emit(CheckoutProcessing());
    // Execute business logic with extracted values
  }
}
```

### Integrating with Riverpod
```dart
final generativeFormEmailProvider = Provider<String>((ref) {
  return GenUiFormRegistry.instance.getValue('email');
});
```

### Integrating with GetX
When using GetX routing, `GenUiDartExecutor` supports `Get.toNamed()` natively. You can also configure `GetPage` dynamic resolution:
```dart
GetMaterialApp(
  unknownRoute: GetPage(
    name: '/genui-fallback',
    page: () => DynamicScreen(route: Get.currentRoute),
  ),
);
```

---

## 4. Backend & API Synchronization in Production

In local development, the app connects to `python3 sync_server/server.py` via HTTP/SSE. In production, configure the client to fetch schemas from your API gateway:

```dart
// Point GenUiSyncClient to your production CDN or API:
GenUiSyncClient.instance.configure(
  endpointUrl: 'https://api.yourcompany.com/v1/mobile/schemas',
  authToken: 'Bearer <user_jwt>',
);
```
Schema payloads are cached locally in `GenUiScreenRegistry`, ensuring instant offline boot with zero network latency.

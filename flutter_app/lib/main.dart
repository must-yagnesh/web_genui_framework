import 'package:flutter/material.dart';
import 'screens/dynamic_screen.dart';
import 'genui_guard/genui_guard.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const GenUiFrameworkApp());
}

class GenUiFrameworkApp extends StatelessWidget {
  const GenUiFrameworkApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Web-Controlled GenUI App',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        fontFamily: 'Inter',
        useMaterial3: true,
      ),
      home: const DynamicScreen(route: '/'),
      onGenerateRoute: (settings) {
        final name = settings.name ?? '';

        // 1. Check if route is a dynamic screen created in Web Console
        if (GenUiScreenRegistry.instance.hasRoute(name)) {
          return MaterialPageRoute(
            builder: (ctx) => DynamicScreen(
              route: name,
              arguments: settings.arguments,
            ),
            settings: settings,
          );
        }

        // 2. Predefined project screens fallback
        if (name == '/profile') {
          return MaterialPageRoute(
            builder: (ctx) => UserProfileDemoScreen(arguments: settings.arguments),
            settings: settings,
          );
        } else if (name == '/settings') {
          return MaterialPageRoute(
            builder: (ctx) => SettingsDemoScreen(arguments: settings.arguments),
            settings: settings,
          );
        }

        // 3. Fallback for any real-project route written by developer
        return MaterialPageRoute(
          builder: (ctx) => GenericProjectScreen(
            routeName: name.isEmpty ? '/custom' : name,
            arguments: settings.arguments,
          ),
          settings: settings,
        );
      },
    );
  }
}

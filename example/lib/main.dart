import 'package:flutter/material.dart';
import 'package:flutter_genui_guard/genui_guard.dart';
import 'config.dart';
import 'screens/demo_screens.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  GenUiConfig.initialize();
  runApp(const GenUiExampleApp());
}

class GenUiExampleApp extends StatelessWidget {
  const GenUiExampleApp({super.key});

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
      // Demonstrates both core integration modes:
      // 1. Embedded GenUiContainer inside a standard screen
      // 2. Full DynamicScreen page
      home: const ExampleAppShell(),
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

/// Root shell with bottom navigation demonstrating BOTH ways to use GenUI:
/// - Tab 1: Embedded Container (`GenUiContainer`) inside a standard native screen
/// - Tab 2: Full Dynamic Page (`DynamicScreen`) taking over the entire screen
class ExampleAppShell extends StatefulWidget {
  const ExampleAppShell({super.key});

  @override
  State<ExampleAppShell> createState() => _ExampleAppShellState();
}

class _ExampleAppShellState extends State<ExampleAppShell> {
  int _currentIndex = 0;

  final List<Widget> _pages = const [
    EmbeddedContainerDemoScreen(),
    DynamicScreen(route: '/'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _pages,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (idx) => setState(() => _currentIndex = idx),
        backgroundColor: const Color(0xFF1E293B),
        indicatorColor: const Color(0xFF4F46E5),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.widgets_outlined),
            selectedIcon: Icon(Icons.widgets, color: Colors.white),
            label: 'Embedded Container',
          ),
          NavigationDestination(
            icon: Icon(Icons.phone_android_outlined),
            selectedIcon: Icon(Icons.phone_android, color: Colors.white),
            label: 'Full Dynamic Screen',
          ),
        ],
      ),
    );
  }
}

/// Screen 1: Demonstrates how to embed `GenUiContainer` inside ANY existing Flutter screen
class EmbeddedContainerDemoScreen extends StatelessWidget {
  const EmbeddedContainerDemoScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text(
          'Native App Screen',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.wifi, color: Colors.white),
            tooltip: 'Configure Sync Host',
            onPressed: () => GenUiSyncClient.showConnectionDialog(context),
          ),
          IconButton(
            icon: const Icon(Icons.person, color: Colors.white),
            onPressed: () => Navigator.pushNamed(context, '/profile'),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(vertical: 16),
        children: [
          // 1. Regular Native Static Flutter Widget
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16),
            child: Card(
              color: Color(0xFF1E293B),
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '📱 Native Flutter Section',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                    SizedBox(height: 6),
                    Text(
                      'This card is a hardcoded static Flutter widget. Below it is the dynamic GenUiContainer loaded live from the Web Console.',
                      style: TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),

          // 2. ⚡ The Web UI Container Widget!
          // Loads live dynamic UI schema from the Web Console in real-time
          const GenUiContainer(
            screenId: 'home',
            padding: EdgeInsets.symmetric(horizontal: 16),
            showLiveBadge: true,
          ),

          const SizedBox(height: 12),

          // 3. Another Regular Native Flutter Widget below it
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF334155)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.sync, color: Color(0xFF818CF8)),
                  SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Edit components on the Web Dashboard and click Apply to see this container update in real-time.',
                      style: TextStyle(fontSize: 12, color: Color(0xFFCBD5E1)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

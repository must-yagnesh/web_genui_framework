import 'package:flutter/material.dart';
import 'screens/dynamic_screen.dart';

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
      home: const DynamicScreen(),
    );
  }
}

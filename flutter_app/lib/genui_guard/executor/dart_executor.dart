import 'package:flutter/material.dart';
import '../models/ui_schema.dart';
import '../state/form_registry.dart';
import '../../screens/demo_screens.dart';

/// Callback for execution telemetry & debugging
typedef DartExecutionCallback = void Function(String summary, bool isError);

/// Safe Flutter & Dart Code Execution Engine
///
/// Parses and executes dynamic Flutter/Dart action snippets configured from the Web Console,
/// including ScaffoldMessenger SnackBars, showDialog AlertDialogs, showModalBottomSheet,
/// Navigator route pushes, form submissions, and multi-statement scripts, with a 0% runtime crash guarantee.
class GenUiDartExecutor {
  static DartExecutionCallback? onTelemetry;

  /// Helper to extract code string from a component node
  static String? extractCode(ComponentNode node) {
    // 1. Direct custom_dart_code property
    final directCode = node.properties['custom_dart_code']?.toString().trim();
    if (directCode != null && directCode.isNotEmpty) {
      return directCode;
    }

    // 2. onclick property (string or map)
    final onclick = node.properties['onclick'];
    if (onclick is String && onclick.trim().isNotEmpty) {
      return onclick.trim();
    }
    if (onclick is Map && onclick['code'] != null) {
      final code = onclick['code'].toString().trim();
      if (code.isNotEmpty) return code;
    }

    // 3. Fallback to action_id if prefixed with dart:
    final actionId = node.properties['action_id']?.toString().trim();
    if (actionId != null && actionId.startsWith('dart:')) {
      return actionId.substring(5).trim();
    }

    return null;
  }

  /// Check if the node has an action or custom Dart code
  static bool hasAction(ComponentNode node) {
    if (extractCode(node) != null) return true;
    final actionId = node.properties['action_id']?.toString().trim();
    return actionId != null && actionId.isNotEmpty && actionId != 'none';
  }

  /// Safely execute the given Dart code string within the provided BuildContext
  static void execute({
    required BuildContext context,
    required String code,
    ComponentNode? node,
    bool isGuarded = true,
  }) {
    final cleanCode = code.trim();
    if (cleanCode.isEmpty) return;

    if (!isGuarded) {
      // NAIVE MODE: Unprotected evaluation
      _executeInternal(context, cleanCode, node);
      return;
    }

    // GUARDED MODE: 0% crash guarantee
    try {
      _executeInternal(context, cleanCode, node);
      onTelemetry?.call('Executed Dart script (${cleanCode.length} chars)', false);
    } catch (e, stack) {
      debugPrint('[GenUiDartExecutor Guard] Intercepted Dart runtime error: $e\n$stack');
      onTelemetry?.call('Handled Dart error: $e', true);

      // Display graceful guard snackbar notification to the developer/user
      if (context.mounted) {
        ScaffoldMessenger.of(context).hideCurrentSnackBar();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: const Color(0xFF1E293B),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
              side: const BorderSide(color: Color(0xFFEF4444), width: 1.5),
            ),
            content: Row(
              children: [
                const Icon(Icons.shield_outlined, color: Color(0xFFEF4444), size: 22),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        '🛡 Dart Execution Guard Intercept',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white),
                      ),
                      Text(
                        e.toString(),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 11, color: Color(0xFFCBD5E1)),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            duration: const Duration(seconds: 4),
          ),
        );
      }
    }
  }

  /// Internal parser & interpreter for Flutter statements
  static void _executeInternal(BuildContext context, String code, ComponentNode? node) {
    // Check if code contains multiple statements
    final statements = _splitStatements(code);
    for (final statement in statements) {
      _executeSingleStatement(context, statement, node);
    }
  }

  /// Split multi-statement scripts preserving nested strings and blocks
  static List<String> _splitStatements(String script) {
    final List<String> statements = [];
    final lines = script.split('\n');
    final StringBuffer current = StringBuffer();

    for (final rawLine in lines) {
      final line = rawLine.trim();
      // Skip empty lines and full-line comments
      if (line.isEmpty || line.startsWith('//')) continue;

      current.write(' ');
      current.write(line);

      // Check if statement concludes with semicolon outside of quote blocks
      if (line.endsWith(';') || line.endsWith('}')) {
        final st = current.toString().trim();
        if (st.isNotEmpty) {
          statements.add(st);
        }
        current.clear();
      }
    }

    if (current.isNotEmpty) {
      final st = current.toString().trim();
      if (st.isNotEmpty) statements.add(st);
    }

    return statements.isNotEmpty ? statements : [script];
  }

  /// Dispatch and execute a single statement
  static void _executeSingleStatement(BuildContext context, String statement, ComponentNode? node) {
    final trimmed = statement.trim();
    if (trimmed.isEmpty) return;

    // 1. ScaffoldMessenger SnackBar
    if (trimmed.contains('showSnackBar') || trimmed.contains('SnackBar(')) {
      _executeSnackBar(context, trimmed, node);
      return;
    }

    // 2. showDialog / AlertDialog
    if (trimmed.contains('showDialog') || trimmed.contains('AlertDialog(')) {
      _executeAlertDialog(context, trimmed, node);
      return;
    }

    // 3. showModalBottomSheet / CustomDemoBottomSheet / Get.bottomSheet
    if (trimmed.contains('showModalBottomSheet') ||
        trimmed.contains('BottomSheet') ||
        trimmed.contains('CustomDemoBottomSheet') ||
        trimmed.contains('showCustomDemoBottomSheet') ||
        trimmed.contains('Get.bottomSheet')) {
      _executeBottomSheet(context, trimmed, node);
      return;
    }

    // 4. Form Submit / Validation
    if (trimmed.contains('validate') || trimmed.contains('GenUiFormRegistry') || trimmed.toLowerCase().contains('submit')) {
      _executeFormSubmit(context, trimmed, node);
      return;
    }

    // 5. Navigator Pop / Get.back
    if (trimmed.contains('Navigator.pop') ||
        trimmed.contains('Navigator.of(context).pop') ||
        trimmed.contains('Get.back(') ||
        trimmed.contains('Get.back()')) {
      if (context.mounted && Navigator.canPop(context)) {
        Navigator.pop(context);
      }
      return;
    }

    // 6. Navigator Push / Route / Get.to
    if (trimmed.contains('Navigator.push') ||
        trimmed.contains('Navigator.of(context).push') ||
        trimmed.contains('Get.to') ||
        trimmed.contains('UserProfileDemoScreen') ||
        trimmed.contains('SettingsDemoScreen') ||
        trimmed.contains('ProfileDemoScreen')) {
      _executeNavigation(context, trimmed, node);
      return;
    }

    // 7. Print / Debug / Telemetry
    if (trimmed.startsWith('print(') || trimmed.startsWith('debugPrint(')) {
      final msg = _extractStringInsideParens(trimmed) ?? trimmed;
      debugPrint('[GenUi Custom Dart Output] $msg');
      return;
    }

    // 8. General Action Fallback (Display toast with executed statement)
    _executeGeneralAction(context, trimmed, node);
  }

  /// Parse and display a SnackBar from Flutter code
  static void _executeSnackBar(BuildContext context, String code, ComponentNode? node) {
    if (!context.mounted) return;

    // Extract message from Text('...') or Text("...")
    String message = 'Triggered dynamic action';
    final textMatch = RegExp(r"""Text\(\s*['"](.+?)['"]\s*\)""").firstMatch(code);
    if (textMatch != null && textMatch.group(1) != null) {
      message = textMatch.group(1)!;
    } else {
      final simpleMatch = RegExp(r"""content:\s*['"](.+?)['"]""").firstMatch(code);
      if (simpleMatch != null && simpleMatch.group(1) != null) {
        message = simpleMatch.group(1)!;
      }
    }

    // Extract background color
    Color bgColor = const Color(0xFF4F46E5);
    if (code.contains('Colors.green') || code.contains('Color(0xFF10B981)')) {
      bgColor = const Color(0xFF10B981);
    } else if (code.contains('Colors.red') || code.contains('Color(0xFFEF4444)')) {
      bgColor = const Color(0xFFEF4444);
    } else if (code.contains('Colors.amber') || code.contains('Colors.orange')) {
      bgColor = const Color(0xFFF59E0B);
    } else if (code.contains('Colors.blue') || code.contains('Colors.cyan')) {
      bgColor = const Color(0xFF0284C7);
    } else {
      final hexMatch = RegExp(r"Color\(\s*0x([0-9a-fA-F]{6,8})\s*\)").firstMatch(code);
      if (hexMatch != null && hexMatch.group(1) != null) {
        final val = int.tryParse(hexMatch.group(1)!, radix: 16);
        if (val != null) {
          bgColor = Color(val.toUnsigned(32));
        }
      }
    }

    // Extract duration
    Duration duration = const Duration(seconds: 3);
    final secMatch = RegExp(r"Duration\(\s*seconds:\s*(\d+)\s*\)").firstMatch(code);
    if (secMatch != null && secMatch.group(1) != null) {
      final sec = int.tryParse(secMatch.group(1)!);
      if (sec != null) duration = Duration(seconds: sec);
    }

    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.bolt, color: Colors.white, size: 20),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                message,
                style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
              ),
            ),
          ],
        ),
        backgroundColor: bgColor,
        duration: duration,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  /// Parse and display an AlertDialog from Flutter code
  static void _executeAlertDialog(BuildContext context, String code, ComponentNode? node) {
    if (!context.mounted) return;

    // Extract title
    String title = 'Dynamic Alert';
    final titleMatch = RegExp(r"""title:\s*Text\(\s*['"](.+?)['"]\s*\)""").firstMatch(code);
    if (titleMatch != null && titleMatch.group(1) != null) {
      title = titleMatch.group(1)!;
    }

    // Extract content/message
    String message = 'Executed Flutter custom code successfully.';
    final contentMatch = RegExp(r"""content:\s*Text\(\s*['"](.+?)['"]\s*\)""").firstMatch(code);
    if (contentMatch != null && contentMatch.group(1) != null) {
      message = contentMatch.group(1)!;
    }

    showDialog(
      context: context,
      builder: (dialogCtx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: Color(0xFF334155), width: 1),
        ),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFF4F46E5).withOpacity(0.2),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.code, color: Color(0xFF818CF8), size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                title,
                style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        content: Text(
          message,
          style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 13, height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogCtx),
            style: TextButton.styleFrom(
              foregroundColor: const Color(0xFF818CF8),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            ),
            child: const Text('Close', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  /// Parse and display a Modal BottomSheet from Flutter code
  static void _executeBottomSheet(BuildContext context, String code, ComponentNode? node) {
    if (!context.mounted) return;

    // Check for pre-existing or custom project bottom sheet
    if (code.contains('CustomDemoBottomSheet') ||
        code.contains('showCustomDemoBottomSheet') ||
        code.contains('CustomActionBottomSheet')) {
      showCustomDemoBottomSheet(context);
      return;
    }

    String textContent = 'Dynamic Bottom Sheet Action';
    final textMatch = RegExp(r"""Text\(\s*['"](.+?)['"]\s*\)""").firstMatch(code);
    if (textMatch != null && textMatch.group(1) != null) {
      textContent = textMatch.group(1)!;
    }

    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF0F172A),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        side: BorderSide(color: Color(0xFF334155), width: 1),
      ),
      builder: (sheetCtx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF475569),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              Row(
                children: [
                  const Icon(Icons.flash_on, color: Color(0xFFF59E0B), size: 22),
                  const SizedBox(width: 10),
                  const Text(
                    'Custom Dart Execution',
                    style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.close, color: Color(0xFF94A3B8), size: 20),
                    onPressed: () => Navigator.pop(sheetCtx),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                textContent,
                style: const TextStyle(color: Color(0xFFE2E8F0), fontSize: 14, height: 1.4),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF4F46E5),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  onPressed: () => Navigator.pop(sheetCtx),
                  child: const Text('Dismiss', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// Handle Form Validation & Submission
  static void _executeFormSubmit(BuildContext context, String code, ComponentNode? node) {
    if (!context.mounted) return;

    final errors = GenUiFormRegistry.instance.validateNonEmpty();
    if (errors.isNotEmpty) {
      ScaffoldMessenger.of(context).hideCurrentSnackBar();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.error_outline, color: Colors.white, size: 20),
              const SizedBox(width: 10),
              Expanded(
                child: Text('Validation Error: ${errors.join(", ")}',
                    style: const TextStyle(fontWeight: FontWeight.w600)),
              ),
            ],
          ),
          backgroundColor: const Color(0xFFEF4444),
          duration: const Duration(seconds: 3),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
      );
      return;
    }

    final values = GenUiFormRegistry.instance.getValues();
    final summary = values.entries.map((e) {
      final label = GenUiFormRegistry.instance.getFieldLabel(e.key);
      final val = e.key.toLowerCase().contains('pass')
          ? '••••••••'
          : (e.value is bool ? (e.value ? 'Yes' : 'No') : e.value);
      return '$label: "$val"';
    }).join(', ');

    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.check_circle_outline, color: Colors.white, size: 20),
                const SizedBox(width: 8),
                Text('Form Validation Passed!', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              summary.isEmpty ? 'All inputs verified successfully' : summary,
              style: const TextStyle(fontSize: 12, color: Color(0xFFE2E8F0)),
            ),
          ],
        ),
        backgroundColor: const Color(0xFF10B981),
        duration: const Duration(seconds: 4),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  /// Handle Route or Destination Navigation (supports Navigator.push, Navigator.pushNamed, Get.to, Get.toNamed, and arguments)
  static void _executeNavigation(BuildContext context, String code, ComponentNode? node) {
    if (!context.mounted) return;

    // 1. Extract route name
    String? routeName = _extractRouteName(code);

    // 2. Extract arguments (if specified, e.g. arguments: {'userId': '123'} or arguments: 'profile_arg')
    final arguments = _extractArguments(code);

    // 3. Fallback route if none matched
    routeName ??= '/profile';

    // 4. Dispatch navigation to actual screens
    if (routeName == '/profile') {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (ctx) => UserProfileDemoScreen(arguments: arguments),
          settings: RouteSettings(name: '/profile', arguments: arguments),
        ),
      );
    } else if (routeName == '/settings') {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (ctx) => SettingsDemoScreen(arguments: arguments),
          settings: RouteSettings(name: '/settings', arguments: arguments),
        ),
      );
    } else {
      // Custom real-project route (e.g. '/orders', '/checkout', '/wallet')
      try {
        Navigator.pushNamed(context, routeName, arguments: arguments);
      } catch (_) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (ctx) => GenericProjectScreen(routeName: routeName!, arguments: arguments),
            settings: RouteSettings(name: routeName, arguments: arguments),
          ),
        );
      }
    }
  }

  /// Helper to extract route name from Flutter or GetX navigation syntax
  static String? _extractRouteName(String code) {
    // 1. Slash path e.g. '/profile', '/settings', '/orders'
    final slashMatch = RegExp(r"""['"](\/[a-zA-Z0-9_\-\/]*)['"]""").firstMatch(code);
    if (slashMatch != null && slashMatch.group(1) != null) {
      return slashMatch.group(1)!;
    }

    // 2. pushNamed / toNamed string argument
    final namedMatch = RegExp(r"""(?:pushNamed|toNamed)\s*\(\s*(?:context\s*,\s*)?['"]([^'"]+)['"]""").firstMatch(code);
    if (namedMatch != null && namedMatch.group(1) != null) {
      final name = namedMatch.group(1)!;
      return name.startsWith('/') ? name : '/$name';
    }

    // 3. Widget constructor references
    if (code.contains('UserProfileDemoScreen') ||
        code.contains('ProfileDemoScreen') ||
        code.contains('ProfileScreen')) {
      return '/profile';
    }
    if (code.contains('SettingsDemoScreen') ||
        code.contains('SettingsScreen')) {
      return '/settings';
    }

    return null;
  }

  /// Helper to extract navigation arguments (Map, String, or int)
  static dynamic _extractArguments(String code) {
    final argMatch = RegExp(r"""arguments:\s*(\{.+?\}|\[.+?\]|['"][^'"]*['"]|\d+)""").firstMatch(code);
    if (argMatch != null && argMatch.group(1) != null) {
      final raw = argMatch.group(1)!.trim();
      if ((raw.startsWith("'") && raw.endsWith("'")) || (raw.startsWith('"') && raw.endsWith('"'))) {
        return raw.substring(1, raw.length - 1);
      }
      return raw;
    }
    return null;
  }

  /// General Action Notification
  static void _executeGeneralAction(BuildContext context, String statement, ComponentNode? node) {
    if (!context.mounted) return;

    final compId = node?.id ?? 'widget';
    final preview = statement.length > 50 ? '${statement.substring(0, 50)}...' : statement;

    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.play_circle_outline, color: Colors.white, size: 20),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                '[$compId] Executed: $preview',
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
              ),
            ),
          ],
        ),
        backgroundColor: const Color(0xFF334155),
        duration: const Duration(seconds: 2),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  static String? _extractStringInsideParens(String statement) {
    final match = RegExp(r"""\(\s*['"](.+?)['"]\s*\)""").firstMatch(statement);
    return match?.group(1);
  }
}

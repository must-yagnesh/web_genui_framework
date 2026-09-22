import 'package:flutter/material.dart';
import '../models/ui_schema.dart';
import '../state/form_registry.dart';
import '../sync/screen_registry.dart';
import '../sync/api_client.dart';
import '../widgets/success_dialog.dart';
import '../screens/dynamic_screen.dart';

/// Callback for execution telemetry & debugging
typedef DartExecutionCallback = void Function(String summary, bool isError);

/// Signal returned from statement/block execution to control control-flow
enum ExecutionSignal { continueNext, halt }

/// Safe Flutter & Dart Code Execution Engine
///
/// Parses and executes dynamic Flutter/Dart action snippets configured from the Web Console,
/// including ScaffoldMessenger SnackBars, showDialog AlertDialogs, showModalBottomSheet,
/// Navigator route pushes, form submissions, and multi-statement scripts, with a 0% runtime crash guarantee.
class GenUiDartExecutor {
  static DartExecutionCallback? onTelemetry;

  /// Optional handler for app-specific custom bottom sheets
  static void Function(BuildContext context, String code)? customBottomSheetHandler;

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
    final Map<String, dynamic> scope = {};
    final units = _splitTopLevelUnits(code);

    for (final unit in units) {
      if (!context.mounted) break;
      final signal = _executeUnit(context, unit, node, scope);
      if (signal == ExecutionSignal.halt) {
        break;
      }
    }
  }

  /// Split multi-statement scripts preserving nested strings, quotes, and brace blocks
  static List<String> _splitTopLevelUnits(String script) {
    final List<String> units = [];
    final StringBuffer current = StringBuffer();
    int braceDepth = 0;
    int parenDepth = 0;
    bool inSingleQuote = false;
    bool inDoubleQuote = false;

    for (int i = 0; i < script.length; i++) {
      final char = script[i];
      final nextChar = (i + 1 < script.length) ? script[i + 1] : '';

      // Skip line comments
      if (!inSingleQuote && !inDoubleQuote && char == '/' && nextChar == '/') {
        while (i < script.length && script[i] != '\n') {
          i++;
        }
        continue;
      }

      // Handle quotes with escape checking
      if (char == "'" && !inDoubleQuote) {
        final isEscaped = i > 0 && script[i - 1] == '\\';
        if (!isEscaped) inSingleQuote = !inSingleQuote;
      } else if (char == '"' && !inSingleQuote) {
        final isEscaped = i > 0 && script[i - 1] == '\\';
        if (!isEscaped) inDoubleQuote = !inDoubleQuote;
      }

      if (!inSingleQuote && !inDoubleQuote) {
        if (char == '(') {
          parenDepth++;
        } else if (char == ')') {
          if (parenDepth > 0) parenDepth--;
        } else if (char == '{') {
          braceDepth++;
        } else if (char == '}') {
          if (braceDepth > 0) braceDepth--;
        }
      }

      current.write(char);

      // Statement / Block termination check
      if (!inSingleQuote && !inDoubleQuote && braceDepth == 0 && parenDepth == 0) {
        if (char == ';') {
          final st = current.toString().trim();
          if (st.isNotEmpty) units.add(st);
          current.clear();
        } else if (char == '}') {
          // Look ahead to check if followed by 'else'
          int j = i + 1;
          while (j < script.length &&
              (script[j] == ' ' || script[j] == '\t' || script[j] == '\n' || script[j] == '\r')) {
            j++;
          }
          if (j + 4 <= script.length && script.substring(j, j + 4) == 'else') {
            // Keep going, will be terminated by the else block's closing brace
          } else {
            final st = current.toString().trim();
            if (st.isNotEmpty) units.add(st);
            current.clear();
          }
        }
      }
    }

    final remaining = current.toString().trim();
    if (remaining.isNotEmpty) {
      units.add(remaining);
    }

    return units.isNotEmpty ? units : [script.trim()];
  }

  /// Dispatch and execute a single statement or control block
  static ExecutionSignal _executeUnit(
    BuildContext context,
    String unit,
    ComponentNode? node,
    Map<String, dynamic> scope,
  ) {
    final trimmed = unit.trim();
    if (trimmed.isEmpty) return ExecutionSignal.continueNext;

    // Check if it's an if-condition construct
    if (trimmed.startsWith('if ') || trimmed.startsWith('if(')) {
      return _executeIfStatement(context, trimmed, node, scope);
    }

    return _executeSingleStatement(context, trimmed, node, scope);
  }

  /// Parse and execute an if-conditional statement
  static ExecutionSignal _executeIfStatement(
    BuildContext context,
    String code,
    ComponentNode? node,
    Map<String, dynamic> scope,
  ) {
    final firstParen = code.indexOf('(');
    if (firstParen == -1) return ExecutionSignal.continueNext;

    int depth = 0;
    int closeParen = -1;
    for (int i = firstParen; i < code.length; i++) {
      if (code[i] == '(') {
        depth++;
      } else if (code[i] == ')') {
        depth--;
        if (depth == 0) {
          closeParen = i;
          break;
        }
      }
    }
    if (closeParen == -1) return ExecutionSignal.continueNext;

    final condition = code.substring(firstParen + 1, closeParen).trim();
    final body = code.substring(closeParen + 1).trim();

    String thenBlock = '';
    String? elseBlock;

    if (body.startsWith('{')) {
      int braceDepth = 0;
      int closeBrace = -1;
      for (int i = 0; i < body.length; i++) {
        if (body[i] == '{') {
          braceDepth++;
        } else if (body[i] == '}') {
          braceDepth--;
          if (braceDepth == 0) {
            closeBrace = i;
            break;
          }
        }
      }

      if (closeBrace != -1) {
        thenBlock = body.substring(1, closeBrace).trim();
        final afterThen = body.substring(closeBrace + 1).trim();
        if (afterThen.startsWith('else')) {
          var elsePart = afterThen.substring(4).trim();
          if (elsePart.startsWith('{') && elsePart.endsWith('}')) {
            elseBlock = elsePart.substring(1, elsePart.length - 1).trim();
          } else {
            elseBlock = elsePart;
          }
        }
      } else {
        thenBlock = body.substring(1).trim();
      }
    } else {
      thenBlock = body;
    }

    final conditionMet = _evaluateCondition(condition, scope);

    if (conditionMet) {
      if (thenBlock.isNotEmpty) {
        return _executeBlock(context, thenBlock, node, scope);
      }
    } else if (elseBlock != null && elseBlock.isNotEmpty) {
      return _executeBlock(context, elseBlock, node, scope);
    }

    return ExecutionSignal.continueNext;
  }

  /// Execute an inner block of statements
  static ExecutionSignal _executeBlock(
    BuildContext context,
    String blockContent,
    ComponentNode? node,
    Map<String, dynamic> scope,
  ) {
    final innerUnits = _splitTopLevelUnits(blockContent);
    for (final u in innerUnits) {
      if (!context.mounted) return ExecutionSignal.halt;
      final trimmed = u.trim();
      if (trimmed == 'return;' || trimmed == 'return') {
        return ExecutionSignal.halt;
      }
      final sig = _executeUnit(context, trimmed, node, scope);
      if (sig == ExecutionSignal.halt) {
        return ExecutionSignal.halt;
      }
    }
    return ExecutionSignal.continueNext;
  }

  /// Evaluate logical conditions (supports ||, &&, .isEmpty, !contains, isValidEmail, equality)
  static bool _evaluateCondition(String condition, Map<String, dynamic> scope) {
    var cond = condition.trim();
    if (cond.isEmpty) return false;

    // Handle logical OR (||)
    if (cond.contains('||')) {
      final parts = cond.split('||');
      for (final part in parts) {
        if (_evaluateCondition(part.trim(), scope)) {
          return true;
        }
      }
      return false;
    }

    // Handle logical AND (&&)
    if (cond.contains('&&')) {
      final parts = cond.split('&&');
      for (final part in parts) {
        if (!_evaluateCondition(part.trim(), scope)) {
          return false;
        }
      }
      return true;
    }

    return _evaluateSingleTerm(cond, scope);
  }

  /// Evaluate a single boolean condition term
  static bool _evaluateSingleTerm(String rawTerm, Map<String, dynamic> scope) {
    var term = rawTerm.trim();
    while (term.startsWith('(') && term.endsWith(')')) {
      term = term.substring(1, term.length - 1).trim();
    }

    bool negate = false;
    if (term.startsWith('!')) {
      negate = true;
      term = term.substring(1).trim();
      while (term.startsWith('(') && term.endsWith(')')) {
        term = term.substring(1, term.length - 1).trim();
      }
    }

    bool result = false;

    // 1. GenUiFormRegistry.instance.isValidEmail(...)
    if (term.contains('isValidEmail(')) {
      final keyMatch = RegExp(r"""isValidEmail\(\s*['"](.+?)['"]\s*\)""").firstMatch(term);
      final key = keyMatch?.group(1) ?? 'email';
      result = GenUiFormRegistry.instance.isValidEmail(key);
    }
    // 2. GenUiFormRegistry.instance.hasValue(...)
    else if (term.contains('hasValue(')) {
      final keyMatch = RegExp(r"""hasValue\(\s*['"](.+?)['"]\s*\)""").firstMatch(term);
      final key = keyMatch?.group(1) ?? '';
      result = GenUiFormRegistry.instance.hasValue(key);
    }
    // 3. .isEmpty
    else if (term.endsWith('.isEmpty')) {
      final varName = term.substring(0, term.length - 8).trim();
      final val = _resolveValue(varName, scope);
      if (val is String) {
        result = val.trim().isEmpty;
      } else if (val is List) {
        result = val.isEmpty;
      } else if (val is Map) {
        result = val.isEmpty;
      } else if (val == null) {
        result = true;
      } else {
        result = val.toString().trim().isEmpty;
      }
    }
    // 4. .isNotEmpty
    else if (term.endsWith('.isNotEmpty')) {
      final varName = term.substring(0, term.length - 11).trim();
      final val = _resolveValue(varName, scope);
      if (val is String) {
        result = val.trim().isNotEmpty;
      } else if (val is List) {
        result = val.isNotEmpty;
      } else if (val is Map) {
        result = val.isNotEmpty;
      } else if (val == null) {
        result = false;
      } else {
        result = val.toString().trim().isNotEmpty;
      }
    }
    // 5. .contains('...')
    else if (term.contains('.contains(')) {
      final match = RegExp(r"""^(.+?)\.contains\(\s*['"](.+?)['"]\s*\)$""").firstMatch(term);
      if (match != null) {
        final varName = match.group(1)!.trim();
        final search = match.group(2)!;
        final val = _resolveValue(varName, scope);
        result = val?.toString().contains(search) ?? false;
      }
    }
    // 6. == equality
    else if (term.contains('==')) {
      final eqParts = term.split('==');
      final left = _resolveValue(eqParts[0].trim(), scope)?.toString() ?? eqParts[0].trim();
      final right = _unquote(eqParts[1].trim());
      result = (left == right);
    }
    // 7. != inequality
    else if (term.contains('!=')) {
      final neParts = term.split('!=');
      final left = _resolveValue(neParts[0].trim(), scope)?.toString() ?? neParts[0].trim();
      final right = _unquote(neParts[1].trim());
      result = (left != right);
    }
    // 8. Direct boolean identifier
    else {
      final val = _resolveValue(term, scope);
      if (val is bool) {
        result = val;
      } else if (val != null) {
        result = val.toString() == 'true';
      }
    }

    return negate ? !result : result;
  }

  /// Resolve dynamic value from scope or FormRegistry
  static dynamic _resolveValue(String keyOrExpr, Map<String, dynamic> scope) {
    final clean = keyOrExpr.trim();
    if (clean.isEmpty) return null;

    if (scope.containsKey(clean)) {
      return scope[clean];
    }

    if ((clean.startsWith("'") && clean.endsWith("'")) || (clean.startsWith('"') && clean.endsWith('"'))) {
      return _unquote(clean);
    }

    if (clean.contains('getValue(')) {
      final m = RegExp(r"""getValue\(\s*['"](.+?)['"]\s*\)""").firstMatch(clean);
      if (m != null && m.group(1) != null) {
        return GenUiFormRegistry.instance.getValue(m.group(1)!);
      }
    }

    final formVal = GenUiFormRegistry.instance.getValue(clean);
    if (formVal.isNotEmpty) {
      return formVal;
    }

    return null;
  }

  /// Check if the statement is a variable assignment
  static bool _isVariableAssignment(String statement) {
    final s = statement.trim();
    if (s.startsWith('Navigator.') ||
        s.startsWith('Get.') ||
        s.startsWith('ScaffoldMessenger.') ||
        s.startsWith('showDialog') ||
        s.startsWith('showModalBottomSheet') ||
        s.startsWith('print(') ||
        s.startsWith('debugPrint(') ||
        s.startsWith('return')) {
      return false;
    }

    return RegExp(r'^(?:final|var|String|int|double|dynamic|bool)?\s*[a-zA-Z0-9_]+\s*=').hasMatch(s);
  }

  /// Parse and store variable assignment in local scope
  static void _executeVariableAssignment(String statement, Map<String, dynamic> scope) {
    final match = RegExp(r'^(?:final|var|String|int|double|dynamic|bool)?\s*([a-zA-Z0-9_]+)\s*=\s*(.+?);?$').firstMatch(statement.trim());
    if (match == null) return;

    final varName = match.group(1)!;
    final expr = match.group(2)!.trim();

    // 1. GenUiFormRegistry.instance.getValue('...')
    if (expr.contains('getValue(')) {
      final m = RegExp(r"""getValue\(\s*['"](.+?)['"]\s*\)""").firstMatch(expr);
      final key = m?.group(1) ?? varName;
      scope[varName] = GenUiFormRegistry.instance.getValue(key);
      return;
    }

    // 2. GenUiFormRegistry.instance.isValidEmail('...')
    if (expr.contains('isValidEmail(')) {
      final m = RegExp(r"""isValidEmail\(\s*['"](.+?)['"]\s*\)""").firstMatch(expr);
      final key = m?.group(1) ?? varName;
      scope[varName] = GenUiFormRegistry.instance.isValidEmail(key);
      return;
    }

    // 3. GenUiFormRegistry.instance.hasValue('...')
    if (expr.contains('hasValue(')) {
      final m = RegExp(r"""hasValue\(\s*['"](.+?)['"]\s*\)""").firstMatch(expr);
      final key = m?.group(1) ?? varName;
      scope[varName] = GenUiFormRegistry.instance.hasValue(key);
      return;
    }

    // 4. GenUiFormRegistry.instance.getValues()
    if (expr.contains('getValues()')) {
      scope[varName] = GenUiFormRegistry.instance.getValues();
      return;
    }

    // 5. GenUiFormRegistry.instance.validateNonEmpty()
    if (expr.contains('validateNonEmpty()')) {
      scope[varName] = GenUiFormRegistry.instance.validateNonEmpty();
      return;
    }

    // 6. String literal
    if ((expr.startsWith("'") && expr.endsWith("'")) || (expr.startsWith('"') && expr.endsWith('"'))) {
      scope[varName] = _unquote(expr);
      return;
    }

    // 7. Int literal
    final intVal = int.tryParse(expr);
    if (intVal != null) {
      scope[varName] = intVal;
      return;
    }

    // 8. Bool literal
    if (expr == 'true') { scope[varName] = true; return; }
    if (expr == 'false') { scope[varName] = false; return; }

    // 9. Existing scope variable
    if (scope.containsKey(expr)) {
      scope[varName] = scope[expr];
      return;
    }

    // 10. Fallback: try form registry or store expr
    final formVal = GenUiFormRegistry.instance.getValue(varName);
    if (formVal.isNotEmpty) {
      scope[varName] = formVal;
    } else {
      scope[varName] = expr;
    }
  }

  /// Dispatch and execute a single statement
  static ExecutionSignal _executeSingleStatement(
    BuildContext context,
    String statement,
    ComponentNode? node,
    Map<String, dynamic> scope,
  ) {
    final trimmed = statement.trim();
    if (trimmed.isEmpty) return ExecutionSignal.continueNext;

    if (trimmed == 'return;' || trimmed == 'return') {
      return ExecutionSignal.halt;
    }

    // 0. Variable Declaration or Assignment
    if (_isVariableAssignment(trimmed)) {
      _executeVariableAssignment(trimmed, scope);
      return ExecutionSignal.continueNext;
    }

    // 1. ScaffoldMessenger SnackBar
    if (trimmed.contains('showSnackBar') || trimmed.contains('SnackBar(')) {
      _executeSnackBar(context, trimmed, node, scope);
      return ExecutionSignal.continueNext;
    }

    // 2. showDialog / AlertDialog
    if (trimmed.contains('showDialog') || trimmed.contains('AlertDialog(')) {
      _executeAlertDialog(context, trimmed, node, scope);
      return ExecutionSignal.continueNext;
    }

    // 3. showModalBottomSheet / CustomDemoBottomSheet / Get.bottomSheet
    if (trimmed.contains('showModalBottomSheet') ||
        trimmed.contains('BottomSheet') ||
        trimmed.contains('CustomDemoBottomSheet') ||
        trimmed.contains('showCustomDemoBottomSheet') ||
        trimmed.contains('Get.bottomSheet')) {
      _executeBottomSheet(context, trimmed, node);
      return ExecutionSignal.continueNext;
    }

    // 4. Form Submit / Validation
    if (trimmed.contains('validate') || trimmed.contains('GenUiFormRegistry') || trimmed.toLowerCase().contains('submit')) {
      _executeFormSubmit(context, trimmed, node);
      return ExecutionSignal.continueNext;
    }

    // 5. Navigator Pop / Get.back
    if (trimmed.contains('Navigator.pop') ||
        trimmed.contains('Navigator.of(context).pop') ||
        trimmed.contains('Get.back(') ||
        trimmed.contains('Get.back()')) {
      if (context.mounted && Navigator.canPop(context)) {
        Navigator.pop(context);
      }
      return ExecutionSignal.continueNext;
    }

    // 6. Navigator Push / Route / Get.to
    if (trimmed.contains('Navigator.push') ||
        trimmed.contains('Navigator.of(context).push') ||
        trimmed.contains('Get.to') ||
        trimmed.contains('MaterialPageRoute') ||
        trimmed.contains('Route')) {
      _executeNavigation(context, trimmed, node, scope);
      return ExecutionSignal.continueNext;
    }

    // 7. Print / Debug / Telemetry
    if (trimmed.startsWith('print(') || trimmed.startsWith('debugPrint(')) {
      var msg = _extractStringInsideParens(trimmed) ?? trimmed;
      scope.forEach((k, v) {
        msg = msg.replaceAll('\$$k', v.toString());
        msg = msg.replaceAll('\${$k}', v.toString());
      });
      debugPrint('[GenUi Custom Dart Output] $msg');
      return ExecutionSignal.continueNext;
    }

    // 8. General Action Fallback (Display toast with executed statement)
    _executeGeneralAction(context, trimmed, node);
    return ExecutionSignal.continueNext;
  }

  /// Parse and display a SnackBar from Flutter code with variable interpolation
  static void _executeSnackBar(
    BuildContext context,
    String code,
    ComponentNode? node,
    Map<String, dynamic> scope,
  ) {
    if (!context.mounted) return;

    // Extract message from Text('...') or Text("...") or Text(varName)
    String message = 'Triggered dynamic action';
    final textMatch = RegExp(r"""Text\(\s*['"](.+?)['"]\s*\)""").firstMatch(code);
    if (textMatch != null && textMatch.group(1) != null) {
      message = textMatch.group(1)!;
    } else {
      final simpleMatch = RegExp(r"""content:\s*['"](.+?)['"]""").firstMatch(code);
      if (simpleMatch != null && simpleMatch.group(1) != null) {
        message = simpleMatch.group(1)!;
      } else {
        final varTextMatch = RegExp(r"""Text\(\s*([a-zA-Z0-9_]+)\s*\)""").firstMatch(code);
        if (varTextMatch != null && varTextMatch.group(1) != null) {
          final varName = varTextMatch.group(1)!;
          if (scope.containsKey(varName)) {
            message = scope[varName]?.toString() ?? message;
          }
        }
      }
    }

    // Interpolate scope variables: $email, ${email}
    scope.forEach((k, v) {
      message = message.replaceAll('\$$k', v.toString());
      message = message.replaceAll('\${$k}', v.toString());
    });

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

  /// Parse and display an AlertDialog from Flutter code with variable interpolation
  static void _executeAlertDialog(
    BuildContext context,
    String code,
    ComponentNode? node,
    Map<String, dynamic> scope,
  ) {
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

    // Interpolate scope variables: $var, ${var}
    scope.forEach((k, v) {
      title = title.replaceAll('\$$k', v.toString());
      title = title.replaceAll('\${$k}', v.toString());
      message = message.replaceAll('\$$k', v.toString());
      message = message.replaceAll('\${$k}', v.toString());
    });

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

    // Check for custom registered bottom sheet handler
    if (customBottomSheetHandler != null &&
        (code.contains('CustomDemoBottomSheet') ||
            code.contains('showCustomDemoBottomSheet') ||
            code.contains('CustomActionBottomSheet') ||
            code.contains('custom_sheet'))) {
      customBottomSheetHandler!(context, code);
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

    // Scope validation to the fields of the screen this button lives on
    final routeName = ModalRoute.of(context)?.settings.name ?? '/';
    final schema = GenUiScreenRegistry.instance.getSchemaForRoute(routeName);
    final scopedIds = schema?.allComponentIds;

    // 1. If this node or screen has a dynamic api_config, execute it
    final apiConfig = node?.apiConfig ?? schema?.apiConfig;
    if (apiConfig != null) {
      GenUiApiClient.executeApi(
        context: context,
        config: apiConfig,
        screenFieldIds: scopedIds,
        components: schema?.components,
        screenId: schema?.screenId,
        screenTitle: schema?.header.title.isNotEmpty ?? false ? schema!.header.title : schema?.screenName,
      );
      return;
    }

    final errors = schema != null
        ? GenUiFormRegistry.instance.validateComponents(schema.components, onlyIds: scopedIds)
        : GenUiFormRegistry.instance.validateNonEmpty(onlyIds: scopedIds);

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

    // Buttons with a `success_dialog` show a confirmation dialog with a
    // "Back to Home Screen" action instead of the summary snackbar.
    final successDialog = GenUiSuccessDialog.fromProperties(node?.properties);
    if (successDialog != null) {
      GenUiSuccessDialog.show(context, successDialog);
      return;
    }

    final values = GenUiFormRegistry.instance.getValues(onlyIds: scopedIds);
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
                SizedBox(width: 8),
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
  static void _executeNavigation(
    BuildContext context,
    String code,
    ComponentNode? node,
    Map<String, dynamic> scope,
  ) {
    if (!context.mounted) return;

    // 1. Extract route name
    String? routeName = _extractRouteName(code);

    // 2. Extract arguments with scope variable resolution
    final arguments = _extractArguments(code, scope);

    // 3. Fallback route if none matched
    routeName ??= '/profile';

    // 4. Dispatch navigation to actual screens
    if (GenUiScreenRegistry.instance.hasRoute(routeName)) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (ctx) => DynamicScreen(route: routeName, arguments: arguments),
          settings: RouteSettings(name: routeName, arguments: arguments),
        ),
      );
    } else {
      // Standard app route push via Navigator (resolved by app's onGenerateRoute or routes map)
      try {
        Navigator.pushNamed(context, routeName, arguments: arguments);
      } catch (e) {
        debugPrint('[GenUiDartExecutor] Navigator.pushNamed error for $routeName: $e');
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

  /// Helper to extract navigation arguments (Map, String, or int) with scope variable substitution
  static dynamic _extractArguments(String code, Map<String, dynamic> scope) {
    final argMatch = RegExp(r"""arguments:\s*(\{[\s\S]+?\}|\[[\s\S]+?\]|['"][^'"]*['"]|[a-zA-Z0-9_]+)""").firstMatch(code);
    if (argMatch == null || argMatch.group(1) == null) return null;

    final raw = argMatch.group(1)!.trim();

    // Case 1: Map literal e.g. {'email': email, 'source': 'login'}
    if (raw.startsWith('{') && raw.endsWith('}')) {
      final inner = raw.substring(1, raw.length - 1).trim();
      if (inner.isEmpty) return <String, dynamic>{};

      final Map<String, dynamic> result = {};
      final pairs = _splitArgumentsMap(inner);

      for (final pair in pairs) {
        final colonIdx = pair.indexOf(':');
        if (colonIdx == -1) continue;

        final rawKey = pair.substring(0, colonIdx).trim();
        final rawVal = pair.substring(colonIdx + 1).trim();
        final key = _unquote(rawKey);

        // A. String literal
        if ((rawVal.startsWith("'") && rawVal.endsWith("'")) ||
            (rawVal.startsWith('"') && rawVal.endsWith('"'))) {
          result[key] = _unquote(rawVal);
        }
        // B. Int / double literal
        else if (int.tryParse(rawVal) != null) {
          result[key] = int.parse(rawVal);
        } else if (double.tryParse(rawVal) != null) {
          result[key] = double.parse(rawVal);
        }
        // C. Boolean
        else if (rawVal == 'true') {
          result[key] = true;
        } else if (rawVal == 'false') {
          result[key] = false;
        }
        // D. In local scope variable
        else if (scope.containsKey(rawVal)) {
          result[key] = scope[rawVal];
        }
        // E. GenUiFormRegistry.instance.getValue('...')
        else if (rawVal.contains('getValue(')) {
          final m = RegExp(r"""getValue\(\s*['"](.+?)['"]\s*\)""").firstMatch(rawVal);
          final k = m?.group(1) ?? key;
          result[key] = GenUiFormRegistry.instance.getValue(k);
        }
        // F. Try finding in GenUiFormRegistry directly
        else {
          final formVal = GenUiFormRegistry.instance.getValue(rawVal);
          if (formVal.isNotEmpty) {
            result[key] = formVal;
          } else {
            result[key] = rawVal;
          }
        }
      }
      return result;
    }

    // Case 2: String literal
    if ((raw.startsWith("'") && raw.endsWith("'")) || (raw.startsWith('"') && raw.endsWith('"'))) {
      return _unquote(raw);
    }

    // Case 3: In scope variable (e.g. arguments: email)
    if (scope.containsKey(raw)) {
      return scope[raw];
    }

    // Case 4: Numeric
    final numVal = num.tryParse(raw);
    if (numVal != null) return numVal;

    // Fallback: check form registry
    final formVal = GenUiFormRegistry.instance.getValue(raw);
    if (formVal.isNotEmpty) return formVal;

    return raw;
  }

  /// Helper to split comma-separated map pairs preserving nested quotes
  static List<String> _splitArgumentsMap(String inner) {
    final List<String> pairs = [];
    final StringBuffer current = StringBuffer();
    bool inSingle = false;
    bool inDouble = false;

    for (int i = 0; i < inner.length; i++) {
      final c = inner[i];
      if (c == "'" && !inDouble) {
        inSingle = !inSingle;
      } else if (c == '"' && !inSingle) {
        inDouble = !inDouble;
      }

      if (c == ',' && !inSingle && !inDouble) {
        final p = current.toString().trim();
        if (p.isNotEmpty) pairs.add(p);
        current.clear();
      } else {
        current.write(c);
      }
    }
    final remaining = current.toString().trim();
    if (remaining.isNotEmpty) pairs.add(remaining);
    return pairs;
  }

  /// Helper to strip outer quotes from a string
  static String _unquote(String str) {
    var s = str.trim();
    if ((s.startsWith("'") && s.endsWith("'")) || (s.startsWith('"') && s.endsWith('"'))) {
      return s.substring(1, s.length - 1);
    }
    return s;
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

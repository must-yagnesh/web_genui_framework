import 'package:flutter/material.dart';
import '../models/ui_schema.dart';
import '../boundary/error_boundary.dart';
import '../widgets/safe_banner.dart';
import '../widgets/safe_card.dart';
import '../widgets/safe_metric.dart';
import '../widgets/safe_button.dart';
import '../widgets/fallback_widget.dart';

/// Whitelisted Registry of safe Flutter widgets mapped to declarative schema tags
class SafeWidgetRegistry {
  static const Set<String> supportedTypes = {
    'banner',
    'metric_row',
    'metrics',
    'card',
    'button',
  };

  /// Build a widget safely with ErrorBoundary and Whitelist protection
  static Widget buildNode({
    required ComponentNode node,
    required ThemeConfig theme,
    bool isGuarded = true,
    Function(String actionId)? onAction,
    Function(String componentId, String error)? onError,
  }) {
    if (!isGuarded) {
      // NAIVE MODE (Simulates unprotected dynamic rendering for contrast)
      return _buildNaiveNode(node, theme, onAction);
    }

    // GUARDED MODE (Production 0% crash resilience)
    return GenUiErrorBoundary(
      node: node,
      onErrorLogged: onError,
      builder: (context) {
        if (!supportedTypes.contains(node.type)) {
          return GenUiFallbackWidget(
            componentId: node.id,
            componentType: node.type,
            errorMessage: 'Unregistered widget tag <${node.type}>. Safely isolated.',
          );
        }

        switch (node.type) {
          case 'banner':
            return SafeGenUiBanner(node: node, theme: theme);
          case 'metric_row':
          case 'metrics':
            return SafeGenUiMetricRow(node: node, theme: theme);
          case 'card':
            return SafeGenUiCard(node: node, theme: theme, onAction: onAction);
          case 'button':
            return SafeGenUiButton(node: node, theme: theme, onAction: onAction);
          default:
            return GenUiFallbackWidget(
              componentId: node.id,
              componentType: node.type,
              errorMessage: 'Widget type not implemented in registry.',
            );
        }
      },
    );
  }

  /// Naive rendering without guard (will display unhandled layout crashes for contrast)
  static Widget _buildNaiveNode(
    ComponentNode node,
    ThemeConfig theme,
    Function(String actionId)? onAction,
  ) {
    if (node.type == 'banner') {
      final title = node.properties['title']?.toString() ?? '';
      final message = node.properties['message']?.toString() ?? '';
      final isTextOverflow = title.length > 70 ||
          message.length > 120 ||
          title.contains('UNBOUNDED') ||
          title.contains('CRASH_OVERFLOW') ||
          node.id.contains('text_bomb');

      if (isTextOverflow) {
        return _buildNaiveCrashWidget(
          errorType: 'RenderFlexOverflowError',
          summary: 'A RenderFlex overflowed by 1,420 pixels on the right.',
          details: 'Unconstrained Row contains unbounded Text ("${title.length > 40 ? title.substring(0, 40) : title}..."). MaxLines and ellipsis boundary missing in naive dynamic parser.',
          impact: 'Total component rendering failure • Google Play Store Vitals crash spike.',
        );
      }
      return SafeGenUiBanner(node: node, theme: theme);
    } else if (node.type == 'metric_row' || node.type == 'metrics') {
      final rawList = node.properties['metrics'];
      if (rawList == null || rawList is! List) {
        return _buildNaiveCrashWidget(
          errorType: 'TypeError: NullCheckError / Unexpected Type',
          summary: "type '${rawList.runtimeType}' is not a subtype of type 'List<dynamic>'",
          details: "Naive parser expected List<dynamic> for 'metrics', got '${rawList.runtimeType}'.",
          impact: 'Unhandled dynamic casting exception on Flutter UI thread.',
        );
      }
      return SafeGenUiMetricRow(node: node, theme: theme);
    } else if (node.type == 'card') {
      final height = node.properties['height'];
      if (height is num && height < 0) {
        return _buildNaiveCrashWidget(
          errorType: 'AssertionError: height >= 0.0 is not true',
          summary: 'Failed assertion: "height >= 0.0": is not true ($height).',
          details: 'SizedBox dimension cannot be negative in Flutter layout constraint engine.',
          impact: 'Fatal framework assertion failure • Immediate red screen.',
        );
      }
      final title = node.properties['title']?.toString() ?? '';
      final desc = node.properties['description']?.toString() ?? '';
      if (title.length > 70 || desc.length > 150) {
        return _buildNaiveCrashWidget(
          errorType: 'RenderFlexOverflowError',
          summary: 'A RenderFlex overflowed by 890 pixels on the bottom.',
          details: 'Unbounded Card text exceeded parent layout bounds without maxLines constraints.',
          impact: 'Viewport clipping & yellow/black hazard stripes.',
        );
      }
      return SafeGenUiCard(node: node, theme: theme, onAction: onAction);
    } else if (node.type == 'button') {
      final actionId = node.properties['action_id']?.toString() ?? '';
      if (actionId.startsWith('javascript:') || actionId.contains('eval(')) {
        return _buildNaiveCrashWidget(
          errorType: 'SecurityProtocolError: Insecure Action Handler',
          summary: 'Unsanitized protocol in action handler: "$actionId"',
          details: 'Naive parser directly passed untrusted action handler to system intent launcher.',
          impact: 'Critical vulnerability: Client-side XSS / arbitrary intent execution.',
        );
      }
      return SafeGenUiButton(node: node, theme: theme, onAction: onAction);
    } else {
      return _buildNaiveCrashWidget(
        errorType: 'UnsupportedError: Hallucinated Tag',
        summary: 'No factory registered for dynamic widget <${node.type}>.',
        details: 'Model generated non-existent widget. Naive parser cannot resolve constructor.',
        impact: 'Total screen death without graceful fallback isolation.',
      );
    }
  }

  static Widget _buildNaiveCrashWidget({
    required String errorType,
    required String summary,
    required String details,
    required String impact,
  }) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8.0),
      decoration: BoxDecoration(
        color: const Color(0xFF450A0A),
        border: Border.all(color: const Color(0xFFDC2626), width: 2.0),
        borderRadius: BorderRadius.circular(10.0),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Yellow-and-black hazard bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 5.0),
            decoration: const BoxDecoration(
              color: Color(0xFFFEF08A),
              borderRadius: BorderRadius.vertical(top: Radius.circular(8.0)),
            ),
            child: const Row(
              children: [
                Icon(Icons.warning, color: Colors.black, size: 16.0),
                SizedBox(width: 6.0),
                Text(
                  '⚠ UNHANDLED RUNTIME EXCEPTION (NAIVE PARSER)',
                  style: TextStyle(
                    color: Colors.black,
                    fontSize: 11.0,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 0.5,
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(14.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '💥 $errorType',
                  style: const TextStyle(
                    color: Color(0xFFFCA5A5),
                    fontSize: 13.0,
                    fontWeight: FontWeight.w800,
                    fontFamily: 'monospace',
                  ),
                ),
                const SizedBox(height: 6.0),
                Text(
                  summary,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12.0,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 6.0),
                Text(
                  details,
                  style: const TextStyle(
                    color: Color(0xFFCBD5E1),
                    fontSize: 11.0,
                    height: 1.3,
                  ),
                ),
                const SizedBox(height: 10.0),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 4.0),
                  decoration: BoxDecoration(
                    color: const Color(0xFF991B1B).withOpacity(0.5),
                    borderRadius: BorderRadius.circular(4.0),
                  ),
                  child: Text(
                    '❌ Impact: $impact',
                    style: const TextStyle(
                      color: Color(0xFFFEE2E2),
                      fontSize: 10.0,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                const SizedBox(height: 8.0),
                const Text(
                  '👉 Flip AppBar toggle to "GUARDED" to see flutter_genui_guard auto-heal and render safely.',
                  style: TextStyle(
                    color: Color(0xFF34D399),
                    fontSize: 11.0,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

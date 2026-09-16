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

  /// Naive rendering without guard (will throw unhandled exceptions on bad types)
  static Widget _buildNaiveNode(
    ComponentNode node,
    ThemeConfig theme,
    Function(String actionId)? onAction,
  ) {
    if (node.type == 'banner') {
      final title = node.properties['title'] as String;
      // In naive mode, an unbounded text in an unconstrained Row will trigger a RenderFlex overflow hazard
      if (title.length > 120) {
        return Row(
          children: [
            Text(title, style: const TextStyle(fontSize: 16.0, color: Colors.white)),
          ],
        );
      }
      return SafeGenUiBanner(node: node, theme: theme);
    } else if (node.type == 'metric_row' || node.type == 'metrics') {
      // In naive mode, if metrics is not a list or has invalid types, let it throw!
      final rawList = node.properties['metrics'] as List; // Will throw if string or null!
      return Column(
        children: rawList.map((m) => Text(m['label'].toString())).toList(),
      );
    } else if (node.type == 'card') {
      final height = node.properties['height'];
      if (height is num && height < 0) {
        // Negative dimension triggers fatal engine AssertionError
        return SizedBox(height: height.toDouble(), child: const Text("Negative Dimension"));
      }
      return SafeGenUiCard(node: node, theme: theme, onAction: onAction);
    } else if (node.type == 'button') {
      return SafeGenUiButton(node: node, theme: theme, onAction: onAction);
    } else {
      // Hallucinated widget in naive mode throws unhandled exception
      throw UnsupportedError('Naive parser encountered unknown widget: ${node.type}');
    }
  }
}

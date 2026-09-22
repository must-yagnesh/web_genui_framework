import 'package:flutter/material.dart';
import '../models/ui_schema.dart';

/// Safe Dynamic Call-To-Action Button Widget
class SafeGenUiButton extends StatelessWidget {
  final ComponentNode node;
  final ThemeConfig theme;
  final Function(String actionId)? onAction;
  final Function(ComponentNode node)? onExecute;

  const SafeGenUiButton({
    super.key,
    required this.node,
    required this.theme,
    this.onAction,
    this.onExecute,
  });

  @override
  Widget build(BuildContext context) {
    final text = node.properties['text']?.toString() ?? 'Action';
    final actionId = node.properties['action_id']?.toString() ?? 'btn_action';
    final isSecondary = node.properties['variant']?.toString().toLowerCase() == 'secondary' ||
        node.properties['variant']?.toString().toLowerCase() == 'outline';

    final rawBg = node.properties['background_color'] ?? node.properties['bg_color'] ?? (isSecondary ? null : node.properties['color']);
    final bgColor = rawBg != null
        ? parseHexColor(rawBg, isSecondary ? Colors.transparent : theme.primaryColor)
        : (isSecondary ? Colors.transparent : theme.primaryColor);

    final rawTextColor = node.properties['text_color'] ?? (isSecondary ? node.properties['color'] : null);
    final textColor = rawTextColor != null
        ? parseHexColor(rawTextColor, isSecondary ? theme.primaryColor : Colors.white)
        : (isSecondary ? theme.primaryColor : Colors.white);

    final rawBorderColor = node.properties['border_color'];
    final borderColor = rawBorderColor != null
        ? parseHexColor(rawBorderColor, theme.primaryColor)
        : (isSecondary ? (rawTextColor != null ? textColor : theme.primaryColor) : theme.primaryColor);

    void handlePress() {
      if (onExecute != null) {
        onExecute!(node);
      } else {
        onAction?.call(actionId);
      }
    }

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: SizedBox(
        width: double.infinity,
        height: 48.0,
        child: isSecondary
            ? OutlinedButton(
                onPressed: handlePress,
                style: OutlinedButton.styleFrom(
                  backgroundColor: bgColor,
                  side: BorderSide(color: borderColor, width: 1.5),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12.0),
                  ),
                ),
                child: Text(
                  text,
                  style: TextStyle(
                    color: textColor,
                    fontSize: 14.0,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              )
            : ElevatedButton(
                onPressed: handlePress,
                style: ElevatedButton.styleFrom(
                  backgroundColor: bgColor,
                  elevation: 2.0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12.0),
                  ),
                ),
                child: Text(
                  text,
                  style: TextStyle(
                    color: textColor,
                    fontSize: 14.0,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
      ),
    );
  }
}

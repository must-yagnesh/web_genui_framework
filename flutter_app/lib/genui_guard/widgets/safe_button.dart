import 'package:flutter/material.dart';
import '../models/ui_schema.dart';

/// Safe Dynamic Call-To-Action Button Widget
class SafeGenUiButton extends StatelessWidget {
  final ComponentNode node;
  final ThemeConfig theme;
  final Function(String actionId)? onAction;

  const SafeGenUiButton({
    super.key,
    required this.node,
    required this.theme,
    this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    final text = node.properties['text']?.toString() ?? 'Action';
    final actionId = node.properties['action_id']?.toString() ?? 'btn_action';
    final isSecondary = node.properties['variant']?.toString().toLowerCase() == 'secondary';

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: SizedBox(
        width: double.infinity,
        height: 48.0,
        child: isSecondary
            ? OutlinedButton(
                onPressed: () => onAction?.call(actionId),
                style: OutlinedButton.styleFrom(
                  side: BorderSide(color: theme.primaryColor, width: 1.5),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12.0),
                  ),
                ),
                child: Text(
                  text,
                  style: TextStyle(
                    color: theme.primaryColor,
                    fontSize: 14.0,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              )
            : ElevatedButton(
                onPressed: () => onAction?.call(actionId),
                style: ElevatedButton.styleFrom(
                  backgroundColor: theme.primaryColor,
                  elevation: 2.0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12.0),
                  ),
                ),
                child: Text(
                  text,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 14.0,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
      ),
    );
  }
}

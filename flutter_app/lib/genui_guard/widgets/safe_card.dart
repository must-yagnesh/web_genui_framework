import 'package:flutter/material.dart';
import '../models/ui_schema.dart';

/// Safe Dynamic Feature Card Widget
class SafeGenUiCard extends StatelessWidget {
  final ComponentNode node;
  final ThemeConfig theme;
  final Function(String actionId)? onAction;

  const SafeGenUiCard({
    super.key,
    required this.node,
    required this.theme,
    this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    final title = node.properties['title']?.toString() ?? 'Feature';
    final description = node.properties['description']?.toString() ?? '';
    final badge = node.properties['badge']?.toString();
    final actionText = node.properties['action_text']?.toString() ?? 'View';
    final actionId = node.properties['action_id']?.toString() ?? 'action';

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 6.0),
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: theme.surfaceColor,
        borderRadius: BorderRadius.circular(14.0),
        border: Border.all(
          color: Colors.white.withOpacity(0.07),
          width: 1.0,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          if (badge != null && badge.isNotEmpty) ...[
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 3.0),
              decoration: BoxDecoration(
                color: theme.primaryColor.withOpacity(0.15),
                borderRadius: BorderRadius.circular(6.0),
                border: Border.all(
                  color: theme.primaryColor.withOpacity(0.3),
                  width: 1.0,
                ),
              ),
              child: Text(
                badge.toUpperCase(),
                style: TextStyle(
                  color: theme.primaryColor,
                  fontSize: 10.0,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
            const SizedBox(height: 10.0),
          ],
          Text(
            title,
            style: TextStyle(
              color: theme.textPrimary,
              fontSize: 16.0,
              fontWeight: FontWeight.w700,
              letterSpacing: -0.2,
            ),
          ),
          if (description.isNotEmpty) ...[
            const SizedBox(height: 6.0),
            Text(
              description,
              style: TextStyle(
                color: theme.textSecondary,
                fontSize: 13.0,
                height: 1.4,
              ),
            ),
          ],
          const SizedBox(height: 12.0),
          InkWell(
            onTap: () => onAction?.call(actionId),
            borderRadius: BorderRadius.circular(6.0),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  actionText,
                  style: TextStyle(
                    color: theme.primaryColor,
                    fontSize: 13.0,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(width: 4.0),
                Icon(
                  Icons.arrow_forward_rounded,
                  color: theme.primaryColor,
                  size: 14.0,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

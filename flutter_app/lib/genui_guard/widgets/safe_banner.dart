import 'package:flutter/material.dart';
import '../models/ui_schema.dart';

/// Safe Dynamic Banner Widget
class SafeGenUiBanner extends StatelessWidget {
  final ComponentNode node;
  final ThemeConfig theme;

  const SafeGenUiBanner({
    super.key,
    required this.node,
    required this.theme,
  });

  @override
  Widget build(BuildContext context) {
    final title = node.properties['title']?.toString() ?? 'Announcement';
    final message = node.properties['message']?.toString() ?? '';
    final badge = node.properties['badge']?.toString();
    final customColor = parseHexColor(node.properties['color'], theme.primaryColor);

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 6.0),
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            customColor,
            customColor.withOpacity(0.75),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(14.0),
        boxShadow: [
          BoxShadow(
            color: customColor.withOpacity(0.3),
            blurRadius: 12.0,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          if (badge != null && badge.isNotEmpty) ...[
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 3.0),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.25),
                borderRadius: BorderRadius.circular(6.0),
              ),
              child: Text(
                badge.toUpperCase(),
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 10.0,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.5,
                ),
              ),
            ),
            const SizedBox(height: 8.0),
          ],
          Text(
            title,
            maxLines: 4,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 16.0,
              fontWeight: FontWeight.w700,
              letterSpacing: -0.2,
            ),
          ),
          if (message.isNotEmpty) ...[
            const SizedBox(height: 6.0),
            Text(
              message,
              maxLines: 8,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: Colors.white.withOpacity(0.9),
                fontSize: 13.0,
                height: 1.35,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

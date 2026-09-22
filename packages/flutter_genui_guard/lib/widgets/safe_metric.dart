import 'package:flutter/material.dart';
import '../models/ui_schema.dart';

/// Safe Dynamic Metric Row Widget
class SafeGenUiMetricRow extends StatelessWidget {
  final ComponentNode node;
  final ThemeConfig theme;

  const SafeGenUiMetricRow({
    super.key,
    required this.node,
    required this.theme,
  });

  @override
  Widget build(BuildContext context) {
    final rawMetrics = node.properties['metrics'];
    final List<Map<String, dynamic>> metrics = [];

    if (rawMetrics is List) {
      for (final m in rawMetrics) {
        if (m is Map) {
          metrics.add(Map<String, dynamic>.from(m));
        }
      }
    }

    if (metrics.isEmpty) {
      return const SizedBox.shrink();
    }

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: Row(
        children: metrics.map((m) {
          final label = m['label']?.toString() ?? 'Stat';
          final value = m['value']?.toString() ?? '0';
          final change = m['change']?.toString() ?? '';
          final isPositive = m['is_positive'] == true;

          return Expanded(
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 4.0),
              padding: const EdgeInsets.all(14.0),
              decoration: BoxDecoration(
                color: theme.surfaceColor,
                borderRadius: BorderRadius.circular(12.0),
                border: Border.all(
                  color: Colors.white.withOpacity(0.06),
                  width: 1.0,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    label,
                    style: TextStyle(
                      color: theme.textSecondary,
                      fontSize: 11.0,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 6.0),
                  Text(
                    value,
                    style: TextStyle(
                      color: theme.textPrimary,
                      fontSize: 18.0,
                      fontWeight: FontWeight.w700,
                      letterSpacing: -0.3,
                    ),
                  ),
                  if (change.isNotEmpty) ...[
                    const SizedBox(height: 4.0),
                    Row(
                      children: [
                        Icon(
                          isPositive ? Icons.trending_up : Icons.trending_down,
                          color: isPositive ? theme.accentColor : const Color(0xFFEF4444),
                          size: 14.0,
                        ),
                        const SizedBox(width: 4.0),
                        Text(
                          change,
                          style: TextStyle(
                            color: isPositive ? theme.accentColor : const Color(0xFFEF4444),
                            fontSize: 11.0,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

/// Telemetry event capturing parsing duration, render time, and fallback activations
class RenderTelemetry {
  final int schemaVersion;
  final int parseDurationMs;
  final int renderDurationMs;
  final int totalNodes;
  final int fallbackCount;
  final List<String> fallbackReasons;
  final int timestamp;

  const RenderTelemetry({
    required this.schemaVersion,
    required this.parseDurationMs,
    required this.renderDurationMs,
    required this.totalNodes,
    required this.fallbackCount,
    required this.fallbackReasons,
    required this.timestamp,
  });

  Map<String, dynamic> toMap() {
    return {
      'schema_version': schemaVersion,
      'parse_duration_ms': parseDurationMs,
      'render_duration_ms': renderDurationMs,
      'total_nodes': totalNodes,
      'fallback_count': fallbackCount,
      'fallback_reasons': fallbackReasons,
      'timestamp': timestamp,
    };
  }
}

import 'package:flutter/material.dart';
import '../models/ui_schema.dart';
import '../widgets/fallback_widget.dart';

/// Component-level Fault Isolation Container.
/// Guarantees that an exception inside one dynamic widget NEVER breaks the surrounding screen.
class GenUiErrorBoundary extends StatefulWidget {
  final ComponentNode node;
  final Widget Function(BuildContext context) builder;
  final Function(String componentId, String error)? onErrorLogged;

  const GenUiErrorBoundary({
    super.key,
    required this.node,
    required this.builder,
    this.onErrorLogged,
  });

  @override
  State<GenUiErrorBoundary> createState() => _GenUiErrorBoundaryState();
}

class _GenUiErrorBoundaryState extends State<GenUiErrorBoundary> {
  bool _hasError = false;
  String? _errorMessage;

  @override
  void didUpdateWidget(covariant GenUiErrorBoundary oldWidget) {
    super.didUpdateWidget(oldWidget);
    // Reset error state if node changes (e.g. fresh schema applied)
    if (oldWidget.node.id != widget.node.id ||
        oldWidget.node.properties != widget.node.properties) {
      if (_hasError) {
        setState(() {
          _hasError = false;
          _errorMessage = null;
        });
      }
    }
  }

  void _retry() {
    setState(() {
      _hasError = false;
      _errorMessage = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_hasError) {
      return GenUiFallbackWidget(
        componentId: widget.node.id,
        componentType: widget.node.type,
        errorMessage: _errorMessage,
        onRetry: _retry,
      );
    }

    try {
      return widget.builder(context);
    } catch (e, stackTrace) {
      final err = 'Layout/Rendering fault: $e';
      widget.onErrorLogged?.call(widget.node.id, err);
      debugPrint('[GenUiGuard] Error isolated in node ${widget.node.id} (${widget.node.type}): $e\n$stackTrace');
      return GenUiFallbackWidget(
        componentId: widget.node.id,
        componentType: widget.node.type,
        errorMessage: err,
        onRetry: _retry,
      );
    }
  }
}

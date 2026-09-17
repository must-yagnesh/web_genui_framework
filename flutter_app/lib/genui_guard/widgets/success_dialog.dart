import 'package:flutter/material.dart';

/// Confirmation dialog shown after a successful form submission when the
/// submit button carries a `success_dialog` property, e.g.
///
/// ```json
/// "success_dialog": {
///   "title": "Message Sent!",
///   "message": "Thanks, we will reply within 24 hours.",
///   "button_text": "Back to Home Screen",
///   "navigate_to": "/"
/// }
/// ```
///
/// Pressing the button closes the dialog and pops back to the first route
/// (the Home screen). Any other `navigate_to` value is pushed as a named route.
class GenUiSuccessDialog {
  GenUiSuccessDialog._();

  /// Read the `success_dialog` map from a component's properties, if present.
  static Map<String, dynamic>? fromProperties(Map<String, dynamic>? properties) {
    final raw = properties?['success_dialog'];
    if (raw is Map) {
      return raw.map((k, v) => MapEntry(k.toString(), v));
    }
    return null;
  }

  static Future<void> show(BuildContext context, Map<String, dynamic> config) async {
    if (!context.mounted) return;
    final title = config['title']?.toString() ?? 'Submitted Successfully';
    final message = config['message']?.toString() ??
        'Your details have been submitted successfully.';
    final buttonText = config['button_text']?.toString() ?? 'Back to Home Screen';
    final navigateTo = config['navigate_to']?.toString() ?? '/';

    await showDialog<void>(
      context: context,
      barrierDismissible: false,
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
                color: const Color(0xFF10B981).withOpacity(0.18),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.check_circle_rounded, color: Color(0xFF10B981), size: 22),
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
          style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 13, height: 1.45),
        ),
        actionsPadding: const EdgeInsets.fromLTRB(16, 0, 16, 14),
        actions: [
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF4F46E5),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              icon: const Icon(Icons.home_rounded, size: 18),
              label: Text(buttonText, style: const TextStyle(fontWeight: FontWeight.bold)),
              onPressed: () {
                final navigator = Navigator.of(dialogCtx);
                navigator.pop(); // close the dialog
                if (navigateTo == '/' || navigateTo.isEmpty) {
                  navigator.popUntil((route) => route.isFirst);
                } else {
                  navigator.pushNamed(navigateTo);
                }
              },
            ),
          ),
        ],
      ),
    );
  }
}

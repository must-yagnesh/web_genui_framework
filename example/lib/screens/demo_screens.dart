import 'package:flutter/material.dart';

/// Helper function to open the CustomDemoBottomSheet directly
Future<T?> showCustomDemoBottomSheet<T>(BuildContext context) {
  return showModalBottomSheet<T>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (ctx) => const CustomDemoBottomSheet(),
  );
}

/// 1. Demo Screen: User Profile Screen (/profile)
/// Represents a real-world pre-existing profile screen in a Flutter app
class UserProfileDemoScreen extends StatelessWidget {
  final dynamic arguments;

  const UserProfileDemoScreen({super.key, this.arguments});

  @override
  Widget build(BuildContext context) {
    // Extract argument data if passed (from Navigator or GetX)
    final args = arguments ?? ModalRoute.of(context)?.settings.arguments;
    final dynamic customTitle = args is Map ? args['title'] : null;

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white, size: 20),
          onPressed: () => Navigator.maybePop(context),
        ),
        title: Text(
          customTitle?.toString() ?? 'User Profile',
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.tune, color: Color(0xFF818CF8)),
            onPressed: () => Navigator.pushNamed(context, '/settings'),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // User Header Card
            Center(
              child: Stack(
                children: [
                  Container(
                    width: 96,
                    height: 96,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: const Color(0xFF4F46E5), width: 3),
                      gradient: const LinearGradient(
                        colors: [Color(0xFF6366F1), Color(0xFF4338CA)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                    ),
                    child: const Center(
                      child: Icon(Icons.person, color: Colors.white, size: 52),
                    ),
                  ),
                  Positioned(
                    bottom: 0,
                    right: 4,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(
                        color: Color(0xFF10B981),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.check, color: Colors.white, size: 14),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),
            const Text(
              'Alex Morgan',
              style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            const Text(
              'alex.morgan@enterprise.io',
              style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFF4F46E5).withOpacity(0.2),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFF4F46E5).withOpacity(0.5)),
              ),
              child: const Text(
                'PRO TIER SUBSCRIBER',
                style: TextStyle(color: Color(0xFF818CF8), fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.5),
              ),
            ),

            // Arguments Info Banner (if passed from custom Dart code)
            if (args != null) ...[
              const SizedBox(height: 18),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFF6366F1), width: 1),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.input, color: Color(0xFF818CF8), size: 16),
                        SizedBox(width: 8),
                        Text('Received Arguments From Web Code:', style: TextStyle(color: Color(0xFF818CF8), fontSize: 12, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      args.toString(),
                      style: const TextStyle(color: Color(0xFFE2E8F0), fontSize: 12, fontFamily: 'monospace'),
                    ),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 24),

            // Profile Metrics Row
            Row(
              children: [
                _buildStatItem('Projects', '24', const Color(0xFF4F46E5)),
                const SizedBox(width: 12),
                _buildStatItem('Deployments', '148', const Color(0xFF10B981)),
                const SizedBox(width: 12),
                _buildStatItem('Rating', '4.9 ★', const Color(0xFFF59E0B)),
              ],
            ),

            const SizedBox(height: 24),

            // Action Buttons
            _buildActionTile(
              context,
              icon: Icons.layers_outlined,
              title: 'Open Custom Bottom Sheet',
              subtitle: 'Tests bottom sheet from profile',
              color: const Color(0xFF818CF8),
              onTap: () => showCustomDemoBottomSheet(context),
            ),
            _buildActionTile(
              context,
              icon: Icons.settings_outlined,
              title: 'App Settings',
              subtitle: 'Test navigation to /settings',
              color: const Color(0xFF38BDF8),
              onTap: () => Navigator.pushNamed(context, '/settings'),
            ),
            _buildActionTile(
              context,
              icon: Icons.share_outlined,
              title: 'Share Profile',
              subtitle: 'Simulate native intent action',
              color: const Color(0xFF34D399),
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Profile link copied to clipboard!'),
                    backgroundColor: Color(0xFF10B981),
                    behavior: SnackBarBehavior.floating,
                  ),
                );
              },
            ),

            const SizedBox(height: 20),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1E293B),
                  side: const BorderSide(color: Color(0xFF475569)),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                icon: const Icon(Icons.arrow_back, color: Colors.white, size: 18),
                label: const Text('Back to Generative Screen', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                onPressed: () => Navigator.maybePop(context),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(String label, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFF334155)),
        ),
        child: Column(
          children: [
            Text(value, style: TextStyle(color: color, fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text(label, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
          ],
        ),
      ),
    );
  }

  Widget _buildActionTile(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: Material(
        color: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: Color(0xFF334155)),
        ),
        clipBehavior: Clip.antiAlias,
        child: ListTile(
          leading: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.15),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          title: Text(title, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
          subtitle: Text(subtitle, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
          trailing: const Icon(Icons.arrow_forward_ios, color: Color(0xFF64748B), size: 14),
          onTap: onTap,
        ),
      ),
    );
  }
}

/// 2. Demo Screen: Settings Screen (/settings)
/// Represents a real-world pre-existing settings screen in a Flutter app
class SettingsDemoScreen extends StatefulWidget {
  final dynamic arguments;

  const SettingsDemoScreen({super.key, this.arguments});

  @override
  State<SettingsDemoScreen> createState() => _SettingsDemoScreenState();
}

class _SettingsDemoScreenState extends State<SettingsDemoScreen> {
  bool _pushNotifications = true;
  bool _biometricUnlock = true;
  bool _darkModeSync = true;
  bool _autoUpdateSchema = true;

  @override
  Widget build(BuildContext context) {
    final args = widget.arguments ?? ModalRoute.of(context)?.settings.arguments;

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white, size: 20),
          onPressed: () => Navigator.maybePop(context),
        ),
        title: const Text(
          'App Settings',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          if (args != null) ...[
            Container(
              padding: const EdgeInsets.all(12),
              margin: const EdgeInsets.only(bottom: 20),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF38BDF8), width: 1),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.info_outline, color: Color(0xFF38BDF8), size: 16),
                      SizedBox(width: 8),
                      Text('Navigation Argument Passed:', style: TextStyle(color: Color(0xFF38BDF8), fontSize: 12, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    args.toString(),
                    style: const TextStyle(color: Color(0xFFE2E8F0), fontSize: 12, fontFamily: 'monospace'),
                  ),
                ],
              ),
            ),
          ],

          _buildSectionHeader('PREFERENCES'),
          _buildSwitchTile('Push Notifications', 'Receive instant alerts on updates', _pushNotifications, (v) => setState(() => _pushNotifications = v)),
          _buildSwitchTile('Biometric Lock', 'Require FaceID / Fingerprint on start', _biometricUnlock, (v) => setState(() => _biometricUnlock = v)),
          _buildSwitchTile('Dark Mode Sync', 'Synchronize with web theme tokens', _darkModeSync, (v) => setState(() => _darkModeSync = v)),
          _buildSwitchTile('Auto-Apply Live Schema', 'Stream updates via Server-Sent Events', _autoUpdateSchema, (v) => setState(() => _autoUpdateSchema = v)),

          const SizedBox(height: 24),
          _buildSectionHeader('ACTIONS & DATA'),

          _buildActionTile(
            icon: Icons.layers,
            title: 'Test Custom Bottom Sheet',
            subtitle: 'Open custom action sheet',
            color: const Color(0xFF818CF8),
            onTap: () => showCustomDemoBottomSheet(context),
          ),
          _buildActionTile(
            icon: Icons.person_outline,
            title: 'Open User Profile Screen',
            subtitle: 'Navigate to /profile',
            color: const Color(0xFF34D399),
            onTap: () => Navigator.pushNamed(context, '/profile'),
          ),
          _buildActionTile(
            icon: Icons.delete_sweep_outlined,
            title: 'Clear Cache & Schema Store',
            subtitle: 'Free 24.8 MB cached temporary assets',
            color: const Color(0xFFEF4444),
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Cache successfully cleared!'),
                  backgroundColor: Color(0xFF10B981),
                  behavior: SnackBarBehavior.floating,
                ),
              );
            },
          ),

          const SizedBox(height: 32),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF4F46E5),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              icon: const Icon(Icons.arrow_back, color: Colors.white, size: 18),
              label: const Text('Back to Generative Screen', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              onPressed: () => Navigator.maybePop(context),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10, left: 4),
      child: Text(
        title,
        style: const TextStyle(color: Color(0xFF64748B), fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1),
      ),
    );
  }

  Widget _buildSwitchTile(String title, String subtitle, bool value, ValueChanged<bool> onChanged) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      child: Material(
        color: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: Color(0xFF334155)),
        ),
        clipBehavior: Clip.antiAlias,
        child: SwitchListTile(
          title: Text(title, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
          subtitle: Text(subtitle, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
          value: value,
          activeColor: const Color(0xFF4F46E5),
          onChanged: onChanged,
        ),
      ),
    );
  }

  Widget _buildActionTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      child: Material(
        color: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: Color(0xFF334155)),
        ),
        clipBehavior: Clip.antiAlias,
        child: ListTile(
          leading: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.15),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          title: Text(title, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
          subtitle: Text(subtitle, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
          trailing: const Icon(Icons.arrow_forward_ios, color: Color(0xFF64748B), size: 14),
          onTap: onTap,
        ),
      ),
    );
  }
}

/// 3. Demo Custom Bottom Sheet Widget
/// Represents a pre-existing custom modal bottom sheet in a Flutter app
class CustomDemoBottomSheet extends StatelessWidget {
  const CustomDemoBottomSheet({super.key});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Container(
        margin: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: const Color(0xFF334155), width: 1.5),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.5),
              blurRadius: 20,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Drag handle
            Center(
              child: Container(
                width: 44,
                height: 5,
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: const Color(0xFF64748B),
                  borderRadius: BorderRadius.circular(3),
                ),
              ),
            ),

            // Header
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF4F46E5).withOpacity(0.2),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.dashboard_customize, color: Color(0xFF818CF8), size: 22),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Custom Project Bottom Sheet',
                        style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        'Triggered dynamically from Web Custom Dart Code',
                        style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: Color(0xFF94A3B8), size: 20),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),

            const SizedBox(height: 16),
            const Divider(color: Color(0xFF334155), height: 1),
            const SizedBox(height: 12),

            // Custom Sheet Actions
            _buildSheetOption(
              context,
              icon: Icons.share_rounded,
              title: 'Share Live Schema',
              subtitle: 'Broadcast link to connected devices',
              color: const Color(0xFF38BDF8),
              onTap: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Schema link copied to clipboard!'),
                    backgroundColor: Color(0xFF0284C7),
                    behavior: SnackBarBehavior.floating,
                  ),
                );
              },
            ),
            _buildSheetOption(
              context,
              icon: Icons.cloud_download_outlined,
              title: 'Export Dynamic UI JSON',
              subtitle: 'Download the current validated schema file',
              color: const Color(0xFF10B981),
              onTap: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Exporting schema JSON payload...'),
                    backgroundColor: Color(0xFF10B981),
                    behavior: SnackBarBehavior.floating,
                  ),
                );
              },
            ),
            _buildSheetOption(
              context,
              icon: Icons.star_outline_rounded,
              title: 'Save to Preset Favorites',
              subtitle: 'Bookmark layout for instant reload',
              color: const Color(0xFFF59E0B),
              onTap: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Added current screen to Favorites!'),
                    backgroundColor: Color(0xFFF59E0B),
                    behavior: SnackBarBehavior.floating,
                  ),
                );
              },
            ),

            const SizedBox(height: 16),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF334155),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () => Navigator.pop(context),
                child: const Text('Dismiss Sheet', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSheetOption(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withOpacity(0.15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, color: color, size: 20),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                  Text(subtitle, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios, color: Color(0xFF64748B), size: 14),
          ],
        ),
      ),
    );
  }
}

/// 4. Generic Project Screen (Fallback for any custom route written by the user)
/// Allows developers in real projects to type ANY custom route (e.g. '/orders', '/checkout', '/wallet')
/// and see it open successfully with arguments displayed, without crashing!
class GenericProjectScreen extends StatelessWidget {
  final String routeName;
  final dynamic arguments;

  const GenericProjectScreen({
    super.key,
    required this.routeName,
    this.arguments,
  });

  @override
  Widget build(BuildContext context) {
    final args = arguments ?? ModalRoute.of(context)?.settings.arguments;

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white, size: 20),
          onPressed: () => Navigator.maybePop(context),
        ),
        title: Text(
          routeName,
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
        ),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: const Color(0xFF4F46E5).withOpacity(0.15),
                  shape: BoxShape.circle,
                  border: Border.all(color: const Color(0xFF4F46E5), width: 2),
                ),
                child: const Icon(Icons.explore_outlined, color: Color(0xFF818CF8), size: 48),
              ),
              const SizedBox(height: 20),
              Text(
                'Opened Route: "$routeName"',
                style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              const Text(
                'Real Project Navigation Successful',
                style: TextStyle(color: Color(0xFF10B981), fontSize: 13, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 20),
              if (args != null) ...[
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFF334155)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Passed Arguments:', style: TextStyle(color: Color(0xFF818CF8), fontSize: 12, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 6),
                      Text(args.toString(), style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 13, fontFamily: 'monospace')),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
              ],
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF4F46E5),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  icon: const Icon(Icons.arrow_back, color: Colors.white, size: 18),
                  label: const Text('Back to Generative Screen', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  onPressed: () => Navigator.maybePop(context),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

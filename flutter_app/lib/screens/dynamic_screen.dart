import 'package:flutter/material.dart';
import '../genui_guard/genui_guard.dart';

class DynamicScreen extends StatefulWidget {
  const DynamicScreen({super.key});

  @override
  State<DynamicScreen> createState() => _DynamicScreenState();
}

class _DynamicScreenState extends State<DynamicScreen> {
  late GenUiSyncClient _syncClient;
  UiSchema _currentSchema = UiSchema.empty();
  bool _isGuardedMode = true;
  String _serverUrl = '';
  int _lastRenderDurationMs = 0;
  final List<String> _isolatedErrors = [];

  @override
  void initState() {
    super.initState();
    _initServerUrl();
    _syncClient = GenUiSyncClient(serverBaseUrl: _serverUrl);
    _syncClient.schemaStream.listen(_onSchemaUpdated);
    _syncClient.start();
  }

  void _initServerUrl() {
    // Defaults to localhost:8080 (works with adb reverse tcp:8080 tcp:8080 and local machine)
    _serverUrl = 'http://localhost:8080';
  }

  void _onSchemaUpdated(UiSchema newSchema) {
    final stopwatch = Stopwatch()..start();
    setState(() {
      _currentSchema = newSchema;
      _isolatedErrors.clear();
    });
    stopwatch.stop();
    _lastRenderDurationMs = stopwatch.elapsedMilliseconds;
  }

  void _showConnectionDialog() {
    final controller = TextEditingController(text: _serverUrl);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text('Configure Sync Server URL', style: TextStyle(color: Colors.white)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              '• Android Emulator: http://10.0.2.2:8080\n• Real Android Device: http://<YOUR_LAN_IP>:8080\n• macOS / Desktop: http://localhost:8080',
              style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12.0),
            ),
            const SizedBox(height: 12.0),
            TextField(
              controller: controller,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                filled: true,
                fillColor: const Color(0xFF0F172A),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8.0)),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              setState(() {
                _serverUrl = controller.text.trim();
              });
              Navigator.pop(ctx);
              _syncClient.dispose();
              _syncClient = GenUiSyncClient(serverBaseUrl: _serverUrl);
              _syncClient.schemaStream.listen(_onSchemaUpdated);
              _syncClient.start();
            },
            child: const Text('Connect'),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _syncClient.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = _currentSchema.theme;
    final header = _currentSchema.header;

    return Scaffold(
      backgroundColor: theme.backgroundColor,
      appBar: AppBar(
        backgroundColor: theme.surfaceColor,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              header.title,
              style: TextStyle(
                color: theme.textPrimary,
                fontSize: 16.0,
                fontWeight: FontWeight.w700,
              ),
            ),
            if (header.subtitle.isNotEmpty)
              Text(
                header.subtitle,
                style: TextStyle(
                  color: theme.textSecondary,
                  fontSize: 11.0,
                ),
              ),
          ],
        ),
        actions: [
          // Mode Toggle (Guarded vs Naive)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 6.0),
            child: Row(
              children: [
                Icon(
                  _isGuardedMode ? Icons.shield : Icons.gpp_bad,
                  color: _isGuardedMode ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                  size: 18.0,
                ),
                const SizedBox(width: 4.0),
                Text(
                  _isGuardedMode ? 'GUARDED' : 'NAIVE',
                  style: TextStyle(
                    color: _isGuardedMode ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                    fontSize: 10.0,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                Switch(
                  value: _isGuardedMode,
                  activeColor: const Color(0xFF10B981),
                  activeTrackColor: const Color(0xFF10B981).withOpacity(0.3),
                  inactiveThumbColor: const Color(0xFFEF4444),
                  inactiveTrackColor: const Color(0xFFEF4444).withOpacity(0.3),
                  onChanged: (val) {
                    setState(() {
                      _isGuardedMode = val;
                    });
                  },
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.settings_ethernet, color: Color(0xFF94A3B8)),
            tooltip: 'Sync Settings',
            onPressed: _showConnectionDialog,
          ),
        ],
      ),
      body: Column(
        children: [
          // Live Sync Status Banner
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 6.0),
            color: const Color(0xFF0F172A),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      width: 8.0,
                      height: 8.0,
                      decoration: const BoxDecoration(
                        color: Color(0xFF10B981),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 8.0),
                    Text(
                      'Live Sync v${_currentSchema.version}',
                      style: const TextStyle(
                        color: Color(0xFF94A3B8),
                        fontSize: 11.0,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                Text(
                  'Render: ${_lastRenderDurationMs}ms | Nodes: ${_currentSchema.components.length}',
                  style: const TextStyle(
                    color: Color(0xFF64748B),
                    fontSize: 11.0,
                  ),
                ),
              ],
            ),
          ),

          // Dynamic Component Feed
          Expanded(
            child: _currentSchema.components.isEmpty
                ? Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const CircularProgressIndicator(),
                        const SizedBox(height: 16.0),
                        Text(
                          'Awaiting schema from Web Dashboard...\n($_serverUrl)',
                          textAlign: TextAlign.center,
                          style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12.0),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(14.0),
                    itemCount: _currentSchema.components.length,
                    itemBuilder: (context, index) {
                      final node = _currentSchema.components[index];
                      return SafeWidgetRegistry.buildNode(
                        node: node,
                        theme: theme,
                        isGuarded: _isGuardedMode,
                        onAction: (actionId) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Triggered Action: "$actionId"'),
                              duration: const Duration(seconds: 1),
                            ),
                          );
                        },
                        onError: (compId, err) {
                          if (!_isolatedErrors.contains(compId)) {
                            _isolatedErrors.add(compId);
                          }
                        },
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}

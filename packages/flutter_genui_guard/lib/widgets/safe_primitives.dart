import 'package:flutter/material.dart';
import '../models/ui_schema.dart';
import '../registry/widget_registry.dart';
import '../state/form_registry.dart';
import '../state/data_binding.dart';

/// Helper to map string icon names to standard Material Icons safely
IconData getMaterialIcon(String? name) {
  switch (name?.toLowerCase().trim()) {
    case 'star': return Icons.star;
    case 'favorite': case 'heart': return Icons.favorite;
    case 'settings': return Icons.settings;
    case 'check': return Icons.check;
    case 'info': return Icons.info_outline;
    case 'arrow_forward': return Icons.arrow_forward_ios;
    case 'notifications': return Icons.notifications;
    case 'person': case 'user': return Icons.person;
    case 'search': return Icons.search;
    case 'share': return Icons.share;
    case 'delete': return Icons.delete;
    case 'home': return Icons.home;
    case 'shopping_cart': return Icons.shopping_cart;
    case 'lock': return Icons.lock;
    case 'email': case 'mail': return Icons.email;
    case 'phone': case 'tel': return Icons.phone;
    case 'language': case 'web': case 'globe': return Icons.language;
    case 'location_on': case 'location': case 'place': case 'pin': case 'map': return Icons.location_on;
    case 'business': case 'company': case 'work': case 'domain': return Icons.business;
    case 'badge': case 'id': case 'tag': return Icons.badge;
    case 'attach_money': case 'money': case 'dollar': return Icons.attach_money;
    case 'sync': case 'refresh': return Icons.sync;
    case 'more_vert': return Icons.more_vert;
    case 'help': return Icons.help_outline;
    default: return Icons.widgets_outlined;
  }
}

/// Helper to parse text alignment safely
TextAlign parseTextAlign(dynamic align) {
  switch (align?.toString().toLowerCase().trim()) {
    case 'center': return TextAlign.center;
    case 'right': case 'end': return TextAlign.right;
    default: return TextAlign.left;
  }
}

/// Safe Dynamic Text Widget with clamped typography, overflow boundary & interactive click handler
class SafeGenUiText extends StatelessWidget {
  final ComponentNode node;
  final ThemeConfig theme;
  final Function(String actionId)? onAction;
  final Function(ComponentNode node)? onExecute;

  const SafeGenUiText({
    super.key,
    required this.node,
    required this.theme,
    this.onAction,
    this.onExecute,
  });

  @override
  Widget build(BuildContext context) {
    final text = node.properties['text']?.toString() ??
        node.properties['title']?.toString() ??
        'Dynamic Text';
    final align = parseTextAlign(node.properties['align']);
    final isBold = node.properties['is_bold'] == true || node.properties['bold'] == true;
    final rawSize = node.properties['font_size'] ?? node.properties['size'] ?? 15.0;
    final fontSize = (rawSize is num ? rawSize.toDouble() : 15.0).clamp(10.0, 36.0);
    final rawPadding = node.properties['padding'] ?? 4.0;
    final padding = (rawPadding is num ? rawPadding.toDouble() : 4.0).clamp(0.0, 48.0);
    final colorHex = node.properties['color'] ?? node.properties['text_color'];
    final color = colorHex != null
        ? parseHexColor(colorHex, theme.textPrimary)
        : theme.textPrimary;

    final hasCustomCode = (node.properties['custom_dart_code']?.toString().trim().isNotEmpty == true) ||
        (node.properties['onclick'] != null);
    final hasActionId = node.properties['action_id']?.toString().trim().isNotEmpty == true;
    final isInteractive = hasCustomCode || hasActionId;

    Widget textWidget = Padding(
      padding: EdgeInsets.symmetric(vertical: padding, horizontal: 4.0),
      child: Text(
        text,
        textAlign: align,
        maxLines: 6,
        overflow: TextOverflow.ellipsis,
        style: TextStyle(
          fontSize: fontSize,
          fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
          color: color,
          height: 1.35,
        ),
      ),
    );

    if (isInteractive) {
      return Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(6.0),
          onTap: () {
            if (onExecute != null) {
              onExecute!(node);
            } else {
              final actionId = node.properties['action_id']?.toString() ?? 'text_click';
              onAction?.call(actionId);
            }
          },
          child: textWidget,
        ),
      );
    }

    return textWidget;
  }
}

/// Safe Dynamic Image Widget with network fallback, boundary clipping & interactive click handler
class SafeGenUiImage extends StatelessWidget {
  final ComponentNode node;
  final ThemeConfig theme;
  final Function(String actionId)? onAction;
  final Function(ComponentNode node)? onExecute;

  const SafeGenUiImage({
    super.key,
    required this.node,
    required this.theme,
    this.onAction,
    this.onExecute,
  });

  @override
  Widget build(BuildContext context) {
    final url = node.properties['image_url']?.toString() ??
        node.properties['url']?.toString() ??
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80';
    final rawHeight = node.properties['height'] ?? 160.0;
    final height = (rawHeight is num ? rawHeight.toDouble() : 160.0).clamp(40.0, 500.0);
    final rawRadius = node.properties['border_radius'] ?? node.properties['radius'] ?? 12.0;
    final radius = (rawRadius is num ? rawRadius.toDouble() : 12.0).clamp(0.0, 40.0);
    final rawPadding = node.properties['padding'] ?? 6.0;
    final padding = (rawPadding is num ? rawPadding.toDouble() : 6.0).clamp(0.0, 48.0);

    final hasCustomCode = (node.properties['custom_dart_code']?.toString().trim().isNotEmpty == true) ||
        (node.properties['onclick'] != null);
    final hasActionId = node.properties['action_id']?.toString().trim().isNotEmpty == true;
    final isInteractive = hasCustomCode || hasActionId;

    Widget imageWidget = ClipRRect(
      borderRadius: BorderRadius.circular(radius),
      child: SizedBox(
        width: double.infinity,
        height: height,
        child: Image.network(
          url,
          fit: BoxFit.cover,
          loadingBuilder: (ctx, child, progress) {
            if (progress == null) return child;
            return Container(
              color: theme.surfaceColor,
              child: Center(
                child: SizedBox(
                  width: 24,
                  height: 24,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation(theme.primaryColor),
                  ),
                ),
              ),
            );
          },
          errorBuilder: (ctx, err, stack) {
            return Container(
              color: const Color(0xFF1E293B),
              padding: const EdgeInsets.all(16.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.broken_image_outlined, color: theme.primaryColor, size: 36),
                  const SizedBox(height: 6),
                  const Text(
                    '🛡 Guard Fallback: Image failed to load',
                    style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );

    if (isInteractive) {
      imageWidget = Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(radius),
          onTap: () {
            if (onExecute != null) {
              onExecute!(node);
            } else {
              final actionId = node.properties['action_id']?.toString() ?? 'image_click';
              onAction?.call(actionId);
            }
          },
          child: imageWidget,
        ),
      );
    }

    return Padding(
      padding: EdgeInsets.symmetric(vertical: padding),
      child: imageWidget,
    );
  }
}

/// Safe Dynamic TextField with custom theme styling
class SafeGenUiTextField extends StatelessWidget {
  final ComponentNode node;
  final ThemeConfig theme;

  const SafeGenUiTextField({super.key, required this.node, required this.theme});

  @override
  Widget build(BuildContext context) {
    final label = node.properties['label']?.toString();
    final hint = node.properties['hint']?.toString() ??
        node.properties['placeholder']?.toString() ??
        'Enter value...';
    final isPassword = node.properties['is_password'] == true;
    final rawMaxLines = node.properties['max_lines'];
    final maxLines = isPassword
        ? 1
        : (rawMaxLines is num ? rawMaxLines.toInt().clamp(1, 10) : 1);
    final rawPadding = node.properties['padding'] ?? 6.0;
    final padding = (rawPadding is num ? rawPadding.toDouble() : 6.0).clamp(0.0, 32.0);

    final controller = GenUiFormRegistry.instance.getController(
      node.id,
      label: label ?? 'Field',
    );

    return Padding(
      padding: EdgeInsets.symmetric(vertical: padding),
      child: TextField(
        controller: controller,
        obscureText: isPassword,
        maxLines: maxLines,
        style: TextStyle(color: theme.textPrimary, fontSize: 14.0),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: TextStyle(color: theme.textSecondary, fontSize: 13.0),
          hintText: hint,
          hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 13.0),
          filled: true,
          fillColor: const Color(0xFF1E293B),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 14.0),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10.0),
            borderSide: const BorderSide(color: Color(0xFF334155), width: 1.2),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10.0),
            borderSide: BorderSide(color: theme.primaryColor, width: 1.8),
          ),
        ),
      ),
    );
  }
}

/// Safe Dynamic ListTile Component
class SafeGenUiListTile extends StatelessWidget {
  final ComponentNode node;
  final ThemeConfig theme;
  final Function(String actionId)? onAction;
  final Function(ComponentNode node)? onExecute;

  const SafeGenUiListTile({
    super.key,
    required this.node,
    required this.theme,
    this.onAction,
    this.onExecute,
  });

  @override
  Widget build(BuildContext context) {
    final title = node.properties['title']?.toString() ??
        node.properties['label']?.toString() ??
        'List Item';
    final subtitle = node.properties['subtitle']?.toString();
    final leadingIconName = node.properties['leading_icon']?.toString() ??
        node.properties['icon']?.toString();
    final leadingImageUrl = node.properties['leading_image']?.toString() ??
        node.properties['avatar']?.toString() ??
        node.properties['avatar_url']?.toString() ??
        node.properties['image_url']?.toString();
    final trailingText = node.properties['trailing_text']?.toString();
    final trailingIconName = node.properties['trailing_icon']?.toString();
    final actionId = node.properties['action_id']?.toString() ?? 'tile_click';

    final customBg = node.properties['background_color'] != null
        ? parseHexColor(node.properties['background_color'], theme.surfaceColor)
        : theme.surfaceColor;

    Widget? leadingWidget;
    if (leadingImageUrl != null && leadingImageUrl.isNotEmpty) {
      leadingWidget = ClipRRect(
        borderRadius: BorderRadius.circular(node.properties['avatar_circular'] == false ? 8.0 : 20.0),
        child: Image.network(
          leadingImageUrl,
          width: 40,
          height: 40,
          fit: BoxFit.cover,
          errorBuilder: (_, __, ___) => Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: theme.primaryColor.withOpacity(0.15),
              borderRadius: BorderRadius.circular(node.properties['avatar_circular'] == false ? 8.0 : 20.0),
            ),
            child: Icon(getMaterialIcon(leadingIconName), color: theme.primaryColor, size: 20),
          ),
        ),
      );
    } else if (leadingIconName != null) {
      leadingWidget = Container(
        width: 38,
        height: 38,
        decoration: BoxDecoration(
          color: theme.primaryColor.withOpacity(0.15),
          borderRadius: BorderRadius.circular(8.0),
        ),
        child: Icon(getMaterialIcon(leadingIconName), color: theme.primaryColor, size: 20),
      );
    }

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Material(
        color: customBg,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12.0),
          side: BorderSide(color: theme.textSecondary.withOpacity(0.15), width: 1.0),
        ),
        clipBehavior: Clip.antiAlias,
        child: ListTile(
          onTap: () {
            if (onExecute != null) {
              onExecute!(node);
            } else if (onAction != null) {
              onAction!(actionId);
            }
          },
          leading: leadingWidget,
          title: Text(
            title,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(color: theme.textPrimary, fontWeight: FontWeight.w600, fontSize: 14.0),
          ),
          subtitle: subtitle != null
              ? Text(
                  subtitle,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(color: theme.textSecondary, fontSize: 12.0),
                )
              : null,
          trailing: trailingText != null
              ? Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 4.0),
                  decoration: BoxDecoration(
                    color: theme.primaryColor.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(6.0),
                  ),
                  child: Text(
                    trailingText,
                    style: TextStyle(color: theme.primaryColor, fontSize: 11.0, fontWeight: FontWeight.bold),
                  ),
                )
              : (trailingIconName != null
                  ? Icon(getMaterialIcon(trailingIconName), color: theme.textSecondary, size: 18)
                  : Icon(Icons.arrow_forward_ios, color: theme.textSecondary.withOpacity(0.6), size: 14)),
        ),
      ),
    );
  }
}

/// Safe Dynamic Chip Component with selectable local state.
/// The selection is registered in [GenUiFormRegistry] so it is included in
/// form submissions (e.g. a "rating" chip in the Feedback & Review screen).
class SafeGenUiChip extends StatefulWidget {
  final ComponentNode node;
  final ThemeConfig theme;
  final Function(String actionId)? onAction;

  const SafeGenUiChip({
    super.key,
    required this.node,
    required this.theme,
    this.onAction,
  });

  @override
  State<SafeGenUiChip> createState() => _SafeGenUiChipState();
}

class _SafeGenUiChipState extends State<SafeGenUiChip> {
  late bool _isSelected;

  String get _label =>
      widget.node.properties['label']?.toString() ??
      widget.node.properties['text']?.toString() ??
      'Chip Tag';

  @override
  void initState() {
    super.initState();
    _isSelected = widget.node.properties['is_selected'] == true ||
        widget.node.properties['selected'] == true;
    GenUiFormRegistry.instance.setValue(widget.node.id, _isSelected, label: _label);
  }

  @override
  void didUpdateWidget(covariant SafeGenUiChip oldWidget) {
    super.didUpdateWidget(oldWidget);
    final wasSelected = oldWidget.node.properties['is_selected'] == true ||
        oldWidget.node.properties['selected'] == true;
    final nowSelected = widget.node.properties['is_selected'] == true ||
        widget.node.properties['selected'] == true;
    if (wasSelected != nowSelected) {
      _isSelected = nowSelected;
      GenUiFormRegistry.instance.setValue(widget.node.id, _isSelected, label: _label);
    }
  }

  @override
  Widget build(BuildContext context) {
    final node = widget.node;
    final theme = widget.theme;
    final label = _label;
    final isSelected = _isSelected;
    final iconName = node.properties['icon']?.toString();
    final actionId = node.properties['action_id']?.toString() ?? 'chip_click';

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4.0, vertical: 4.0),
      child: ActionChip(
        onPressed: () {
          setState(() => _isSelected = !_isSelected);
          GenUiFormRegistry.instance.setValue(node.id, _isSelected, label: label);
          // Only forward explicit actions; plain chips act as selectable tags.
          if (node.properties['action_id'] != null) {
            widget.onAction?.call(actionId);
          }
        },
        avatar: iconName != null
            ? Icon(
                getMaterialIcon(iconName),
                size: 16,
                color: isSelected ? Colors.white : theme.primaryColor,
              )
            : null,
        label: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : theme.textPrimary,
            fontSize: 12.0,
            fontWeight: FontWeight.w600,
          ),
        ),
        backgroundColor: isSelected ? theme.primaryColor : const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20.0),
          side: BorderSide(
            color: isSelected ? theme.primaryColor : const Color(0xFF334155),
            width: 1.2,
          ),
        ),
      ),
    );
  }
}

/// Safe Dynamic Switch Toggle Component with local interactive state
class SafeGenUiSwitch extends StatefulWidget {
  final ComponentNode node;
  final ThemeConfig theme;

  const SafeGenUiSwitch({super.key, required this.node, required this.theme});

  @override
  State<SafeGenUiSwitch> createState() => _SafeGenUiSwitchState();
}

class _SafeGenUiSwitchState extends State<SafeGenUiSwitch> {
  late bool _isChecked;

  @override
  void initState() {
    super.initState();
    _isChecked = widget.node.properties['is_checked'] == true ||
        widget.node.properties['value'] == true ||
        widget.node.properties['checked'] == true;
    final label = widget.node.properties['label']?.toString() ??
        widget.node.properties['title']?.toString() ??
        'Toggle Switch';
    GenUiFormRegistry.instance.setValue(widget.node.id, _isChecked, label: label);
  }

  @override
  Widget build(BuildContext context) {
    final label = widget.node.properties['label']?.toString() ??
        widget.node.properties['title']?.toString() ??
        'Toggle Switch';
    final subtitle = widget.node.properties['subtitle']?.toString();

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Material(
        color: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12.0),
          side: const BorderSide(color: Color(0xFF334155), width: 1.0),
        ),
        clipBehavior: Clip.antiAlias,
        child: SwitchListTile(
          title: Text(label, style: TextStyle(color: widget.theme.textPrimary, fontSize: 14.0, fontWeight: FontWeight.w600)),
          subtitle: subtitle != null
              ? Text(subtitle, style: TextStyle(color: widget.theme.textSecondary, fontSize: 12.0))
              : null,
          value: _isChecked,
          activeColor: widget.theme.primaryColor,
          onChanged: (val) {
            setState(() => _isChecked = val);
            GenUiFormRegistry.instance.setValue(widget.node.id, val, label: label);
          },
        ),
      ),
    );
  }
}

/// Safe Dynamic Checkbox Component with local interactive state
class SafeGenUiCheckbox extends StatefulWidget {
  final ComponentNode node;
  final ThemeConfig theme;

  const SafeGenUiCheckbox({super.key, required this.node, required this.theme});

  @override
  State<SafeGenUiCheckbox> createState() => _SafeGenUiCheckboxState();
}

class _SafeGenUiCheckboxState extends State<SafeGenUiCheckbox> {
  late bool _isChecked;

  @override
  void initState() {
    super.initState();
    _isChecked = widget.node.properties['is_checked'] == true ||
        widget.node.properties['value'] == true ||
        widget.node.properties['checked'] == true;
    final label = widget.node.properties['label']?.toString() ??
        widget.node.properties['title']?.toString() ??
        'Checkbox Option';
    GenUiFormRegistry.instance.setValue(widget.node.id, _isChecked, label: label);
  }

  @override
  Widget build(BuildContext context) {
    final label = widget.node.properties['label']?.toString() ??
        widget.node.properties['title']?.toString() ??
        'Checkbox Option';
    final subtitle = widget.node.properties['subtitle']?.toString();

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Material(
        color: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12.0),
          side: const BorderSide(color: Color(0xFF334155), width: 1.0),
        ),
        clipBehavior: Clip.antiAlias,
        child: CheckboxListTile(
          title: Text(label, style: TextStyle(color: widget.theme.textPrimary, fontSize: 14.0, fontWeight: FontWeight.w600)),
          subtitle: subtitle != null
              ? Text(subtitle, style: TextStyle(color: widget.theme.textSecondary, fontSize: 12.0))
              : null,
          value: _isChecked,
          activeColor: widget.theme.primaryColor,
          checkColor: Colors.white,
          controlAffinity: ListTileControlAffinity.leading,
          onChanged: (val) {
            final checked = val ?? false;
            setState(() => _isChecked = checked);
            GenUiFormRegistry.instance.setValue(widget.node.id, checked, label: label);
          },
        ),
      ),
    );
  }
}

/// Safe Dynamic Radio Component with local interactive state
class SafeGenUiRadio extends StatefulWidget {
  final ComponentNode node;
  final ThemeConfig theme;

  const SafeGenUiRadio({super.key, required this.node, required this.theme});

  @override
  State<SafeGenUiRadio> createState() => _SafeGenUiRadioState();
}

class _SafeGenUiRadioState extends State<SafeGenUiRadio> {
  late bool _isSelected;

  @override
  void initState() {
    super.initState();
    _isSelected = widget.node.properties['is_selected'] == true ||
        widget.node.properties['selected'] == true;
  }

  @override
  Widget build(BuildContext context) {
    final label = widget.node.properties['label']?.toString() ??
        widget.node.properties['title']?.toString() ??
        'Radio Option';
    final subtitle = widget.node.properties['subtitle']?.toString();

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Material(
        color: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12.0),
          side: const BorderSide(color: Color(0xFF334155), width: 1.0),
        ),
        clipBehavior: Clip.antiAlias,
        child: RadioListTile<bool>(
          title: Text(label, style: TextStyle(color: widget.theme.textPrimary, fontSize: 14.0, fontWeight: FontWeight.w600)),
          subtitle: subtitle != null
              ? Text(subtitle, style: TextStyle(color: widget.theme.textSecondary, fontSize: 12.0))
              : null,
          value: true,
          groupValue: _isSelected ? true : false,
          activeColor: widget.theme.primaryColor,
          onChanged: (val) {
            setState(() => _isSelected = !_isSelected);
          },
        ),
      ),
    );
  }
}

/// Safe Dynamic Icon Component with interactive click handler
class SafeGenUiIcon extends StatelessWidget {
  final ComponentNode node;
  final ThemeConfig theme;
  final Function(String actionId)? onAction;
  final Function(ComponentNode node)? onExecute;

  const SafeGenUiIcon({
    super.key,
    required this.node,
    required this.theme,
    this.onAction,
    this.onExecute,
  });

  @override
  Widget build(BuildContext context) {
    final name = node.properties['icon']?.toString() ??
        node.properties['name']?.toString() ??
        'star';
    final rawSize = node.properties['size'] ?? 24.0;
    final size = (rawSize is num ? rawSize.toDouble() : 24.0).clamp(12.0, 72.0);
    final colorHex = node.properties['color'];
    final color = colorHex != null
        ? parseHexColor(colorHex, theme.primaryColor)
        : theme.primaryColor;
    final align = parseTextAlign(node.properties['align']);

    final hasCustomCode = (node.properties['custom_dart_code']?.toString().trim().isNotEmpty == true) ||
        (node.properties['onclick'] != null);
    final hasActionId = node.properties['action_id']?.toString().trim().isNotEmpty == true;
    final isInteractive = hasCustomCode || hasActionId;

    Alignment widgetAlignment = Alignment.centerLeft;
    if (align == TextAlign.center) widgetAlignment = Alignment.center;
    if (align == TextAlign.right) widgetAlignment = Alignment.centerRight;

    Widget iconWidget = Icon(getMaterialIcon(name), size: size, color: color);

    if (isInteractive) {
      iconWidget = Material(
        color: Colors.transparent,
        child: InkResponse(
          radius: (size / 2) + 12,
          onTap: () {
            if (onExecute != null) {
              onExecute!(node);
            } else {
              final actionId = node.properties['action_id']?.toString() ?? 'icon_click';
              onAction?.call(actionId);
            }
          },
          child: Padding(
            padding: const EdgeInsets.all(4.0),
            child: iconWidget,
          ),
        ),
      );
    } else {
      iconWidget = Padding(
        padding: const EdgeInsets.all(4.0),
        child: iconWidget,
      );
    }

    return Align(
      alignment: widgetAlignment,
      child: iconWidget,
    );
  }
}

/// Safe Dynamic Divider Component
class SafeGenUiDivider extends StatelessWidget {
  final ComponentNode node;
  final ThemeConfig theme;

  const SafeGenUiDivider({super.key, required this.node, required this.theme});

  @override
  Widget build(BuildContext context) {
    final rawThickness = node.properties['thickness'] ?? 1.0;
    final thickness = (rawThickness is num ? rawThickness.toDouble() : 1.0).clamp(0.5, 10.0);
    final rawPadding = node.properties['padding'] ?? 8.0;
    final padding = (rawPadding is num ? rawPadding.toDouble() : 8.0).clamp(0.0, 48.0);
    final colorHex = node.properties['color'];
    final color = colorHex != null
        ? parseHexColor(colorHex, const Color(0xFF334155))
        : const Color(0xFF334155);

    return Padding(
      padding: EdgeInsets.symmetric(vertical: padding),
      child: Divider(thickness: thickness, color: color),
    );
  }
}

/// Safe Dynamic Spacer / SizedBox with negative height / width protection
class SafeGenUiSpacer extends StatelessWidget {
  final ComponentNode node;

  const SafeGenUiSpacer({super.key, required this.node});

  @override
  Widget build(BuildContext context) {
    final rawH = node.properties['height'] ?? 16.0;
    final rawW = node.properties['width'] ?? 0.0;
    final height = (rawH is num ? rawH.toDouble() : 16.0).clamp(0.0, 300.0);
    final width = (rawW is num ? rawW.toDouble() : 0.0).clamp(0.0, 300.0);

    return SizedBox(height: height, width: width);
  }
}

MainAxisAlignment parseMainAxisAlignment(dynamic val, {MainAxisAlignment fallback = MainAxisAlignment.start}) {
  switch (val?.toString().toLowerCase().trim()) {
    case 'center': return MainAxisAlignment.center;
    case 'end': return MainAxisAlignment.end;
    case 'spacebetween': case 'space_between': return MainAxisAlignment.spaceBetween;
    case 'spacearound': case 'space_around': return MainAxisAlignment.spaceAround;
    case 'spaceevenly': case 'space_evenly': return MainAxisAlignment.spaceEvenly;
    case 'start': return MainAxisAlignment.start;
    default: return fallback;
  }
}

CrossAxisAlignment parseCrossAxisAlignment(dynamic val, {CrossAxisAlignment fallback = CrossAxisAlignment.center}) {
  switch (val?.toString().toLowerCase().trim()) {
    case 'start': return CrossAxisAlignment.start;
    case 'end': return CrossAxisAlignment.end;
    case 'stretch': return CrossAxisAlignment.stretch;
    case 'center': return CrossAxisAlignment.center;
    default: return fallback;
  }
}

/// Safe Dynamic Layout Container (Row and Column with recursive children)
class SafeGenUiLayoutContainer extends StatelessWidget {
  final ComponentNode node;
  final ThemeConfig theme;
  final bool isGuarded;
  final Function(String actionId)? onAction;
  final Function(ComponentNode node)? onExecute;
  final Function(String componentId, String error)? onError;

  const SafeGenUiLayoutContainer({
    super.key,
    required this.node,
    required this.theme,
    this.isGuarded = true,
    this.onAction,
    this.onExecute,
    this.onError,
  });

  @override
  Widget build(BuildContext context) {
    final isRow = node.type == 'row' || node.type == 'layout_row';
    final children = node.children;

    if (children.isEmpty) {
      return const SizedBox.shrink();
    }

    final rawPadding = node.properties['padding'] ?? 4.0;
    final padding = (rawPadding is num ? rawPadding.toDouble() : 4.0).clamp(0.0, 32.0);

    final builtChildren = children.map((childNode) {
      final childWidget = SafeWidgetRegistry.buildNode(
        node: childNode,
        theme: theme,
        isGuarded: isGuarded,
        onAction: onAction,
        onExecute: onExecute,
        onError: onError,
      );

      // In a guarded Row, wrap child with Flexible so runaway text never causes RenderFlex overflow!
      if (isRow && isGuarded) {
        return Flexible(
          fit: FlexFit.loose,
          child: childWidget,
        );
      }
      return childWidget;
    }).toList();

    if (isRow) {
      return Padding(
        padding: EdgeInsets.symmetric(vertical: padding),
        child: Row(
          mainAxisAlignment: parseMainAxisAlignment(
            node.properties['main_axis_alignment'],
            fallback: MainAxisAlignment.spaceBetween,
          ),
          crossAxisAlignment: parseCrossAxisAlignment(
            node.properties['cross_axis_alignment'],
            fallback: CrossAxisAlignment.center,
          ),
          children: builtChildren,
        ),
      );
    }

    return Padding(
      padding: EdgeInsets.symmetric(vertical: padding),
      child: Column(
        mainAxisAlignment: parseMainAxisAlignment(
          node.properties['main_axis_alignment'],
          fallback: MainAxisAlignment.start,
        ),
        crossAxisAlignment: parseCrossAxisAlignment(
          node.properties['cross_axis_alignment'],
          fallback: CrossAxisAlignment.stretch,
        ),
        mainAxisSize: MainAxisSize.min,
        children: builtChildren,
      ),
    );
  }
}

Alignment parseAlignment(dynamic val, {Alignment fallback = Alignment.topLeft}) {
  switch (val?.toString().toLowerCase().trim()) {
    case 'topleft': case 'top_left': return Alignment.topLeft;
    case 'topcenter': case 'top_center': return Alignment.topCenter;
    case 'topright': case 'top_right': return Alignment.topRight;
    case 'centerleft': case 'center_left': return Alignment.centerLeft;
    case 'center': return Alignment.center;
    case 'centerright': case 'center_right': return Alignment.centerRight;
    case 'bottomleft': case 'bottom_left': return Alignment.bottomLeft;
    case 'bottomcenter': case 'bottom_center': return Alignment.bottomCenter;
    case 'bottomright': case 'bottom_right': return Alignment.bottomRight;
    default: return fallback;
  }
}

/// Safe Dynamic Container with rich decoration properties (background, border, radius, padding, margin)
class SafeGenUiContainer extends StatelessWidget {
  final ComponentNode node;
  final ThemeConfig theme;
  final bool isGuarded;
  final Function(String actionId)? onAction;
  final Function(ComponentNode node)? onExecute;
  final Function(String componentId, String error)? onError;

  const SafeGenUiContainer({
    super.key,
    required this.node,
    required this.theme,
    this.isGuarded = true,
    this.onAction,
    this.onExecute,
    this.onError,
  });

  @override
  Widget build(BuildContext context) {
    final rawBg = node.properties['background_color'] ?? node.properties['color'];
    final bgColor = rawBg != null ? parseHexColor(rawBg, Colors.transparent) : null;

    final rawBorderColor = node.properties['border_color'];
    final borderColor = rawBorderColor != null ? parseHexColor(rawBorderColor, theme.surfaceColor) : null;

    final rawBorderWidth = node.properties['border_width'];
    final borderWidth = (rawBorderWidth is num ? rawBorderWidth.toDouble() : 0.0).clamp(0.0, 32.0);

    final rawBorderRadius = node.properties['border_radius'];
    final borderRadius = (rawBorderRadius is num ? rawBorderRadius.toDouble() : 0.0).clamp(0.0, 100.0);

    final rawPadding = node.properties['padding'];
    final padding = rawPadding is num
        ? EdgeInsets.all((rawPadding.toDouble()).clamp(0.0, 100.0))
        : (rawPadding != null ? const EdgeInsets.all(12.0) : EdgeInsets.zero);

    final rawMargin = node.properties['margin'];
    final margin = rawMargin is num
        ? EdgeInsets.all((rawMargin.toDouble()).clamp(0.0, 100.0))
        : (rawMargin != null ? const EdgeInsets.symmetric(vertical: 4.0) : EdgeInsets.zero);

    final rawW = node.properties['width'];
    final double? width = (rawW is num)
        ? rawW.toDouble()
        : (rawW == '100%' || rawW == 'infinity' ? double.infinity : null);

    final rawH = node.properties['height'];
    final double? height = (rawH is num) ? rawH.toDouble() : null;

    final alignment = node.properties.containsKey('alignment')
        ? parseAlignment(node.properties['alignment'], fallback: Alignment.topLeft)
        : null;

    final decoration = BoxDecoration(
      color: bgColor,
      borderRadius: borderRadius > 0 ? BorderRadius.circular(borderRadius) : null,
      border: (borderColor != null || borderWidth > 0)
          ? Border.all(
              color: borderColor ?? theme.surfaceColor,
              width: borderWidth > 0 ? borderWidth : 1.0,
            )
          : null,
    );

    // Build children
    final children = node.children;
    Widget? childWidget;

    if (children.length == 1) {
      childWidget = SafeWidgetRegistry.buildNode(
        node: children.first,
        theme: theme,
        isGuarded: isGuarded,
        onAction: onAction,
        onExecute: onExecute,
        onError: onError,
      );
    } else if (children.length > 1) {
      final builtChildren = children.map((c) => SafeWidgetRegistry.buildNode(
        node: c,
        theme: theme,
        isGuarded: isGuarded,
        onAction: onAction,
        onExecute: onExecute,
        onError: onError,
      )).toList();

      childWidget = Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: builtChildren,
      );
    }

    final actId = node.properties['action_id']?.toString();
    final hasCode = node.properties['custom_dart_code'] != null;

    if ((actId != null && actId.isNotEmpty) || hasCode) {
      childWidget = InkWell(
        onTap: () {
          if (hasCode && onExecute != null) {
            onExecute!(node);
          } else if (actId != null && actId.isNotEmpty && onAction != null) {
            onAction!(actId);
          }
        },
        borderRadius: borderRadius > 0 ? BorderRadius.circular(borderRadius) : null,
        child: childWidget ?? const SizedBox.shrink(),
      );
    }

    return Container(
      width: width,
      height: height,
      margin: margin,
      padding: padding,
      alignment: alignment,
      decoration: decoration,
      child: childWidget,
    );
  }
}

/// Safe Dynamic Stack widget supporting layered z-index order and Positioned coordinates
class SafeGenUiStack extends StatelessWidget {
  final ComponentNode node;
  final ThemeConfig theme;
  final bool isGuarded;
  final Function(String actionId)? onAction;
  final Function(ComponentNode node)? onExecute;
  final Function(String componentId, String error)? onError;

  const SafeGenUiStack({
    super.key,
    required this.node,
    required this.theme,
    this.isGuarded = true,
    this.onAction,
    this.onExecute,
    this.onError,
  });

  @override
  Widget build(BuildContext context) {
    final children = node.children;
    if (children.isEmpty) {
      return const SizedBox.shrink();
    }

    final alignment = parseAlignment(node.properties['alignment'], fallback: Alignment.topLeft);
    final fit = node.properties['fit'] == 'expand' ? StackFit.expand : StackFit.loose;
    final clipBehavior = node.properties['clip'] == 'none' ? Clip.none : Clip.hardEdge;

    final rawW = node.properties['width'];
    final double? width = (rawW is num)
        ? rawW.toDouble()
        : (rawW == '100%' || rawW == 'infinity' ? double.infinity : null);

    final rawH = node.properties['height'];
    final double? height = (rawH is num) ? rawH.toDouble() : null;

    final builtChildren = children.map((childNode) {
      final childWidget = SafeWidgetRegistry.buildNode(
        node: childNode,
        theme: theme,
        isGuarded: isGuarded,
        onAction: onAction,
        onExecute: onExecute,
        onError: onError,
      );

      final props = childNode.properties;
      final isPositioned = props['is_positioned'] == true ||
          props.containsKey('top') ||
          props.containsKey('bottom') ||
          props.containsKey('left') ||
          props.containsKey('right');

      if (isPositioned) {
        final top = (props['top'] is num) ? (props['top'] as num).toDouble() : null;
        final bottom = (props['bottom'] is num) ? (props['bottom'] as num).toDouble() : null;
        final left = (props['left'] is num) ? (props['left'] as num).toDouble() : null;
        final right = (props['right'] is num) ? (props['right'] as num).toDouble() : null;
        final w = (props['width'] is num) ? (props['width'] as num).toDouble() : null;
        final h = (props['height'] is num) ? (props['height'] as num).toDouble() : null;

        return Positioned(
          top: top,
          bottom: bottom,
          left: left,
          right: right,
          width: w,
          height: h,
          child: childWidget,
        );
      }

      return childWidget;
    }).toList();

    Widget stackWidget = Stack(
      alignment: alignment,
      fit: fit,
      clipBehavior: clipBehavior,
      children: builtChildren,
    );

    if (height != null || width != null) {
      return SizedBox(
        width: width,
        height: height,
        child: stackWidget,
      );
    }

    return stackWidget;
  }
}

/// Safe Dynamic ListView Component with dynamic repeating item templates,
/// nested data path evaluation, empty state fallback, and pagination spinner.
class SafeGenUiListView extends StatelessWidget {
  final ComponentNode node;
  final ThemeConfig theme;
  final bool isGuarded;
  final Function(String actionId)? onAction;
  final Function(ComponentNode node)? onExecute;
  final Function(String componentId, String error)? onError;

  const SafeGenUiListView({
    super.key,
    required this.node,
    required this.theme,
    this.isGuarded = true,
    this.onAction,
    this.onExecute,
    this.onError,
  });

  @override
  Widget build(BuildContext context) {
    // 1. Resolve list items
    List<dynamic> items = [];
    final rawItems = node.properties['items'] ?? node.properties['data'];
    if (rawItems is List) {
      items = rawItems;
    }

    // 2. Item template or fallback children
    final itemTemplate = node.itemTemplate;
    final shrinkWrap = node.properties['shrink_wrap'] != false; // default true to avoid unbounded height in scrollable parents
    final isScrollable = node.properties['scrollable'] == true;
    final isPaginating = node.properties['is_paginating'] == true;
    final emptyText = node.emptyText;
    final rawPadding = node.properties['padding'] ?? 8.0;
    final padding = (rawPadding is num ? rawPadding.toDouble() : 8.0).clamp(0.0, 48.0);
    final rawSpacing = node.properties['spacing'] ?? 6.0;
    final spacing = (rawSpacing is num ? rawSpacing.toDouble() : 6.0).clamp(0.0, 40.0);

    // If items is empty and no children defined
    if (items.isEmpty && node.children.isEmpty) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 36.0, horizontal: 20.0),
        alignment: Alignment.center,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.inbox_outlined, size: 42, color: theme.textSecondary.withOpacity(0.5)),
            const SizedBox(height: 10),
            Text(
              emptyText,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: theme.textSecondary,
                fontSize: 14.0,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      );
    }

    // If items is empty but children are provided (static mode)
    if (items.isEmpty && node.children.isNotEmpty) {
      return ListView.separated(
        shrinkWrap: shrinkWrap,
        physics: isScrollable ? const BouncingScrollPhysics() : const NeverScrollableScrollPhysics(),
        padding: EdgeInsets.all(padding),
        itemCount: node.children.length,
        separatorBuilder: (_, __) => SizedBox(height: spacing),
        itemBuilder: (context, index) {
          return SafeWidgetRegistry.buildNode(
            node: node.children[index],
            theme: theme,
            isGuarded: isGuarded,
            onAction: onAction,
            onExecute: onExecute,
            onError: onError,
          );
        },
      );
    }

    // Dynamic item repeating mode
    final totalCount = items.length + (isPaginating ? 1 : 0);

    return ListView.separated(
      shrinkWrap: shrinkWrap,
      physics: isScrollable ? const BouncingScrollPhysics() : const NeverScrollableScrollPhysics(),
      padding: EdgeInsets.all(padding),
      itemCount: totalCount,
      separatorBuilder: (_, __) => SizedBox(height: spacing),
      itemBuilder: (context, index) {
        // Pagination indicator at the bottom
        if (index >= items.length) {
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 16.0),
            child: Center(
              child: SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(
                  strokeWidth: 2.5,
                  valueColor: AlwaysStoppedAnimation<Color>(theme.primaryColor),
                ),
              ),
            ),
          );
        }

        final rawItem = items[index];
        final Map<String, dynamic> rowScope = {};

        if (rawItem is Map) {
          rawItem.forEach((k, v) => rowScope[k.toString()] = v);
          rowScope['item'] = rawItem;
        } else {
          rowScope['item'] = rawItem;
          rowScope['value'] = rawItem;
        }
        rowScope['index'] = index;

        ComponentNode rowNode;
        if (itemTemplate != null) {
          // Deep clone & interpolate template with row scope
          rowNode = GenUiDataBinding.interpolateNode(itemTemplate, rowScope);
        } else {
          // Smart default fallback tile if template wasn't provided
          final title = rowScope['title'] ?? rowScope['name'] ?? rowScope['label'] ?? 'Item #${index + 1}';
          final subtitle = rowScope['subtitle'] ?? rowScope['description'] ?? rowScope['email'] ?? rowScope['price']?.toString();
          final image = rowScope['image'] ?? rowScope['avatar'] ?? rowScope['thumbnail'] ?? rowScope['icon'];
          rowNode = ComponentNode(
            id: 'auto_item_$index',
            type: 'listtile',
            properties: {
              'title': title.toString(),
              if (subtitle != null) 'subtitle': subtitle.toString(),
              if (image != null) 'leading_image': image.toString(),
              'action_id': 'item_click_$index',
            },
          );
        }

        return SafeWidgetRegistry.buildNode(
          node: rowNode,
          theme: theme,
          isGuarded: isGuarded,
          onAction: onAction,
          onExecute: onExecute,
          onError: onError,
        );
      },
    );
  }
}

# Declarative JSON Schema (AST) Specification

This document provides the formal JSON Abstract Syntax Tree (AST) specification for screens and components in the **Web-Controlled Generative UI App Framework**.

---

## 1. Schema Hierarchy & Root Structure

A Generative UI Screen is represented as a declarative JSON object with the following top-level properties:

```json
{
  "screen_id": "checkout",
  "screen_name": "Checkout Summary",
  "route": "/checkout",
  "theme": {
    "primary_color": "#4F46E5",
    "background_color": "#F8FAFC",
    "surface_color": "#FFFFFF",
    "font_family": "Inter",
    "border_radius": 12.0
  },
  "appBar": {
    "title": "Order Checkout",
    "subtitle": "Review and pay",
    "showBackButton": true,
    "elevation": 0.0
  },
  "body": {
    "type": "column",
    "properties": {
      "padding": 16.0,
      "crossAxisAlignment": "stretch"
    },
    "children": [
      {
        "type": "card",
        "properties": {
          "elevation": 2.0,
          "padding": 16.0
        },
        "children": [
          {
            "type": "text",
            "properties": {
              "text": "Order #8921",
              "fontSize": 18.0,
              "fontWeight": "bold"
            }
          }
        ]
      }
    ]
  }
}
```

---

## 2. Component Catalog & Node Types

Every element in the `body` tree is a **`ComponentNode`** containing:
* `type` (String, required): The registered widget type.
* `properties` (Map<String, dynamic>, optional): Visual and functional parameters.
* `children` (List<ComponentNode>, optional): Nested sub-components (for layout nodes).
* `onTapCode` (String, optional): Custom Dart action snippet executed on tap.

### A. Layout Containers

| Type | Description | Key Properties |
| :--- | :--- | :--- |
| `column` | Vertical flex layout with automatic scrolling protection. | `crossAxisAlignment`, `mainAxisAlignment`, `padding` |
| `row` | Horizontal flex layout with automatic overflow wrapping. | `mainAxisAlignment`, `crossAxisAlignment`, `spacing` |
| `container` | Box model container for styling, padding, and borders. | `width`, `height`, `padding`, `margin`, `backgroundColor`, `borderRadius` |
| `card` | Material surface card with elevation and rounded corners. | `elevation`, `borderRadius`, `backgroundColor`, `padding` |

### B. Content Primitives

| Type | Description | Key Properties |
| :--- | :--- | :--- |
| `text` | Typographic display node. | `text`, `fontSize`, `fontWeight`, `color`, `align`, `maxLines` |
| `image` | Network or asset image with safe fallback. | `url`, `height`, `width`, `borderRadius`, `fit` |
| `icon` | Material icon glyph. | `iconName`, `size`, `color` |
| `divider` | Visual separator line. | `height`, `thickness`, `color`, `indent` |
| `spacer` | Fixed-dimensional spacing block. | `height`, `width` |

### C. Input Elements (Form Engine)

| Type | Description | Key Properties |
| :--- | :--- | :--- |
| `textfield` | Text input capturing form entries in `GenUiFormRegistry`. | `key`, `label`, `placeholder`, `obscureText`, `keyboardType` |
| `switch` | Interactive Boolean toggle switch. | `key`, `label`, `value`, `activeColor` |
| `checkbox` | Checkbox tile with custom label. | `key`, `label`, `value` |
| `chip` | Selectable chip tag. | `key`, `label`, `selected` |

### D. Action Nodes

| Type | Description | Key Properties |
| :--- | :--- | :--- |
| `button` | High-impact call-to-action button. | `label`, `variant` (`filled`, `outlined`, `text`), `color`, `onTapCode` |
| `listtile` | Material navigation tile with leading/trailing icons. | `title`, `subtitle`, `leadingIcon`, `trailingIcon`, `onTapCode` |

---

## 3. Sanitization & Type Coercion Rules

To guarantee **0% runtime crash rates** even when schemas are synthesized by non-deterministic LLMs, `GenUiSchemaValidator` enforces automatic coercion:

1. **Numeric Coercion**:
   * `"fontSize": "16"` $\rightarrow$ coerced to `16.0`
   * `"padding": "twenty"` $\rightarrow$ coerced to default `16.0`
2. **Hex Color Sanitization**:
   * `"#4F46E5"` $\rightarrow$ `Color(0xFF4F46E5)`
   * `"invalid-hex"` $\rightarrow$ coerced to `theme.primary_color`
3. **Dimension Clamping**:
   * `"height": -50.0` or `NaN` $\rightarrow$ clamped to `0.0`
4. **Unknown Widget Tags**:
   * Hallucinated tags (e.g. `<QuantumAIWidget>`) $\rightarrow$ gracefully rendered as an isolated fallback card without interrupting surrounding UI.

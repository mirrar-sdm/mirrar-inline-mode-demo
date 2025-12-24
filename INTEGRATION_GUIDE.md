# Mirrar WebAR Integration Guide

## Overview

This guide explains how to integrate Mirrar Virtual Try-On into any webpage using `mirrar-ui.js`. The SDK supports two modes:

- **Popup Mode** (default): Full-screen overlay experience
- **Inline Mode**: Embedded within a container element on the page

---

## Quick Start

### 1. Include the SDK

Add the Mirrar SDK script in your HTML `<head>` or before the closing `</body>` tag:

```html
<script src="https://cdn.mirrar.com/general/scripts/mirrar-ui.js"></script>
```

### 2. Create a Container (Inline Mode Only)

For inline mode, add a container element with explicit dimensions:

```html
<div id="mirrar-container" style="width: 100%; height: 500px;"></div>
```

### 3. Initialize Try-On

Call `initMirrarUI()` with your product SKU and configuration options:

```javascript
initMirrarUI('YOUR_SKU', {
    brandId: 'YOUR_BRAND_ID',
    mode: 'inline',
    containerId: 'mirrar-container'
});
```

---

## Complete Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>Product Page</title>
    <script src="https://cdn.mirrar.com/general/scripts/mirrar-ui.js"></script>
</head>
<body>
    <button onclick="startTryOn()">Try It On</button>
    
    <div id="mirrar-container" style="width: 100%; height: 500px;"></div>

    <script>
        function startTryOn() {
            initMirrarUI('3525348', {
                brandId: 'd254a928-3f20-4ba1-ac08-328a68d2d2d2',
                mode: 'inline',
                containerId: 'mirrar-container'
            });
        }
    </script>
</body>
</html>
```

---

## API Reference

### initMirrarUI(sku, options)

Initializes the Mirrar Virtual Try-On experience.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sku` | String | Yes | Product SKU or variant code |
| `options` | Object | Yes | Configuration options |

**Options Object:**

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `brandId` | String | Yes | - | Your Mirrar Brand ID |
| `mode` | String | No | `'popup'` | Display mode: `'popup'` or `'inline'` |
| `containerId` | String | Conditional | - | Container element ID. Required when `mode` is `'inline'` |
| `productData` | Object | No | - | Product filtering data by category |

---

## Configuration Options

### Popup Mode (Default)

Opens a full-screen overlay. No container element required.

```javascript
initMirrarUI('SKU123', {
    brandId: 'YOUR_BRAND_ID'
});
```

### Inline Mode

Renders the try-on experience inside a specified container element.

```javascript
initMirrarUI('SKU123', {
    brandId: 'YOUR_BRAND_ID',
    mode: 'inline',
    containerId: 'your-container-id'
});
```

**Container Requirements:**

- Must have a unique `id` attribute
- Must have explicit height (CSS or inline style)
- Recommended minimum height: 400px

---

## Container Styling

The SDK will automatically apply the following styles to your container if not already set:

- `position: relative` (if currently `static`)
- `overflow: hidden`
- Minimum height based on aspect ratio (if height is 0)

**Recommended CSS:**

```css
#mirrar-container {
    width: 100%;
    height: 500px;
    position: relative;
}
```

---

## Events

Listen for Mirrar events using the `message` event listener:

```javascript
window.addEventListener('message', function(event) {
    if (event.data && event.data.origin === 'mirrar') {
        switch (event.data.function) {
            case 'closeMirrar':
                // Try-on was closed
                break;
            case 'makeMirrarVisible':
                // Try-on is ready
                break;
        }
    }
});
```

---

## Browser Support

- Chrome 80+
- Safari 14+
- Firefox 75+
- Edge 80+

Camera access requires HTTPS in production environments.

---

## Troubleshooting

**Try-on not loading:**
- Verify the container has explicit height
- Check browser console for errors
- Ensure HTTPS is used in production

**Camera not working:**
- Grant camera permissions when prompted
- Verify site is served over HTTPS
- Check if another application is using the camera

---

## Support

For integration support, contact your Mirrar account representative or visit the Mirrar developer portal.

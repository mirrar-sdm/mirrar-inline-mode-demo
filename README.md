# Mirrar Virtual Try-On Integration Guide

## Overview

This documentation provides a comprehensive guide for integrating Mirrar's Virtual Try-On inline mode into your website. The inline mode allows customers to experience virtual try-on directly within your product pages without navigating away from your site.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Implementation](#implementation)
5. [API Reference](#api-reference)
6. [Styling Guidelines](#styling-guidelines)
7. [Browser Compatibility](#browser-compatibility)
8. [Troubleshooting](#troubleshooting)
9. [Support](#support)

---

## Prerequisites

Before integrating Mirrar Virtual Try-On, ensure you have:

- A valid Mirrar Brand ID (provided by your Mirrar account manager)
- Product SKUs registered in the Mirrar platform
- HTTPS enabled on your production website (required for camera access)

---

## Installation

### Step 1: Include Required Files

Add the following files to your project:

```
your-project/
├── mirrar-ui.js        # Mirrar SDK (provided by Mirrar)
├── styles.css          # Styling for try-on container
└── app.js              # Integration logic
```

### Step 2: Add Script Reference

Include the Mirrar SDK in your HTML file's `<head>` section:

```html
<head>
    <!-- Other head elements -->
    <script src="mirrar-ui.js"></script>
</head>
```

---

## Configuration

### Basic Configuration

Open `app.js` and configure the `MIRRAR_CONFIG` object with your credentials:

```javascript
const MIRRAR_CONFIG = {
    brandId: 'your-brand-id',           // Required: Your Mirrar Brand ID
    sku: 'product-sku',                 // Required: Default product SKU
    category: 'sunglasses',             // Required: Product category
    productData: {
        "Sunglasses": {
            items: ['sku-1', 'sku-2'],   // Array of product SKUs
            type: 'face'                 // Body part type for AR placement
        }
    }
};
```

### Configuration Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `brandId` | String | Yes | Unique identifier for your brand provided by Mirrar |
| `sku` | String | Yes | Product SKU to display on initialization |
| `category` | String | Yes | Product category (e.g., 'sunglasses', 'eyeglasses') |
| `productData` | Object | No | Object containing category-specific product arrays |

### Environment Configuration

Configure the host URL based on your environment:

```javascript
const MIRRAR_HOST = window.location.href.includes('localhost') 
    ? 'http://localhost:3000/'                              // Development
    : 'https://cdn.mirrar.com/mirrar-jewellery-webar-new/'; // Production
```

---

## Implementation

### HTML Structure

Add the following HTML structure to your product page where you want the try-on experience to appear:

```html
<!-- Try-On Container -->
<div class="main-image-container" id="main-view-container">
    <!-- Product Image View -->
    <div class="product-view" id="product-view">
        <img src="product-image.jpg" alt="Product" id="main-product-image" class="main-image">
    </div>

    <!-- Camera View (hidden by default) -->
    <div class="camera-view hidden" id="camera-view">
        <!-- Header with close button -->
        <div class="camera-header">
            <div class="camera-title">
                <span>Virtual Try-On</span>
            </div>
            <button class="close-btn" id="close-tryon-btn">Close</button>
        </div>

        <!-- Mirrar Content Container -->
        <div class="mirrar-container" id="mirrar-tryon-content"></div>

        <!-- Loading State -->
        <div class="loading-overlay" id="loading-overlay">
            <div class="loader"></div>
            <span>Starting virtual try-on...</span>
        </div>

        <!-- Error State -->
        <div class="error-overlay hidden" id="error-overlay">
            <p id="error-message">Failed to initialize virtual try-on.</p>
        </div>
    </div>
</div>

<!-- Try-On Trigger Button -->
<button class="tryon-btn" id="tryon-btn">Try On</button>
```

### JavaScript Integration

#### Initializing the Try-On Experience

```javascript
function initMirrarInline() {
    const container = document.getElementById('mirrar-tryon-content');
    
    // Create iframe element
    const iframe = document.createElement('iframe');
    iframe.id = 'mirrar-inline-iframe';
    iframe.allow = 'camera;autoplay;microphone;clipboard-read;clipboard-write';
    iframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
        position: absolute;
        top: 0;
        left: 0;
        display: block;
    `;
    
    // Build URL with parameters
    const params = new URLSearchParams({
        brand_id: MIRRAR_CONFIG.brandId,
        sku: MIRRAR_CONFIG.sku,
        category: MIRRAR_CONFIG.category,
        mode: 'inline',
        fullScreen: 'true',
        lang: 'en'
    });
    
    // Add product data
    if (MIRRAR_CONFIG.productData) {
        Object.keys(MIRRAR_CONFIG.productData).forEach(category => {
            const categoryData = MIRRAR_CONFIG.productData[category];
            if (categoryData.items && categoryData.items.length > 0) {
                params.append(category, categoryData.items.join(','));
            }
        });
    }
    
    iframe.src = `${MIRRAR_HOST}index.html?${params.toString()}`;
    container.appendChild(iframe);
}
```

#### Starting and Stopping Try-On

```javascript
function startTryOn() {
    document.getElementById('product-view').style.display = 'none';
    document.getElementById('camera-view').classList.remove('hidden');
    initMirrarInline();
}

function stopTryOn() {
    document.getElementById('product-view').style.display = 'block';
    document.getElementById('camera-view').classList.add('hidden');
    
    // Clean up iframe
    const container = document.getElementById('mirrar-tryon-content');
    container.innerHTML = '';
}
```

#### Event Listeners

```javascript
// Try-On button click
document.getElementById('tryon-btn').addEventListener('click', startTryOn);

// Close button click
document.getElementById('close-tryon-btn').addEventListener('click', stopTryOn);
```

---

## API Reference

### Message Events

Mirrar communicates with the parent page through the `postMessage` API. Listen for these events:

```javascript
window.addEventListener('message', (event) => {
    if (event.data && event.data.origin === 'mirrar') {
        switch (event.data.function) {
            case 'closeMirrar':
                // User closed the try-on experience
                stopTryOn();
                break;
            case 'makeMirrarVisible':
                // Try-on is ready and visible
                hideLoading();
                break;
        }
    }
});
```

### Available Events

| Event | Description |
|-------|-------------|
| `closeMirrar` | Triggered when user requests to close the try-on |
| `makeMirrarVisible` | Triggered when the try-on experience is ready |

### Sending Messages to Mirrar

Send resize events when the container dimensions change:

```javascript
window.addEventListener('resize', () => {
    const iframe = document.getElementById('mirrar-inline-iframe');
    const container = document.getElementById('mirrar-tryon-content');
    
    if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
            type: 'resize',
            width: container.offsetWidth,
            height: container.offsetHeight,
            fullScreen: true
        }, '*');
    }
});
```

---

## Styling Guidelines

### Required Container Styles

Ensure the try-on container has the following CSS properties:

```css
.mirrar-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.mirrar-container iframe {
    width: 100% !important;
    height: 100% !important;
    border: none !important;
    display: block !important;
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
}

/* Hide Mirrar's default close button when using custom UI */
.mirrar-container #mirrar-close-btn {
    display: none !important;
}
```

### Responsive Considerations

The container should maintain a consistent aspect ratio. Recommended approach:

```css
.main-image-container {
    position: relative;
    aspect-ratio: 1;
    width: 100%;
    overflow: hidden;
}

@media (max-width: 768px) {
    .main-image-container {
        aspect-ratio: 3/4;
    }
}
```

---

## Browser Compatibility

### Supported Browsers

| Browser | Minimum Version | Notes |
|---------|-----------------|-------|
| Chrome | 80+ | Recommended |
| Safari | 14+ | Full support |
| Firefox | 78+ | Full support |
| Edge | 80+ | Full support |

### Requirements

- Camera access requires HTTPS in production environments
- `localhost` is allowed for development without HTTPS
- WebGL support is required for AR rendering

---

## Troubleshooting

### Camera Not Accessible

**Symptoms:** Camera feed does not appear or permission dialog is not shown.

**Solutions:**
1. Verify the page is served over HTTPS (or localhost for development)
2. Check browser camera permissions in settings
3. Ensure no other application is using the camera
4. Try refreshing the page and granting permissions again

### Try-On Experience Not Loading

**Symptoms:** Loading indicator persists or error message is displayed.

**Solutions:**
1. Verify the `brandId` is correct and active
2. Confirm the `sku` exists in the Mirrar platform
3. Check browser console for JavaScript errors
4. Ensure the Mirrar host URL is accessible from your domain

### Iframe Not Displaying Correctly

**Symptoms:** The try-on experience appears cropped or misaligned.

**Solutions:**
1. Verify the container has explicit width and height values
2. Check that the container uses `position: relative`
3. Ensure no parent elements have `overflow: hidden` that might clip the content
4. Send a resize message after the iframe loads

### Cross-Origin Issues

**Symptoms:** Console shows CORS errors or iframe content is blocked.

**Solutions:**
1. Contact Mirrar support to whitelist your domain
2. Ensure you are using the correct `MIRRAR_HOST` URL for your environment

---

## Support

For technical assistance or to report issues:

- **Email:** support@mirrar.com
- **Documentation:** https://docs.mirrar.com

When contacting support, please include:
- Your Brand ID
- Browser and version
- Console error logs (if applicable)
- Steps to reproduce the issue

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.7.2 | December 2025 | Initial release |

---

Copyright 2025 Mirrar. All rights reserved.

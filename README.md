# Mirrar Virtual Try-On - Simple HTML Demo

A simple HTML/CSS/JavaScript implementation of the Mirrar Virtual Try-On inline mode integration. This demo showcases how to integrate Mirrar's eyewear try-on feature into a product page without using any framework.

## Project Structure

```
mirrar-inline-html-demo/
├── index.html          # Main HTML page with product layout
├── styles.css          # All styles for the demo
├── app.js              # Application logic and Mirrar integration
├── mirrar-ui.js        # Mirrar SDK (copy from your source)
└── README.md           # This file
```

## Quick Start

### 1. Configure Mirrar Credentials

Open `app.js` and update the `MIRRAR_CONFIG` object with your actual credentials:

```javascript
const MIRRAR_CONFIG = {
    brandId: 'your-brand-id',        // Your Mirrar Brand ID
    sku: 'your-sku-id',              // Product SKU
    category: 'sunglasses',          // Product category
    productData: {
        "Sunglasses": {
            items: ['your-sku-id'],   // Array of SKUs
            type: 'face'
        }
    }
};
```

### 2. Update Host URL

In `app.js`, update the `MIRRAR_HOST` based on your environment:

```javascript
// For development (localhost)
const MIRRAR_HOST = 'http://localhost:3000/';

// For production
const MIRRAR_HOST = 'https://cdn.mirrar.com/webar/latest/';
```

### 3. Run the Demo

You can serve the files using any local server:

**Using Python:**
```bash
# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

**Using Node.js (http-server):**
```bash
npx http-server -p 8080
```

**Using VS Code Live Server:**
- Install the "Live Server" extension
- Right-click on `index.html` and select "Open with Live Server"

Then open `http://localhost:8080` in your browser.

## Features

- 📷 **Virtual Try-On**: Inline camera view for eyewear try-on
- 🖼️ **Product Gallery**: Multiple product images with thumbnails
- 🎨 **Color Selection**: Interactive color options
- 📱 **Responsive Design**: Works on desktop and mobile
- ⚡ **Loading States**: Visual feedback during initialization
- 🚫 **Error Handling**: Graceful error states

## How It Works

### Inline Mode Integration

The integration creates an iframe that loads the Mirrar WebAR experience directly within a container on your page:

```javascript
// Create iframe for inline mode
const iframe = document.createElement('iframe');
iframe.allow = 'camera;autoplay;microphone;clipboard-read;clipboard-write';

// Build URL with parameters
const params = new URLSearchParams({
    brand_id: MIRRAR_CONFIG.brandId,
    sku: MIRRAR_CONFIG.sku,
    category: MIRRAR_CONFIG.category,
    mode: 'inline',
    fullScreen: 'true',
    lang: 'en'
});

iframe.src = `${MIRRAR_HOST}index.html?${params.toString()}`;
container.appendChild(iframe);
```

### Message Communication

The demo listens for messages from the Mirrar iframe:

```javascript
window.addEventListener('message', (event) => {
    if (event.data && event.data.origin === 'mirrar') {
        switch (event.data.function) {
            case 'closeMirrar':
                stopTryOn();
                break;
            case 'makeMirrarVisible':
                hideLoading();
                break;
        }
    }
});
```

### Resize Handling

The demo sends resize messages to the iframe when the window is resized:

```javascript
window.addEventListener('resize', () => {
    if (state.mirrarIframe && state.mirrarIframe.contentWindow) {
        state.mirrarIframe.contentWindow.postMessage({
            type: 'resize',
            width: container.offsetWidth,
            height: container.offsetHeight,
            fullScreen: true
        }, '*');
    }
});
```

## Customization

### Styling

All styles are in `styles.css`. Key sections:

- `.camera-view` - The virtual try-on container
- `.mirrar-container` - Iframe container styles
- `.loading-overlay` - Loading state styles
- `.error-overlay` - Error state styles

### Adding Products

To add more products, update the product images array in `app.js`:

```javascript
const productImages = [
    "path/to/image1.jpg",
    "path/to/image2.jpg",
    "path/to/image3.jpg"
];
```

And update the corresponding thumbnails in `index.html`.

## Browser Support

- Chrome (recommended)
- Safari
- Firefox
- Edge

Note: Camera access requires HTTPS in production or localhost for development.

## Troubleshooting

### Camera Not Working
- Ensure you're accessing the page via `localhost` or `https://`
- Check browser camera permissions
- Try refreshing the page

### Try-On Not Loading
- Verify your `brandId` and `sku` are correct
- Check the browser console for errors
- Ensure the Mirrar host URL is accessible

### Styling Issues
- The iframe content is sandboxed; external styles won't affect it
- Use the `.mirrar-container` styles to control the container

## Comparison with React Version

| Feature | HTML Version | React Version |
|---------|-------------|---------------|
| Framework | Vanilla JS | React + TypeScript |
| Build | None required | Vite |
| State Management | Simple object | useState hooks |
| Styling | CSS | Tailwind CSS |
| Components | Single file | Separate components |

## License

This demo is provided as-is for integration reference. Contact Mirrar for commercial use licensing.

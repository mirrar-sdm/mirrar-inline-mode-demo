/**
 * Mirrar Virtual Try-On Integration
 * Standard API Implementation using mirrar-ui.js
 * 
 * Supports both:
 * - Popup Mode (default): Full-screen overlay
 * - Inline Mode: Embedded in a container element
 */

// ========================================
// MIRRAR CONFIGURATION
// ========================================
const MIRRAR_CONFIG = {
    // Required: Your Mirrar Brand ID
    brandId: 'd254a928-3f20-4ba1-ac08-328a68d2d2d2',
    
    // Required: Product SKU for try-on
    sku: '3525348',
    
    // Mode: 'popup' (default) or 'inline'
    // - 'popup': Opens full-screen overlay (handled entirely by mirrar-ui.js)
    // - 'inline': Renders inside containerId element
    mode: 'inline',
    
    // Required for inline mode: Container element ID
    containerId: 'mirrar-tryon-content',
    
    // Optional: Product data for filtering inventory
    productData: {
        "Sunglasses": {
            items: ['3525348'],
            type: 'face'
        }
    }
};

// ========================================
// DOM ELEMENTS
// ========================================
const elements = {
    // Gallery elements
    productView: document.getElementById('product-view'),
    cameraView: document.getElementById('camera-view'),
    mainProductImage: document.getElementById('main-product-image'),
    mirrarContainer: document.getElementById('mirrar-tryon-content'),
    
    // Loading/Error states (for inline mode UI feedback)
    loadingOverlay: document.getElementById('loading-overlay'),
    errorOverlay: document.getElementById('error-overlay'),
    errorMessage: document.getElementById('error-message'),
    activeIndicator: document.getElementById('active-indicator'),
    
    // Buttons
    tryonBtn: document.getElementById('tryon-btn'),
    closeTryonBtn: document.getElementById('close-tryon-btn'),
    
    // Other UI elements
    thumbnails: document.querySelectorAll('.thumbnail:not(.tryon-btn)'),
    colorOptions: document.querySelectorAll('.color-option'),
    addToCartBtn: document.getElementById('add-to-cart-btn'),
    wishlistBtn: document.getElementById('wishlist-btn')
};

// Product images for gallery
const productImages = [
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=600&h=600&fit=crop"
];

// ========================================
// STATE
// ========================================
let state = {
    isTryOnActive: false,
    selectedImageIndex: 0
};

// ========================================
// MIRRAR TRY-ON FUNCTIONS
// ========================================

/**
 * Build options object for initMirrarUI
 * @returns {Object} Options object with all required parameters
 */
function buildMirrarOptions() {
    const options = {
        brandId: MIRRAR_CONFIG.brandId
    };
    
    // Add mode if inline
    if (MIRRAR_CONFIG.mode === 'inline') {
        options.mode = 'inline';
        options.containerId = MIRRAR_CONFIG.containerId;
    }
    
    // Add product data if available
    if (MIRRAR_CONFIG.productData) {
        options.productData = MIRRAR_CONFIG.productData;
    }
    
    return options;
}

/**
 * Start virtual try-on using standard initMirrarUI API
 * This follows Option 1 from mirrAR Web Documentation
 */
function startTryOn() {
    console.log('[Try-On] Starting virtual try-on');
    console.log('[Try-On] Mode:', MIRRAR_CONFIG.mode);
    
    state.isTryOnActive = true;
    
    // Build options following standard API
    const options = buildMirrarOptions();
    const sku = MIRRAR_CONFIG.sku;
    
    console.log('[Try-On] Calling initMirrarUI with:', { sku, options });
    
    if (MIRRAR_CONFIG.mode === 'inline') {
        // For inline mode: Update UI to show camera view
        elements.productView.style.display = 'none';
        elements.cameraView.classList.remove('hidden');
        elements.tryonBtn.classList.add('active');
        elements.thumbnails.forEach(thumb => thumb.classList.remove('active'));
        
        // Show loading state
        showLoading();
    }
    
    // Call the standard Mirrar API
    // initMirrarUI is globally available from mirrar-ui.js
    if (typeof initMirrarUI === 'function') {
        initMirrarUI(sku, options);
    } else {
        console.error('[Try-On] initMirrarUI not found. Make sure mirrar-ui.js is loaded.');
        showError('Failed to initialize try-on. SDK not loaded.');
    }
}

/**
 * Stop virtual try-on
 * For popup mode: mirrar-ui.js handles closing via closeMirrar message
 * For inline mode: We need to clean up the container
 */
function stopTryOn() {
    console.log('[Try-On] Stopping virtual try-on');
    
    state.isTryOnActive = false;
    
    if (MIRRAR_CONFIG.mode === 'inline') {
        // Update UI to show product view
        elements.productView.style.display = 'block';
        elements.cameraView.classList.add('hidden');
        elements.tryonBtn.classList.remove('active');
        
        // Restore active thumbnail
        elements.thumbnails[state.selectedImageIndex]?.classList.add('active');
        
        // Hide indicators
        hideLoading();
        hideActiveIndicator();
        
        // Clear the container (mirrar-webar-integration.js should handle cleanup)
        // But we ensure the container is cleared for UI consistency
        if (elements.mirrarContainer) {
            elements.mirrarContainer.innerHTML = '';
        }
    }
    // For popup mode, mirrar-ui.js handles everything via closeMirrar
}

// ========================================
// UI HELPER FUNCTIONS
// ========================================

function showLoading() {
    if (elements.loadingOverlay) {
        elements.loadingOverlay.classList.remove('hidden');
    }
    if (elements.errorOverlay) {
        elements.errorOverlay.classList.add('hidden');
    }
    if (elements.activeIndicator) {
        elements.activeIndicator.classList.add('hidden');
    }
}

function hideLoading() {
    if (elements.loadingOverlay) {
        elements.loadingOverlay.classList.add('hidden');
    }
}

function showError(message) {
    hideLoading();
    if (elements.errorMessage) {
        elements.errorMessage.textContent = message;
    }
    if (elements.errorOverlay) {
        elements.errorOverlay.classList.remove('hidden');
    }
}

function showActiveIndicator() {
    if (elements.activeIndicator) {
        elements.activeIndicator.classList.remove('hidden');
    }
}

function hideActiveIndicator() {
    if (elements.activeIndicator) {
        elements.activeIndicator.classList.add('hidden');
    }
}

/**
 * Select a product image from gallery
 * @param {number} index - Image index to select
 */
function selectImage(index) {
    state.selectedImageIndex = index;
    
    // Update main image
    if (elements.mainProductImage) {
        elements.mainProductImage.src = productImages[index];
        elements.mainProductImage.classList.add('animate-fade-in');
        
        setTimeout(() => {
            elements.mainProductImage.classList.remove('animate-fade-in');
        }, 300);
    }
    
    // Update thumbnails
    elements.thumbnails.forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
    
    // If try-on is active in inline mode, stop it
    if (state.isTryOnActive && MIRRAR_CONFIG.mode === 'inline') {
        stopTryOn();
    }
}

/**
 * Select a color option
 * @param {HTMLElement} selectedOption - The clicked color option
 */
function selectColor(selectedOption) {
    elements.colorOptions.forEach(option => {
        option.classList.remove('active');
    });
    selectedOption.classList.add('active');
}

// ========================================
// EVENT LISTENERS
// ========================================

/**
 * Listen for messages from Mirrar iframe/integration
 * Handles events like closeMirrar, makeMirrarVisible, etc.
 */
window.addEventListener('message', (event) => {
    if (event.data && event.data.origin === 'mirrar') {
        console.log('[Try-On] Message from Mirrar:', event.data);
        
        switch (event.data.function) {
            case 'closeMirrar':
                // Mirrar closed (user clicked close or popup dismissed)
                stopTryOn();
                break;
                
            case 'makeMirrarVisible':
                // Mirrar is ready and visible
                hideLoading();
                showActiveIndicator();
                break;
            
            case 'enableInlineMode':
                // Inline mode is enabled and ready
                console.log('[Try-On] Inline mode enabled with settings:', event.data.settings);
                hideLoading();
                showActiveIndicator();
                break;
                
            case 'mirrar-loaded':
                // Mirrar finished loading
                console.log('[Try-On] Mirrar loaded');
                hideLoading();
                showActiveIndicator();
                break;
        }
    }
    
    // Also handle events from CDN origin
    if (event.origin === 'https://cdn.mirrar.com') {
        console.log('[Try-On] Event from Mirrar CDN:', event.data);
    }
});

// Try-On button click
if (elements.tryonBtn) {
    elements.tryonBtn.addEventListener('click', () => {
        if (state.isTryOnActive) {
            stopTryOn();
        } else {
            startTryOn();
        }
    });
}

// Close try-on button click (for inline mode)
if (elements.closeTryonBtn) {
    elements.closeTryonBtn.addEventListener('click', stopTryOn);
}

// Thumbnail clicks
elements.thumbnails.forEach((thumb, index) => {
    thumb.addEventListener('click', () => selectImage(index));
});

// Color option clicks
elements.colorOptions.forEach(option => {
    option.addEventListener('click', () => selectColor(option));
});

// Add to cart button
if (elements.addToCartBtn) {
    elements.addToCartBtn.addEventListener('click', () => {
        alert('Product added to cart!');
    });
}

// Wishlist button
if (elements.wishlistBtn) {
    elements.wishlistBtn.addEventListener('click', () => {
        elements.wishlistBtn.classList.toggle('active');
        alert('Product added to wishlist!');
    });
}

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('[App] Mirrar Virtual Try-On Demo initialized');
    console.log('[App] Using standard initMirrarUI API');
    console.log('[App] Configuration:', MIRRAR_CONFIG);
    console.log('[App] Mode:', MIRRAR_CONFIG.mode);
    
    // Verify mirrar-ui.js is loaded
    if (typeof initMirrarUI === 'function') {
        console.log('[App] ✓ mirrar-ui.js loaded successfully');
    } else {
        console.warn('[App] ✗ initMirrarUI not found - mirrar-ui.js may not be loaded');
    }
    
    // Set initial active thumbnail
    if (elements.thumbnails.length > 0) {
        elements.thumbnails[0].classList.add('active');
    }
});

/**
 * Mirrar Virtual Try-On Integration
 * Simple HTML/CSS/JavaScript Implementation
 */

// ========================================
// MIRRAR CONFIGURATION
// ========================================
// Update these values with your actual Mirrar credentials
const MIRRAR_CONFIG = {
    brandId: 'd254a928-3f20-4ba1-ac08-328a68d2d2d2',        // Your Mirrar Brand ID
    sku: '3525348',              // Product SKU
    category: 'sunglasses',          // Product category
    productData: {
        "Sunglasses": {
            items: ['3525348'],   // Array of SKUs
            type: 'face'
        }
    }
};

// Host URL - change for production
const MIRRAR_HOST = window.location.href.includes('localhost') 
    ? 'http://localhost:3000/' 
    : 'https://cdn.mirrar.com/mirrar-jewellery-webar-new/';

// ========================================
// DOM ELEMENTS
// ========================================
const elements = {
    productView: document.getElementById('product-view'),
    cameraView: document.getElementById('camera-view'),
    mainProductImage: document.getElementById('main-product-image'),
    mirrarContainer: document.getElementById('mirrar-tryon-content'),
    loadingOverlay: document.getElementById('loading-overlay'),
    errorOverlay: document.getElementById('error-overlay'),
    errorMessage: document.getElementById('error-message'),
    activeIndicator: document.getElementById('active-indicator'),
    tryonBtn: document.getElementById('tryon-btn'),
    closeTryonBtn: document.getElementById('close-tryon-btn'),
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
    selectedImageIndex: 0,
    mirrarIframe: null
};

// ========================================
// MIRRAR INLINE MODE FUNCTIONS
// ========================================

/**
 * Initialize Mirrar inline mode
 * Creates and configures the iframe for virtual try-on
 */
function initMirrarInline() {
    try {
        const container = elements.mirrarContainer;
        
        if (!container) {
            showError("Container not found.");
            return;
        }

        console.log('[Try-On] Starting inline mode initialization');
        
        // Clear container
        container.innerHTML = '';
        
        // Show loading
        showLoading();
        
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
        
        // Build URL with all required parameters for inline mode
        const params = new URLSearchParams({
            brand_id: MIRRAR_CONFIG.brandId,
            sku: MIRRAR_CONFIG.sku,
            category: MIRRAR_CONFIG.category,
            mode: 'inline',
            fullScreen: 'true',
            lang: 'en'
        });
        
        // Add product data if available
        if (MIRRAR_CONFIG.productData) {
            Object.keys(MIRRAR_CONFIG.productData).forEach(category => {
                const categoryData = MIRRAR_CONFIG.productData[category];
                if (categoryData.items && categoryData.items.length > 0) {
                    params.append(category, categoryData.items.join(','));
                }
            });
        }
        
        iframe.src = `${MIRRAR_HOST}index.html?${params.toString()}`;
        
        console.log('[Try-On] Loading iframe:', iframe.src);
        
        // Handle iframe load
        iframe.onload = () => {
            console.log('[Try-On] Iframe loaded successfully');
            hideLoading();
            showActiveIndicator();
            
            // Send resize message to ensure proper canvas sizing
            if (iframe.contentWindow && container) {
                setTimeout(() => {
                    iframe.contentWindow.postMessage({
                        type: 'resize',
                        width: container.offsetWidth,
                        height: container.offsetHeight,
                        fullScreen: true
                    }, '*');
                }, 1000);
            }
        };
        
        // Handle iframe error
        iframe.onerror = () => {
            console.error('[Try-On] Failed to load iframe');
            showError('Failed to load virtual try-on. Please try again.');
        };
        
        // Append iframe to container
        container.appendChild(iframe);
        state.mirrarIframe = iframe;
        
        // Timeout fallback to hide loading
        setTimeout(() => {
            hideLoading();
        }, 5000);
        
    } catch (err) {
        console.error('[Try-On] Error initializing inline mode:', err);
        showError("Failed to initialize virtual try-on.");
    }
}

/**
 * Start virtual try-on
 */
function startTryOn() {
    state.isTryOnActive = true;
    
    // Update UI
    elements.productView.style.display = 'none';
    elements.cameraView.classList.remove('hidden');
    elements.tryonBtn.classList.add('active');
    
    // Remove active class from image thumbnails
    elements.thumbnails.forEach(thumb => thumb.classList.remove('active'));
    
    // Initialize Mirrar
    initMirrarInline();
}

/**
 * Stop virtual try-on
 */
function stopTryOn() {
    state.isTryOnActive = false;
    
    // Update UI
    elements.productView.style.display = 'block';
    elements.cameraView.classList.add('hidden');
    elements.tryonBtn.classList.remove('active');
    
    // Restore active thumbnail
    elements.thumbnails[state.selectedImageIndex].classList.add('active');
    
    // Clean up
    hideActiveIndicator();
    
    // Remove iframe
    if (state.mirrarIframe) {
        state.mirrarIframe.remove();
        state.mirrarIframe = null;
    }
    elements.mirrarContainer.innerHTML = '';
}

// ========================================
// UI HELPER FUNCTIONS
// ========================================

function showLoading() {
    elements.loadingOverlay.classList.remove('hidden');
    elements.errorOverlay.classList.add('hidden');
    elements.activeIndicator.classList.add('hidden');
}

function hideLoading() {
    elements.loadingOverlay.classList.add('hidden');
}

function showError(message) {
    elements.loadingOverlay.classList.add('hidden');
    elements.errorMessage.textContent = message;
    elements.errorOverlay.classList.remove('hidden');
}

function showActiveIndicator() {
    elements.activeIndicator.classList.remove('hidden');
}

function hideActiveIndicator() {
    elements.activeIndicator.classList.add('hidden');
}

/**
 * Select a product image
 * @param {number} index - Image index to select
 */
function selectImage(index) {
    state.selectedImageIndex = index;
    
    // Update main image
    elements.mainProductImage.src = productImages[index];
    elements.mainProductImage.classList.add('animate-fade-in');
    
    // Remove animation class after it completes
    setTimeout(() => {
        elements.mainProductImage.classList.remove('animate-fade-in');
    }, 300);
    
    // Update thumbnails
    elements.thumbnails.forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
    
    // If try-on is active, stop it
    if (state.isTryOnActive) {
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

// Listen for messages from Mirrar iframe
window.addEventListener('message', (event) => {
    if (event.data && event.data.origin === 'mirrar') {
        console.log('[Try-On] Message from Mirrar:', event.data);
        
        switch (event.data.function) {
            case 'closeMirrar':
                stopTryOn();
                break;
            case 'makeMirrarVisible':
                hideLoading();
                showActiveIndicator();
                break;
        }
    }
});

// Try-On button click
elements.tryonBtn.addEventListener('click', () => {
    if (state.isTryOnActive) {
        stopTryOn();
    } else {
        startTryOn();
    }
});

// Close try-on button click
elements.closeTryonBtn.addEventListener('click', stopTryOn);

// Thumbnail clicks
elements.thumbnails.forEach((thumb, index) => {
    thumb.addEventListener('click', () => selectImage(index));
});

// Color option clicks
elements.colorOptions.forEach(option => {
    option.addEventListener('click', () => selectColor(option));
});

// Add to cart button
elements.addToCartBtn.addEventListener('click', () => {
    alert('Product added to cart!');
});

// Wishlist button
elements.wishlistBtn.addEventListener('click', () => {
    elements.wishlistBtn.classList.toggle('active');
    alert('Product added to wishlist!');
});

// Handle window resize when try-on is active
window.addEventListener('resize', () => {
    if (state.isTryOnActive && state.mirrarIframe && state.mirrarIframe.contentWindow) {
        const container = elements.mirrarContainer;
        state.mirrarIframe.contentWindow.postMessage({
            type: 'resize',
            width: container.offsetWidth,
            height: container.offsetHeight,
            fullScreen: true
        }, '*');
    }
});

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('[App] Mirrar Inline Demo initialized');
    console.log('[App] Configuration:', MIRRAR_CONFIG);
    
    // Set initial active thumbnail
    if (elements.thumbnails.length > 0) {
        elements.thumbnails[0].classList.add('active');
    }
});

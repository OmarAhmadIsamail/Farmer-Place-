// Cart Page Functionality - Enhanced with Debugging
class CartPage {
    constructor() {
        console.log('CartPage initializing...');
        this.init();
    }

    init() {
        console.log('Initializing cart page...');
        this.debugCartState();
        this.waitForCartManager().then(() => {
            console.log('Cart manager ready, loading cart items...');
            this.loadCartItems();
            this.setupEventListeners();
            this.setupCartUpdateListener();
        }).catch(error => {
            console.error('Cart manager not available, using fallback:', error);
            this.loadCartItems();
            this.setupEventListeners();
        });
    }

    debugCartState() {
        console.log('=== CART DEBUG INFO ===');
        
        // Check localStorage directly
        const cartFromStorage = localStorage.getItem('cart');
        console.log('Raw cart from localStorage:', cartFromStorage);
        
        try {
            const parsedCart = JSON.parse(cartFromStorage || '[]');
            console.log('Parsed cart:', parsedCart);
            console.log('Cart length:', parsedCart.length);
            console.log('Cart items:', parsedCart);
            
            // Check farmProducts
            const products = JSON.parse(localStorage.getItem('farmProducts') || '[]');
            console.log('Available products:', products);
            
        } catch (error) {
            console.error('Error parsing cart:', error);
        }
        
        console.log('=== END DEBUG INFO ===');
    }

    waitForCartManager() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50;
            
            const checkCartManager = () => {
                attempts++;
                if (window.cartManager) {
                    console.log('Cart manager found after', attempts, 'attempts');
                    console.log('Cart manager cart:', window.cartManager.getCart());
                    resolve();
                } else if (attempts >= maxAttempts) {
                    reject(new Error('Cart manager not available after waiting'));
                } else {
                    setTimeout(checkCartManager, 100);
                }
            };
            
            checkCartManager();
        });
    }

    loadCartItems() {
        console.log('Loading cart items...');
        
        // Get cart from cart manager or fallback to localStorage
        let cart = [];
        if (window.cartManager && window.cartManager.getCart) {
            cart = window.cartManager.getCart();
            console.log('Cart from cartManager:', cart);
        } else {
            // Fallback: get cart directly from localStorage
            try {
                cart = JSON.parse(localStorage.getItem('cart')) || [];
                console.log('Cart from localStorage fallback:', cart);
            } catch (error) {
                console.error('Error reading cart from localStorage:', error);
                cart = [];
            }
        }

        console.log('Final cart to display:', cart);

        const cartContent = document.getElementById('cart-content');
        const emptyCart = document.getElementById('empty-cart');
        const cartItemCount = document.getElementById('cart-item-count');
        const checkoutBtn = document.getElementById('checkout-btn');

        if (!cartContent) {
            console.error('Cart content element not found!');
            return;
        }

        if (cart.length === 0) {
            console.log('Cart is empty, showing empty message');
            // Show empty cart message
            if (emptyCart) emptyCart.style.display = 'block';
            cartContent.innerHTML = '';
            if (cartItemCount) cartItemCount.textContent = '0 items';
            if (checkoutBtn) checkoutBtn.disabled = true;
            this.updateOrderSummary(0, 0, 0);
            return;
        }

        console.log('Cart has items, generating HTML...');

        // Hide empty cart message
        if (emptyCart) emptyCart.style.display = 'none';

        // Calculate total items
        const totalItems = cart.reduce((total, item) => total + (item.quantity || 1), 0);
        if (cartItemCount) cartItemCount.textContent = `${totalItems} ${totalItems === 1 ? 'item' : 'items'}`;

        // Generate cart items HTML
        let cartHTML = '';
        const subtotal = cart.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 1)), 0);

        cart.forEach((item, index) => {
            console.log('Processing cart item:', item);
            const itemPrice = item.price || 0;
            const itemQuantity = item.quantity || 1;
            const itemTotal = itemPrice * itemQuantity;
            const itemName = item.name || 'Unnamed Product';
            const itemImage = item.image || 'assets/img/products/product-1.jpg';
            const itemCategory = item.category || 'uncategorized';

            cartHTML += `
                <div class="cart-item" data-product-id="${item.id}" data-index="${index}">
                    <div class="row align-items-center">
                        <div class="col-md-2">
                            <img src="${itemImage}" 
                                 alt="${itemName}" 
                                 class="img-fluid rounded cart-item-image"
                                 onerror="this.src='assets/img/products/product-1.jpg'">
                        </div>
                        <div class="col-md-4">
                            <h5 class="cart-item-title">${itemName}</h5>
                            <p class="cart-item-category text-muted mb-0">${this.formatCategory(itemCategory)}</p>
                            <small class="cart-item-weight text-muted">${item.weight || 'N/A'}</small>
                        </div>
                        <div class="col-md-2">
                            <span class="cart-item-price">$${itemPrice.toFixed(2)}</span>
                        </div>
                        <div class="col-md-2">
                            <div class="quantity-controls d-flex align-items-center">
                                <button class="btn btn-sm btn-outline-secondary quantity-decrease" 
                                        data-index="${index}">-</button>
                                <span class="quantity-display mx-2">${itemQuantity}</span>
                                <button class="btn btn-sm btn-outline-secondary quantity-increase" 
                                        data-index="${index}">+</button>
                            </div>
                        </div>
                        <div class="col-md-2">
                            <span class="cart-item-total fw-bold">$${itemTotal.toFixed(2)}</span>
                            <button class="btn btn-sm btn-outline-danger remove-item ms-2" 
                                    data-index="${index}" 
                                    title="Remove item">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                    <hr>
                </div>
            `;
        });

        cartContent.innerHTML = cartHTML;

        if (checkoutBtn) checkoutBtn.disabled = false;

        // Calculate delivery and totals
        const deliveryFee = this.calculateDeliveryFee(subtotal);
        const discount = this.calculateDiscount(subtotal);
        const total = subtotal + deliveryFee - discount;

        this.updateOrderSummary(subtotal, deliveryFee, discount, total);
        
        console.log('Cart items loaded successfully');
    }

    // ... rest of your existing methods remain the same ...
    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Use event delegation for dynamic elements
        document.addEventListener('click', (e) => {
            // Quantity decrease
            if (e.target.classList.contains('quantity-decrease') || 
                e.target.closest('.quantity-decrease')) {
                const button = e.target.classList.contains('quantity-decrease') ? e.target : e.target.closest('.quantity-decrease');
                const index = parseInt(button.getAttribute('data-index'));
                console.log('Decrease quantity for index:', index);
                this.handleQuantityChange(index, -1);
            }

            // Quantity increase
            if (e.target.classList.contains('quantity-increase') || 
                e.target.closest('.quantity-increase')) {
                const button = e.target.classList.contains('quantity-increase') ? e.target : e.target.closest('.quantity-increase');
                const index = parseInt(button.getAttribute('data-index'));
                console.log('Increase quantity for index:', index);
                this.handleQuantityChange(index, 1);
            }

            // Remove item
            if (e.target.classList.contains('remove-item') || 
                e.target.closest('.remove-item')) {
                const button = e.target.classList.contains('remove-item') ? e.target : e.target.closest('.remove-item');
                const index = parseInt(button.getAttribute('data-index'));
                console.log('Remove item at index:', index);
                this.handleRemoveItem(index);
            }
        });

        // Delivery options
        const deliveryOptions = document.querySelectorAll('input[name="deliveryOption"]');
        deliveryOptions.forEach(option => {
            option.addEventListener('change', () => {
                console.log('Delivery option changed');
                this.updateDeliveryAndTotal();
            });
        });

        // Promo code
        const applyPromoBtn = document.getElementById('apply-promo');
        if (applyPromoBtn) {
            applyPromoBtn.addEventListener('click', () => {
                console.log('Apply promo clicked');
                this.applyPromoCode();
            });
        }

        // Checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                console.log('Checkout clicked');
                this.proceedToCheckout();
            });
        }

        // Enter key for promo code
        const promoInput = document.getElementById('promo-code');
        if (promoInput) {
            promoInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    console.log('Enter pressed in promo code');
                    this.applyPromoCode();
                }
            });
        }
        
        console.log('Event listeners setup complete');
    }

    setupCartUpdateListener() {
        // Listen for cart updates from the cart manager
        window.addEventListener('cartUpdated', (event) => {
            console.log('Cart updated event received in cart page', event.detail);
            this.loadCartItems();
        });

        // Also listen for storage events
        window.addEventListener('storage', (event) => {
            if (event.key === 'cart') {
                console.log('Storage event received in cart page for cart');
                this.loadCartItems();
            }
        });
        
        // Listen for page visibility changes (when user comes back from other pages)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                console.log('Page became visible, reloading cart');
                this.loadCartItems();
            }
        });
    }

    handleQuantityChange(index, change) {
        console.log('Quantity change requested:', index, change);
        
        let success = false;
        if (window.cartManager && window.cartManager.updateQuantity) {
            success = window.cartManager.updateQuantity(index, change);
        } else {
            // Fallback: update cart directly
            success = this.fallbackUpdateQuantity(index, change);
        }
        
        if (success) {
            this.showNotification('Cart updated');
            this.loadCartItems(); // Reload to reflect changes
        }
    }

    fallbackUpdateQuantity(index, change) {
        try {
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            if (cart[index]) {
                cart[index].quantity += change;
                
                if (cart[index].quantity <= 0) {
                    cart.splice(index, 1);
                }
                
                localStorage.setItem('cart', JSON.stringify(cart));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error in fallback quantity update:', error);
            return false;
        }
    }

    handleRemoveItem(index) {
        console.log('Remove item requested:', index);
        
        let removedItem = null;
        if (window.cartManager && window.cartManager.removeItem) {
            removedItem = window.cartManager.removeItem(index);
        } else {
            // Fallback: remove item directly
            removedItem = this.fallbackRemoveItem(index);
        }
        
        if (removedItem) {
            this.showNotification(`${removedItem.name} removed from cart`);
            this.loadCartItems(); // Reload to reflect changes
        }
    }

    fallbackRemoveItem(index) {
        try {
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            if (cart[index]) {
                const removedItem = cart.splice(index, 1)[0];
                localStorage.setItem('cart', JSON.stringify(cart));
                return removedItem;
            }
            return null;
        } catch (error) {
            console.error('Error in fallback remove item:', error);
            return null;
        }
    }

    calculateDeliveryFee(subtotal) {
        const selectedOption = document.querySelector('input[name="deliveryOption"]:checked');
        
        if (!selectedOption) return 5.00;
        
        switch (selectedOption.value) {
            case 'free':
                return subtotal >= 50 ? 0 : 5.00;
            case 'standard':
                return 5.00;
            case 'express':
                return 12.00;
            default:
                return 5.00;
        }
    }

    calculateDiscount(subtotal) {
        const promoCode = document.getElementById('promo-code');
        if (!promoCode) return 0;

        const code = promoCode.value.trim().toUpperCase();
        let discount = 0;

        if (code === 'WELCOME10' && subtotal > 0) {
            discount = subtotal * 0.1;
        } else if (code === 'FARMER15' && subtotal >= 30) {
            discount = subtotal * 0.15;
        } else if (code === 'FIRST5' && subtotal > 0) {
            discount = 5.00;
        }

        return Math.min(discount, subtotal);
    }

    updateDeliveryAndTotal() {
        console.log('Updating delivery and total...');
        
        let subtotal = 0;
        if (window.cartManager && window.cartManager.getSubtotal) {
            subtotal = window.cartManager.getSubtotal();
        } else {
            // Fallback: calculate subtotal from localStorage
            try {
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                subtotal = cart.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 1)), 0);
            } catch (error) {
                console.error('Error calculating subtotal:', error);
                subtotal = 0;
            }
        }

        const deliveryFee = this.calculateDeliveryFee(subtotal);
        const discount = this.calculateDiscount(subtotal);
        const total = subtotal + deliveryFee - discount;

        this.updateOrderSummary(subtotal, deliveryFee, discount, total);
    }

    updateOrderSummary(subtotal, deliveryFee, discount, total) {
        console.log('Updating order summary:', { subtotal, deliveryFee, discount, total });
        
        const subtotalEl = document.getElementById('subtotal');
        const deliveryFeeEl = document.getElementById('delivery-fee');
        const discountEl = document.getElementById('discount');
        const totalEl = document.getElementById('total');

        if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        if (deliveryFeeEl) deliveryFeeEl.textContent = `$${deliveryFee.toFixed(2)}`;
        if (discountEl) discountEl.textContent = `-$${discount.toFixed(2)}`;
        if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;

        // Update free delivery option availability
        const freeDeliveryOption = document.getElementById('freeDelivery');
        if (freeDeliveryOption) {
            const freeDeliveryLabel = freeDeliveryOption.nextElementSibling;
            
            if (subtotal >= 50) {
                freeDeliveryOption.disabled = false;
                freeDeliveryLabel.innerHTML = 'Free Delivery (orders over $50) - <span class="text-success">$0.00</span>';
            } else {
                freeDeliveryOption.disabled = true;
                const needed = (50 - subtotal).toFixed(2);
                freeDeliveryLabel.innerHTML = `Free Delivery - Add $${needed} more to qualify`;
                
                if (freeDeliveryOption.checked) {
                    const standardOption = document.getElementById('standardDelivery');
                    if (standardOption) standardOption.checked = true;
                }
            }
        }
    }

    applyPromoCode() {
        const promoInput = document.getElementById('promo-code');
        if (!promoInput) return;

        const promoCode = promoInput.value.trim().toUpperCase();
        const validPromoCodes = ['WELCOME10', 'FARMER15', 'FIRST5'];
        
        if (!promoCode) {
            this.showPromoMessage('Please enter a promo code', 'error');
            return;
        }

        if (!validPromoCodes.includes(promoCode)) {
            this.showPromoMessage('Invalid promo code', 'error');
            return;
        }

        let subtotal = 0;
        if (window.cartManager && window.cartManager.getSubtotal) {
            subtotal = window.cartManager.getSubtotal();
        } else {
            // Fallback
            try {
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                subtotal = cart.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 1)), 0);
            } catch (error) {
                console.error('Error calculating subtotal for promo:', error);
                subtotal = 0;
            }
        }

        if (promoCode === 'FARMER15' && subtotal < 30) {
            this.showPromoMessage('Minimum order of $30 required for this promo', 'error');
            return;
        }

        this.showPromoMessage('Promo code applied successfully!', 'success');
        this.updateDeliveryAndTotal();
    }

    showPromoMessage(message, type) {
        const existingMessage = document.querySelector('.promo-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `promo-message alert alert-${type === 'success' ? 'success' : 'danger'} mt-2`;
        messageDiv.textContent = message;

        const promoContainer = document.querySelector('.promo-code');
        if (promoContainer) {
            promoContainer.appendChild(messageDiv);
        }

        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 3000);
    }

    showNotification(message, type = 'success') {
        console.log('Showing notification:', message, type);
        
        // Create or get notification element
        let notification = document.getElementById('cart-page-notification');
        
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'cart-page-notification';
            notification.className = 'cart-notification';
            document.body.appendChild(notification);
        }
        
        const icon = type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill';
        notification.innerHTML = `
            <i class="bi ${icon}"></i>
            <span class="notification-text">${message}</span>
        `;
        
        notification.className = `cart-notification ${type}`;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    formatCategory(category) {
        return category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Uncategorized';
    }

    proceedToCheckout() {
        let cart = [];
        if (window.cartManager && window.cartManager.getCart) {
            cart = window.cartManager.getCart();
        } else {
            // Fallback
            try {
                cart = JSON.parse(localStorage.getItem('cart')) || [];
            } catch (error) {
                console.error('Error reading cart for checkout:', error);
                cart = [];
            }
        }
        
        if (cart.length === 0) {
            alert('Your cart is empty. Please add items before checkout.');
            return;
        }
        
        // Save delivery option
        const deliveryOption = document.querySelector('input[name="deliveryOption"]:checked');
        if (deliveryOption) {
            localStorage.setItem('deliveryOption', deliveryOption.value);
        } else {
            // Default to standard delivery if no option selected
            localStorage.setItem('deliveryOption', 'standard');
        }
        
        // Save promo code if applied
        const promoCode = document.getElementById('promo-code');
        if (promoCode && promoCode.value.trim()) {
            localStorage.setItem('appliedPromoCode', promoCode.value.trim().toUpperCase());
        } else {
            localStorage.removeItem('appliedPromoCode');
        }
        
        // Save cart total for checkout page
        const totalEl = document.getElementById('total');
        if (totalEl) {
            const totalValue = parseFloat(totalEl.textContent.replace('$', ''));
            localStorage.setItem('checkoutTotal', totalValue.toFixed(2));
        }
        
        // Redirect to checkout page
        window.location.href = 'checkout.html';
    }
}

// Initialize cart page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing CartPage...');
    window.cartPage = new CartPage();
});
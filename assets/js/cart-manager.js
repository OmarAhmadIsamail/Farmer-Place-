// Centralized Cart Manager with Enhanced Promo Integration - UPDATED
class CartManager {
    constructor() {
        console.log('CartManager initializing...');
        this.cart = this.getCart();
        this.init();
    }

    init() {
        console.log('CartManager init called');
        this.updateCartCounter();
        window.addEventListener('storage', this.handleStorageEvent.bind(this));
        this.forceCounterUpdate();
        
        // Clean up any invalid cart items on initialization
        this.cleanInvalidCartItems();
        
        // Mark as ready
        window.cartManagerReady = true;
        console.log('CartManager ready');
    }

    handleStorageEvent(event) {
        if (event.key === 'cart') {
            this.cart = this.getCart();
            this.updateCartCounter();
            this.dispatchCartUpdateEvent();
        }
    }

    getCart() {
        try {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            // Validate and clean up cart items
            return cart.filter(item => this.isValidCartItem(item));
        } catch (error) {
            console.error('Error reading cart from localStorage:', error);
            return [];
        }
    }

    // Check if cart item is valid (has required properties and exists in products)
    isValidCartItem(item) {
        if (!item || typeof item !== 'object') return false;
        
        // Check for required properties
        if (!item.id || !item.name || typeof item.price !== 'number') {
            return false;
        }
        
        // Check if product exists in farmProducts and is active
        const products = this.getProducts();
        const product = products.find(p => p.id === item.id);
        
        if (!product || product.status !== 'active') {
            return false;
        }
        
        return true;
    }

    // Clean up invalid cart items
    cleanInvalidCartItems() {
        const originalLength = this.cart.length;
        this.cart = this.cart.filter(item => this.isValidCartItem(item));
        
        if (this.cart.length !== originalLength) {
            console.log(`Cleaned up ${originalLength - this.cart.length} invalid cart items`);
            this.saveCart();
        }
    }

    saveCart() {
        try {
            localStorage.setItem('cart', JSON.stringify(this.cart));
            this.updateCartCounter();
            this.dispatchCartUpdateEvent();
            window.dispatchEvent(new Event('storage'));
        } catch (error) {
            console.error('Error saving cart to localStorage:', error);
        }
    }

    getProducts() {
        try {
            return JSON.parse(localStorage.getItem('farmProducts')) || [];
        } catch (error) {
            console.error('Error reading products from localStorage:', error);
            return [];
        }
    }

    // Only validate existing properties, don't create unknown products
    validateCartItem(item) {
        // If item is already invalid, return null to filter it out
        if (!this.isValidCartItem(item)) {
            return null;
        }
        
        const products = this.getProducts();
        const product = products.find(p => p.id === item.id);
        
        if (!product) {
            return null; // Don't create unknown products
        }
        
        return {
            id: item.id,
            name: product.name, // Always use the name from farmProducts
            price: product.price, // Always use the price from farmProducts
            category: product.category || 'uncategorized',
            image: product.image || (product.images && product.images[0]) || 'assets/img/placeholder.jpg',
            weight: product.details?.weight || product.weight || 'N/A',
            quantity: Math.max(1, parseInt(item.quantity) || 1) // Ensure valid quantity
        };
    }

    addItem(productId, quantity = 1) {
        console.log('Adding product to cart:', productId, quantity);
        
        const products = this.getProducts();
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            console.error('Product not found in farmProducts:', productId);
            this.showNotification('Product not available', 'error');
            return false;
        }

        // Check if product is active
        if (product.status !== 'active') {
            this.showNotification('This product is not available for purchase', 'error');
            return false;
        }

        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            // Create new cart item with product data
            const newCartItem = {
                id: product.id,
                name: product.name,
                price: product.price,
                category: product.category,
                image: product.image || 
                      (product.images && product.images[0]) || 
                      'assets/img/placeholder.jpg',
                weight: product.details?.weight || product.weight || 'N/A',
                quantity: quantity
            };
            
            this.cart.push(newCartItem);
        }
        
        this.saveCart();
        this.showNotification(`${product.name} added to cart`);
        return true;
    }

    updateQuantity(index, change) {
        if (this.cart[index]) {
            this.cart[index].quantity += change;
            
            if (this.cart[index].quantity <= 0) {
                this.cart.splice(index, 1);
            }
            
            this.saveCart();
            return true;
        }
        return false;
    }

    removeItem(index) {
        if (this.cart[index]) {
            const removedItem = this.cart.splice(index, 1)[0];
            this.saveCart();
            return removedItem;
        }
        return null;
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
    }

    getTotalItems() {
        return this.cart.reduce((total, item) => total + (item.quantity || 1), 0);
    }

    getSubtotal() {
        return this.cart.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 1)), 0);
    }

    // Get cart item by product ID
    getCartItem(productId) {
        return this.cart.find(item => item.id === productId);
    }

    // Check if product is in cart
    isInCart(productId) {
        return this.cart.some(item => item.id === productId);
    }

    // Get current user from session storage
    getCurrentUser() {
        try {
            const userData = sessionStorage.getItem('userData');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    // Create order with user info
    createOrder(customerInfo, totalAmount = null) {
        const orders = this.getOrders();
        const currentUser = this.getCurrentUser();
        
        // Get applied promo code
        const appliedPromoCode = localStorage.getItem('appliedPromoCode');
        const deliveryOption = localStorage.getItem('deliveryOption') || 'standard';
        
        // Calculate final amounts
        const subtotal = this.getSubtotal();
        const deliveryFee = this.calculateDeliveryFee(subtotal, deliveryOption);
        const discount = this.calculateDiscount(subtotal, appliedPromoCode);
        const finalTotal = totalAmount || (subtotal + deliveryFee - discount);

        const newOrder = {
            id: 'ORD_' + Date.now(),
            items: [...this.cart],
            customerName: customerInfo.name,
            customerEmail: customerInfo.email,
            customerPhone: customerInfo.phone,
            customerAddress: customerInfo.address,
            subtotal: subtotal,
            deliveryFee: deliveryFee,
            discount: discount,
            totalAmount: finalTotal,
            status: 'pending',
            date: new Date().toISOString(),
            deliveryOption: deliveryOption,
            promoCode: appliedPromoCode,
            userId: currentUser ? currentUser.id : 'guest',
            userEmail: currentUser ? currentUser.email : customerInfo.email
        };

        // Increment promo code usage if applied
        if (appliedPromoCode) {
            this.incrementPromoUsage(appliedPromoCode);
        }

        orders.push(newOrder);
        this.saveOrders(orders);
        this.clearCart();
        
        // Clear checkout-related localStorage items
        this.clearCheckoutData();
        
        return newOrder;
    }

    // NEW: Increment promo code usage
    incrementPromoUsage(promoCode) {
        try {
            const promoCodes = JSON.parse(localStorage.getItem('promoCodes')) || [];
            const promo = promoCodes.find(p => p.code === promoCode);
            
            if (promo) {
                promo.usedCount = (promo.usedCount || 0) + 1;
                promo.updatedAt = new Date().toISOString();
                localStorage.setItem('promoCodes', JSON.stringify(promoCodes));
                console.log(`Incremented usage for promo code: ${promoCode}`);
            }
        } catch (error) {
            console.error('Error incrementing promo usage:', error);
        }
    }

    // NEW: Clear checkout data
    clearCheckoutData() {
        localStorage.removeItem('deliveryOption');
        localStorage.removeItem('appliedPromoCode');
        localStorage.removeItem('checkoutTotal');
    }

    getOrders() {
        try {
            return JSON.parse(localStorage.getItem('orders')) || [];
        } catch (error) {
            console.error('Error reading orders from localStorage:', error);
            return [];
        }
    }

    saveOrders(orders) {
        try {
            localStorage.setItem('orders', JSON.stringify(orders));
        } catch (error) {
            console.error('Error saving orders to localStorage:', error);
            throw new Error('Failed to save order');
        }
    }

    getOrder(orderId) {
        const orders = this.getOrders();
        return orders.find(order => order.id === orderId);
    }

    updateOrderStatus(orderId, status) {
        const orders = this.getOrders();
        const order = orders.find(order => order.id === orderId);
        
        if (order) {
            order.status = status;
            order.updatedAt = new Date().toISOString();
            this.saveOrders(orders);
            
            // Dispatch event for order status update
            this.dispatchOrderUpdateEvent(orderId, status);
            return true;
        }
        return false;
    }

    // Get orders by status
    getOrdersByStatus(status) {
        const orders = this.getOrders();
        return orders.filter(order => order.status === status);
    }

    // UPDATED: Calculate delivery fee with promo consideration
    calculateDeliveryFee(subtotal, deliveryOption = null) {
        const option = deliveryOption || localStorage.getItem('deliveryOption') || 'standard';
        
        // Check for free shipping promo
        const appliedPromoCode = localStorage.getItem('appliedPromoCode');
        if (appliedPromoCode) {
            try {
                const promoCodes = JSON.parse(localStorage.getItem('promoCodes')) || [];
                const promo = promoCodes.find(p => 
                    p.code === appliedPromoCode && 
                    p.type === 'free_shipping'
                );
                
                if (promo) {
                    // Validate free shipping promo
                    const validation = this.validatePromoCodeForCart(appliedPromoCode, subtotal);
                    if (validation.valid) {
                        return 0; // Free shipping
                    }
                }
            } catch (error) {
                console.error('Error checking free shipping promo:', error);
            }
        }
        
        switch (option) {
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

    // UPDATED: Calculate discount with enhanced promo integration
    calculateDiscount(subtotal, promoCode = null) {
        const code = promoCode || localStorage.getItem('appliedPromoCode');
        if (!code) return 0;

        // Use promo validation
        const validation = this.validatePromoCodeForCart(code, subtotal);
        if (!validation.valid || !validation.promo) {
            return 0;
        }

        const promo = validation.promo;
        let discount = 0;

        switch (promo.type) {
            case 'percentage':
                discount = subtotal * (promo.value / 100);
                break;
            case 'fixed':
                discount = Math.min(promo.value, subtotal);
                break;
            case 'free_shipping':
                discount = 0; // Free shipping handled separately
                break;
        }

        return Math.min(discount, subtotal);
    }

    // NEW: Enhanced promo code validation
    validatePromoCodeForCart(code, cartSubtotal) {
        if (!code) {
            return { valid: false, message: 'Please enter a promo code' };
        }

        try {
            const promoCodes = JSON.parse(localStorage.getItem('promoCodes')) || [];
            const promo = promoCodes.find(p => 
                p.code === code.toUpperCase() && 
                p.status === 'active'
            );

            if (!promo) {
                return { valid: false, message: 'Invalid promo code' };
            }

            const now = new Date();

            // Check if not started yet
            if (promo.startDate && new Date(promo.startDate) > now) {
                const startDate = new Date(promo.startDate).toLocaleDateString();
                return { 
                    valid: false, 
                    message: `Promo code starts on ${startDate}` 
                };
            }

            // Check if expired
            if (promo.expiryDate && new Date(promo.expiryDate) < now) {
                return { valid: false, message: 'Promo code has expired' };
            }

            // Check minimum order
            if (promo.minOrder && cartSubtotal < promo.minOrder) {
                return { 
                    valid: false, 
                    message: `Minimum order of $${promo.minOrder} required` 
                };
            }

            // Check usage limits
            if (promo.maxUses && (promo.usedCount || 0) >= promo.maxUses) {
                return { valid: false, message: 'Promo code usage limit reached' };
            }

            return { valid: true, promo: promo };
        } catch (error) {
            console.error('Error validating promo code:', error);
            return { valid: false, message: 'Error validating promo code' };
        }
    }

    // NEW: Apply promo code with enhanced functionality
    applyPromoCode(code, cartSubtotal) {
        const validation = this.validatePromoCodeForCart(code, cartSubtotal);
        
        if (!validation.valid) {
            return validation;
        }

        const promo = validation.promo;
        let discount = 0;
        let freeShipping = false;

        switch (promo.type) {
            case 'percentage':
                discount = cartSubtotal * (promo.value / 100);
                break;
            case 'fixed':
                discount = Math.min(promo.value, cartSubtotal);
                break;
            case 'free_shipping':
                freeShipping = true;
                discount = 0;
                break;
        }

        // Store applied promo code
        localStorage.setItem('appliedPromoCode', code.toUpperCase());

        return {
            valid: true,
            discount: discount,
            freeShipping: freeShipping,
            promo: promo
        };
    }

    // NEW: Remove applied promo code
    removePromoCode() {
        localStorage.removeItem('appliedPromoCode');
        return { valid: true, message: 'Promo code removed' };
    }

    // NEW: Get cart summary for checkout with promo support
    getCartSummary() {
        const subtotal = this.getSubtotal();
        const deliveryOption = localStorage.getItem('deliveryOption') || 'standard';
        const deliveryFee = this.calculateDeliveryFee(subtotal, deliveryOption);
        const discount = this.calculateDiscount(subtotal);
        const total = subtotal + deliveryFee - discount;

        return {
            subtotal: subtotal,
            deliveryFee: deliveryFee,
            discount: discount,
            total: total,
            itemCount: this.getTotalItems(),
            deliveryOption: deliveryOption,
            appliedPromoCode: localStorage.getItem('appliedPromoCode')
        };
    }

    updateCartCounter() {
        const totalItems = this.getTotalItems();
        const cartCounter = document.querySelector('.cart-counter');
        
        if (cartCounter) {
            cartCounter.textContent = totalItems;
            cartCounter.style.display = totalItems > 0 ? 'flex' : 'none';
            cartCounter.style.visibility = 'visible';
            cartCounter.style.opacity = '1';
            
            if (totalItems === 0) {
                cartCounter.style.background = 'color-mix(in srgb, var(--default-color), transparent 30%)';
            } else {
                cartCounter.style.background = 'var(--accent-color)';
            }
        }
        
        // Also update any elements with class 'cart-count'
        const cartCountElements = document.querySelectorAll('.cart-count');
        cartCountElements.forEach(element => {
            element.textContent = totalItems;
            element.style.display = totalItems > 0 ? 'inline' : 'none';
        });

        // Update cart badge in mobile view
        const mobileCartBadge = document.querySelector('.mobile-cart-badge');
        if (mobileCartBadge) {
            mobileCartBadge.textContent = totalItems;
            mobileCartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }

    forceCounterUpdate() {
        setTimeout(() => {
            this.updateCartCounter();
        }, 100);
        
        // Also update on page load completion
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.updateCartCounter();
            }, 500);
        });
    }

    dispatchCartUpdateEvent() {
        const event = new CustomEvent('cartUpdated', {
            detail: { 
                cart: [...this.cart],
                totalItems: this.getTotalItems(),
                subtotal: this.getSubtotal(),
                summary: this.getCartSummary()
            }
        });
        window.dispatchEvent(event);
    }

    // Dispatch order update event
    dispatchOrderUpdateEvent(orderId, status) {
        const event = new CustomEvent('orderUpdated', {
            detail: {
                orderId: orderId,
                status: status
            }
        });
        window.dispatchEvent(event);
    }

    showNotification(message, type = 'success') {
        console.log('Cart notification:', message, type);
        
        let notification = document.getElementById('cart-notification');
        
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'cart-notification';
            notification.className = 'cart-notification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 9999;
                display: flex;
                align-items: center;
                gap: 10px;
                transform: translateX(400px);
                opacity: 0;
                transition: all 0.3s ease;
                border-left: 4px solid ${type === 'success' ? '#28a745' : '#dc3545'};
            `;
            document.body.appendChild(notification);
        }
        
        const icon = type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill';
        const iconColor = type === 'success' ? '#28a745' : '#dc3545';
        
        notification.innerHTML = `
            <i class="bi ${icon}" style="color: ${iconColor};"></i>
            <span class="notification-text">${message}</span>
        `;
        
        notification.className = `cart-notification ${type}`;
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
        
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            notification.style.opacity = '0';
        }, 3000);
    }

    // NEW: Get promo statistics
    getPromoStats() {
        try {
            const promoCodes = JSON.parse(localStorage.getItem('promoCodes')) || [];
            const totalPromos = promoCodes.length;
            const activePromos = promoCodes.filter(p => p.status === 'active').length;
            const expiredPromos = promoCodes.filter(p => p.status === 'expired').length;
            const totalUses = promoCodes.reduce((sum, promo) => sum + (promo.usedCount || 0), 0);
            
            return {
                totalPromos,
                activePromos,
                expiredPromos,
                totalUses
            };
        } catch (error) {
            console.error('Error getting promo stats:', error);
            return { totalPromos: 0, activePromos: 0, expiredPromos: 0, totalUses: 0 };
        }
    }
}

// Initialize cart manager immediately
console.log('Creating global cart manager instance...');
window.cartManager = new CartManager();
console.log('Cart manager instance created:', !!window.cartManager);

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartManager;
}
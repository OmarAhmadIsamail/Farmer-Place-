// Centralized Cart Manager with Order Management - FIXED
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
            // Validate and clean up cart items - FIXED: Don't create unknown products
            return cart.filter(item => this.isValidCartItem(item));
        } catch (error) {
            console.error('Error reading cart from localStorage:', error);
            return [];
        }
    }

    // NEW METHOD: Check if cart item is valid (has required properties and exists in products)
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

    // NEW METHOD: Clean up invalid cart items
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

    // FIXED METHOD: Only validate existing properties, don't create unknown products
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
            console.log('Available products:', products.map(p => p.id));
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
            // Create new cart item with product data - FIXED: Use actual product data
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

    // NEW METHOD: Get cart item by product ID
    getCartItem(productId) {
        return this.cart.find(item => item.id === productId);
    }

    // NEW METHOD: Check if product is in cart
    isInCart(productId) {
        return this.cart.some(item => item.id === productId);
    }

    createOrder(customerInfo, totalAmount = null) {
        const orders = this.getOrders();
        
        const newOrder = {
            id: Date.now(),
            items: [...this.cart],
            customerName: customerInfo.name,
            customerEmail: customerInfo.email,
            customerPhone: customerInfo.phone,
            customerAddress: customerInfo.address,
            amount: totalAmount || this.getSubtotal(),
            status: 'pending',
            date: new Date().toISOString(),
            deliveryOption: localStorage.getItem('deliveryOption') || 'standard',
            promoCode: localStorage.getItem('appliedPromoCode') || null
        };

        orders.push(newOrder);
        this.saveOrders(orders);
        this.clearCart();
        
        // Clear checkout-related localStorage items
        localStorage.removeItem('deliveryOption');
        localStorage.removeItem('appliedPromoCode');
        localStorage.removeItem('checkoutTotal');
        
        return newOrder;
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

    // NEW METHOD: Get orders by status
    getOrdersByStatus(status) {
        const orders = this.getOrders();
        return orders.filter(order => order.status === status);
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
                subtotal: this.getSubtotal()
            }
        });
        window.dispatchEvent(event);
    }

    // NEW METHOD: Dispatch order update event
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

    // NEW METHOD: Calculate delivery fee
    calculateDeliveryFee(subtotal) {
        const deliveryOption = localStorage.getItem('deliveryOption') || 'standard';
        
        switch (deliveryOption) {
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

    // NEW METHOD: Calculate discount from promo code
    calculateDiscount(subtotal) {
        const promoCode = localStorage.getItem('appliedPromoCode');
        if (!promoCode) return 0;

        let discount = 0;

        switch (promoCode.toUpperCase()) {
            case 'WELCOME10':
                discount = subtotal * 0.1;
                break;
            case 'FARMER15':
                discount = subtotal >= 30 ? subtotal * 0.15 : 0;
                break;
            case 'FIRST5':
                discount = 5.00;
                break;
            default:
                discount = 0;
        }

        return Math.min(discount, subtotal);
    }

    // NEW METHOD: Get cart summary for checkout
    getCartSummary() {
        const subtotal = this.getSubtotal();
        const deliveryFee = this.calculateDeliveryFee(subtotal);
        const discount = this.calculateDiscount(subtotal);
        const total = subtotal + deliveryFee - discount;

        return {
            subtotal: subtotal,
            deliveryFee: deliveryFee,
            discount: discount,
            total: total,
            itemCount: this.getTotalItems()
        };
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
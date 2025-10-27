// Centralized Cart Manager - Fixed Version
class CartManager {
    constructor() {
        this.cart = this.getCart();
        this.init();
    }

    init() {
        this.updateCartCounter();
        // Listen for storage events from other tabs
        window.addEventListener('storage', this.handleStorageEvent.bind(this));
        
        // Initial update to ensure counter is visible
        this.forceCounterUpdate();
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
            return JSON.parse(localStorage.getItem('cart')) || [];
        } catch (error) {
            console.error('Error reading cart from localStorage:', error);
            return [];
        }
    }

    saveCart() {
        try {
            localStorage.setItem('cart', JSON.stringify(this.cart));
            this.updateCartCounter();
            this.dispatchCartUpdateEvent();
            
            // Force storage event for same-tab listening
            window.dispatchEvent(new Event('storage'));
        } catch (error) {
            console.error('Error saving cart to localStorage:', error);
        }
    }

    addItem(product) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += product.quantity || 1;
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                category: product.category,
                image: product.image,
                weight: product.weight,
                quantity: product.quantity || 1
            });
        }
        
        this.saveCart();
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
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    getSubtotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    updateCartCounter() {
        const totalItems = this.getTotalItems();
        const cartCounter = document.querySelector('.cart-counter');
        
        if (cartCounter) {
            cartCounter.textContent = totalItems;
            // Always show the counter, even when 0
            cartCounter.style.display = 'flex';
            cartCounter.style.visibility = 'visible';
            cartCounter.style.opacity = '1';
            
            // Optional: Change style when cart is empty
            if (totalItems === 0) {
                cartCounter.style.background = 'color-mix(in srgb, var(--default-color), transparent 30%)';
            } else {
                cartCounter.style.background = 'var(--accent-color)';
            }
        }
    }

    // Force counter update on initialization
    forceCounterUpdate() {
        setTimeout(() => {
            this.updateCartCounter();
        }, 100);
    }

    dispatchCartUpdateEvent() {
        // Dispatch custom event when cart is updated
        const event = new CustomEvent('cartUpdated', {
            detail: { 
                cart: [...this.cart],
                totalItems: this.getTotalItems(),
                subtotal: this.getSubtotal()
            }
        });
        window.dispatchEvent(event);
    }

    showNotification(message, type = 'success') {
        let notification = document.getElementById('cart-notification');
        
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'cart-notification';
            notification.className = 'cart-notification';
            document.body.appendChild(notification);
        }
        
        const icon = type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill';
        notification.innerHTML = `
            <i class="bi ${icon}"></i>
            <span class="notification-text">${message}</span>
        `;
        
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    }
}

// Create global cart manager instance
window.cartManager = new CartManager();
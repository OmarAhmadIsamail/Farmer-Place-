// Cart Page Functionality - Fixed Delete Issue
class CartPage {
    constructor() {
        this.init();
    }

    init() {
        if (!window.cartManager) {
            console.error('Cart manager not found');
            return;
        }

        this.loadCartItems();
        this.setupEventListeners();
        this.setupCartUpdateListener();
    }

    loadCartItems() {
        const cart = window.cartManager.getCart();
        const cartContent = document.getElementById('cart-content');
        const emptyCart = document.getElementById('empty-cart');
        const cartItemCount = document.getElementById('cart-item-count');
        const checkoutBtn = document.getElementById('checkout-btn');

        console.log('Loading cart items:', cart);

        if (cart.length === 0) {
            // Show empty cart message
            if (emptyCart) emptyCart.style.display = 'block';
            if (cartContent) cartContent.innerHTML = '';
            if (cartItemCount) cartItemCount.textContent = '0 items';
            if (checkoutBtn) checkoutBtn.disabled = true;
            this.updateOrderSummary(0, 0, 0);
            return;
        }

        // Hide empty cart message
        if (emptyCart) emptyCart.style.display = 'none';

        // Calculate total items
        const totalItems = window.cartManager.getTotalItems();
        if (cartItemCount) cartItemCount.textContent = `${totalItems} ${totalItems === 1 ? 'item' : 'items'}`;

        // Generate cart items HTML
        let cartHTML = '';
        const subtotal = window.cartManager.getSubtotal();

        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;

            cartHTML += `
                <div class="cart-item" data-product-id="${item.id}" data-index="${index}">
                    <div class="row align-items-center">
                        <div class="col-md-2">
                            <img src="${item.image || 'assets/img/products/product-1.jpg'}" 
                                 alt="${item.name}" 
                                 class="img-fluid rounded cart-item-image"
                                 onerror="this.src='assets/img/products/product-1.jpg'">
                        </div>
                        <div class="col-md-4">
                            <h5 class="cart-item-title">${item.name}</h5>
                            <p class="cart-item-category text-muted mb-0">${item.category}</p>
                            <small class="cart-item-weight">${item.weight}</small>
                        </div>
                        <div class="col-md-2">
                            <span class="cart-item-price">$${item.price.toFixed(2)}</span>
                        </div>
                        <div class="col-md-2">
                            <div class="quantity-controls">
                                <button class="btn btn-sm btn-outline-secondary quantity-decrease" 
                                        data-index="${index}">-</button>
                                <span class="quantity-display mx-2">${item.quantity}</span>
                                <button class="btn btn-sm btn-outline-secondary quantity-increase" 
                                        data-index="${index}">+</button>
                            </div>
                        </div>
                        <div class="col-md-2">
                            <span class="cart-item-total">$${itemTotal.toFixed(2)}</span>
                            <button class="btn btn-sm btn-danger remove-item ms-2" 
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

        if (cartContent) cartContent.innerHTML = cartHTML;
        if (checkoutBtn) checkoutBtn.disabled = false;

        // Calculate delivery and totals
        const deliveryFee = this.calculateDeliveryFee(subtotal);
        const discount = this.calculateDiscount(subtotal);
        const total = subtotal + deliveryFee - discount;

        this.updateOrderSummary(subtotal, deliveryFee, discount, total);
    }

    setupEventListeners() {
        // Use event delegation for dynamic elements
        document.addEventListener('click', (e) => {
            // Quantity decrease
            if (e.target.classList.contains('quantity-decrease') || 
                e.target.closest('.quantity-decrease')) {
                const button = e.target.classList.contains('quantity-decrease') ? e.target : e.target.closest('.quantity-decrease');
                const index = parseInt(button.getAttribute('data-index'));
                this.handleQuantityChange(index, -1);
            }

            // Quantity increase
            if (e.target.classList.contains('quantity-increase') || 
                e.target.closest('.quantity-increase')) {
                const button = e.target.classList.contains('quantity-increase') ? e.target : e.target.closest('.quantity-increase');
                const index = parseInt(button.getAttribute('data-index'));
                this.handleQuantityChange(index, 1);
            }

            // Remove item
            if (e.target.classList.contains('remove-item') || 
                e.target.closest('.remove-item')) {
                const button = e.target.classList.contains('remove-item') ? e.target : e.target.closest('.remove-item');
                const index = parseInt(button.getAttribute('data-index'));
                this.handleRemoveItem(index);
            }
        });

        // Delivery options
        const deliveryOptions = document.querySelectorAll('input[name="deliveryOption"]');
        deliveryOptions.forEach(option => {
            option.addEventListener('change', () => this.updateDeliveryAndTotal());
        });

        // Promo code
        const applyPromoBtn = document.getElementById('apply-promo');
        if (applyPromoBtn) {
            applyPromoBtn.addEventListener('click', () => this.applyPromoCode());
        }

        // Checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.proceedToCheckout());
        }

        // Enter key for promo code
        const promoInput = document.getElementById('promo-code');
        if (promoInput) {
            promoInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.applyPromoCode();
                }
            });
        }
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
                console.log('Storage event received in cart page');
                this.loadCartItems();
            }
        });
    }

    handleQuantityChange(index, change) {
        console.log('Quantity change requested:', index, change);
        if (window.cartManager.updateQuantity(index, change)) {
            window.cartManager.showNotification('Cart updated');
        }
    }

    handleRemoveItem(index) {
        console.log('Remove item requested:', index);
        const removedItem = window.cartManager.removeItem(index);
        if (removedItem) {
            window.cartManager.showNotification(`${removedItem.name} removed from cart`);
            // The cartUpdated event will trigger loadCartItems()
        }
    }

    // ... rest of your existing methods (calculateDeliveryFee, calculateDiscount, etc.)
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
        if (!window.cartManager) return;

        const subtotal = window.cartManager.getSubtotal();
        const deliveryFee = this.calculateDeliveryFee(subtotal);
        const discount = this.calculateDiscount(subtotal);
        const total = subtotal + deliveryFee - discount;

        this.updateOrderSummary(subtotal, deliveryFee, discount, total);
    }

    updateOrderSummary(subtotal, deliveryFee, discount, total) {
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

        if (!window.cartManager) return;
        const subtotal = window.cartManager.getSubtotal();

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

    proceedToCheckout() {
        if (!window.cartManager) return;

        const cart = window.cartManager.getCart();
        
        if (cart.length === 0) {
            alert('Your cart is empty. Please add some items before checkout.');
            return;
        }

        const total = document.getElementById('total');
        const itemCount = window.cartManager.getTotalItems();
        
        alert(`Proceeding to checkout with ${itemCount} items. Total: ${total ? total.textContent : '$0.00'}\n\nThis would redirect to a secure checkout page in a real application.`);
    }
}

// Initialize cart page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.cartPage = new CartPage();
});
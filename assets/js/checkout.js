// Checkout Functionality - Updated for Guest Checkout
document.addEventListener('DOMContentLoaded', function() {
    // Initialize checkout
    initializeCheckout();
    
    // Load order summary
    loadOrderSummary();
    
    // Setup event listeners
    setupEventListeners();
});

// Initialize checkout
function initializeCheckout() {
    // Check if cart exists and has items
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        alert('Your cart is empty. Redirecting to products page.');
        window.location.href = 'product.html';
        return;
    }
    
    // Pre-fill user information if available (from registered user or previous guest checkout)
    prefillUserInfo();
}

// Pre-fill user information
function prefillUserInfo() {
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    const registeredUser = JSON.parse(sessionStorage.getItem('registeredUser'));
    
    // Try to get guest info from localStorage if available
    const guestInfo = JSON.parse(localStorage.getItem('guestInfo')) || {};
    
    if (registeredUser && registeredUser.fullName) {
        const names = registeredUser.fullName.split(' ');
        document.getElementById('firstName').value = names[0] || '';
        document.getElementById('lastName').value = names.slice(1).join(' ') || '';
    } else if (guestInfo.firstName) {
        document.getElementById('firstName').value = guestInfo.firstName;
        document.getElementById('lastName').value = guestInfo.lastName || '';
    }
    
    if (registeredUser && registeredUser.email) {
        document.getElementById('email').value = registeredUser.email;
    } else if (guestInfo.email) {
        document.getElementById('email').value = guestInfo.email;
    }
    
    // Pre-fill other guest info if available
    if (guestInfo.phone) {
        document.getElementById('phone').value = guestInfo.phone;
    }
    if (guestInfo.address) {
        document.getElementById('address').value = guestInfo.address;
    }
    if (guestInfo.city) {
        document.getElementById('city').value = guestInfo.city;
    }
    if (guestInfo.zipCode) {
        document.getElementById('zipCode').value = guestInfo.zipCode;
    }
    if (guestInfo.country) {
        document.getElementById('country').value = guestInfo.country;
    }
}

// Load order summary
function loadOrderSummary() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const deliveryOption = localStorage.getItem('deliveryOption') || 'standard';
    
    // Calculate totals
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const deliveryFee = deliveryOption === 'express' ? 12.00 : 5.00;
    const tax = subtotal * 0.08;
    const total = subtotal + deliveryFee + tax;
    
    // Update sidebar
    document.getElementById('sidebar-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('sidebar-delivery').textContent = `$${deliveryFee.toFixed(2)}`;
    document.getElementById('sidebar-tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('sidebar-total').textContent = `$${total.toFixed(2)}`;
    document.getElementById('delivery-time').textContent = deliveryOption === 'express' ? '1 day' : '2-3 days';
    
    // Load items in sidebar
    const sidebarItems = document.getElementById('sidebar-items');
    sidebarItems.innerHTML = '';
    
    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'summary-item';
        itemElement.innerHTML = `
            <div class="item-name">${item.name}</div>
            <div class="item-quantity">x${item.quantity}</div>
            <div class="item-price">$${(item.price * item.quantity).toFixed(2)}</div>
        `;
        sidebarItems.appendChild(itemElement);
    });
    
    // Load items in review step
    loadReviewItems();
}

// Load items for review step
function loadReviewItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const checkoutItems = document.getElementById('checkout-items');
    checkoutItems.innerHTML = '';
    
    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'review-item';
        itemElement.innerHTML = `
            <div class="review-info">
                <strong>${item.name}</strong> - ${item.quantity} x $${item.price.toFixed(2)}
            </div>
            <div class="review-price">
                $${(item.price * item.quantity).toFixed(2)}
            </div>
        `;
        checkoutItems.appendChild(itemElement);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Step navigation
    document.querySelectorAll('.next-step').forEach(button => {
        button.addEventListener('click', handleNextStep);
    });
    
    document.querySelectorAll('.prev-step').forEach(button => {
        button.addEventListener('click', handlePrevStep);
    });
    
    // Payment method selection
    document.querySelectorAll('.payment-method-card').forEach(card => {
        card.addEventListener('click', handlePaymentMethodSelect);
    });
    
    // Form validation
    document.getElementById('step-2').addEventListener('submit', handleLocationSubmit);
    document.getElementById('step-3').addEventListener('submit', handleOrderSubmit);
    
    // Place order button
    document.getElementById('place-order-btn').addEventListener('click', placeOrder);
    
    // Card number formatting
    document.getElementById('cardNumber')?.addEventListener('input', formatCardNumber);
    document.getElementById('expiryDate')?.addEventListener('input', formatExpiryDate);
    
    // Guest checkout option
    const guestCheckoutBtn = document.getElementById('guest-checkout-btn');
    if (guestCheckoutBtn) {
        guestCheckoutBtn.addEventListener('click', proceedAsGuest);
    }
}

// Handle next step
function handleNextStep(e) {
    e.preventDefault();
    const currentStep = e.target.closest('.checkout-step');
    const nextStepId = e.target.getAttribute('data-next');
    
    // Validate current step
    if (!validateStep(currentStep.id)) {
        return;
    }
    
    // Save step data
    saveStepData(currentStep.id);
    
    // Move to next step
    currentStep.classList.remove('active');
    document.getElementById(`step-${nextStepId}`).classList.add('active');
    updateStepProgress(nextStepId);
}

// Handle previous step
function handlePrevStep(e) {
    e.preventDefault();
    const currentStep = e.target.closest('.checkout-step');
    const prevStepId = e.target.getAttribute('data-prev');
    
    currentStep.classList.remove('active');
    document.getElementById(`step-${prevStepId}`).classList.add('active');
    updateStepProgress(prevStepId);
}

// Update step progress
function updateStepProgress(activeStep) {
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });
    
    for (let i = 1; i <= activeStep; i++) {
        document.querySelector(`.step[data-step="${i}"]`).classList.add('active');
    }
}

// Validate step
function validateStep(stepId) {
    switch (stepId) {
        case 'step-1':
            return validatePaymentMethod();
        case 'step-2':
            return validateLocation();
        case 'step-3':
            return validateReview();
        default:
            return true;
    }
}

// Validate payment method
function validatePaymentMethod() {
    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked');
    
    if (!selectedMethod) {
        alert('Please select a payment method');
        return false;
    }
    
    if (selectedMethod.value === 'digital') {
        const walletSelected = document.querySelector('input[name="wallet"]:checked');
        if (!walletSelected) {
            alert('Please select a digital wallet');
            return false;
        }
    }
    
    if (selectedMethod.value === 'card') {
        if (!validateCardForm()) {
            return false;
        }
    }
    
    return true;
}

// Validate card form
function validateCardForm() {
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const expiryDate = document.getElementById('expiryDate').value;
    const cvv = document.getElementById('cvv').value;
    const cardHolder = document.getElementById('cardHolder').value;
    
    if (cardNumber.length !== 16 || !/^\d+$/.test(cardNumber)) {
        alert('Please enter a valid 16-digit card number');
        return false;
    }
    
    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
        alert('Please enter a valid expiry date (MM/YY)');
        return false;
    }
    
    if (cvv.length !== 3 || !/^\d+$/.test(cvv)) {
        alert('Please enter a valid 3-digit CVV');
        return false;
    }
    
    if (!cardHolder.trim()) {
        alert('Please enter card holder name');
        return false;
    }
    
    return true;
}

// Validate location
function validateLocation() {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'zipCode', 'country'];
    
    for (const fieldId of requiredFields) {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            alert(`Please fill in ${field.labels[0].textContent}`);
            field.focus();
            return false;
        }
    }
    
    // Validate email
    const email = document.getElementById('email').value;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Please enter a valid email address');
        return false;
    }
    
    return true;
}

// Validate review
function validateReview() {
    const agreeTerms = document.getElementById('agreeTerms');
    
    if (!agreeTerms.checked) {
        alert('Please agree to the terms and conditions');
        return false;
    }
    
    return true;
}

// Handle payment method selection
function handlePaymentMethodSelect(e) {
    const card = e.currentTarget;
    const radio = card.querySelector('.method-radio');
    
    // Select the radio button
    radio.checked = true;
    
    // Update UI
    document.querySelectorAll('.payment-method-card').forEach(c => {
        c.classList.remove('selected');
    });
    card.classList.add('selected');
}

// Save step data
function saveStepData(stepId) {
    switch (stepId) {
        case 'step-1':
            savePaymentMethod();
            break;
        case 'step-2':
            saveLocation();
            break;
    }
}

// Save payment method
function savePaymentMethod() {
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    localStorage.setItem('paymentMethod', paymentMethod);
    
    if (paymentMethod === 'digital') {
        const wallet = document.querySelector('input[name="wallet"]:checked').value;
        localStorage.setItem('wallet', wallet);
    }
    
    if (paymentMethod === 'card') {
        const cardData = {
            number: document.getElementById('cardNumber').value,
            expiry: document.getElementById('expiryDate').value,
            cvv: document.getElementById('cvv').value,
            holder: document.getElementById('cardHolder').value
        };
        localStorage.setItem('cardData', JSON.stringify(cardData));
    }
}

// Save location
function saveLocation() {
    const locationData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        zipCode: document.getElementById('zipCode').value,
        country: document.getElementById('country').value,
        instructions: document.getElementById('deliveryInstructions').value
    };
    
    localStorage.setItem('deliveryLocation', JSON.stringify(locationData));
    
    // Save guest info for future use
    localStorage.setItem('guestInfo', JSON.stringify(locationData));
    
    updateDeliveryInfo();
}

// Update delivery info in review step
function updateDeliveryInfo() {
    const locationData = JSON.parse(localStorage.getItem('deliveryLocation') || '{}');
    const deliveryInfo = document.getElementById('delivery-info');
    
    deliveryInfo.innerHTML = `
        <div class="review-item">
            <div class="review-info">
                <strong>Name:</strong> ${locationData.firstName} ${locationData.lastName}
            </div>
        </div>
        <div class="review-item">
            <div class="review-info">
                <strong>Email:</strong> ${locationData.email}
            </div>
        </div>
        <div class="review-item">
            <div class="review-info">
                <strong>Phone:</strong> ${locationData.phone}
            </div>
        </div>
        <div class="review-item">
            <div class="review-info">
                <strong>Address:</strong> ${locationData.address}, ${locationData.city}, ${locationData.zipCode}, ${locationData.country}
            </div>
        </div>
        ${locationData.instructions ? `
        <div class="review-item">
            <div class="review-info">
                <strong>Instructions:</strong> ${locationData.instructions}
            </div>
        </div>
        ` : ''}
    `;
    
    updatePaymentInfo();
}

// Update payment info in review step
function updatePaymentInfo() {
    const paymentMethod = localStorage.getItem('paymentMethod');
    const paymentInfo = document.getElementById('payment-info');
    
    let paymentDetails = '';
    
    switch (paymentMethod) {
        case 'cash':
            paymentDetails = 'Cash on Delivery';
            break;
        case 'digital':
            const wallet = localStorage.getItem('wallet');
            paymentDetails = `Digital Wallet (${wallet})`;
            break;
        case 'card':
            const cardData = JSON.parse(localStorage.getItem('cardData') || '{}');
            paymentDetails = `Credit/Debit Card ending in ${cardData.number.slice(-4)}`;
            break;
    }
    
    paymentInfo.innerHTML = `
        <div class="review-item">
            <div class="review-info">
                <strong>Payment Method:</strong> ${paymentDetails}
            </div>
        </div>
    `;
}

// Format card number
function formatCardNumber(e) {
    let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let matches = value.match(/\d{4,16}/g);
    let match = matches && matches[0] || '';
    let parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
        e.target.value = parts.join(' ');
    } else {
        e.target.value = value;
    }
}

// Format expiry date
function formatExpiryDate(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length >= 2) {
        e.target.value = value.slice(0, 2) + '/' + value.slice(2, 4);
    } else {
        e.target.value = value;
    }
}

// Handle location form submit
function handleLocationSubmit(e) {
    e.preventDefault();
    if (validateLocation()) {
        saveLocation();
    }
}

// Handle order submit
function handleOrderSubmit(e) {
    e.preventDefault();
    placeOrder();
}

// Proceed as guest (skip login requirement)
function proceedAsGuest() {
    // Skip login and go directly to checkout step 2 (shipping info)
    document.getElementById('step-1').classList.remove('active');
    document.getElementById('step-2').classList.add('active');
    updateStepProgress(2);
    
    // Hide the login prompt
    const loginPrompt = document.querySelector('.login-prompt');
    if (loginPrompt) {
        loginPrompt.style.display = 'none';
    }
}

// Place order
function placeOrder() {
    if (!validateReview()) {
        return;
    }
    
    // Get all order data
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const paymentMethod = localStorage.getItem('paymentMethod');
    const deliveryLocation = JSON.parse(localStorage.getItem('deliveryLocation') || '{}');
    const deliveryOption = localStorage.getItem('deliveryOption') || 'standard';
    
    // Calculate totals
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const deliveryFee = deliveryOption === 'express' ? 12.00 : 5.00;
    const tax = subtotal * 0.08;
    const total = subtotal + deliveryFee + tax;
    
    // Check if user is logged in
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    const userId = loggedInUser ? JSON.parse(loggedInUser).id : 'guest';
    
    // Create order object
    const order = {
        id: 'FA-' + Date.now(),
        date: new Date().toISOString(),
        userId: userId,
        items: cart,
        paymentMethod: paymentMethod,
        delivery: {
            location: deliveryLocation,
            option: deliveryOption,
            fee: deliveryFee
        },
        totals: {
            subtotal: subtotal,
            tax: tax,
            delivery: deliveryFee,
            total: total
        },
        status: 'confirmed'
    };
    
    // Save order to localStorage (in real app, this would go to backend)
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Clear cart
    localStorage.removeItem('cart');
    
    // Update cart counter
    updateCartCounter();
    
    // Show success modal
    showSuccessModal(order);
}

// Show success modal
function showSuccessModal(order) {
    document.getElementById('order-id').textContent = order.id;
    
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + (order.delivery.option === 'express' ? 1 : 3));
    document.getElementById('estimated-delivery').textContent = deliveryDate.toLocaleDateString();
    
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));
    successModal.show();
    
    // Redirect when modal is hidden
    document.getElementById('successModal').addEventListener('hidden.bs.modal', function() {
        window.location.href = 'index.html';
    });
}

// Update cart counter
function updateCartCounter() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    const cartCounter = document.querySelector('.cart-counter');
    if (cartCounter) {
        cartCounter.textContent = totalItems;
        cartCounter.classList.toggle('show', totalItems > 0);
    }
}
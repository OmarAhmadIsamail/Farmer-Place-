// product.js - Product display and filtering functionality

// Product data structure
const products = [
    {
        id: "fresh-apples",
        name: "Fresh Organic Apples",
        category: "fruit",
        price: 12.00,
        image: "assets/img/products/product-1.jpg",
        details: {
            weight: "1kg",
            origin: "Local"
        },
        description: "Fresh, crisp organic apples grown locally with no pesticides."
    },
    {
        id: "organic-carrots",
        name: "Organic Carrots",
        category: "vegetable",
        price: 8.50,
        image: "assets/img/products/product-2.jpg",
        details: {
            weight: "500g",
            origin: "Local"
        },
        description: "Sweet and crunchy organic carrots, freshly harvested."
    },
    {
        id: "gardening-tools",
        name: "Gardening Tool Set",
        category: "equipment",
        price: 45.00,
        image: "assets/img/products/product-3.jpg",
        details: {
            pieces: "5",
            material: "Steel"
        },
        description: "Complete gardening tool set with durable steel construction."
    },
    {
        id: "fresh-chicken",
        name: "Fresh Chicken Breast",
        category: "meat",
        price: 15.75,
        image: "assets/img/products/product-4.jpg",
        details: {
            weight: "1kg",
            type: "Boneless"
        },
        description: "Fresh, boneless chicken breast from free-range chickens."
    },
    {
        id: "organic-bananas",
        name: "Organic Bananas",
        category: "fruit",
        price: 6.99,
        image: "assets/img/products/product-5.jpg",
        details: {
            weight: "1kg",
            origin: "Tropical"
        },
        description: "Sweet organic bananas imported from tropical regions."
    },
    {
        id: "fresh-tomatoes",
        name: "Fresh Tomatoes",
        category: "vegetable",
        price: 7.25,
        image: "assets/img/products/product-6.jpg",
        details: {
            weight: "1kg",
            type: "Cherry"
        },
        description: "Juicy cherry tomatoes, perfect for salads and cooking."
    },
    {
        id: "organic-spinach",
        name: "Organic Spinach",
        category: "vegetable",
        price: 4.50,
        image: "assets/img/products/product-7.jpg",
        details: {
            weight: "250g",
            origin: "Local"
        },
        description: "Fresh organic spinach, packed with nutrients."
    },
    {
        id: "premium-beef",
        name: "Premium Beef Steak",
        category: "meat",
        price: 24.99,
        image: "assets/img/products/product-8.jpg",
        details: {
            weight: "500g",
            type: "Ribeye"
        },
        description: "Premium ribeye steak, aged to perfection."
    },
    {
        id: "watering-can",
        name: "Metal Watering Can",
        category: "equipment",
        price: 18.50,
        image: "assets/img/products/product-9.jpg",
        details: {
            capacity: "2L",
            material: "Galvanized Steel"
        },
        description: "Durable metal watering can for all your gardening needs."
    }
];

// Initialize products when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeProducts();
    setupFilterButtons();
    setupCartFunctionality();
});

// Initialize products display
function initializeProducts() {
    const productsContainer = document.querySelector('.products-container');
    
    if (!productsContainer) {
        console.error('Products container not found');
        return;
    }
    
    // Clear existing content
    productsContainer.innerHTML = '';
    
    // Generate product cards
    products.forEach((product, index) => {
        const productCard = createProductCard(product, index);
        productsContainer.appendChild(productCard);
    });
    
    // Initialize AOS for animations
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
}

// Create product card HTML
function createProductCard(product, index) {
    const productElement = document.createElement('div');
    productElement.className = `col-xl-4 col-md-6 product-item`;
    productElement.setAttribute('data-category', product.category);
    productElement.setAttribute('data-aos', 'fade-up');
    productElement.setAttribute('data-aos-delay', (index + 1) * 100);
    
    // Generate details HTML
    let detailsHTML = '';
    for (const [key, value] of Object.entries(product.details)) {
        const label = key.charAt(0).toUpperCase() + key.slice(1);
        detailsHTML += `
            <div class="info-item">
                <span class="info-label">${label}</span>
                <span class="info-value">${value}</span>
            </div>
        `;
    }
    
    productElement.innerHTML = `
        <div class="card">
            <img src="${product.image}" alt="${product.name}" class="img-fluid">
            <div class="card-body">
                <span class="product-category">${getCategoryDisplayName(product.category)} | $${product.price.toFixed(2)}</span>
                <h3><a href="product-details.html?product=${product.id}" class="stretched-link">${product.name}</a></h3>
                <div class="card-content">
                    <div class="product-info">
                        ${detailsHTML}
                    </div>
                    <button class="add-to-cart-btn" 
                            data-product-id="${product.id}" 
                            data-product-name="${product.name}" 
                            data-price="${product.price}">
                        <i class="bi bi-cart-plus"></i> Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return productElement;
}

// Get display name for category
function getCategoryDisplayName(category) {
    const categoryMap = {
        'fruit': 'Fruit',
        'vegetable': 'Vegetable',
        'equipment': 'Equipment',
        'meat': 'Meat'
    };
    
    return categoryMap[category] || category;
}

// Setup filter buttons functionality
function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Filter products
            const filterValue = this.getAttribute('data-filter');
            filterProducts(filterValue);
        });
    });
}

// Filter products based on category
function filterProducts(category) {
    const productItems = document.querySelectorAll('.product-item');
    
    productItems.forEach(item => {
        if (category === 'all' || item.getAttribute('data-category') === category) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
    
    // Refresh AOS animations for visible items
    if (typeof AOS !== 'undefined') {
        setTimeout(() => {
            AOS.refresh();
        }, 300);
    }
}

// Setup cart functionality
function setupCartFunctionality() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart-btn') || 
            e.target.closest('.add-to-cart-btn')) {
            
            const button = e.target.classList.contains('add-to-cart-btn') ? 
                          e.target : e.target.closest('.add-to-cart-btn');
            
            addToCart(
                button.getAttribute('data-product-id'),
                button.getAttribute('data-product-name'),
                parseFloat(button.getAttribute('data-price'))
            );
        }
    });
}

// Add product to cart
function addToCart(productId, productName, price) {
    // Get existing cart from localStorage or initialize empty array
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex(item => item.id === productId);
    
    if (existingItemIndex !== -1) {
        // Increment quantity if product already in cart
        cart[existingItemIndex].quantity += 1;
    } else {
        // Add new product to cart
        cart.push({
            id: productId,
            name: productName,
            price: price,
            quantity: 1
        });
    }
    
    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Show success message
    showCartNotification(productName);
    
    // Update cart count in header if exists
    updateCartCount();
}

// Show cart notification
function showCartNotification(productName) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'cart-notification alert alert-success alert-dismissible fade show';
    notification.innerHTML = `
        <i class="bi bi-check-circle-fill"></i> 
        <strong>${productName}</strong> added to cart!
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Update cart count in header
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Calculate total items in cart
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    // Update all cart count elements
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
        element.style.display = totalItems > 0 ? 'inline' : 'none';
    });
}

// Search products function (if you add a search bar later)
function searchProducts(query) {
    const productItems = document.querySelectorAll('.product-item');
    const searchTerm = query.toLowerCase();
    
    productItems.forEach(item => {
        const productName = item.querySelector('h3 a').textContent.toLowerCase();
        const productCategory = item.getAttribute('data-category');
        
        if (productName.includes(searchTerm) || 
            productCategory.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Export functions for use in other files (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        products,
        initializeProducts,
        filterProducts,
        addToCart
    };
}
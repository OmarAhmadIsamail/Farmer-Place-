// Product Display Management
class ProductDisplay {
    constructor() {
        this.products = JSON.parse(localStorage.getItem('farmProducts')) || [];
        this.filteredProducts = [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.loadProducts();
        this.setupEventListeners();
        this.setupSearch();
    }

    loadProducts() {
        const productsGrid = document.getElementById('products-grid');
        const noProducts = document.getElementById('no-products');

        if (!productsGrid) return;

        // Filter only active products
        const activeProducts = this.products.filter(product => product.status === 'active');
        
        if (activeProducts.length === 0) {
            productsGrid.innerHTML = '';
            if (noProducts) noProducts.classList.remove('d-none');
            return;
        }

        if (noProducts) noProducts.classList.add('d-none');

        productsGrid.innerHTML = '';

        activeProducts.forEach(product => {
            const productCard = this.createProductCard(product);
            productsGrid.appendChild(productCard);
        });

        // Initialize AOS for new elements
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    }

    createProductCard(product) {
        const col = document.createElement('div');
        col.className = 'product-item';
        col.setAttribute('data-aos', 'fade-up');
        col.setAttribute('data-category', product.category);
    
        // Use first image for product listing
        const displayImage = product.image || 
                            (product.images && product.images[0]) || 
                            'assets/img/placeholder.jpg';
    
        col.innerHTML = `
            <div class="card product-card">
                <div class="product-image-container">
                    <img src="${displayImage}" class="card-img product-image" alt="${product.name}" 
                         onerror="this.src='assets/img/placeholder.jpg'">
                </div>
                <div class="card-body">
                    <span class="product-category">${this.formatCategory(product.category)}</span>
                    <h3><a href="product-details.html?id=${product.id}">${product.name}</a></h3>
                    <div class="card-content">
                        <div class="product-info">
                            <div class="info-item">
                                <span class="info-label">WEIGHT</span>
                                <span class="info-value">${product.details.weight || 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">ORIGIN</span>
                                <span class="info-value">${product.details.origin || 'Local'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">PRICE</span>
                                <span class="info-value">$${product.price.toFixed(2)}</span>
                            </div>
                        </div>
                        <button class="add-to-cart-btn" onclick="productDisplay.goToProductDetails('${product.id}')">
                            <i class="bi bi-cart-plus"></i> VIEW DETAILS
                        </button>
                    </div>
                </div>
            </div>
        `;
    
        return col;
    }
    

    setupEventListeners() {
        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const filter = e.target.getAttribute('data-filter');
                this.applyFilter(filter);
                
                // Update active state
                filterButtons.forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    setupSearch() {
        const searchInput = document.getElementById('product-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchProducts(e.target.value);
            });
        }
    }

    applyFilter(filter) {
        this.currentFilter = filter;
        const products = document.querySelectorAll('.products-container .col-xl-3');

        products.forEach(product => {
            if (filter === 'all' || product.getAttribute('data-category') === filter) {
                product.style.display = 'block';
            } else {
                product.style.display = 'none';
            }
        });

        this.checkNoProducts();
    }

    searchProducts(searchTerm) {
        const products = document.querySelectorAll('.products-container .col-xl-3');
        let visibleCount = 0;

        products.forEach(product => {
            const title = product.querySelector('h3 a').textContent.toLowerCase();
            const category = product.getAttribute('data-category');
            
            const matchesSearch = title.includes(searchTerm.toLowerCase()) || 
                                category.includes(searchTerm.toLowerCase());
            const matchesFilter = this.currentFilter === 'all' || 
                                product.getAttribute('data-category') === this.currentFilter;

            if (matchesSearch && matchesFilter) {
                product.style.display = 'block';
                visibleCount++;
            } else {
                product.style.display = 'none';
            }
        });

        this.checkNoProducts();
    }

    checkNoProducts() {
        const noProducts = document.getElementById('no-products');
        const visibleProducts = document.querySelectorAll('.products-container .col-xl-3[style="display: block"]');
        
        if (noProducts) {
            if (visibleProducts.length === 0) {
                noProducts.classList.remove('d-none');
            } else {
                noProducts.classList.add('d-none');
            }
        }
    }

    goToProductDetails(productId) {
        // Navigate to product details page with the product ID
        window.location.href = `product-details.html?id=${productId}`;
    }

    // This method is kept for reference but won't be called by the button anymore
    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            // Your cart implementation here
            console.log('Added to cart:', product.name);
            this.showCartNotification(`${product.name} added to cart`);
        }
    }

    showCartNotification(message) {
        const notification = document.getElementById('cart-notification');
        if (notification) {
            const text = notification.querySelector('.notification-text');
            text.textContent = message;
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        } else {
            // Fallback notification
            const fallbackNotification = document.createElement('div');
            fallbackNotification.className = 'cart-notification show';
            fallbackNotification.innerHTML = `
                <i class="bi bi-check-circle-fill"></i>
                <span class="notification-text">${message}</span>
            `;
            
            document.body.appendChild(fallbackNotification);
            
            setTimeout(() => {
                fallbackNotification.remove();
            }, 3000);
        }
    }

    formatCategory(category) {
        return category.charAt(0).toUpperCase() + category.slice(1);
    }
}

// Initialize product display
const productDisplay = new ProductDisplay();
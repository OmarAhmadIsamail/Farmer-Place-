
// Product Details Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Product data
    const products = {
        'fresh-apples': {
            id: 'PROD001',
            name: 'Fresh Organic Apples',
            category: 'fruit',
            price: 12.00,
            shortDesc: 'Crisp and juicy organic apples from our local orchards',
            fullDesc: 'Our fresh organic apples are hand-picked from local orchards, ensuring the highest quality and freshness. Grown without synthetic pesticides or fertilizers, these apples are perfect for snacking, baking, or making fresh juice.',
            features: [
                '100% Organic Certified',
                'Locally Grown',
                'No Artificial Preservatives',
                'Rich in Fiber and Vitamins'
            ],
            weight: '1kg',
            origin: 'Local Orchards',
            shelfLife: '2-3 weeks',
            organic: 'Yes',
            availability: 'In Stock',
            images: [
                'assets/img/products/product-1.jpg',
                'assets/img/products/product-1-2.jpg',
                'assets/img/products/product-1-3.jpg'
            ],
            details: '<p>Our organic apples are grown using sustainable farming practices that protect the environment and promote biodiversity. Each apple is carefully selected for optimal ripeness and flavor.</p><p>Available in mixed varieties including Fuji, Gala, and Honeycrisp for a diverse taste experience.</p>',
            nutrition: '<p><strong>Nutrition Facts per 100g:</strong></p><ul><li>Calories: 52</li><li>Carbohydrates: 14g</li><li>Fiber: 2.4g</li><li>Vitamin C: 7% DV</li><li>Potassium: 107mg</li></ul>',
            storage: '<p>Store in a cool, dry place away from direct sunlight. For longer freshness, refrigerate in the crisper drawer. Keep separate from other fruits that produce ethylene gas.</p>'
        },
        'organic-carrots': {
            id: 'PROD002',
            name: 'Organic Carrots',
            category: 'vegetable',
            price: 8.50,
            shortDesc: 'Sweet and crunchy organic carrots, perfect for cooking or snacking',
            fullDesc: 'Our organic carrots are grown in nutrient-rich soil without chemical pesticides. They are known for their sweet flavor and crisp texture, making them perfect for both raw consumption and cooking.',
            features: [
                'Certified Organic',
                'Sweet and Crisp',
                'Rich in Beta-Carotene',
                'Versatile for Cooking'
            ],
            weight: '500g',
            origin: 'Local Farms',
            shelfLife: '3-4 weeks',
            organic: 'Yes',
            availability: 'In Stock',
            images: [
                'assets/img/products/product-2.jpg',
                'assets/img/products/product-2-2.jpg',
                'assets/img/products/product-2-3.jpg'
            ],
            details: '<p>These carrots are harvested at peak maturity to ensure maximum sweetness and nutritional value. Grown in rotated fields to maintain soil health.</p>',
            nutrition: '<p><strong>Nutrition Facts per 100g:</strong></p><ul><li>Calories: 41</li><li>Vitamin A: 334% DV</li><li>Vitamin K: 13% DV</li><li>Fiber: 2.8g</li><li>Potassium: 320mg</li></ul>',
            storage: '<p>Remove green tops before storage. Store in plastic bag in refrigerator crisper. Can be stored for several weeks when kept cold and humid.</p>'
        }
        // Add more products as needed
    };

    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product') || 'fresh-apples';
    const product = products[productId];

    // Initialize product details
    function initializeProductDetails() {
        if (!product) {
            console.error('Product not found');
            return;
        }

        // Update page content
        document.getElementById('product-title').textContent = product.name;
        document.getElementById('product-short-desc').textContent = product.shortDesc;
        document.getElementById('breadcrumb-product').textContent = product.name;
        document.getElementById('product-name').textContent = product.name;
        document.getElementById('product-category').textContent = product.category.charAt(0).toUpperCase() + product.category.slice(1);
        document.getElementById('product-price').textContent = `$${product.price.toFixed(2)}`;
        document.getElementById('product-description-full').textContent = product.fullDesc;

        // Update product info sidebar
        document.getElementById('product-id').textContent = product.id;
        document.getElementById('product-category-summary').textContent = product.category.charAt(0).toUpperCase() + product.category.slice(1);
        document.getElementById('product-weight').textContent = product.weight;
        document.getElementById('product-origin').textContent = product.origin;
        document.getElementById('product-shelf-life').textContent = product.shelfLife;
        document.getElementById('product-organic').textContent = product.organic;

        // Update features list
        const featuresList = document.getElementById('product-features-list');
        featuresList.innerHTML = '';
        product.features.forEach(feature => {
            const li = document.createElement('li');
            li.textContent = feature;
            featuresList.appendChild(li);
        });

        // Update tab content
        document.getElementById('product-details-content').innerHTML = product.details;
        document.getElementById('nutrition-info-content').innerHTML = product.nutrition;
        document.getElementById('storage-tips-content').innerHTML = product.storage;

        // Initialize image slider
        initializeImageSlider(product.images);
    }

    // Initialize image slider
    function initializeImageSlider(images) {
        const sliderWrapper = document.querySelector('.product-details-slider .swiper-wrapper');
        sliderWrapper.innerHTML = '';

        images.forEach((image, index) => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            slide.innerHTML = `<img src="${image}" alt="${product.name} - Image ${index + 1}">`;
            sliderWrapper.appendChild(slide);
        });

        // Reinitialize Swiper
        if (typeof Swiper !== 'undefined') {
            new Swiper('.product-details-slider', {
                loop: true,
                speed: 600,
                autoplay: {
                    delay: 5000,
                },
                slidesPerView: 'auto',
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                pagination: {
                    el: '.swiper-pagination',
                    type: 'bullets',
                    clickable: true,
                },
            });
        }
    }

    // Quantity selector functionality
    function initializeQuantitySelector() {
        const quantityInput = document.getElementById('quantity');
        const minusBtn = document.querySelector('.quantity-minus');
        const plusBtn = document.querySelector('.quantity-plus');

        minusBtn.addEventListener('click', () => {
            let value = parseInt(quantityInput.value);
            if (value > 1) {
                quantityInput.value = value - 1;
            }
        });

        plusBtn.addEventListener('click', () => {
            let value = parseInt(quantityInput.value);
            if (value < 100) {
                quantityInput.value = value + 1;
            }
        });

        quantityInput.addEventListener('change', () => {
            let value = parseInt(quantityInput.value);
            if (isNaN(value) || value < 1) {
                quantityInput.value = 1;
            } else if (value > 100) {
                quantityInput.value = 100;
            }
        });
    }

    // Add to cart functionality
    function initializeAddToCart() {
        const addToCartBtn = document.getElementById('add-to-cart-btn');
        
        addToCartBtn.addEventListener('click', function() {
            const quantity = parseInt(document.getElementById('quantity').value);
            addToCart(product, quantity);
        });
    }

    // Add product to cart - FIXED VERSION
    function addToCart(productData, quantity) {
        console.log('Adding to cart:', productData.name, quantity);
        
        // Initialize cart if it doesn't exist
        let cart = JSON.parse(localStorage.getItem('cart'));
        if (!cart) {
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
        }
        
        // Check if product already in cart
        const existingItemIndex = cart.findIndex(item => item.id === productData.id);
        
        if (existingItemIndex > -1) {
            // Update quantity if product exists
            cart[existingItemIndex].quantity += quantity;
            console.log('Updated existing item:', cart[existingItemIndex]);
        } else {
            // Add new product to cart
            const newItem = {
                id: productData.id,
                name: productData.name,
                price: productData.price,
                category: productData.category,
                image: productData.images[0],
                weight: productData.weight,
                quantity: quantity
            };
            cart.push(newItem);
            console.log('Added new item:', newItem);
        }
        
        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        console.log('Cart saved:', cart);
        
        // Update UI
        updateCartCounter();
        showCartNotification(productData.name, quantity);
        
        // Verify cart was saved
        const verifyCart = JSON.parse(localStorage.getItem('cart'));
        console.log('Cart verification:', verifyCart);
    }

    // Update cart counter in header - FIXED VERSION
    function updateCartCounter() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        
        console.log('Updating cart counter. Total items:', totalItems);
        
        // Update counter in current page
        const cartCounter = document.querySelector('.cart-counter');
        if (cartCounter) {
            cartCounter.textContent = totalItems;
            cartCounter.style.display = totalItems > 0 ? 'flex' : 'none';
            console.log('Cart counter updated in DOM');
        }
        
        // Also update in header if it exists separately
        const headerCartCounter = document.querySelector('header .cart-counter');
        if (headerCartCounter) {
            headerCartCounter.textContent = totalItems;
            headerCartCounter.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }

    // Show cart notification
    function showCartNotification(productName, quantity) {
        const notification = document.getElementById('cart-notification');
        const notificationText = notification.querySelector('.notification-text');
        
        notificationText.textContent = `${quantity} ${productName} added to cart!`;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // Initialize everything
    initializeProductDetails();
    initializeQuantitySelector();
    initializeAddToCart();
    updateCartCounter(); // Initialize cart counter on page load
});

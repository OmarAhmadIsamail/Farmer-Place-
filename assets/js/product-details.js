// Product Details Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Product data (in real application, this would come from backend or URL parameters)
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
        ,
        'gardening-tools': {
            id: 'PROD003',
            name: 'Gardening Tool Set',
            category: 'equipment',
            price: 45.00,
            shortDesc: 'Durable 5-piece gardening tool set for all your planting needs',
            fullDesc: 'This gardening tool set includes everything you need for planting, pruning, and maintaining your garden. Made from high-quality steel and ergonomically designed for comfort and durability.',
            features: [
                '5 Essential Tools Included',
                'Ergonomic Handles for Comfort',
                'Rust-Resistant Steel',
                'Ideal for All Garden Sizes'
            ],
            pieces: '5',
            material: 'Steel',
            shelfLife: 'N/A',
            organic: 'No',
            availability: 'In Stock',
            images: [
                'assets/img/products/product-3.jpg',
                'assets/img/products/product-3-2.jpg',
                'assets/img/products/product-3-3.jpg'
            ],
            details: '<p>This 5-piece set includes a trowel, transplanter, weeder, hand rake, and pruner — perfect for maintaining your home garden or farm. Each tool is lightweight yet sturdy for long-term use.</p>',
            nutrition: '',
            storage: '<p>Store tools in a dry place to prevent rusting. Clean and dry after each use.</p>'
        },
        'fresh-chicken': {
            id: 'PROD004',
            name: 'Fresh Chicken Breast',
            category: 'meat',
            price: 15.75,
            shortDesc: 'Boneless, skinless chicken breast – tender and protein-rich',
            fullDesc: 'Our fresh chicken breast is 100% natural, free from hormones, and processed under strict hygiene standards. Ideal for grilling, baking, or stir-frying.',
            features: [
                'High Protein, Low Fat',
                'Hormone-Free',
                'Boneless and Skinless',
                'Processed under strict hygiene standards'
            ],
            weight: '1kg',
            type: 'Boneless',
            origin: 'Local Farms',
            shelfLife: '3-5 days (refrigerated)',
            organic: 'No',
            availability: 'In Stock',
            images: [
                'assets/img/products/product-4.jpg',
                'assets/img/products/product-4-2.jpg',
                'assets/img/products/product-4-3.jpg'
            ],
            details: '<p>Our fresh chicken breasts are sourced from local farms and packed fresh daily to ensure maximum quality and taste.</p>',
            nutrition: '<p><strong>Nutrition Facts per 100g:</strong></p><ul><li>Calories: 165</li><li>Protein: 31g</li><li>Fat: 3.6g</li><li>Cholesterol: 85mg</li></ul>',
            storage: '<p>Keep refrigerated at or below 4°C. Cook thoroughly before consumption. Can be frozen for up to 6 months.</p>'
        },
        'organic-bananas': {
            id: 'PROD005',
            name: 'Organic Bananas',
            category: 'fruit',
            price: 6.99,
            shortDesc: 'Naturally sweet and energy-rich organic bananas',
            fullDesc: 'These organic bananas are sourced from tropical farms that use sustainable farming methods. They’re perfect for smoothies, snacks, and baking.',
            features: [
                'Certified Organic',
                'High in Potassium',
                'Naturally Sweet Flavor',
                'Perfect for Snacking or Smoothies'
            ],
            weight: '1kg',
            origin: 'Tropical Farms',
            shelfLife: '5-7 days',
            organic: 'Yes',
            availability: 'In Stock',
            images: [
                'assets/img/products/product-5.jpg',
                'assets/img/products/product-5-2.jpg',
                'assets/img/products/product-5-3.jpg'
            ],
            details: '<p>Our organic bananas are carefully harvested and handled to maintain their perfect ripeness. Grown without chemical fertilizers or pesticides.</p>',
            nutrition: '<p><strong>Nutrition Facts per 100g:</strong></p><ul><li>Calories: 89</li><li>Carbohydrates: 23g</li><li>Fiber: 2.6g</li><li>Potassium: 358mg</li><li>Vitamin B6: 20% DV</li></ul>',
            storage: '<p>Store at room temperature. To slow ripening, refrigerate once bananas reach desired ripeness.</p>'
        },
        'fresh-tomatoes': {
            id: 'PROD006',
            name: 'Fresh Tomatoes',
            category: 'vegetable',
            price: 7.25,
            shortDesc: 'Juicy cherry tomatoes packed with flavor and vitamins',
            fullDesc: 'Our fresh cherry tomatoes are grown under ideal conditions to ensure sweetness and firmness. Perfect for salads, sauces, and garnishes.',
            features: [
                'Vine-Ripened Cherry Tomatoes',
                'Rich in Antioxidants',
                'Excellent for Cooking or Raw Dishes',
                'Freshly Picked Daily'
            ],
            weight: '1kg',
            type: 'Cherry',
            origin: 'Local Greenhouses',
            shelfLife: '7-10 days',
            organic: 'Yes',
            availability: 'In Stock',
            images: [
                'assets/img/products/product-6.jpg',
                'assets/img/products/product-6-2.jpg',
                'assets/img/products/product-6-3.jpg'
            ],
            details: '<p>Picked at peak ripeness for superior flavor and freshness. Our cherry tomatoes are ideal for salads, pasta, or sauces.</p>',
            nutrition: '<p><strong>Nutrition Facts per 100g:</strong></p><ul><li>Calories: 18</li><li>Vitamin C: 21% DV</li><li>Vitamin A: 16% DV</li><li>Fiber: 1.2g</li></ul>',
            storage: '<p>Store at room temperature away from sunlight. Refrigerate only after full ripeness to extend shelf life.</p>'
        }

    };

    // Get product ID from URL (in real app, this would come from URL parameters)
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

    // Add product to cart
    function addToCart(productData, quantity) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Check if product already in cart
        const existingItemIndex = cart.findIndex(item => item.id === productData.id);
        
        if (existingItemIndex > -1) {
            // Update quantity if product exists
            cart[existingItemIndex].quantity += quantity;
        } else {
            // Add new product to cart
            cart.push({
                id: productData.id,
                name: productData.name,
                price: productData.price,
                category: productData.category,
                image: productData.images[0],
                weight: productData.weight,
                quantity: quantity
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCounter();
        showCartNotification(productData.name, quantity);
    }

    // Update cart counter in header
    function updateCartCounter() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        
        const cartCounter = document.querySelector('.cart-counter');
        if (cartCounter) {
            cartCounter.textContent = totalItems;
            cartCounter.classList.toggle('show', totalItems > 0);
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
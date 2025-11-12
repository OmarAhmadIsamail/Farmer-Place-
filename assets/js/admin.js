// Admin Product Management
class ProductManager {
    constructor() {
        this.products = JSON.parse(localStorage.getItem('farmProducts')) || this.getDefaultProducts();
        this.currentEditProduct = null;
        this.init();
    }

    init() {
        // Only initialize if we're on admin pages
        if (window.location.pathname.includes('/admin/')) {
            this.loadProductsTable();
            this.setupEventListeners();
            this.setupImageUpload();
            this.setupAddProductForm();
            this.setupEditModal();
            
            // Load dashboard specific elements
            this.updateDashboardStats();
            this.loadRecentProducts();
        }
    }

    getDefaultProducts() {
        return [
            {
                id: "fresh-apples",
                name: "Fresh Organic Apples",
                category: "fruit",
                price: 12.00,
                images: ["assets/img/products/product-1.jpg"],
                details: {
                    weight: "1kg",
                    origin: "Local"
                },
                description: "Fresh, crisp organic apples grown locally with no pesticides.",
                status: "active",
                organic: true,
                shelfLife: "2-3 weeks",
                features: [
                    '100% Organic Certified',
                    'Locally Grown',
                    'No Artificial Preservatives',
                    'Rich in Fiber and Vitamins'
                ],
                nutrition: '<p><strong>Nutrition Facts per 100g:</strong></p><ul><li>Calories: 52</li><li>Carbohydrates: 14g</li><li>Fiber: 2.4g</li><li>Vitamin C: 7% DV</li><li>Potassium: 107mg</li></ul>',
                storage: '<p>Store in a cool, dry place away from direct sunlight. For longer freshness, refrigerate in the crisper drawer. Keep separate from other fruits that produce ethylene gas.</p>'
            },
            {
                id: "organic-carrots",
                name: "Organic Carrots",
                category: "vegetable",
                price: 8.50,
                images: ["assets/img/products/product-2.jpg"],
                details: {
                    weight: "500g",
                    origin: "Local Farm"
                },
                description: "Fresh organic carrots, rich in beta-carotene and vitamins.",
                status: "active",
                organic: true,
                shelfLife: "3-4 weeks",
                features: [
                    '100% Organic',
                    'Rich in Vitamin A',
                    'Freshly Harvested',
                    'No Chemicals'
                ],
                nutrition: '<p><strong>Nutrition Facts per 100g:</strong></p><ul><li>Calories: 41</li><li>Carbohydrates: 10g</li><li>Fiber: 2.8g</li><li>Vitamin A: 334% DV</li><li>Vitamin K: 16% DV</li></ul>',
                storage: '<p>Store in refrigerator in plastic bag. Remove green tops before storage to prevent moisture loss.</p>'
            },
            {
                id: "tomato-seeds",
                name: "Heirloom Tomato Seeds",
                category: "seed",
                price: 4.99,
                images: ["assets/img/products/seeds-1.jpg"],
                details: {
                    weight: "50 seeds",
                    origin: "Certified Organic"
                },
                description: "Premium heirloom tomato seeds for your home garden. Non-GMO and organic.",
                status: "active",
                organic: true,
                shelfLife: "2 years",
                features: [
                    'Non-GMO Heirloom Variety',
                    '95% Germination Rate',
                    'Organic Certified',
                    'Open Pollinated'
                ],
                nutrition: '<p><strong>Growing Information:</strong></p><ul><li>Germination Time: 7-14 days</li><li>Days to Maturity: 75-85 days</li><li>Plant Spacing: 24-36 inches</li><li>Sun Requirements: Full Sun</li></ul>',
                storage: '<p>Store in a cool, dry place in original packaging. For best results, plant within 2 years of purchase. Keep away from moisture and direct sunlight.</p>'
            }
        ];
    }

    // In the addProduct method - Update to handle multiple images
    addProduct() {
        const name = document.getElementById('product-name').value;
        const description = document.getElementById('product-description').value;
        const category = document.getElementById('product-category').value;
        const price = parseFloat(document.getElementById('product-price').value);
        const weight = document.getElementById('product-weight').value;
        const origin = document.getElementById('product-origin').value;
        const featuresText = document.getElementById('product-features').value;
        const features = featuresText ? featuresText.split('\n').filter(f => f.trim()) : [];
        const status = document.getElementById('product-status').value;
        const organic = document.getElementById('product-organic').checked;
        const shelfLife = document.getElementById('product-shelf-life').value;
        
        // Get ALL images from preview
        const imagePreview = document.getElementById('image-preview');
        const imageItems = imagePreview.querySelectorAll('.image-preview-item img');
        const images = Array.from(imageItems).map(img => img.src);

        // Validate required fields
        if (!name || !description || !category || !price || isNaN(price)) {
            alert('Please fill in all required fields with valid data');
            return;
        }

        if (images.length === 0) {
            alert('Please upload at least one product image');
            return;
        }

        // Generate unique ID
        const id = this.generateProductId(name);

        const newProduct = {
            id: id,
            name: name,
            category: category,
            price: price,
            images: images, // Store all images in array
            image: images[0], // Store first image as main image for product listing
            details: {
                weight: weight,
                origin: origin
            },
            description: description,
            status: status,
            organic: organic,
            shelfLife: shelfLife,
            features: features,
            nutrition: this.generateNutritionInfo(category, organic),
            storage: this.generateStorageTips(category)
        };

        this.products.push(newProduct);
        this.saveProducts();
        
        // Show success message and redirect
        alert('Product added successfully!');
        window.location.href = 'products.html';
    }

    // In the updateProduct method - Update to handle multiple images
    updateProduct() {
        if (!this.currentEditProduct) return;

        const name = document.getElementById('edit-product-name').value;
        const description = document.getElementById('edit-product-description').value;
        const category = document.getElementById('edit-product-category').value;
        const price = parseFloat(document.getElementById('edit-product-price').value);
        const weight = document.getElementById('edit-product-weight').value;
        const origin = document.getElementById('edit-product-origin').value;
        const featuresText = document.getElementById('edit-product-features').value;
        const features = featuresText ? featuresText.split('\n').filter(f => f.trim()) : [];
        const status = document.getElementById('edit-product-status').value;
        const organic = document.getElementById('edit-product-organic').checked;
        const shelfLife = document.getElementById('edit-product-shelf-life').value;

        // Get ALL images from preview
        const imagePreview = document.getElementById('edit-image-preview');
        const imageItems = imagePreview.querySelectorAll('.image-preview-item img');
        const images = Array.from(imageItems).map(img => img.src);

        // Validate required fields
        if (!name || !description || !category || !price || isNaN(price)) {
            alert('Please fill in all required fields with valid data');
            return;
        }

        if (images.length === 0) {
            alert('Please upload at least one product image');
            return;
        }

        // Update product
        const updatedProduct = {
            ...this.currentEditProduct,
            name: name,
            category: category,
            price: price,
            images: images, // Store all images
            image: images[0], // First image as main image
            details: {
                weight: weight,
                origin: origin
            },
            description: description,
            status: status,
            organic: organic,
            shelfLife: shelfLife,
            features: features
        };

        // Update in products array
        const index = this.products.findIndex(p => p.id === this.currentEditProduct.id);
        if (index !== -1) {
            this.products[index] = updatedProduct;
            this.saveProducts();
        }

        this.closeEditModal();
        alert('Product updated successfully!');
    }

    // Setup edit modal
    setupEditModal() {
        // Create modal HTML
        const modalHTML = `
            <div class="edit-modal" id="edit-product-modal">
                <div class="edit-modal-content">
                    <div class="edit-modal-header">
                        <h4 class="mb-0">Edit Product</h4>
                        <button class="close-modal" onclick="productManager.closeEditModal()">&times;</button>
                    </div>
                    <div class="edit-modal-body">
                        <form id="edit-product-form">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="edit-product-name" class="form-label">Product Name *</label>
                                        <input type="text" class="form-control" id="edit-product-name" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="edit-product-category" class="form-label">Category *</label>
                                        <select class="form-control" id="edit-product-category" required>
                                            <option value="fruit">Fruit</option>
                                            <option value="vegetable">Vegetable</option>
                                            <option value="seed">Seeds</option>
                                            <option value="meat">Meat</option>
                                            <option value="equipment">Equipment</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="edit-product-price" class="form-label">Price ($) *</label>
                                        <input type="number" class="form-control" id="edit-product-price" step="0.01" min="0" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="edit-product-status" class="form-label">Status</label>
                                        <select class="form-control" id="edit-product-status">
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div class="mb-3">
                                <label for="edit-product-description" class="form-label">Description *</label>
                                <textarea class="form-control" id="edit-product-description" rows="3" required></textarea>
                            </div>

                            <!-- Multiple Image Upload for Edit -->
                            <div class="image-upload-container">
                                <label class="form-label">Product Images (Max 6)</label>
                                <div class="upload-area" id="edit-image-upload-area">
                                    <i class="bi bi-cloud-upload display-4 text-muted d-block mb-2"></i>
                                    <p class="mb-1">Click to upload or drag and drop</p>
                                    <small class="upload-info">PNG, JPG, GIF up to 5MB each</small>
                                    <input type="file" id="edit-product-images" multiple accept="image/*" style="display: none;">
                                </div>
                                <div class="image-preview-grid" id="edit-image-preview"></div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="edit-product-weight" class="form-label">Weight/Package</label>
                                        <input type="text" class="form-control" id="edit-product-weight">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="edit-product-origin" class="form-label">Origin</label>
                                        <input type="text" class="form-control" id="edit-product-origin">
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="edit-product-shelf-life" class="form-label">Shelf Life</label>
                                        <input type="text" class="form-control" id="edit-product-shelf-life">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3 form-check" style="margin-top: 2rem;">
                                        <input type="checkbox" class="form-check-input" id="edit-product-organic">
                                        <label class="form-check-label" for="edit-product-organic">Organic Product</label>
                                    </div>
                                </div>
                            </div>

                            <div class="mb-3">
                                <label for="edit-product-features" class="form-label">Features (one per line)</label>
                                <textarea class="form-control" id="edit-product-features" rows="3"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="edit-modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="productManager.closeEditModal()">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="productManager.updateProduct()">Update Product</button>
                    </div>
                </div>
            </div>
        `;

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Setup edit image upload
        this.setupEditImageUpload();
    }

    // Setup image upload for edit modal
    setupEditImageUpload() {
        const uploadArea = document.getElementById('edit-image-upload-area');
        const fileInput = document.getElementById('edit-product-images');
        const imagePreview = document.getElementById('edit-image-preview');

        if (!uploadArea || !fileInput || !imagePreview) return;

        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const files = Array.from(e.dataTransfer.files);
            this.handleMultipleImageUpload(files, imagePreview, uploadArea);
        });

        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            this.handleMultipleImageUpload(files, imagePreview, uploadArea);
        });
    }

    // Handle multiple image upload
    handleMultipleImageUpload(files, imagePreview, uploadArea) {
        const currentImages = imagePreview.querySelectorAll('.image-preview-item').length;
        
        if (currentImages + files.length > 6) {
            alert('Maximum 6 images allowed. Please select fewer images.');
            return;
        }

        files.forEach(file => {
            if (file && file.type.startsWith('image/')) {
                this.handleImageUpload(file, imagePreview, uploadArea);
            }
        });
    }

    // Handle single image upload
    handleImageUpload(file, imagePreview, uploadArea) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.addImageToPreview(e.target.result, imagePreview, uploadArea);
            };
            img.src = e.target.result;
        };
        
        reader.readAsDataURL(file);
    }

    // Add image to preview grid
    addImageToPreview(imageSrc, imagePreview, uploadArea) {
        const previewItem = document.createElement('div');
        previewItem.className = 'image-preview-item';
        previewItem.innerHTML = `
            <img src="${imageSrc}" alt="Preview">
            <button type="button" class="remove-image" onclick="productManager.removeImagePreview(this)">
                <i class="bi bi-x"></i>
            </button>
        `;
        
        imagePreview.appendChild(previewItem);
        
        // Hide upload area if we have 6 images
        const totalImages = imagePreview.querySelectorAll('.image-preview-item').length;
        if (totalImages >= 6) {
            uploadArea.style.display = 'none';
        }
    }

    // Remove image preview
    removeImagePreview(button) {
        const previewItem = button.closest('.image-preview-item');
        previewItem.remove();
        
        const uploadArea = document.getElementById('edit-image-upload-area');
        if (uploadArea) {
            uploadArea.style.display = 'block';
        }
    }

    // Open edit modal
    editProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        this.currentEditProduct = product;

        // Fill form with product data
        document.getElementById('edit-product-name').value = product.name;
        document.getElementById('edit-product-category').value = product.category;
        document.getElementById('edit-product-price').value = product.price;
        document.getElementById('edit-product-status').value = product.status;
        document.getElementById('edit-product-description').value = product.description;
        document.getElementById('edit-product-weight').value = product.details.weight || '';
        document.getElementById('edit-product-origin').value = product.details.origin || '';
        document.getElementById('edit-product-shelf-life').value = product.shelfLife || '';
        document.getElementById('edit-product-organic').checked = product.organic || false;
        document.getElementById('edit-product-features').value = product.features ? product.features.join('\n') : '';

        // Load existing images
        const imagePreview = document.getElementById('edit-image-preview');
        imagePreview.innerHTML = '';
        
        if (product.images && product.images.length > 0) {
            product.images.forEach(imageSrc => {
                this.addImageToPreview(imageSrc, imagePreview, document.getElementById('edit-image-upload-area'));
            });
        }

        // Show modal
        document.getElementById('edit-product-modal').classList.add('show');
    }

    // Close edit modal
    closeEditModal() {
        document.getElementById('edit-product-modal').classList.remove('show');
        this.currentEditProduct = null;
    }

    // Setup image upload for add product form
    setupImageUpload() {
        const uploadArea = document.getElementById('image-upload-area');
        const fileInput = document.getElementById('product-images');
        const imagePreview = document.getElementById('image-preview');

        if (!uploadArea || !fileInput || !imagePreview) return;

        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const files = Array.from(e.dataTransfer.files);
            this.handleMultipleImageUpload(files, imagePreview, uploadArea);
        });

        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            this.handleMultipleImageUpload(files, imagePreview, uploadArea);
        });
    }

    // Load products into admin table
    loadProductsTable() {
        const tableBody = document.getElementById('products-table');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        if (this.products.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4">
                        <i class="bi bi-inbox display-4 d-block text-muted mb-2"></i>
                        <p class="text-muted">No products found. <a href="add-product.html">Add your first product</a></p>
                    </td>
                </tr>
            `;
            return;
        }

        this.products.forEach(product => {
            const firstImage = product.images && product.images.length > 0 ? product.images[0] : 'assets/img/placeholder.jpg';
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <img src="${firstImage}" alt="${product.name}" class="product-thumbnail">
                </td>
                <td>${product.name}</td>
                <td>
                    <span class="badge bg-${this.getCategoryBadgeColor(product.category)}">
                        ${this.formatCategory(product.category)}
                    </span>
                </td>
                <td>$${product.price.toFixed(2)}</td>
                <td>
                    <span class="badge bg-${product.status === 'active' ? 'success' : 'secondary'}">
                        ${product.status}
                    </span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="productManager.editProduct('${product.id}')">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="productManager.deleteProduct('${product.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Setup search functionality
    setupEventListeners() {
        const searchInput = document.getElementById('product-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterProducts(e.target.value);
            });
        }
    }

    filterProducts(searchTerm) {
        const filteredProducts = this.products.filter(product => 
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const tableBody = document.getElementById('products-table');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        if (filteredProducts.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4">
                        <i class="bi bi-search display-4 d-block text-muted mb-2"></i>
                        <p class="text-muted">No products match your search</p>
                    </td>
                </tr>
            `;
            return;
        }

        filteredProducts.forEach(product => {
            const firstImage = product.images && product.images.length > 0 ? product.images[0] : 'assets/img/placeholder.jpg';
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <img src="${firstImage}" alt="${product.name}" class="product-thumbnail">
                </td>
                <td>${product.name}</td>
                <td>
                    <span class="badge bg-${this.getCategoryBadgeColor(product.category)}">
                        ${this.formatCategory(product.category)}
                    </span>
                </td>
                <td>$${product.price.toFixed(2)}</td>
                <td>
                    <span class="badge bg-${product.status === 'active' ? 'success' : 'secondary'}">
                        ${product.status}
                    </span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="productManager.editProduct('${product.id}')">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="productManager.deleteProduct('${product.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Setup add product form
    setupAddProductForm() {
        const form = document.getElementById('add-product-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addProduct();
        });
    }

    // Generate product ID from name
    generateProductId(name) {
        let baseId = name.toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        
        // Ensure unique ID
        let id = baseId;
        let counter = 1;
        while (this.products.find(p => p.id === id)) {
            id = `${baseId}-${counter}`;
            counter++;
        }
        
        return id;
    }

    // Generate default nutrition info based on category
    generateNutritionInfo(category, organic) {
        const baseInfo = '<p><strong>Product Information:</strong></p><ul>';
        
        switch(category) {
            case 'fruit':
                return baseInfo + '<li>Rich in Vitamins and Minerals</li><li>High in Dietary Fiber</li><li>Natural Sugars</li><li>Antioxidants</li>' + (organic ? '<li>100% Organic Certified</li>' : '') + '</ul>';
            case 'vegetable':
                return baseInfo + '<li>High in Fiber</li><li>Essential Vitamins</li><li>Low in Calories</li><li>Mineral Rich</li>' + (organic ? '<li>100% Organic Certified</li>' : '') + '</ul>';
            case 'seed':
                return baseInfo + '<li>High Germination Rate</li><li>Non-GMO Seeds</li><li>Heirloom Variety</li><li>Planting Instructions Included</li>' + (organic ? '<li>Organic Certified Seeds</li>' : '') + '</ul>';
            case 'meat':
                return baseInfo + '<li>High Quality Protein</li><li>Essential Amino Acids</li><li>Iron and Zinc</li><li>B Vitamins</li>' + (organic ? '<li>Grass-fed, No Hormones</li>' : '') + '</ul>';
            default:
                return baseInfo + '<li>Quality Guaranteed</li><li>Farm Fresh</li></ul>';
        }
    }

    // Generate storage tips based on category
    generateStorageTips(category) {
        switch(category) {
            case 'fruit':
                return '<p>Store in a cool, dry place. Some fruits can be refrigerated to extend freshness. Keep separate from vegetables.</p>';
            case 'vegetable':
                return '<p>Store in refrigerator crisper drawer. Keep dry and avoid washing until ready to use.</p>';
            case 'seed':
                return '<p>Store in a cool, dry, dark place in original packaging. Keep away from moisture and extreme temperatures.</p>';
            case 'meat':
                return '<p>Keep refrigerated at all times. Use within 2-3 days of purchase or freeze for longer storage.</p>';
            default:
                return '<p>Store according to manufacturer instructions. Keep in original packaging when possible.</p>';
        }
    }

    // Get dashboard statistics
    getDashboardStats() {
        const totalProducts = this.products.length;
        const activeProducts = this.products.filter(product => product.status === 'active').length;
        
        return {
            totalProducts,
            activeProducts
        };
    }

    // Load recent products for dashboard
    loadRecentProducts() {
        const tableBody = document.getElementById('recent-products-table');
        if (!tableBody) return;

        // Get recent products (last 5 added)
        const recentProducts = [...this.products]
            .sort((a, b) => b.id.localeCompare(a.id)) // Simple sort by ID for demo
            .slice(0, 5);

        tableBody.innerHTML = '';

        if (recentProducts.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-4">
                        <i class="bi bi-inbox display-4 d-block text-muted mb-2"></i>
                        <p class="text-muted">No products found</p>
                    </td>
                </tr>
            `;
            return;
        }

        recentProducts.forEach(product => {
            const firstImage = product.images && product.images.length > 0 ? product.images[0] : 'assets/img/placeholder.jpg';
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="d-flex align-items-center">
                        <img src="${firstImage}" alt="${product.name}" 
                             class="product-thumbnail-sm rounded me-3">
                        <span>${product.name}</span>
                    </div>
                </td>
                <td>
                    <span class="badge bg-${this.getCategoryBadgeColor(product.category)}">
                        ${this.formatCategory(product.category)}
                    </span>
                </td>
                <td>$${product.price.toFixed(2)}</td>
                <td>
                    <span class="badge bg-${product.status === 'active' ? 'success' : 'secondary'}">
                        ${product.status}
                    </span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="productManager.editProduct('${product.id}')">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="productManager.deleteProduct('${product.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Update dashboard statistics - Unified approach
    updateDashboardStats() {
        // Get product stats
        const productStats = this.getDashboardStats();
        
        // Get order stats if orderManager exists
        let orderStats = { totalOrders: 0, totalRevenue: 0 };
        let uniqueCustomers = 0;
        
        if (window.orderManager) {
            orderStats = window.orderManager.getOrderStats();
            const uniqueEmails = new Set(window.orderManager.getAllOrders()
                .map(order => order.delivery?.location?.email)
                .filter(email => email));
            uniqueCustomers = uniqueEmails.size;
        }
        
        // Update all stats consistently
        this.updateElement('total-products', productStats.totalProducts);
        this.updateElement('total-orders', orderStats.totalOrders);
        this.updateElement('total-revenue', `$${orderStats.totalRevenue.toFixed(2)}`);
        this.updateElement('total-customers', uniqueCustomers);
        
        // Update active products if the element exists
        const activeProductsEl = document.getElementById('active-products');
        if (activeProductsEl) {
            activeProductsEl.textContent = productStats.activeProducts;
        }
    }
    
    // Helper method to update elements safely
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    // Helper methods
    getCategoryBadgeColor(category) {
        const colors = {
            fruit: 'success',
            vegetable: 'info',
            seed: 'primary',
            meat: 'danger',
            equipment: 'warning'
        };
        return colors[category] || 'secondary';
    }

    formatCategory(category) {
        return category.charAt(0).toUpperCase() + category.slice(1);
    }

    // Save products to localStorage
    saveProducts() {
        localStorage.setItem('farmProducts', JSON.stringify(this.products));
        this.loadProductsTable();
        // Also update dashboard stats when products change
        this.updateDashboardStats();
        this.loadRecentProducts();
    }

    // Delete product
    deleteProduct(productId) {
        if (confirm('Are you sure you want to delete this product?')) {
            this.products = this.products.filter(product => product.id !== productId);
            this.saveProducts();
            alert('Product deleted successfully!');
        }
    }

    // Get all products (for public pages)
    getAllProducts() {
        return this.products;
    }

    // Get active products only (for public pages)
    getActiveProducts() {
        return this.products.filter(product => product.status === 'active');
    }
}

// Initialize product manager and ensure dashboard updates
const productManager = new ProductManager();

// Update dashboard stats after a short delay to ensure orderManager is loaded
setTimeout(() => {
    productManager.updateDashboardStats();
    productManager.loadRecentProducts();
}, 100);
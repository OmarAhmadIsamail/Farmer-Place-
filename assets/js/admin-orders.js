// Admin Order Management
class OrderManager {
    constructor() {
        this.orders = JSON.parse(localStorage.getItem('orders')) || [];
        this.init();
    }

    init() {
        if (window.location.pathname.includes('/admin/orders.html')) {
            this.loadOrderStats();
            this.loadOrdersTable();
            this.setupEventListeners();
        }
        
        // Always update dashboard stats when OrderManager is initialized
        this.updateDashboardStats();
    }

    // Load order statistics cards
    loadOrderStats() {
        const statsContainer = document.getElementById('order-stats-cards');
        if (!statsContainer) return;

        const stats = this.getOrderStats();

        statsContainer.innerHTML = `
            <div class="col-xl-3 col-md-6">
                <div class="admin-card stats-card">
                    <i class="bi bi-cart display-4 text-primary"></i>
                    <span class="stats-number">${stats.totalOrders}</span>
                    <span class="stats-label">Total Orders</span>
                </div>
            </div>
            <div class="col-xl-3 col-md-6">
                <div class="admin-card stats-card">
                    <i class="bi bi-clock-history display-4 text-warning"></i>
                    <span class="stats-number">${stats.pendingOrders}</span>
                    <span class="stats-label">Pending</span>
                </div>
            </div>
            <div class="col-xl-3 col-md-6">
                <div class="admin-card stats-card">
                    <i class="bi bi-check-circle display-4 text-success"></i>
                    <span class="stats-number">${stats.completedOrders}</span>
                    <span class="stats-label">Completed</span>
                </div>
            </div>
            <div class="col-xl-3 col-md-6">
                <div class="admin-card stats-card">
                    <i class="bi bi-currency-dollar display-4 text-info"></i>
                    <span class="stats-number">$${stats.totalRevenue.toFixed(2)}</span>
                    <span class="stats-label">Total Revenue</span>
                </div>
            </div>
        `;
    }

    // Get order statistics
    getOrderStats() {
        const totalOrders = this.orders.length;
        const pendingOrders = this.orders.filter(order => 
            order.status === 'pending' || order.status === 'confirmed'
        ).length;
        const completedOrders = this.orders.filter(order => 
            order.status === 'delivered'
        ).length;
        const totalRevenue = this.orders
            .filter(order => order.status !== 'cancelled')
            .reduce((total, order) => total + order.totals.total, 0);

        return {
            totalOrders,
            pendingOrders,
            completedOrders,
            totalRevenue
        };
    }

    // Load orders into admin table
    loadOrdersTable() {
        const tableBody = document.getElementById('orders-table');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        if (this.orders.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-4">
                        <i class="bi bi-inbox display-4 d-block text-muted mb-2"></i>
                        <p class="text-muted">No orders found</p>
                    </td>
                </tr>
            `;
            return;
        }

        // Sort orders by date (newest first)
        const sortedOrders = [...this.orders].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );

        sortedOrders.forEach(order => {
            const row = document.createElement('tr');
            const orderDate = new Date(order.date).toLocaleDateString();
            const customerName = order.delivery.location?.firstName + ' ' + order.delivery.location?.lastName;
            const customerEmail = order.delivery.location?.email || 'N/A';

            row.innerHTML = `
                <td>
                    <strong>${order.id}</strong>
                </td>
                <td>${orderDate}</td>
                <td>${customerName}</td>
                <td>${customerEmail}</td>
                <td>$${order.totals.total.toFixed(2)}</td>
                <td>
                    <span class="badge bg-${this.getStatusBadgeColor(order.status)}">
                        ${this.formatStatus(order.status)}
                    </span>
                </td>
                <td>
                    <span class="badge bg-secondary">
                        ${this.formatPaymentMethod(order.paymentMethod)}
                    </span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="orderManager.viewOrder('${order.id}')" 
                                data-bs-toggle="tooltip" title="View Details">
                            <i class="bi bi-eye"></i>
                        </button>
                        <div class="dropdown">
                            <button class="btn btn-outline-secondary dropdown-toggle" type="button" 
                                    data-bs-toggle="dropdown" data-bs-boundary="viewport">
                                <i class="bi bi-gear"></i>
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="#" onclick="orderManager.updateStatus('${order.id}', 'confirmed')">
                                    <i class="bi bi-check-circle text-success"></i> Confirm
                                </a></li>
                                <li><a class="dropdown-item" href="#" onclick="orderManager.updateStatus('${order.id}', 'shipped')">
                                    <i class="bi bi-truck text-primary"></i> Mark Shipped
                                </a></li>
                                <li><a class="dropdown-item" href="#" onclick="orderManager.updateStatus('${order.id}', 'delivered')">
                                    <i class="bi bi-box-seam text-info"></i> Mark Delivered
                                </a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item text-danger" href="#" onclick="orderManager.updateStatus('${order.id}', 'cancelled')">
                                    <i class="bi bi-x-circle"></i> Cancel Order
                                </a></li>
                            </ul>
                        </div>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Initialize tooltips
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }

    // Setup event listeners for search and filter
    setupEventListeners() {
        const searchInput = document.getElementById('order-search');
        const statusFilter = document.getElementById('order-status-filter');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterOrders(e.target.value, statusFilter.value);
            });
        }

        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filterOrders(searchInput.value, e.target.value);
            });
        }
    }

    // Filter orders based on search term and status
    filterOrders(searchTerm, statusFilter) {
        let filteredOrders = this.orders;

        // Filter by status
        if (statusFilter !== 'all') {
            filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
        }

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredOrders = filteredOrders.filter(order => 
                order.id.toLowerCase().includes(term) ||
                (order.delivery.location?.firstName + ' ' + order.delivery.location?.lastName).toLowerCase().includes(term) ||
                order.delivery.location?.email.toLowerCase().includes(term)
            );
        }

        // Sort by date (newest first)
        filteredOrders = filteredOrders.sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );

        this.updateOrdersTable(filteredOrders);
    }

    // Update orders table with filtered results
    updateOrdersTable(orders) {
        const tableBody = document.getElementById('orders-table');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        if (orders.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-4">
                        <i class="bi bi-search display-4 d-block text-muted mb-2"></i>
                        <p class="text-muted">No orders match your search</p>
                    </td>
                </tr>
            `;
            return;
        }

        orders.forEach(order => {
            const row = document.createElement('tr');
            const orderDate = new Date(order.date).toLocaleDateString();
            const customerName = order.delivery.location?.firstName + ' ' + order.delivery.location?.lastName;
            const customerEmail = order.delivery.location?.email || 'N/A';

            row.innerHTML = `
                <td>
                    <strong>${order.id}</strong>
                </td>
                <td>${orderDate}</td>
                <td>${customerName}</td>
                <td>${customerEmail}</td>
                <td>$${order.totals.total.toFixed(2)}</td>
                <td>
                    <span class="badge bg-${this.getStatusBadgeColor(order.status)}">
                        ${this.formatStatus(order.status)}
                    </span>
                </td>
                <td>
                    <span class="badge bg-secondary">
                        ${this.formatPaymentMethod(order.paymentMethod)}
                    </span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="orderManager.viewOrder('${order.id}')" 
                                data-bs-toggle="tooltip" title="View Details">
                            <i class="bi bi-eye"></i>
                        </button>
                        <div class="dropdown">
                            <button class="btn btn-outline-secondary dropdown-toggle" type="button" 
                                    data-bs-toggle="dropdown" data-bs-boundary="viewport">
                                <i class="bi bi-gear"></i>
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="#" onclick="orderManager.updateStatus('${order.id}', 'confirmed')">
                                    <i class="bi bi-check-circle text-success"></i> Confirm
                                </a></li>
                                <li><a class="dropdown-item" href="#" onclick="orderManager.updateStatus('${order.id}', 'shipped')">
                                    <i class="bi bi-truck text-primary"></i> Mark Shipped
                                </a></li>
                                <li><a class="dropdown-item" href="#" onclick="orderManager.updateStatus('${order.id}', 'delivered')">
                                    <i class="bi bi-box-seam text-info"></i> Mark Delivered
                                </a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item text-danger" href="#" onclick="orderManager.updateStatus('${order.id}', 'cancelled')">
                                    <i class="bi bi-x-circle"></i> Cancel Order
                                </a></li>
                            </ul>
                        </div>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // View order details
    viewOrder(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) {
            alert('Order not found!');
            return;
        }

        // Create and show order details modal
        this.showOrderModal(order);
    }

    // Show order details modal
    showOrderModal(order) {
        const orderDate = new Date(order.date).toLocaleString();
        const customer = order.delivery.location;

        // Create modal HTML
        const modalHTML = `
            <div class="modal fade" id="orderModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Order Details - ${order.id}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <h6>Order Information</h6>
                                    <p><strong>Date:</strong> ${orderDate}</p>
                                    <p><strong>Status:</strong> 
                                        <span class="badge bg-${this.getStatusBadgeColor(order.status)}">
                                            ${this.formatStatus(order.status)}
                                        </span>
                                    </p>
                                    <p><strong>Payment Method:</strong> ${this.formatPaymentMethod(order.paymentMethod)}</p>
                                </div>
                                <div class="col-md-6">
                                    <h6>Customer Information</h6>
                                    <p><strong>Name:</strong> ${customer.firstName} ${customer.lastName}</p>
                                    <p><strong>Email:</strong> ${customer.email}</p>
                                    <p><strong>Phone:</strong> ${customer.phone}</p>
                                    <p><strong>Address:</strong> ${customer.address}, ${customer.city}, ${customer.zipCode}, ${customer.country}</p>
                                    ${customer.instructions ? `<p><strong>Delivery Instructions:</strong> ${customer.instructions}</p>` : ''}
                                </div>
                            </div>
                            
                            <hr>
                            
                            <h6>Order Items</h6>
                            <div class="table-responsive">
                                <table class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Quantity</th>
                                            <th>Price</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${order.items.map(item => `
                                            <tr>
                                                <td>${item.name}</td>
                                                <td>${item.quantity}</td>
                                                <td>$${item.price.toFixed(2)}</td>
                                                <td>$${(item.price * item.quantity).toFixed(2)}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div class="row mt-3">
                                <div class="col-md-6"></div>
                                <div class="col-md-6">
                                    <div class="d-flex justify-content-between">
                                        <span>Subtotal:</span>
                                        <span>$${order.totals.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div class="d-flex justify-content-between">
                                        <span>Delivery Fee:</span>
                                        <span>$${order.totals.delivery.toFixed(2)}</span>
                                    </div>
                                    <div class="d-flex justify-content-between">
                                        <span>Tax:</span>
                                        <span>$${order.totals.tax.toFixed(2)}</span>
                                    </div>
                                    <hr>
                                    <div class="d-flex justify-content-between fw-bold">
                                        <span>Total:</span>
                                        <span>$${order.totals.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('orderModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Show modal
        const orderModal = new bootstrap.Modal(document.getElementById('orderModal'));
        orderModal.show();
    }

    // Update order status
    updateStatus(orderId, newStatus) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) {
            alert('Order not found!');
            return;
        }

        if (confirm(`Are you sure you want to change order status to "${this.formatStatus(newStatus)}"?`)) {
            order.status = newStatus;
            this.saveOrders();
            
            // Reload the table and stats
            this.loadOrdersTable();
            this.loadOrderStats();
            this.updateDashboardStats();
            
            alert(`Order status updated to ${this.formatStatus(newStatus)}`);
        }
    }

    // Update dashboard statistics - Unified approach
    updateDashboardStats() {
        const stats = this.getOrderStats();
        
        // Get unique customers count
        const uniqueCustomers = new Set(this.orders.map(order => order.delivery.location?.email).filter(email => email));
        
        // Update all dashboard elements if they exist
        this.updateElement('total-orders', stats.totalOrders);
        this.updateElement('total-revenue', `$${stats.totalRevenue.toFixed(2)}`);
        this.updateElement('total-customers', uniqueCustomers.size);
        
        // Also update product stats if productManager exists
        if (window.productManager) {
            const productStats = window.productManager.getDashboardStats();
            this.updateElement('total-products', productStats.totalProducts);
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
    getStatusBadgeColor(status) {
        const colors = {
            pending: 'warning',
            confirmed: 'info',
            shipped: 'primary',
            delivered: 'success',
            cancelled: 'danger'
        };
        return colors[status] || 'secondary';
    }

    formatStatus(status) {
        return status.charAt(0).toUpperCase() + status.slice(1);
    }

    formatPaymentMethod(method) {
        const methods = {
            cash: 'Cash on Delivery',
            digital: 'Digital Wallet',
            card: 'Credit/Debit Card'
        };
        return methods[method] || method;
    }

    // Save orders to localStorage
    saveOrders() {
        localStorage.setItem('orders', JSON.stringify(this.orders));
    }

    // Get all orders (for other parts of the application)
    getAllOrders() {
        return this.orders;
    }

    // Get orders by status
    getOrdersByStatus(status) {
        return this.orders.filter(order => order.status === status);
    }
}

// Initialize order manager
const orderManager = new OrderManager();

// Ensure dashboard stats are updated
setTimeout(() => {
    orderManager.updateDashboardStats();
}, 100);
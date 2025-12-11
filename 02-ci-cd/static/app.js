// State management
let allOrders = [];
let currentFilter = 'all';
let requestTimes = [];

// Products list for random generation
const PRODUCTS = [
    "Laptop", "Smartphone", "Headphones", "Monitor", "Keyboard",
    "Mouse", "Webcam", "Tablet", "Smartwatch", "Speaker"
];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    checkHealth();
    refreshOrders();
    setInterval(checkHealth, 10000); // Check health every 10s
    setInterval(refreshOrders, 5000); // Refresh orders every 5s
});

// Health check
async function checkHealth() {
    const statusDot = document.getElementById('healthStatus');
    const statusText = document.getElementById('healthText');

    try {
        const response = await fetch('/health');
        if (response.ok) {
            statusDot.className = 'status-dot healthy';
            statusText.textContent = 'Healthy';
            updateStats();
        } else {
            statusDot.className = 'status-dot unhealthy';
            statusText.textContent = 'Unhealthy';
        }
    } catch (error) {
        statusDot.className = 'status-dot unhealthy';
        statusText.textContent = 'Offline';
    }
}

// Update statistics
function updateStats() {
    document.getElementById('totalOrders').textContent = allOrders.length;

    // Calculate success rate (mock for now)
    const successRate = allOrders.length > 0 ? '99.5%' : '100%';
    document.getElementById('successRate').textContent = successRate;

    // Calculate average response time
    const avgTime = requestTimes.length > 0
        ? (requestTimes.reduce((a, b) => a + b, 0) / requestTimes.length).toFixed(0)
        : '0';
    document.getElementById('avgResponse').textContent = `${avgTime}ms`;
}

// Fetch orders
async function refreshOrders() {
    const startTime = performance.now();

    try {
        const response = await fetch('/orders');
        const data = await response.json();

        const endTime = performance.now();
        const duration = endTime - startTime;
        requestTimes.push(duration);
        if (requestTimes.length > 10) requestTimes.shift(); // Keep last 10

        allOrders = data.orders || [];
        renderOrders();
        updateStats();
    } catch (error) {
        showToast('Failed to fetch orders', 'error');
        console.error('Error fetching orders:', error);
    }
}

// Render orders based on filter
function renderOrders() {
    const container = document.getElementById('ordersContainer');

    let filteredOrders = allOrders;
    if (currentFilter !== 'all') {
        filteredOrders = allOrders.filter(order => order.status === currentFilter);
    }

    if (filteredOrders.length === 0) {
        container.innerHTML = '<p class="empty-state">No orders found.</p>';
        return;
    }

    container.innerHTML = filteredOrders.map(order => `
        <div class="order-card">
            <div class="order-info">
                <div class="order-header">
                    <span class="order-id">#${order.id}</span>
                    <span class="order-product">${order.product}</span>
                    <span class="status-badge status-${order.status}">${order.status}</span>
                </div>
                <div class="order-details">
                    <span>Qty: ${order.quantity}</span>
                    <span>Price: $${order.price.toFixed(2)}</span>
                    <span>Created: ${new Date(order.created_at * 1000).toLocaleTimeString()}</span>
                </div>
            </div>
            <div class="order-actions">
                <button class="btn btn-secondary" onclick="updateOrderStatus(${order.id})">
                    Update
                </button>
                <button class="btn btn-danger" onclick="deleteOrder(${order.id})">
                    Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Create order from form
async function createOrder(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const orderData = {
        product: formData.get('product'),
        quantity: parseInt(formData.get('quantity')),
        price: parseFloat(formData.get('price'))
    };

    try {
        const response = await fetch('/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            showToast('Order created successfully!', 'success');
            event.target.reset();
            refreshOrders();
        } else {
            showToast('Failed to create order', 'error');
        }
    } catch (error) {
        showToast('Error creating order', 'error');
        console.error('Error:', error);
    }
}

// Create random order
async function createRandomOrder() {
    const orderData = {
        product: PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)],
        quantity: Math.floor(Math.random() * 5) + 1,
        price: parseFloat((Math.random() * 990 + 10).toFixed(2))
    };

    try {
        const response = await fetch('/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            showToast(`Created order: ${orderData.product}`, 'success');
            refreshOrders();
        } else {
            showToast('Failed to create order', 'error');
        }
    } catch (error) {
        showToast('Error creating order', 'error');
        console.error('Error:', error);
    }
}

// Update order status
async function updateOrderStatus(orderId) {
    const statuses = ['pending', 'processing', 'shipped', 'delivered'];
    const currentOrder = allOrders.find(o => o.id === orderId);
    const currentIndex = statuses.indexOf(currentOrder.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];

    try {
        const response = await fetch(`/orders/${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: nextStatus })
        });

        if (response.ok) {
            showToast(`Order #${orderId} updated to ${nextStatus}`, 'success');
            refreshOrders();
        } else {
            showToast('Failed to update order', 'error');
        }
    } catch (error) {
        showToast('Error updating order', 'error');
        console.error('Error:', error);
    }
}

// Delete order
async function deleteOrder(orderId) {
    if (!confirm(`Delete order #${orderId}?`)) return;

    try {
        const response = await fetch(`/orders/${orderId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showToast(`Order #${orderId} deleted`, 'success');
            refreshOrders();
        } else {
            showToast('Failed to delete order', 'error');
        }
    } catch (error) {
        showToast('Error deleting order', 'error');
        console.error('Error:', error);
    }
}

// Clear all orders
async function clearAllOrders() {
    if (!confirm('Delete all orders? This cannot be undone.')) return;

    const deletePromises = allOrders.map(order =>
        fetch(`/orders/${order.id}`, { method: 'DELETE' })
    );

    try {
        await Promise.all(deletePromises);
        showToast('All orders cleared', 'success');
        refreshOrders();
    } catch (error) {
        showToast('Error clearing orders', 'error');
        console.error('Error:', error);
    }
}

// Simulate error
async function simulateError(type) {
    try {
        const response = await fetch(`/simulate-error?error_type=${type}`);
        if (response.ok) {
            showToast(`Simulated ${type} error`, 'warning');
        } else {
            showToast(`Error ${response.status}: ${type}`, 'error');
        }
    } catch (error) {
        showToast(`${type} error triggered`, 'warning');
    }
}

// Switch tabs
function switchTab(filter) {
    currentFilter = filter;

    // Update tab styling
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');

    renderOrders();
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

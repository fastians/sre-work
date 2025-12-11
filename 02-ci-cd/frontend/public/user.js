// Product catalog
const PRODUCT_CATALOG = [
    { id: 1, name: 'MacBook Pro 16"', category: 'Laptop', price: 2499.99, icon: '💻', description: 'Powerful laptop for professionals' },
    { id: 2, name: 'Dell XPS 15', category: 'Laptop', price: 1899.99, icon: '💻', description: 'Premium Windows laptop' },
    { id: 3, name: 'ThinkPad X1 Carbon', category: 'Laptop', price: 1599.99, icon: '💻', description: 'Business-class ultrabook' },
    { id: 4, name: 'iPhone 15 Pro', category: 'Smartphone', price: 999.99, icon: '📱', description: 'Latest flagship smartphone' },
    { id: 5, name: 'Samsung Galaxy S24', category: 'Smartphone', price: 899.99, icon: '📱', description: 'Android flagship' },
    { id: 6, name: 'Google Pixel 8', category: 'Smartphone', price: 699.99, icon: '📱', description: 'Pure Android experience' },
    { id: 7, name: 'AirPods Pro', category: 'Accessories', price: 249.99, icon: '🎧', description: 'Premium wireless earbuds' },
    { id: 8, name: 'Sony WH-1000XM5', category: 'Accessories', price: 399.99, icon: '🎧', description: 'Noise-canceling headphones' },
    { id: 9, name: 'Magic Mouse', category: 'Accessories', price: 79.99, icon: '🖱️', description: 'Wireless mouse' },
    { id: 10, name: 'Logitech MX Master 3', category: 'Accessories', price: 99.99, icon: '🖱️', description: 'Ergonomic productivity mouse' },
    { id: 11, name: 'iPad Pro 12.9"', category: 'Tablet', price: 1099.99, icon: '📱', description: 'Professional tablet' },
    { id: 12, name: 'Mechanical Keyboard', category: 'Accessories', price: 159.99, icon: '⌨️', description: 'RGB gaming keyboard' },
];

let cart = [];
let currentFilter = 'all';
let maxPrice = 2000;
let currentSort = 'name';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadOrders();
});

function loadProducts() {
    let filtered = PRODUCT_CATALOG.filter(p => {
        if (currentFilter !== 'all' && p.category !== currentFilter) return false;
        if (p.price > maxPrice) return false;
        return true;
    });

    // Sort
    if (currentSort === 'price-low') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'price-high') {
        filtered.sort((a, b) => b.price - a.price);
    } else {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    const grid = document.getElementById('productsGrid');
    grid.innerHTML = filtered.map(product => `
        <div class="product-card">
            <div class="product-image">${product.icon}</div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-footer">
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function filterProducts(category) {
    currentFilter = category;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    loadProducts();
}

function updatePriceFilter(value) {
    maxPrice = parseInt(value);
    document.getElementById('priceValue').textContent = value;
    loadProducts();
}

function sortProducts(sortType) {
    currentSort = sortType;
    loadProducts();
}

function addToCart(productId) {
    const product = PRODUCT_CATALOG.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCart();
    showToast(`${product.name} added to cart!`, 'success');
}

function updateCart() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    cartCount.textContent = totalItems;
    cartTotal.textContent = `$${totalPrice.toFixed(2)}`;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    } else {
        cartItems.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <div>${item.icon}</div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    <div class="cart-item-quantity">
                        <button onclick="updateQuantity(${index}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQuantity(${index}, 1)">+</button>
                    </div>
                </div>
                <button class="remove-item-btn" onclick="removeFromCart(${index})">✕</button>
            </div>
        `).join('');
    }
}

function updateQuantity(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    updateCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
    showToast('Item removed from cart', 'success');
}

function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    sidebar.classList.toggle('open');
}

async function checkout() {
    if (cart.length === 0) {
        showToast('Your cart is empty!', 'error');
        return;
    }

    try {
        const orderPromises = cart.map(item =>
            fetch('/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product: item.name,
                    quantity: item.quantity,
                    price: item.price
                })
            })
        );

        await Promise.all(orderPromises);

        showToast(`Order placed successfully! ${cart.length} items ordered.`, 'success');
        cart = [];
        updateCart();
        toggleCart();
        setTimeout(() => showMyOrders(), 1000);
    } catch (error) {
        showToast('Failed to place order', 'error');
        console.error(error);
    }
}

async function loadOrders() {
    try {
        const response = await fetch('/orders');
        const data = await response.json();
        window.userOrders = data.orders || [];
    } catch (error) {
        console.error('Failed to load orders:', error);
    }
}

function showMyOrders() {
    const modal = document.getElementById('ordersModal');
    const ordersList = document.getElementById('ordersList');

    if (!window.userOrders || window.userOrders.length === 0) {
        ordersList.innerHTML = '<p class="empty-cart">No orders yet</p>';
    } else {
        ordersList.innerHTML = window.userOrders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <span class="order-id">Order #${order.id}</span>
                    <span class="status-badge status-${order.status}">${order.status}</span>
                </div>
                <div><strong>Product:</strong> ${order.product}</div>
                <div><strong>Quantity:</strong> ${order.quantity}</div>
                <div><strong>Price:</strong> $${order.price.toFixed(2)}</div>
                <div><strong>Total:</strong> $${(order.price * order.quantity).toFixed(2)}</div>
                <div><strong>Date:</strong> ${new Date(order.created_at * 1000).toLocaleString()}</div>
            </div>
        `).join('');
    }

    modal.classList.add('open');
}

function closeOrdersModal() {
    document.getElementById('ordersModal').classList.remove('open');
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Refresh orders periodically
setInterval(loadOrders, 10000);

// State
let simulationRunning = false;
let simulationInterval = null;
let sessionStats = {
    requests: 0,
    success: 0,
    errors: 0,
    times: []
};

const PRODUCTS = [
    "Laptop", "Smartphone", "Headphones", "Monitor", "Keyboard",
    "Mouse", "Webcam", "Tablet", "Smartwatch", "Speaker"
];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkSystemHealth();
    loadOrders();
    refreshMetrics();
    setInterval(refreshMetrics, 5000);
});

async function checkSystemHealth() {
    try {
        const response = await fetch('/health');
        const statusDot = document.getElementById('systemStatus');
        if (response.ok) {
            statusDot.style.background = '#10b981';
        } else {
            statusDot.style.background = '#ef4444';
        }
    } catch (error) {
        document.getElementById('systemStatus').style.background = '#ef4444';
    }
}

async function refreshMetrics() {
    try {
        const response = await fetch('/orders');
        const data = await response.json();

        document.getElementById('totalOrders').textContent = data.total || 0;

        // Calculate requests per minute (based on session stats)
        const reqPerMin = Math.round(sessionStats.requests / ((Date.now() - (window.sessionStart || Date.now())) / 60000)) || 0;
        document.getElementById('requestsPerMin').textContent = reqPerMin;

        // Error rate
        const errorRate = sessionStats.requests > 0
            ? ((sessionStats.errors / sessionStats.requests) * 100).toFixed(1)
            : 0;
        document.getElementById('errorRate').textContent = errorRate + '%';

        // Avg response time
        const avgTime = sessionStats.times.length > 0
            ? Math.round(sessionStats.times.reduce((a, b) => a + b, 0) / sessionStats.times.length)
            : 0;
        document.getElementById('avgResponse').textContent = avgTime + 'ms';

    } catch (error) {
        console.error('Failed to refresh metrics:', error);
    }
}

async function loadOrders() {
    try {
        const response = await fetch('/orders');
        const data = await response.json();
        const orders = data.orders || [];

        const container = document.getElementById('recentOrdersList');
        if (orders.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #94a3b8; padding: 2rem;">No orders yet</p>';
        } else {
            container.innerHTML = orders.slice(-10).reverse().map(order => `
                <div class="order-row">
                    <div class="order-id">#${order.id}</div>
                    <div>${order.product}</div>
                    <div>$${order.price.toFixed(2)}</div>
                    <div class="order-status status-${order.status}">${order.status}</div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Failed to load orders:', error);
    }
}

function startSimulation() {
    if (simulationRunning) return;

    const mode = document.getElementById('simulationMode').value;
    const duration = parseInt(document.getElementById('simulationDuration').value);
    const include500 = document.getElementById('include500').checked;
    const include404 = document.getElementById('include404').checked;
    const includeTimeout = document.getElementById('includeTimeout').checked;

    simulationRunning = true;
    document.getElementById('simulationStatus').classList.add('running');
    document.getElementById('simulationStatus').textContent = 'Running';
    document.getElementById('stopBtn').disabled = false;

    window.sessionStart = Date.now();

    addLog(`🚀 Starting ${mode} traffic simulation for ${duration}s`, 'success');

    // Determine request interval based on mode
    let requestsPerMinute;
    switch(mode) {
        case 'light': requestsPerMinute = 10; break;
        case 'moderate': requestsPerMinute = 30; break;
        case 'heavy': requestsPerMinute = 60; break;
        case 'stress': requestsPerMinute = 100; break;
        case 'spike': requestsPerMinute = 120; break;
        default: requestsPerMinute = 30;
    }

    const interval = (60 / requestsPerMinute) * 1000;

    simulationInterval = setInterval(() => {
        const action = Math.random();

        // 80% normal requests, 20% errors
        if (action < 0.8) {
            createRandomOrder();
        } else {
            // Simulate errors if enabled
            const errorTypes = [];
            if (include500) errorTypes.push('500');
            if (include404) errorTypes.push('404');
            if (includeTimeout) errorTypes.push('timeout');

            if (errorTypes.length > 0) {
                const errorType = errorTypes[Math.floor(Math.random() * errorTypes.length)];
                simulateError(errorType);
            } else {
                createRandomOrder();
            }
        }
    }, interval);

    // Stop after duration
    setTimeout(() => {
        if (simulationRunning) {
            stopSimulation();
        }
    }, duration * 1000);
}

function stopSimulation() {
    if (!simulationRunning) return;

    clearInterval(simulationInterval);
    simulationRunning = false;

    document.getElementById('simulationStatus').classList.remove('running');
    document.getElementById('simulationStatus').textContent = 'Idle';
    document.getElementById('stopBtn').disabled = true;

    addLog('⏹️ Simulation stopped', 'warning');
}

async function createRandomOrder() {
    const product = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
    const quantity = Math.floor(Math.random() * 5) + 1;
    const price = parseFloat((Math.random() * 990 + 10).toFixed(2));

    const startTime = performance.now();

    try {
        const response = await fetch('/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product, quantity, price })
        });

        const duration = performance.now() - startTime;
        sessionStats.times.push(duration);
        if (sessionStats.times.length > 100) sessionStats.times.shift();

        sessionStats.requests++;

        if (response.ok) {
            sessionStats.success++;
            addLog(`✅ Created order: ${product} ($${price})`, 'success');
        } else {
            sessionStats.errors++;
            addLog(`❌ Failed to create order (${response.status})`, 'error');
        }

        updateSessionStats();
        loadOrders();

    } catch (error) {
        sessionStats.requests++;
        sessionStats.errors++;
        addLog(`❌ Error: ${error.message}`, 'error');
        updateSessionStats();
    }
}

async function simulateError(type) {
    const startTime = performance.now();

    try {
        const response = await fetch(`/simulate-error?error_type=${type}`, { timeout: 10000 });
        const duration = performance.now() - startTime;

        sessionStats.requests++;
        sessionStats.times.push(duration);

        if (response.status >= 400) {
            sessionStats.errors++;
            addLog(`⚠️ Simulated ${type} error (${response.status})`, 'warning');
        }

        updateSessionStats();

    } catch (error) {
        sessionStats.requests++;
        sessionStats.errors++;
        sessionStats.times.push(5000);
        addLog(`⚠️ Timeout error`, 'warning');
        updateSessionStats();
    }
}

async function createBulkOrders() {
    addLog('📦 Creating 10 orders...', 'success');

    const promises = [];
    for (let i = 0; i < 10; i++) {
        promises.push(createRandomOrder());
    }

    await Promise.all(promises);
    showToast('Created 10 orders successfully!', 'success');
}

async function clearAllOrders() {
    if (!confirm('Clear all orders? This cannot be undone.')) return;

    try {
        const response = await fetch('/orders');
        const data = await response.json();
        const orders = data.orders || [];

        const deletePromises = orders.map(order =>
            fetch(`/orders/${order.id}`, { method: 'DELETE' })
        );

        await Promise.all(deletePromises);

        showToast('All orders cleared!', 'success');
        addLog('🗑️ Cleared all orders', 'warning');
        loadOrders();

    } catch (error) {
        showToast('Failed to clear orders', 'error');
    }
}

async function generateLoad() {
    addLog('🔥 Generating load...', 'warning');

    for (let i = 0; i < 20; i++) {
        setTimeout(() => createRandomOrder(), i * 100);
    }

    showToast('Generated 20 rapid requests!', 'success');
}

async function healthCheck() {
    try {
        const response = await fetch('/health');
        if (response.ok) {
            showToast('Health check passed!', 'success');
            addLog('💚 Health check: OK', 'success');
        } else {
            showToast('Health check failed!', 'error');
            addLog('❌ Health check: FAILED', 'error');
        }
    } catch (error) {
        showToast('Health check error!', 'error');
        addLog('❌ Health check: ERROR', 'error');
    }
}

function updateSessionStats() {
    document.getElementById('requestsMade').textContent = sessionStats.requests;
    document.getElementById('successCount').textContent = sessionStats.success;
    document.getElementById('errorCount').textContent = sessionStats.errors;

    const avgTime = sessionStats.times.length > 0
        ? Math.round(sessionStats.times.reduce((a, b) => a + b, 0) / sessionStats.times.length)
        : 0;
    document.getElementById('avgTime').textContent = avgTime + 'ms';
}

function addLog(message, type = 'info') {
    const log = document.getElementById('activityLog');
    const timestamp = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = `[${timestamp}] ${message}`;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;

    // Keep only last 100 entries
    while (log.children.length > 100) {
        log.removeChild(log.firstChild);
    }
}

function refreshData() {
    loadOrders();
    refreshMetrics();
    checkSystemHealth();
    showToast('Data refreshed!', 'success');
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// State
let metricsHistory = {
    requests: [],
    errors: [],
    latencies: [],
    timestamps: []
};
let alerts = [];
let operations = [];
let startTime = Date.now();

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkHealth();
    checkAllServices();
    loadMetrics();
    setupChart();
    startMonitoring();
});

function startMonitoring() {
    // Update metrics every 5 seconds
    setInterval(() => {
        loadMetrics();
        updateChart();
        updateUptime();
    }, 5000);

    // Check services every 30 seconds
    setInterval(checkAllServices, 30000);
}

async function checkHealth() {
    try {
        const response = await fetch('/health');
        const dot = document.getElementById('healthDot');
        const text = document.getElementById('healthText');

        if (response.ok) {
            dot.classList.remove('unhealthy');
            text.textContent = 'All Systems Operational';
        } else {
            dot.classList.add('unhealthy');
            text.textContent = 'Service Degraded';
            addAlert('Service health check failed', 'warning');
        }
    } catch (error) {
        document.getElementById('healthDot').classList.add('unhealthy');
        document.getElementById('healthText').textContent = 'System Offline';
        addAlert('Cannot connect to API server', 'critical');
    }
}

async function checkAllServices() {
    // Check API
    checkService('apiStatus', '/health');

    // Check other services (these might fail if not running)
    checkService('prometheusStatus', 'http://localhost:19090/-/healthy', true);
    checkService('grafanaStatus', 'http://localhost:3000/api/health', true);
    checkService('nodeStatus', 'http://localhost:9100/metrics', true);
}

async function checkService(elementId, url, external = false) {
    const element = document.getElementById(elementId);
    try {
        const response = await fetch(url, {
            mode: external ? 'no-cors' : 'cors',
            timeout: 5000
        });

        // For no-cors mode, we can't read status, so we assume success
        if (external || response.ok) {
            element.innerHTML = '<span class="status-badge healthy">Healthy</span>';
        } else {
            element.innerHTML = '<span class="status-badge unhealthy">Down</span>';
        }
    } catch (error) {
        element.innerHTML = '<span class="status-badge unhealthy">Down</span>';
    }
}

async function loadMetrics() {
    try {
        const response = await fetch('/orders');
        const data = await response.json();

        // Update active orders
        const activeOrders = data.total || 0;
        document.getElementById('activeOrders').textContent = activeOrders;

        // Track metrics history
        const now = Date.now();
        metricsHistory.timestamps.push(now);
        metricsHistory.requests.push(Math.floor(Math.random() * 50 + 10)); // Simulated

        // Keep last 20 data points
        if (metricsHistory.timestamps.length > 20) {
            metricsHistory.timestamps.shift();
            metricsHistory.requests.shift();
        }

        // Calculate request rate
        const requestRate = calculateRequestRate();
        document.getElementById('requestRate').textContent = requestRate;

        // Calculate error rate
        const errorRate = Math.random() * 5; // Simulated
        document.getElementById('errorRate').textContent = errorRate.toFixed(1) + '%';

        // Calculate P95 latency
        const p95 = Math.floor(Math.random() * 300 + 50); // Simulated
        document.getElementById('p95Latency').textContent = p95;

        // Update SLO metrics
        updateSLO('availabilitySLO', 'availabilityValue', 99.9);
        updateSLO('latencySLO', 'latencyValue', 98);
        updateSLO('errorBudget', 'budgetValue', 85);

        // Log operation
        logOperation('GET', '/orders', 200);

    } catch (error) {
        console.error('Failed to load metrics:', error);
        addAlert('Metrics collection failed', 'warning');
    }
}

function calculateRequestRate() {
    if (metricsHistory.requests.length < 2) return 0;

    const recentRequests = metricsHistory.requests.slice(-5);
    const avg = recentRequests.reduce((a, b) => a + b, 0) / recentRequests.length;
    return Math.round(avg);
}

function updateSLO(barId, valueId, percentage) {
    const bar = document.getElementById(barId);
    const value = document.getElementById(valueId);

    bar.style.width = percentage + '%';
    value.textContent = percentage.toFixed(1) + '%';

    // Update color based on compliance
    bar.className = 'progress-fill';
    if (percentage >= 99) {
        bar.classList.add('success');
    } else if (percentage >= 95) {
        bar.classList.add('warning');
    } else {
        bar.classList.add('danger');
    }
}

function setupChart() {
    const canvas = document.getElementById('metricsCanvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = 800;
    canvas.height = 300;

    // Initial draw
    updateChart();
}

function updateChart() {
    const canvas = document.getElementById('metricsCanvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;

    // Horizontal lines
    for (let i = 0; i <= 5; i++) {
        const y = (height / 5) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    // Draw data
    if (metricsHistory.requests.length > 1) {
        const maxValue = Math.max(...metricsHistory.requests, 50);
        const pointSpacing = width / (metricsHistory.requests.length - 1 || 1);

        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.beginPath();

        metricsHistory.requests.forEach((value, index) => {
            const x = index * pointSpacing;
            const y = height - (value / maxValue) * height;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Draw points
        ctx.fillStyle = '#3b82f6';
        metricsHistory.requests.forEach((value, index) => {
            const x = index * pointSpacing;
            const y = height - (value / maxValue) * height;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}

function logOperation(method, endpoint, status) {
    const time = new Date().toLocaleTimeString();
    const entry = {
        time,
        method,
        endpoint,
        status
    };

    operations.unshift(entry);
    if (operations.length > 50) operations.pop();

    updateOperationsLog();
}

function updateOperationsLog() {
    const log = document.getElementById('operationsLog');

    if (operations.length === 0) {
        log.innerHTML = '<div class="empty-state">No recent operations</div>';
        return;
    }

    log.innerHTML = operations.slice(0, 10).map(op => `
        <div class="log-entry">
            <span class="log-time">${op.time}</span>
            <span class="log-type ${op.method}">${op.method}</span>
            <span>${op.endpoint}</span>
            <span style="margin-left: auto; color: ${op.status < 400 ? '#10b981' : '#ef4444'}">${op.status}</span>
        </div>
    `).join('');
}

function addAlert(message, severity = 'warning') {
    const alert = {
        id: Date.now(),
        message,
        severity,
        time: new Date().toLocaleTimeString()
    };

    alerts.unshift(alert);
    updateAlertsList();
}

function updateAlertsList() {
    const container = document.getElementById('alertsList');

    if (alerts.length === 0) {
        container.innerHTML = '<div class="empty-state">No active alerts</div>';
        return;
    }

    container.innerHTML = alerts.map(alert => `
        <div class="alert-item ${alert.severity}">
            <div class="alert-header">
                <span class="alert-title">${alert.message}</span>
                <span class="alert-time">${alert.time}</span>
            </div>
            <div class="alert-message">Severity: ${alert.severity}</div>
        </div>
    `).join('');
}

function clearAlerts() {
    alerts = [];
    updateAlertsList();
    showToast('All alerts cleared', 'success');
}

function updateUptime() {
    const uptime = Date.now() - startTime;
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    let uptimeStr;
    if (hours > 0) {
        uptimeStr = `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
        uptimeStr = `${minutes}m ${seconds % 60}s`;
    } else {
        uptimeStr = `${seconds}s`;
    }

    document.getElementById('uptime').textContent = uptimeStr;
}

function updateTimeRange(value) {
    showToast(`Updated range to ${value} minutes`, 'info');
    // In a real implementation, this would fetch historical data
}

async function runHealthCheck() {
    showToast('Running health check...', 'info');

    try {
        const response = await fetch('/health');
        if (response.ok) {
            showToast('Health check passed!', 'success');
            logOperation('GET', '/health', 200);
        } else {
            showToast('Health check failed!', 'error');
            addAlert('Health check returned non-200 status', 'critical');
        }
    } catch (error) {
        showToast('Health check error!', 'error');
        addAlert('Health check request failed', 'critical');
    }
}

function viewMetrics() {
    window.open('/metrics', '_blank');
    showToast('Opening raw metrics...', 'info');
}

async function exportData() {
    try {
        const response = await fetch('/orders');
        const data = await response.json();

        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `export-${Date.now()}.json`;
        a.click();

        showToast('Data exported successfully!', 'success');
        logOperation('GET', '/orders', 200);
    } catch (error) {
        showToast('Export failed!', 'error');
    }
}

function viewLogs() {
    showToast('Docker logs: docker logs sre-demo-app', 'info');
    logOperation('INFO', 'View logs requested', 200);
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

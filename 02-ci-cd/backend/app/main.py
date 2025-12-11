"""
Main FastAPI Application
Production-grade API server with monitoring and observability
"""
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import Response, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
import time
import random
import logging
from typing import Optional
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(
    title="TechStore API",
    description="E-commerce platform with monitoring and observability",
    version="3.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prometheus Metrics
REQUEST_COUNT = Counter(
    'app_requests_total',
    'Total request count',
    ['method', 'endpoint', 'status']
)
REQUEST_DURATION = Histogram(
    'app_request_duration_seconds',
    'Request duration',
    ['endpoint']
)
ACTIVE_ORDERS = Gauge(
    'app_active_orders',
    'Number of active orders'
)
ERROR_COUNT = Counter(
    'app_errors_total',
    'Total error count',
    ['type']
)

# In-memory data store
orders_db = {}
order_counter = 1

# Pydantic Models
class OrderCreate(BaseModel):
    product: str = "Unknown Product"
    quantity: int = 1
    price: float = 99.99

class OrderUpdate(BaseModel):
    status: Optional[str] = None
    quantity: Optional[int] = None

# Middleware for metrics
@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time

    REQUEST_DURATION.labels(endpoint=request.url.path).observe(duration)
    REQUEST_COUNT.labels(
        method=request.method,
        endpoint=request.url.path,
        status=response.status_code
    ).inc()

    return response

# Mount static files
static_path = Path(__file__).parent.parent.parent / "frontend" / "public"
app.mount("/static", StaticFiles(directory=str(static_path)), name="static")

# Routes
@app.get("/", response_class=HTMLResponse)
async def user_frontend():
    """Serve user-facing e-commerce frontend"""
    try:
        html_path = static_path / "user.html"
        with open(html_path, "r") as f:
            return HTMLResponse(content=f.read())
    except FileNotFoundError:
        return {"error": "Frontend not found"}

@app.get("/admin", response_class=HTMLResponse)
async def admin_dashboard():
    """Serve admin dashboard (protected in production)"""
    try:
        html_path = static_path / "admin.html"
        with open(html_path, "r") as f:
            return HTMLResponse(content=f.read())
    except FileNotFoundError:
        return {"error": "Admin dashboard not found"}

@app.get("/sre", response_class=HTMLResponse)
async def sre_dashboard():
    """Serve SRE monitoring dashboard (protected in production)"""
    try:
        html_path = static_path / "sre.html"
        with open(html_path, "r") as f:
            return HTMLResponse(content=f.read())
    except FileNotFoundError:
        return {"error": "SRE dashboard not found"}

@app.get("/api")
async def api_info():
    """API information endpoint"""
    logger.info("API info endpoint accessed")
    return {
        "name": "TechStore API",
        "version": "3.0.0",
        "status": "healthy",
        "docs": "/docs",
        "metrics": "/metrics"
    }

@app.get("/health")
async def health():
    """Health check endpoint for load balancers"""
    return {"status": "ok", "timestamp": time.time()}

@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint"""
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)

# Order CRUD Operations
@app.get("/orders")
async def get_orders():
    """Get all orders"""
    logger.info(f"Fetching all orders. Total: {len(orders_db)}")
    return {
        "orders": list(orders_db.values()),
        "total": len(orders_db)
    }

@app.post("/orders", status_code=201)
async def create_order(order: OrderCreate):
    """Create a new order"""
    global order_counter

    new_order = {
        "id": order_counter,
        "product": order.product,
        "quantity": order.quantity,
        "price": order.price,
        "status": "pending",
        "created_at": time.time()
    }
    orders_db[order_counter] = new_order
    ACTIVE_ORDERS.set(len(orders_db))
    logger.info(f"Order created: {order_counter} - {order.product}")
    order_counter += 1
    return new_order

@app.get("/orders/{order_id}")
async def get_order(order_id: int):
    """Get a specific order"""
    order = orders_db.get(order_id)
    if not order:
        ERROR_COUNT.labels(type='not_found').inc()
        logger.warning(f"Order not found: {order_id}")
        raise HTTPException(status_code=404, detail="Order not found")

    logger.info(f"Fetching order: {order_id}")
    return order

@app.put("/orders/{order_id}")
async def update_order(order_id: int, order_update: OrderUpdate):
    """Update an order"""
    order = orders_db.get(order_id)
    if not order:
        ERROR_COUNT.labels(type='not_found').inc()
        raise HTTPException(status_code=404, detail="Order not found")

    if order_update.status:
        order["status"] = order_update.status
    if order_update.quantity:
        order["quantity"] = order_update.quantity
    order["updated_at"] = time.time()

    logger.info(f"Order updated: {order_id}")
    return order

@app.delete("/orders/{order_id}")
async def delete_order(order_id: int):
    """Delete an order"""
    if order_id not in orders_db:
        ERROR_COUNT.labels(type='not_found').inc()
        raise HTTPException(status_code=404, detail="Order not found")

    del orders_db[order_id]
    ACTIVE_ORDERS.set(len(orders_db))
    logger.info(f"Order deleted: {order_id}")
    return {"message": "Order deleted"}

@app.get("/simulate-error")
async def simulate_error(error_type: Optional[str] = "random"):
    """Simulate various error scenarios for testing"""
    if error_type == 'random':
        error_type = random.choice(['500', '404', 'timeout', 'validation'])

    if error_type == '500':
        ERROR_COUNT.labels(type='internal_error').inc()
        logger.error("Simulated internal server error")
        raise HTTPException(status_code=500, detail="Internal server error")

    elif error_type == '404':
        ERROR_COUNT.labels(type='not_found').inc()
        logger.warning("Simulated not found error")
        raise HTTPException(status_code=404, detail="Resource not found")

    elif error_type == 'timeout':
        ERROR_COUNT.labels(type='timeout').inc()
        logger.warning("Simulating slow response")
        time.sleep(5)
        return {"message": "Slow response completed"}

    elif error_type == 'validation':
        ERROR_COUNT.labels(type='validation').inc()
        logger.warning("Simulated validation error")
        raise HTTPException(status_code=400, detail="Validation failed")

    return {"message": "Unknown error type"}

# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info("=" * 50)
    logger.info("TechStore API Starting...")
    logger.info(f"Version: 3.0.0")
    logger.info(f"Metrics enabled: /metrics")
    logger.info(f"API docs: /docs")
    logger.info("=" * 50)

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("TechStore API Shutting down...")

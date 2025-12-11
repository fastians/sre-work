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

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="SRE Demo App",
    description="FastAPI demo with monitoring and observability",
    version="3.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prometheus metrics
REQUEST_COUNT = Counter('app_requests_total', 'Total request count', ['method', 'endpoint', 'status'])
REQUEST_DURATION = Histogram('app_request_duration_seconds', 'Request duration', ['endpoint'])
ACTIVE_ORDERS = Gauge('app_active_orders', 'Number of active orders')
ERROR_COUNT = Counter('app_errors_total', 'Total error count', ['type'])

# In-memory database for demo
orders = {}
order_id_counter = 1

# Pydantic models
class OrderCreate(BaseModel):
    product: str = "Unknown Product"
    quantity: int = 1
    price: float = 99.99

class OrderUpdate(BaseModel):
    status: Optional[str] = None
    quantity: Optional[int] = None

class Order(BaseModel):
    id: int
    product: str
    quantity: int
    price: float
    status: str
    created_at: float
    updated_at: Optional[float] = None

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

# Serve static files (frontend)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def home():
    """Serve the user-facing frontend"""
    try:
        with open("static/user.html", "r") as f:
            return HTMLResponse(content=f.read())
    except FileNotFoundError:
        return {
            "status": "healthy",
            "message": "SRE Demo App Running (FastAPI)",
            "version": "3.0",
            "docs": "/docs",
            "endpoints": {
                "user": "/",
                "admin": "/admin",
                "sre": "/sre",
                "api": "/api",
                "health": "/health",
                "orders": "/orders",
                "metrics": "/metrics",
                "simulate-error": "/simulate-error"
            }
        }

@app.get("/admin", response_class=HTMLResponse)
async def admin_dashboard():
    """Serve the admin dashboard"""
    try:
        with open("static/admin.html", "r") as f:
            return HTMLResponse(content=f.read())
    except FileNotFoundError:
        return {"error": "Admin dashboard not found"}

@app.get("/sre", response_class=HTMLResponse)
async def sre_dashboard():
    """Serve the SRE dashboard"""
    try:
        with open("static/sre.html", "r") as f:
            return HTMLResponse(content=f.read())
    except FileNotFoundError:
        return {"error": "SRE dashboard not found"}

@app.get("/api")
async def api_info():
    """API information"""
    logger.info("API info endpoint accessed")
    return {
        "status": "healthy",
        "message": "SRE Demo App Running (FastAPI)",
        "version": "3.0",
        "docs": "/docs",
        "endpoints": {
            "health": "/health",
            "orders": "/orders",
            "metrics": "/metrics",
            "simulate-error": "/simulate-error"
        }
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "ok"}

@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint"""
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)

# CRUD Operations for Orders
@app.get("/orders")
async def get_orders():
    """Get all orders"""
    logger.info(f"Fetching all orders. Total: {len(orders)}")
    return {
        "orders": list(orders.values()),
        "total": len(orders)
    }

@app.post("/orders", status_code=201)
async def create_order(order: OrderCreate):
    """Create a new order"""
    global order_id_counter

    new_order = {
        "id": order_id_counter,
        "product": order.product,
        "quantity": order.quantity,
        "price": order.price,
        "status": "pending",
        "created_at": time.time()
    }
    orders[order_id_counter] = new_order
    ACTIVE_ORDERS.set(len(orders))
    logger.info(f"Order created: {order_id_counter}")
    order_id_counter += 1
    return new_order

@app.get("/orders/{order_id}")
async def get_order(order_id: int):
    """Get a specific order"""
    order = orders.get(order_id)
    if not order:
        ERROR_COUNT.labels(type='not_found').inc()
        logger.warning(f"Order not found: {order_id}")
        raise HTTPException(status_code=404, detail="Order not found")

    logger.info(f"Fetching order: {order_id}")
    return order

@app.put("/orders/{order_id}")
async def update_order(order_id: int, order_update: OrderUpdate):
    """Update an order"""
    order = orders.get(order_id)
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
    if order_id not in orders:
        ERROR_COUNT.labels(type='not_found').inc()
        raise HTTPException(status_code=404, detail="Order not found")

    del orders[order_id]
    ACTIVE_ORDERS.set(len(orders))
    logger.info(f"Order deleted: {order_id}")
    return {"message": "Order deleted"}

@app.get("/simulate-error")
async def simulate_error(error_type: Optional[str] = "random"):
    """Endpoint to simulate various error scenarios"""
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

"""
API Tests for TechStore
Tests all endpoints using FastAPI TestClient
"""
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app


@pytest.fixture
def client():
    """Create test client"""
    return TestClient(app)


def test_health_endpoint(client):
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_api_info(client):
    """Test API info endpoint"""
    response = client.get("/api")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "TechStore API"
    assert data["version"] == "3.0.0"


def test_metrics_endpoint(client):
    """Test Prometheus metrics endpoint"""
    response = client.get("/metrics")
    assert response.status_code == 200
    assert "app_requests_total" in response.text


def test_create_order(client):
    """Test order creation"""
    order_data = {
        "product": "Test Laptop",
        "quantity": 2,
        "price": 999.99
    }
    response = client.post("/orders", json=order_data)
    assert response.status_code == 201
    data = response.json()
    assert data["product"] == "Test Laptop"
    assert data["quantity"] == 2
    assert data["status"] == "pending"


def test_get_orders(client):
    """Test getting all orders"""
    response = client.get("/orders")
    assert response.status_code == 200
    data = response.json()
    assert "orders" in data
    assert "total" in data


def test_get_order_not_found(client):
    """Test getting non-existent order"""
    response = client.get("/orders/99999")
    assert response.status_code == 404


def test_update_order(client):
    """Test order update"""
    # First create an order
    order_data = {"product": "Update Test", "quantity": 1, "price": 100.0}
    create_response = client.post("/orders", json=order_data)
    order_id = create_response.json()["id"]

    # Then update it
    update_data = {"status": "shipped"}
    response = client.put(f"/orders/{order_id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "shipped"


def test_delete_order(client):
    """Test order deletion"""
    # First create an order
    order_data = {"product": "Delete Test", "quantity": 1, "price": 50.0}
    create_response = client.post("/orders", json=order_data)
    order_id = create_response.json()["id"]

    # Then delete it
    response = client.delete(f"/orders/{order_id}")
    assert response.status_code == 200

    # Verify it's gone
    get_response = client.get(f"/orders/{order_id}")
    assert get_response.status_code == 404


def test_simulate_error_500(client):
    """Test 500 error simulation"""
    response = client.get("/simulate-error?error_type=500")
    assert response.status_code == 500


def test_simulate_error_404(client):
    """Test 404 error simulation"""
    response = client.get("/simulate-error?error_type=404")
    assert response.status_code == 404


def test_simulate_error_validation(client):
    """Test validation error simulation"""
    response = client.get("/simulate-error?error_type=validation")
    assert response.status_code == 400


def test_user_frontend_loads(client):
    """Test that user frontend HTML is served"""
    response = client.get("/")
    assert response.status_code == 200
    assert "TechStore" in response.text


def test_admin_frontend_loads(client):
    """Test that admin dashboard HTML is served"""
    response = client.get("/admin")
    assert response.status_code == 200
    assert "Admin" in response.text


def test_sre_frontend_loads(client):
    """Test that SRE dashboard HTML is served"""
    response = client.get("/sre")
    assert response.status_code == 200
    assert "SRE" in response.text

#!/usr/bin/env python3
"""
Traffic Simulator - Universal Traffic Generator
Can be used with any REST API application
Generates realistic traffic patterns including normal requests and error scenarios
"""

import requests
import time
import random
import logging
import sys
import argparse
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

DEFAULT_URL = "http://localhost:5001"

PRODUCTS = [
    "Laptop", "Smartphone", "Headphones", "Monitor", "Keyboard",
    "Mouse", "Webcam", "Tablet", "Smartwatch", "Speaker"
]

class TrafficSimulator:
    def __init__(self, base_url=DEFAULT_URL):
        self.base_url = base_url.rstrip('/')
        self.created_orders = []

    def create_order(self):
        """Simulate creating an order"""
        try:
            order_data = {
                "product": random.choice(PRODUCTS),
                "quantity": random.randint(1, 5),
                "price": round(random.uniform(9.99, 999.99), 2)
            }
            response = requests.post(f"{self.base_url}/orders", json=order_data, timeout=5)
            if response.status_code == 201:
                order = response.json()
                self.created_orders.append(order['id'])
                logger.info(f"✅ Created order {order['id']}: {order_data['product']} x{order_data['quantity']}")
                return order
        except Exception as e:
            logger.error(f"❌ Failed to create order: {e}")
        return None

    def get_orders(self):
        """Fetch all orders"""
        try:
            response = requests.get(f"{self.base_url}/orders", timeout=5)
            if response.status_code == 200:
                data = response.json()
                logger.info(f"📋 Fetched {data['total']} orders")
                return data
        except Exception as e:
            logger.error(f"❌ Failed to fetch orders: {e}")
        return None

    def update_order(self):
        """Update a random order"""
        if not self.created_orders:
            return None

        try:
            order_id = random.choice(self.created_orders)
            status = random.choice(["processing", "shipped", "delivered"])
            response = requests.put(
                f"{self.base_url}/orders/{order_id}",
                json={"status": status},
                timeout=5
            )
            if response.status_code == 200:
                logger.info(f"🔄 Updated order {order_id} to status: {status}")
                return response.json()
        except Exception as e:
            logger.error(f"❌ Failed to update order: {e}")
        return None

    def delete_order(self):
        """Delete a random order"""
        if not self.created_orders:
            return None

        try:
            order_id = self.created_orders.pop(random.randint(0, len(self.created_orders) - 1))
            response = requests.delete(f"{self.base_url}/orders/{order_id}", timeout=5)
            if response.status_code == 200:
                logger.info(f"🗑️  Deleted order {order_id}")
                return True
        except Exception as e:
            logger.error(f"❌ Failed to delete order: {e}")
        return None

    def check_health(self):
        """Health check"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=5)
            if response.status_code == 200:
                logger.info("💚 Health check passed")
                return True
        except Exception as e:
            logger.error(f"❌ Health check failed: {e}")
        return False

    def simulate_error(self, error_type=None):
        """Trigger error simulation"""
        try:
            params = {"type": error_type} if error_type else {}
            response = requests.get(f"{self.base_url}/simulate-error", params=params, timeout=10)
            logger.warning(f"⚠️  Simulated error: {response.status_code} - {error_type or 'random'}")
        except requests.exceptions.Timeout:
            logger.warning("⚠️  Request timeout (expected for timeout simulation)")
        except Exception as e:
            logger.error(f"❌ Error simulation failed: {e}")

    def run_normal_traffic(self, duration_seconds=60, requests_per_minute=30):
        """Generate normal traffic pattern"""
        logger.info(f"🚀 Starting normal traffic simulation for {duration_seconds}s")
        logger.info(f"📊 Target: ~{requests_per_minute} requests/minute")

        start_time = time.time()
        request_count = 0

        while time.time() - start_time < duration_seconds:
            action = random.choices(
                ['create', 'read', 'update', 'delete', 'health'],
                weights=[40, 30, 15, 5, 10]  # Weighted distribution
            )[0]

            if action == 'create':
                self.create_order()
            elif action == 'read':
                self.get_orders()
            elif action == 'update':
                self.update_order()
            elif action == 'delete':
                self.delete_order()
            elif action == 'health':
                self.check_health()

            request_count += 1

            # Sleep to maintain target requests per minute
            time.sleep(60 / requests_per_minute + random.uniform(-0.5, 0.5))

        logger.info(f"✅ Completed {request_count} requests in {duration_seconds}s")

    def run_stress_test(self, duration_seconds=30, requests_per_second=10):
        """Generate high traffic load"""
        logger.info(f"⚡ Starting stress test for {duration_seconds}s")
        logger.info(f"📊 Target: {requests_per_second} requests/second")

        start_time = time.time()
        request_count = 0

        while time.time() - start_time < duration_seconds:
            self.create_order()
            request_count += 1
            time.sleep(1 / requests_per_second)

        logger.info(f"✅ Stress test complete: {request_count} requests")

    def run_error_scenario(self, duration_seconds=30):
        """Generate various error scenarios"""
        logger.info(f"💥 Starting error scenario simulation for {duration_seconds}s")

        start_time = time.time()
        error_types = ['500', '404', 'timeout', 'validation']

        while time.time() - start_time < duration_seconds:
            error_type = random.choice(error_types)
            self.simulate_error(error_type)
            time.sleep(random.uniform(2, 5))

        logger.info("✅ Error scenario complete")

    def run_mixed_scenario(self, duration_seconds=120):
        """Run a mix of normal traffic, stress, and errors"""
        logger.info(f"🎭 Starting mixed scenario for {duration_seconds}s")
        logger.info("Mix: 70% normal, 20% errors, 10% stress")

        start_time = time.time()

        while time.time() - start_time < duration_seconds:
            scenario = random.choices(
                ['normal', 'error', 'stress'],
                weights=[70, 20, 10]
            )[0]

            if scenario == 'normal':
                action = random.choice(['create', 'read', 'update', 'health'])
                if action == 'create':
                    self.create_order()
                elif action == 'read':
                    self.get_orders()
                elif action == 'update':
                    self.update_order()
                else:
                    self.check_health()
                time.sleep(random.uniform(1, 3))

            elif scenario == 'error':
                self.simulate_error()
                time.sleep(random.uniform(2, 4))

            elif scenario == 'stress':
                for _ in range(5):
                    self.create_order()
                time.sleep(1)

        logger.info("✅ Mixed scenario complete")


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description='Universal Traffic Simulator for REST APIs',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Use with demo app (default)
  python traffic_simulator.py

  # Use with custom URL
  python traffic_simulator.py --url https://api.example.com

  # Run specific mode
  python traffic_simulator.py --mode normal
  python traffic_simulator.py --mode stress --url http://localhost:8080
        """
    )
    parser.add_argument(
        '--url',
        default=DEFAULT_URL,
        help=f'Base URL of the API (default: {DEFAULT_URL})'
    )
    parser.add_argument(
        '--mode',
        choices=['normal', 'stress', 'error', 'mixed', 'continuous'],
        help='Simulation mode (if not provided, interactive menu will be shown)'
    )

    args = parser.parse_args()
    base_url = args.url

    print(f"""
╔══════════════════════════════════════════════╗
║   Universal Traffic Simulator               ║
╚══════════════════════════════════════════════╝

Target URL: {base_url}
    """)

    simulator = TrafficSimulator(base_url=base_url)

    # Check if app is running
    try:
        requests.get(f"{base_url}/health", timeout=2)
        logger.info(f"✅ Connected to {base_url}")
    except:
        logger.error(f"❌ Cannot connect to {base_url}")
        logger.error("Make sure the target application is running")
        logger.info(f"For demo app: cd 02-ci-cd && docker compose up -d")
        return

    if args.mode:
        choice_map = {
            'normal': '1',
            'stress': '2',
            'error': '3',
            'mixed': '4',
            'continuous': '5'
        }
        choice = choice_map[args.mode]
    else:
        print("""
Choose a simulation mode:
1. Normal Traffic (60s, ~30 req/min)
2. Stress Test (30s, high load)
3. Error Scenarios (30s)
4. Mixed Scenario (120s, realistic)
5. Continuous (run until stopped)
        """)
        choice = input("Enter choice (1-5): ").strip()

    if choice == '1':
        simulator.run_normal_traffic(duration_seconds=60, requests_per_minute=30)
    elif choice == '2':
        simulator.run_stress_test(duration_seconds=30, requests_per_second=10)
    elif choice == '3':
        simulator.run_error_scenario(duration_seconds=30)
    elif choice == '4':
        simulator.run_mixed_scenario(duration_seconds=120)
    elif choice == '5':
        logger.info("Running continuous traffic (Ctrl+C to stop)")
        try:
            while True:
                simulator.run_mixed_scenario(duration_seconds=60)
        except KeyboardInterrupt:
            logger.info("\n👋 Stopping traffic simulator")
    else:
        logger.error("Invalid choice")

    print("\n✅ Simulation complete!")
    print(f"📊 View metrics at: {base_url}/metrics")
    print("📈 View in Grafana: http://localhost:3000 (if using demo setup)")


if __name__ == "__main__":
    main()

import requests
import sys
import json
from datetime import datetime

class RoboticsEcommerceAPITester:
    def __init__(self, base_url="https://robotics-hub-6.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_user_email = f"test_user_{datetime.now().strftime('%H%M%S')}@test.com"
        self.test_user_password = "TestPass123!"
        self.test_user_name = "Test User"

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if endpoint else self.api_url
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Response text: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_api_root(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_user_registration(self):
        """Test user registration"""
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={
                "email": self.test_user_email,
                "password": self.test_user_password,
                "full_name": self.test_user_name
            }
        )
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['id']
            print(f"   Token obtained: {self.token[:20]}...")
            return True
        return False

    def test_user_login(self):
        """Test user login"""
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data={
                "email": self.test_user_email,
                "password": self.test_user_password
            }
        )
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   Login successful, token: {self.token[:20]}...")
            return True
        return False

    def test_get_current_user(self):
        """Test get current user info"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        if success:
            print(f"   User info: {response.get('email', 'N/A')}")
        return success

    def test_get_products(self):
        """Test get all products"""
        success, response = self.run_test(
            "Get All Products",
            "GET",
            "products",
            200
        )
        if success:
            print(f"   Found {len(response)} products")
            return response
        return []

    def test_search_products(self):
        """Test product search"""
        success, response = self.run_test(
            "Search Products (RoboVac)",
            "GET",
            "products?search=RoboVac",
            200
        )
        if success:
            print(f"   Search results: {len(response)} products")
        return success

    def test_filter_products_by_category(self):
        """Test product filtering by category"""
        success, response = self.run_test(
            "Filter Products by Category",
            "GET",
            "products?category=home_automation",
            200
        )
        if success:
            print(f"   Category results: {len(response)} products")
        return success

    def test_get_featured_products(self):
        """Test get featured products"""
        success, response = self.run_test(
            "Get Featured Products",
            "GET",
            "products?featured=true",
            200
        )
        if success:
            print(f"   Featured products: {len(response)} products")
        return success

    def test_get_single_product(self, product_id):
        """Test get single product by ID"""
        success, response = self.run_test(
            "Get Single Product",
            "GET",
            f"products/{product_id}",
            200
        )
        if success:
            print(f"   Product: {response.get('name', 'N/A')}")
        return success

    def test_get_categories(self):
        """Test get categories"""
        success, response = self.run_test(
            "Get Categories",
            "GET",
            "categories",
            200
        )
        if success:
            print(f"   Categories: {len(response)} found")
        return success

    def test_get_cart(self):
        """Test get user cart"""
        success, response = self.run_test(
            "Get User Cart",
            "GET",
            "cart",
            200
        )
        if success:
            print(f"   Cart items: {len(response.get('items', []))}")
        return success

    def test_add_to_cart(self, product_id):
        """Test add item to cart"""
        success, response = self.run_test(
            "Add Item to Cart",
            "POST",
            "cart/add",
            200,
            data={
                "product_id": product_id,
                "quantity": 2
            }
        )
        return success

    def test_remove_from_cart(self, product_id):
        """Test remove item from cart"""
        success, response = self.run_test(
            "Remove Item from Cart",
            "DELETE",
            f"cart/remove/{product_id}",
            200
        )
        return success

    def test_create_order(self, product_id):
        """Test create order"""
        success, response = self.run_test(
            "Create Order",
            "POST",
            "orders",
            200,
            data={
                "items": [
                    {
                        "product_id": product_id,
                        "quantity": 1
                    }
                ],
                "payment_method": "cod",
                "shipping_address": {
                    "street": "123 Test Street",
                    "city": "Test City",
                    "state": "Test State",
                    "zip_code": "12345",
                    "country": "Test Country"
                }
            }
        )
        if success:
            print(f"   Order ID: {response.get('id', 'N/A')}")
            print(f"   Total: ${response.get('total_amount', 0)}")
        return success

    def test_get_orders(self):
        """Test get user orders"""
        success, response = self.run_test(
            "Get User Orders",
            "GET",
            "orders",
            200
        )
        if success:
            print(f"   Orders found: {len(response)}")
        return success

def main():
    print("🤖 Starting Robotics E-commerce API Testing...")
    print("=" * 60)
    
    tester = RoboticsEcommerceAPITester()
    
    # Test API availability
    if not tester.test_api_root()[0]:
        print("❌ API is not accessible, stopping tests")
        return 1

    # Test user registration and authentication
    if not tester.test_user_registration():
        print("❌ User registration failed, stopping tests")
        return 1

    if not tester.test_get_current_user():
        print("❌ Get current user failed")
        return 1

    # Test product endpoints
    products = tester.test_get_products()
    if not products:
        print("❌ Get products failed, stopping tests")
        return 1

    # Get first product ID for testing
    product_id = products[0]['id'] if products else None
    if not product_id:
        print("❌ No products found for testing")
        return 1

    # Test product-related endpoints
    tester.test_search_products()
    tester.test_filter_products_by_category()
    tester.test_get_featured_products()
    tester.test_get_single_product(product_id)
    tester.test_get_categories()

    # Test cart functionality
    tester.test_get_cart()
    tester.test_add_to_cart(product_id)
    tester.test_get_cart()  # Check cart after adding
    
    # Test order functionality
    tester.test_create_order(product_id)
    tester.test_get_orders()
    
    # Test cart after order (should be empty)
    tester.test_get_cart()
    
    # Test remove from cart (add item first)
    tester.test_add_to_cart(product_id)
    tester.test_remove_from_cart(product_id)

    # Print final results
    print("\n" + "=" * 60)
    print(f"📊 FINAL RESULTS:")
    print(f"   Tests Run: {tester.tests_run}")
    print(f"   Tests Passed: {tester.tests_passed}")
    print(f"   Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())
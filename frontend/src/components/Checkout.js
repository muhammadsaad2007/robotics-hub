import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CreditCard, Truck, MapPin, Lock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [shippingAddress, setShippingAddress] = useState({
    full_name: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Pakistan',
    phone: ''
  });

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const cartResponse = await axios.get(`${API}/cart`);
      if (!cartResponse.data || cartResponse.data.items.length === 0) {
        toast.error('Your cart is empty');
        navigate('/cart');
        return;
      }
      
      setCart(cartResponse.data);
      
      // Fetch product details
      const productPromises = cartResponse.data.items.map(item =>
        axios.get(`${API}/products/${item.product_id}`)
      );
      
      const productResponses = await Promise.all(productPromises);
      const productsMap = {};
      
      productResponses.forEach(response => {
        productsMap[response.data.id] = response.data;
      });
      
      setProducts(productsMap);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Error loading cart');
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value
    });
  };

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    
    return cart.items.reduce((total, item) => {
      const product = products[item.product_id];
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setProcessing(true);

    // Validate shipping address
    const requiredFields = ['full_name', 'address_line_1', 'city', 'state', 'postal_code', 'phone'];
    const missingFields = requiredFields.filter(field => !shippingAddress[field]);
    
    if (missingFields.length > 0) {
      toast.error('Please fill in all required shipping information');
      setProcessing(false);
      return;
    }

    try {
      const orderData = {
        items: cart.items,
        payment_method: paymentMethod,
        shipping_address: shippingAddress
      };

      const response = await axios.post(`${API}/orders`, orderData);
      
      toast.success('Order placed successfully!');
      navigate('/profile', { 
        state: { 
          message: 'Order placed successfully!', 
          orderId: response.data.id 
        } 
      });
      
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Error placing order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const total = calculateTotal();
  const tax = total * 0.08;
  const finalTotal = total + tax;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Checkout</h1>
          <p className="text-xl text-gray-300">Complete your robot purchase</p>
        </div>

        <form onSubmit={handleSubmitOrder}>
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Checkout Forms */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Shipping Address */}
              <div className="glass-effect rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <MapPin className="h-6 w-6 text-[#8af3ff]" />
                  <h2 className="text-2xl font-bold">Shipping Address</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      required
                      value={shippingAddress.full_name}
                      onChange={handleAddressChange}
                      className="input-field w-full"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={shippingAddress.phone}
                      onChange={handleAddressChange}
                      className="input-field w-full"
                      placeholder="+92 XXX XXXXXXX"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      name="address_line_1"
                      required
                      value={shippingAddress.address_line_1}
                      onChange={handleAddressChange}
                      className="input-field w-full"
                      placeholder="Street address"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      name="address_line_2"
                      value={shippingAddress.address_line_2}
                      onChange={handleAddressChange}
                      className="input-field w-full"
                      placeholder="Apartment, suite, etc. (optional)"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={shippingAddress.city}
                      onChange={handleAddressChange}
                      className="input-field w-full"
                      placeholder="City"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      State/Province *
                    </label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={shippingAddress.state}
                      onChange={handleAddressChange}
                      className="input-field w-full"
                      placeholder="State or Province"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      name="postal_code"
                      required
                      value={shippingAddress.postal_code}
                      onChange={handleAddressChange}
                      className="input-field w-full"
                      placeholder="Postal code"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Country
                    </label>
                    <select
                      name="country"
                      value={shippingAddress.country}
                      onChange={handleAddressChange}
                      className="input-field w-full"
                    >
                      <option value="Pakistan">Pakistan</option>
                      <option value="India">India</option>
                      <option value="Bangladesh">Bangladesh</option>
                      <option value="UAE">UAE</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="glass-effect rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <CreditCard className="h-6 w-6 text-[#8af3ff]" />
                  <h2 className="text-2xl font-bold">Payment Method</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="cod"
                      name="payment_method"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-[#8af3ff] bg-transparent border-[#8af3ff] focus:ring-[#8af3ff]"
                    />
                    <label htmlFor="cod" className="flex items-center space-x-3 cursor-pointer">
                      <Truck className="h-5 w-5 text-[#8af3ff]" />
                      <div>
                        <div className="font-medium">Cash on Delivery</div>
                        <div className="text-sm text-gray-300">Pay when your order arrives</div>
                      </div>
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3 opacity-50">
                    <input
                      type="radio"
                      id="card"
                      name="payment_method"
                      value="card"
                      disabled
                      className="w-4 h-4 text-[#8af3ff] bg-transparent border-[#8af3ff] focus:ring-[#8af3ff]"
                    />
                    <label htmlFor="card" className="flex items-center space-x-3 cursor-not-allowed">
                      <CreditCard className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-400">Credit/Debit Card</div>
                        <div className="text-sm text-gray-500">Coming soon</div>
                      </div>
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3 opacity-50">
                    <input
                      type="radio"
                      id="mobile"
                      name="payment_method"
                      value="mobile"
                      disabled
                      className="w-4 h-4 text-[#8af3ff] bg-transparent border-[#8af3ff] focus:ring-[#8af3ff]"
                    />
                    <label htmlFor="mobile" className="flex items-center space-x-3 cursor-not-allowed">
                      <div className="h-5 w-5 bg-gray-400 rounded"></div>
                      <div>
                        <div className="font-medium text-gray-400">Mobile Wallet</div>
                        <div className="text-sm text-gray-500">JazzCash, Easypaisa - Coming soon</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <div className="glass-effect rounded-xl p-6 sticky top-24">
                <h3 className="text-2xl font-bold mb-6">Order Summary</h3>
                
                {/* Order Items */}
                <div className="space-y-4 mb-6">
                  {cart?.items.map((item) => {
                    const product = products[item.product_id];
                    if (!product) return null;

                    return (
                      <div key={item.product_id} className="flex items-center space-x-3">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="font-medium line-clamp-1">{product.name}</div>
                          <div className="text-sm text-gray-300">Qty: {item.quantity}</div>
                        </div>
                        <div className="font-bold text-[#8af3ff]">
                          ${(product.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Pricing */}
                <div className="space-y-3 border-t border-[#8af3ff]/20 pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-300">Shipping</span>
                    <span className="text-green-400">FREE</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-300">Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-xl font-bold border-t border-[#8af3ff]/20 pt-3">
                    <span>Total</span>
                    <span className="text-[#8af3ff]">${finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full cyber-button py-4 rounded-lg mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="loading-spinner w-5 h-5"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Lock className="h-5 w-5" />
                      <span>Place Order</span>
                    </div>
                  )}
                </button>

                {/* Security Notice */}
                <div className="mt-4 p-3 bg-[#8af3ff]/10 rounded-lg">
                  <div className="flex items-center space-x-2 text-sm">
                    <Lock className="h-4 w-4 text-[#8af3ff]" />
                    <span className="text-gray-300">Your information is secure and protected</span>
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="glass-effect rounded-xl p-6">
                <h4 className="font-bold text-[#8af3ff] mb-4">Delivery Information</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Free delivery on all orders</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>3-5 business days delivery</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Order tracking included</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>2-year warranty</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
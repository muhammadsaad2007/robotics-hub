import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Cart = () => {
  const [cart, setCart] = useState(null);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const cartResponse = await axios.get(`${API}/cart`);
      setCart(cartResponse.data);
      
      // Fetch product details for each item in cart
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
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }

    setUpdating(prev => ({ ...prev, [productId]: true }));

    try {
      await axios.post(`${API}/cart/add`, {
        product_id: productId,
        quantity: newQuantity - (cart.items.find(item => item.product_id === productId)?.quantity || 0)
      });
      
      // Update local state
      setCart(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.product_id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      }));
      
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Error updating quantity');
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  const removeItem = async (productId) => {
    setUpdating(prev => ({ ...prev, [productId]: true }));

    try {
      await axios.delete(`${API}/cart/remove/${productId}`);
      
      // Update local state
      setCart(prev => ({
        ...prev,
        items: prev.items.filter(item => item.product_id !== productId)
      }));
      
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Error removing item');
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    
    return cart.items.reduce((total, item) => {
      const product = products[item.product_id];
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const calculateSavings = () => {
    const total = calculateTotal();
    return total * 0.15; // Mock 15% savings
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="text-[#8af3ff] mb-4">
            <ShoppingBag className="h-24 w-24 mx-auto" />
          </div>
          <h2 className="text-3xl font-bold">Your Cart is Empty</h2>
          <p className="text-gray-300 text-lg">
            Discover amazing robots and start building your collection!
          </p>
          <Link
            to="/catalog"
            className="inline-flex items-center space-x-2 cyber-button px-8 py-4 rounded-lg"
          >
            <span>Start Shopping</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    );
  }

  const total = calculateTotal();
  const savings = calculateSavings();

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Shopping Cart</h1>
          <p className="text-xl text-gray-300">
            {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cart.items.map((item) => {
              const product = products[item.product_id];
              if (!product) return null;

              return (
                <div key={item.product_id} className="glass-effect rounded-xl p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    
                    {/* Product Image */}
                    <div className="w-full md:w-48 flex-shrink-0">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="text-xl font-bold">{product.name}</h3>
                        <p className="text-gray-300 line-clamp-2">{product.description}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-[#8af3ff]">
                          ${product.price}
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            disabled={updating[item.product_id]}
                            className="w-10 h-10 rounded-lg glass-effect border-[#8af3ff]/30 hover:border-[#8af3ff] flex items-center justify-center transition-all disabled:opacity-50"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          
                          <span className="w-12 h-10 rounded-lg glass-effect border-[#8af3ff]/30 flex items-center justify-center font-bold">
                            {item.quantity}
                          </span>
                          
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            disabled={updating[item.product_id] || item.quantity >= product.stock_quantity}
                            className="w-10 h-10 rounded-lg glass-effect border-[#8af3ff]/30 hover:border-[#8af3ff] flex items-center justify-center transition-all disabled:opacity-50"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-lg font-semibold">
                          Subtotal: <span className="text-[#8af3ff]">${(product.price * item.quantity).toFixed(2)}</span>
                        </div>
                        
                        <button
                          onClick={() => removeItem(item.product_id)}
                          disabled={updating[item.product_id]}
                          className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="glass-effect rounded-xl p-6 sticky top-24">
              <h3 className="text-2xl font-bold mb-6">Order Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-300">Subtotal</span>
                  <span className="font-semibold">${total.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-green-400">
                  <span>Savings</span>
                  <span>-${savings.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-300">Shipping</span>
                  <span className="text-green-400">FREE</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-300">Tax</span>
                  <span className="font-semibold">${(total * 0.08).toFixed(2)}</span>
                </div>
                
                <div className="border-t border-[#8af3ff]/20 pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-[#8af3ff]">${(total - savings + (total * 0.08)).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Link
                to="/checkout"
                className="block w-full text-center cyber-button py-4 rounded-lg mt-6"
              >
                Proceed to Checkout
              </Link>

              <Link
                to="/catalog"
                className="block w-full text-center glass-effect border-[#8af3ff]/30 hover:border-[#8af3ff] py-3 rounded-lg mt-4 transition-all hover:bg-[#8af3ff]/10"
              >
                Continue Shopping
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="glass-effect rounded-xl p-6 space-y-4">
              <h4 className="font-bold text-[#8af3ff]">Why Shop With Us?</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Free shipping on all orders</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>2-year warranty included</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>30-day return policy</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>24/7 customer support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
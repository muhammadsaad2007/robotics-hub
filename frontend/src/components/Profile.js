import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { User, Package, Clock, CheckCircle, Truck, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../App';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Profile = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    fetchOrders();
    
    // Show success message if redirected from checkout
    if (location.state?.message) {
      toast.success(location.state.message);
    }
  }, [location.state]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/orders`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error loading orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-400';
      case 'processing':
        return 'text-blue-400';
      case 'shipped':
        return 'text-purple-400';
      case 'delivered':
        return 'text-green-400';
      case 'cancelled':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5" />;
      case 'processing':
        return <Package className="h-5 w-5" />;
      case 'shipped':
        return <Truck className="h-5 w-5" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-[#8af3ff]/20 p-4 rounded-full">
              <User className="h-12 w-12 text-[#8af3ff]" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Welcome, {user?.full_name}!</h1>
          <p className="text-xl text-gray-300">Manage your robot orders and account</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="glass-effect rounded-xl p-6 h-fit">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'orders' 
                    ? 'bg-[#8af3ff]/20 text-[#8af3ff] border border-[#8af3ff]/30' 
                    : 'hover:bg-[#8af3ff]/10 text-gray-300 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Package className="h-5 w-5" />
                  <span>My Orders</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'profile' 
                    ? 'bg-[#8af3ff]/20 text-[#8af3ff] border border-[#8af3ff]/30' 
                    : 'hover:bg-[#8af3ff]/10 text-gray-300 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5" />
                  <span>Profile Info</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold">My Orders</h2>
                  <span className="text-gray-300">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
                </div>

                {orders.length === 0 ? (
                  <div className="glass-effect rounded-xl p-12 text-center">
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">No Orders Yet</h3>
                    <p className="text-gray-300 mb-6">You haven't placed any orders yet. Start shopping for amazing robots!</p>
                    <a
                      href="/catalog"
                      className="cyber-button px-6 py-3 rounded-lg inline-block"
                    >
                      Start Shopping
                    </a>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="glass-effect rounded-xl p-6">
                        
                        {/* Order Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                          <div>
                            <h3 className="text-xl font-bold mb-2">Order #{order.id.slice(-8)}</h3>
                            <p className="text-gray-300">{formatDate(order.created_at)}</p>
                          </div>
                          
                          <div className="flex items-center space-x-4 mt-4 md:mt-0">
                            <div className={`flex items-center space-x-2 ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              <span className="font-semibold capitalize">{order.status}</span>
                            </div>
                            <div className="text-2xl font-bold text-[#8af3ff]">
                              ${order.total_amount.toFixed(2)}
                            </div>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-4 mb-6">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex items-center space-x-4 p-4 bg-[#1a1a3a]/50 rounded-lg">
                              <div className="w-16 h-16 bg-[#8af3ff]/20 rounded-lg flex items-center justify-center">
                                <Package className="h-8 w-8 text-[#8af3ff]" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold">{item.product_name}</h4>
                                <p className="text-gray-300">Quantity: {item.quantity}</p>
                              </div>
                              <div className="text-right">
                                <div className="font-bold">${item.total.toFixed(2)}</div>
                                <div className="text-sm text-gray-300">${item.price.toFixed(2)} each</div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Shipping Address */}
                        <div className="border-t border-[#8af3ff]/20 pt-4">
                          <div className="flex items-start space-x-2">
                            <MapPin className="h-5 w-5 text-[#8af3ff] mt-1" />
                            <div>
                              <h4 className="font-semibold mb-2">Shipping Address</h4>
                              <div className="text-gray-300 space-y-1">
                                <div>{order.shipping_address.full_name}</div>
                                <div>{order.shipping_address.address_line_1}</div>
                                {order.shipping_address.address_line_2 && (
                                  <div>{order.shipping_address.address_line_2}</div>
                                )}
                                <div>
                                  {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                                </div>
                                <div>{order.shipping_address.country}</div>
                                <div>Phone: {order.shipping_address.phone}</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Payment Method */}
                        <div className="border-t border-[#8af3ff]/20 pt-4 mt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-gray-300">Payment Method: </span>
                              <span className="font-semibold capitalize">
                                {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}
                              </span>
                            </div>
                            
                            {order.status === 'pending' && (
                              <div className="text-sm text-yellow-400">
                                ⏱️ Processing your order...
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile Info Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">Profile Information</h2>
                
                <div className="glass-effect rounded-xl p-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={user?.full_name || ''}
                        readOnly
                        className="input-field w-full bg-gray-800/50 cursor-not-allowed"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        readOnly
                        className="input-field w-full bg-gray-800/50 cursor-not-allowed"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Account Type
                      </label>
                      <input
                        type="text"
                        value={user?.is_admin ? 'Administrator' : 'Customer'}
                        readOnly
                        className="input-field w-full bg-gray-800/50 cursor-not-allowed"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Member Since
                      </label>
                      <input
                        type="text"
                        value={user?.created_at ? formatDate(user.created_at) : 'N/A'}
                        readOnly
                        className="input-field w-full bg-gray-800/50 cursor-not-allowed"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-8 p-4 bg-[#8af3ff]/10 rounded-lg">
                    <h4 className="font-semibold text-[#8af3ff] mb-2">Account Status</h4>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-green-400">Account Active & Verified</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
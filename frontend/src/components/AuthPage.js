import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../App';
import { Eye, EyeOff, Bot, User, Mail, Lock } from 'lucide-react';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    confirmPassword: ''
  });

  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success('Welcome back to RoboHub!');
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match');
          setLoading(false);
          return;
        }
        
        await register(formData.email, formData.password, formData.full_name);
        toast.success('Welcome to RoboHub! Account created successfully.');
      }
      
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
      
    } catch (error) {
      console.error('Auth error:', error);
      const errorMessage = error.response?.data?.detail || 
                          (isLogin ? 'Login failed. Please check your credentials.' : 'Registration failed. Please try again.');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-[#8af3ff]/20 p-4 rounded-full">
              <Bot className="h-12 w-12 text-[#8af3ff]" />
            </div>
          </div>
          <h2 className="text-3xl font-bold">
            {isLogin ? 'Welcome Back' : 'Join RoboHub'}
          </h2>
          <p className="mt-2 text-gray-300">
            {isLogin 
              ? 'Sign in to your account to continue your robot journey' 
              : 'Create your account and explore the future of robotics'
            }
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-effect rounded-xl p-8 space-y-6">
          
          {/* Full Name (Register only) */}
          {!isLogin && (
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-300 mb-2">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Full Name</span>
                </div>
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required={!isLogin}
                value={formData.full_name}
                onChange={handleInputChange}
                className="input-field w-full"
                placeholder="Enter your full name"
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>Email Address</span>
              </div>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="input-field w-full"
              placeholder="Enter your email"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4" />
                <span>Password</span>
              </div>
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleInputChange}
                className="input-field w-full pr-10"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Register only) */}
          {!isLogin && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4" />
                  <span>Confirm Password</span>
                </div>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required={!isLogin}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="input-field w-full"
                placeholder="Confirm your password"
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full cyber-button py-4 rounded-lg relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="loading-spinner w-5 h-5"></div>
                <span>Processing...</span>
              </div>
            ) : (
              <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
            )}
          </button>

          {/* Toggle Auth Mode */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setFormData({
                  email: '',
                  password: '',
                  full_name: '',
                  confirmPassword: ''
                });
              }}
              className="text-[#8af3ff] hover:text-[#71bbf4] transition-colors"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </button>
          </div>
        </form>

        {/* Demo Credentials */}
        <div className="glass-effect rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold mb-3 text-[#8af3ff]">Demo Account</h3>
          <p className="text-sm text-gray-300 mb-4">
            Want to try the platform? Use these demo credentials:
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Email:</span>
              <span className="font-mono">demo@robohub.com</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Password:</span>
              <span className="font-mono">demo123</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            * Demo account for testing purposes only
          </p>
        </div>

        {/* Features */}
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold text-[#8af3ff]">Why Join RoboHub?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="glass-effect rounded-lg p-4">
              <div className="text-[#8af3ff] mb-2">🤖</div>
              <div className="font-medium">Latest Robots</div>
              <div className="text-gray-400">Cutting-edge robotics</div>
            </div>
            <div className="glass-effect rounded-lg p-4">
              <div className="text-[#8af3ff] mb-2">🚀</div>
              <div className="font-medium">Fast Delivery</div>
              <div className="text-gray-400">Quick & secure shipping</div>
            </div>
            <div className="glass-effect rounded-lg p-4">
              <div className="text-[#8af3ff] mb-2">🛡️</div>
              <div className="font-medium">Warranty</div>
              <div className="text-gray-400">2-year protection</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
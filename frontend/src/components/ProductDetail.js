import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, ShoppingCart, Star, Zap, Shield, Cpu, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../App';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API}/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Product not found');
      navigate('/catalog');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/auth');
      return;
    }

    try {
      await axios.post(`${API}/cart/add`, {
        product_id: product.id,
        quantity: quantity
      });
      toast.success(`Added ${quantity} ${product.name}(s) to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Error adding to cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <button
            onClick={() => navigate('/catalog')}
            className="cyber-button px-6 py-3 rounded-lg"
          >
            Back to Catalog
          </button>
        </div>
      </div>
    );
  }

  // Mock additional images for gallery
  const productImages = [
    product.image_url,
    "https://images.unsplash.com/photo-1652127691413-6cb8c0304aba",
    "https://images.unsplash.com/photo-1625314876522-a908c4c01167"
  ];

  const features = [
    { icon: <Zap className="h-5 w-5" />, text: "Advanced AI Integration" },
    { icon: <Shield className="h-5 w-5" />, text: "Military-Grade Security" },
    { icon: <Cpu className="h-5 w-5" />, text: "Quantum Processing" },
    { icon: <Check className="h-5 w-5" />, text: "2 Year Warranty" }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-[#8af3ff] hover:text-[#71bbf4] transition-colors mb-8"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>

        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-w-16 aspect-h-12">
              <img
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full h-96 object-cover rounded-xl neon-border"
              />
            </div>
            
            {/* Image Thumbnails */}
            <div className="flex space-x-4">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index 
                      ? 'border-[#8af3ff] neon-glow' 
                      : 'border-transparent hover:border-[#8af3ff]/50'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              {product.featured && (
                <span className="bg-[#8af3ff]/20 text-[#8af3ff] px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block">
                  ⭐ Featured Product
                </span>
              )}
              <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center text-yellow-400">
                  <Star className="h-5 w-5 fill-current" />
                  <Star className="h-5 w-5 fill-current" />
                  <Star className="h-5 w-5 fill-current" />
                  <Star className="h-5 w-5 fill-current" />
                  <Star className="h-5 w-5 fill-current" />
                  <span className="ml-2 text-gray-300">(128 reviews)</span>
                </div>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed">{product.description}</p>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-4xl font-bold text-[#8af3ff]">${product.price}</span>
              <span className="text-gray-400 line-through text-xl">${(product.price * 1.2).toFixed(2)}</span>
              <span className="bg-green-600 text-white px-2 py-1 rounded text-sm">Save 20%</span>
            </div>

            {/* Features */}
            <div className="glass-effect rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Key Features</h3>
              <div className="grid grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 text-[#8af3ff]">
                    {feature.icon}
                    <span className="text-white">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="glass-effect rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4">Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-300 capitalize">{key.replace('_', ' ')}:</span>
                      <span className="text-white font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                product.stock_quantity > 10 ? 'bg-green-500' : 
                product.stock_quantity > 0 ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className="text-gray-300">
                {product.stock_quantity > 10 ? 'In Stock' : 
                 product.stock_quantity > 0 ? `Only ${product.stock_quantity} left` : 'Out of Stock'}
              </span>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="text-gray-300">Quantity:</label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg glass-effect border-[#8af3ff]/30 hover:border-[#8af3ff] flex items-center justify-center transition-all"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="w-12 h-10 rounded-lg glass-effect border-[#8af3ff]/30 flex items-center justify-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    className="w-10 h-10 rounded-lg glass-effect border-[#8af3ff]/30 hover:border-[#8af3ff] flex items-center justify-center transition-all"
                    disabled={quantity >= product.stock_quantity}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={addToCart}
                  disabled={product.stock_quantity === 0}
                  className="flex-1 cyber-button py-4 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>Add to Cart</span>
                </button>
                <button className="px-8 py-4 rounded-lg glass-effect border-[#8af3ff]/30 hover:border-[#8af3ff] transition-all hover:bg-[#8af3ff]/10">
                  ♥
                </button>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-between text-sm text-gray-400 pt-6 border-t border-[#8af3ff]/20">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>2 Year Warranty</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span>Fast Shipping</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4" />
                <span>Quality Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
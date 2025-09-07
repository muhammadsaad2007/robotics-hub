import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Zap, Shield, Cpu, Star } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        axios.get(`${API}/products?featured=true`),
        axios.get(`${API}/categories`)
      ]);
      
      setFeaturedProducts(productsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Advanced AI",
      description: "Cutting-edge artificial intelligence powering every robot"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Secure & Safe",
      description: "Military-grade security protocols for home and business"
    },
    {
      icon: <Cpu className="h-8 w-8" />,
      title: "Latest Tech",
      description: "State-of-the-art processors and neural networks"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-section relative">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Welcome to the
              <span className="neon-text block mt-2">Future of Robotics</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-3xl mx-auto">
              Discover cutting-edge robots and automation solutions that will transform your world. 
              From home assistants to industrial marvels.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/catalog"
                className="cyber-button inline-flex items-center space-x-2 px-8 py-4 rounded-lg text-lg"
              >
                <span>Explore Robots</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/category/ai_companion"
                className="glass-effect border-[#8af3ff]/30 hover:border-[#8af3ff] px-8 py-4 rounded-lg text-lg transition-all duration-300 hover:bg-[#8af3ff]/10"
              >
                AI Companions
              </Link>
            </div>
          </div>
        </div>
        
        {/* Floating Robot Image */}
        <div className="absolute right-10 top-1/2 transform -translate-y-1/2 hidden lg:block">
          <img
            src="https://images.unsplash.com/photo-1625314887424-9f190599bd56"
            alt="Futuristic Robot"
            className="w-80 h-80 object-cover rounded-lg floating-animation opacity-80"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-[#1a1a3a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose RoboHub?</h2>
            <p className="text-xl text-gray-300">Advanced technology meets exceptional quality</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`glass-effect rounded-xl p-8 text-center hover:neon-border transition-all duration-300 ${
                  index % 2 === 0 ? 'slide-in-left' : 'slide-in-right'
                }`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="text-[#8af3ff] mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Featured Robots</h2>
            <p className="text-xl text-gray-300">Our most popular and advanced robotics solutions</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <div key={product.id} className="product-card fade-in">
                <div className="aspect-w-16 aspect-h-12 mb-4">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
                <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                <p className="text-gray-300 mb-4 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-[#8af3ff]">${product.price}</span>
                  <div className="flex items-center text-yellow-400">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                </div>
                <Link
                  to={`/product/${product.id}`}
                  className="block w-full text-center cyber-button py-3 rounded-lg"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-[#1a1a3a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Explore Categories</h2>
            <p className="text-xl text-gray-300">Find the perfect robot for your needs</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {categories.map((category, index) => {
              const categoryImages = {
                home_automation: "https://images.unsplash.com/photo-1707733260992-73ff6dbed163",
                educational: "https://images.unsplash.com/photo-1581916459131-90da1f9c7162",
                ai_companion: "https://images.unsplash.com/photo-1530546171585-cc042ea5d7ab"
              };
              
              return (
                <Link
                  key={category.id}
                  to={`/category/${category.id}`}
                  className="category-card block"
                >
                  <img
                    src={categoryImages[category.id]}
                    alt={category.name}
                    className="w-full h-48 object-cover rounded-lg mb-6"
                  />
                  <h3 className="text-2xl font-bold mb-3 text-[#8af3ff]">{category.name}</h3>
                  <p className="text-gray-300">{category.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#8af3ff]/10 to-[#71bbf4]/10"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Join the Robot Revolution?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Start your journey into the future of automation and AI-powered assistants
          </p>
          <Link
            to="/catalog"
            className="cyber-button inline-flex items-center space-x-2 px-8 py-4 rounded-lg text-lg"
          >
            <span>Shop Now</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};
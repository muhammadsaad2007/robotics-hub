import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { Search, Filter, Grid, List, Star, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../App';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const ProductCatalog = () => {
  const { category } = useParams();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(category || '');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setSelectedCategory(category || '');
    fetchProducts();
  }, [category, searchTerm, selectedCategory, sortBy]);

  const fetchData = async () => {
    try {
      const categoriesRes = await axios.get(`${API}/categories`);
      setCategories(categoriesRes.data);
      await fetchProducts();
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error loading catalog');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await axios.get(`${API}/products?${params}`);
      let sortedProducts = [...response.data];
      
      switch (sortBy) {
        case 'price_low':
          sortedProducts.sort((a, b) => a.price - b.price);
          break;
        case 'price_high':
          sortedProducts.sort((a, b) => b.price - a.price);
          break;
        case 'name':
          sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
          break;
        default:
          break;
      }
      
      setProducts(sortedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error loading products');
    }
  };

  const addToCart = async (productId) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      await axios.post(`${API}/cart/add`, {
        product_id: productId,
        quantity: 1
      });
      toast.success('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Error adding to cart');
    }
  };

  const getCategoryName = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.name : 'All Products';
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            {selectedCategory ? getCategoryName(selectedCategory) : 'Robot Catalog'}
          </h1>
          <p className="text-xl text-gray-300">
            {selectedCategory 
              ? categories.find(c => c.id === selectedCategory)?.description 
              : 'Explore our complete collection of advanced robots'
            }
          </p>
        </div>

        {/* Filters and Controls */}
        <div className="glass-effect rounded-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search robots..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field"
            >
              <option value="name">Sort by Name</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>

            {/* View Mode */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-[#8af3ff]/20 text-[#8af3ff]' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-[#8af3ff]/20 text-[#8af3ff]' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-300">No robots found matching your criteria.</p>
          </div>
        ) : (
          <div className={`grid gap-8 ${
            viewMode === 'grid' 
              ? 'md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {products.map((product) => (
              <div
                key={product.id}
                className={`product-card fade-in ${
                  viewMode === 'list' ? 'flex flex-col md:flex-row gap-6' : ''
                }`}
              >
                <div className={`${
                  viewMode === 'list' ? 'w-full md:w-80 flex-shrink-0' : ''
                }`}>
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className={`w-full object-cover rounded-lg ${
                      viewMode === 'list' ? 'h-64' : 'h-48'
                    }`}
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold">{product.name}</h3>
                    {product.featured && (
                      <span className="bg-[#8af3ff]/20 text-[#8af3ff] px-2 py-1 rounded-full text-xs">
                        Featured
                      </span>
                    )}
                  </div>
                  
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
                  
                  <div className="space-y-2">
                    <Link
                      to={`/product/${product.id}`}
                      className="block w-full text-center glass-effect border-[#8af3ff]/30 hover:border-[#8af3ff] py-2 rounded-lg transition-all duration-300 hover:bg-[#8af3ff]/10"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => addToCart(product.id)}
                      className="w-full cyber-button py-2 rounded-lg flex items-center justify-center space-x-2"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
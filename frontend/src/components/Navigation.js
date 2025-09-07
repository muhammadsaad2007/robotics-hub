import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { ShoppingCart, User, LogOut, Menu, X, Bot } from 'lucide-react';

export const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/catalog', label: 'Catalog' },
    { to: '/category/home_automation', label: 'Home Automation' },
    { to: '/category/educational', label: 'Educational' },
    { to: '/category/ai_companion', label: 'AI Companions' },
  ];

  return (
    <nav className="bg-[#1a1a3a] backdrop-filter backdrop-blur-lg border-b border-[#8af3ff]/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-[#8af3ff] hover:text-[#71bbf4] transition-colors">
            <Bot className="h-8 w-8" />
            <span className="font-bold text-xl font-orbitron">RoboHub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/cart"
                  className="flex items-center space-x-1 text-white hover:text-[#8af3ff] transition-colors p-2 rounded-lg hover:bg-[#8af3ff]/10"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>Cart</span>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center space-x-1 text-white hover:text-[#8af3ff] transition-colors p-2 rounded-lg hover:bg-[#8af3ff]/10"
                >
                  <User className="h-5 w-5" />
                  <span>{user.full_name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-white hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-400/10"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="cyber-button px-6 py-2 rounded-lg"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white hover:text-[#8af3ff] transition-colors p-2"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-[#1a1a3a] border-b border-[#8af3ff]/20 z-50">
            <div className="px-4 py-4 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block nav-link ${location.pathname === link.to ? 'active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="border-t border-[#8af3ff]/20 pt-4 space-y-2">
                {user ? (
                  <>
                    <Link
                      to="/cart"
                      className="flex items-center space-x-2 text-white hover:text-[#8af3ff] transition-colors p-2 rounded-lg hover:bg-[#8af3ff]/10"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <ShoppingCart className="h-5 w-5" />
                      <span>Cart</span>
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 text-white hover:text-[#8af3ff] transition-colors p-2 rounded-lg hover:bg-[#8af3ff]/10"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      <span>{user.full_name}</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 text-white hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-400/10 w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    className="block cyber-button px-6 py-2 rounded-lg text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
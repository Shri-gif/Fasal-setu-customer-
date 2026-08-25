import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'products', label: 'Products' },
    { id: 'orders', label: 'My Orders' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
    { id: 'profile', label: 'Account' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Brand Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-left focus:outline-hidden group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-xl shadow-xs group-hover:scale-105 transition-transform">
              🌱
            </div>
            <div>
              <span className="text-xl font-extrabold text-emerald-800 tracking-tight block">
                Fasal Setu
              </span>
              <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-widest block -mt-1">
                Farm To Home
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`text-sm font-semibold transition-colors ${
                  currentView === item.id
                    ? 'text-emerald-700 font-bold border-b-2 border-emerald-600 pb-1'
                    : 'text-stone-600 hover:text-emerald-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Cart Button */}
            <button
              onClick={() => onNavigate('cart')}
              className={`relative p-2.5 rounded-xl border transition-all flex items-center justify-center ${
                currentView === 'cart'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white border-stone-200 text-stone-700 hover:border-emerald-300 hover:bg-emerald-50/50'
              }`}
              aria-label="Shopping Cart"
            >
              <span className="text-xl">🛒</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-red-600 text-white rounded-full text-[11px] font-extrabold flex items-center justify-center shadow-xs animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Quick Order Now Button */}
            <button
              onClick={() => onNavigate('checkout')}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold shadow-xs hover:shadow-md transition-all active:scale-95"
            >
              Checkout
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="md:hidden p-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50"
              aria-label="Toggle menu"
            >
              <span className="text-xl leading-none">{mobileMenuOpen ? '✕' : '☰'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-emerald-100 px-4 pt-2 pb-6 space-y-1 shadow-lg animate-in slide-in-from-top duration-200">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                currentView === item.id
                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                  : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => {
              onNavigate('checkout');
              setMobileMenuOpen(false);
            }}
            className="w-full mt-2 py-3 rounded-xl bg-emerald-700 text-white text-sm font-bold text-center"
          >
            Order Now / Checkout
          </button>
        </div>
      )}
    </header>
  );
};

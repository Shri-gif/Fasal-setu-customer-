import React from 'react';
import { useCart } from '../context/CartContext';

interface FooterProps {
  onNavigate: (view: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-14 pb-24 md:pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-stone-800">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-lg">
                🌱
              </span>
              <span className="text-xl font-bold text-white tracking-tight">
                Fasal Setu
              </span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed max-w-sm">
              Connecting conscious consumers directly with certified and passionate local farmers. Fresh, natural agricultural produce with complete transparency.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <span>🌾 Direct Farm Sourcing</span>
              <span>•</span>
              <span>🚚 Express Delivery</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-emerald-400 transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('products')} className="hover:text-emerald-400 transition-colors">
                  Browse All Products
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-emerald-400 transition-colors">
                  Our Mission & Story
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-emerald-400 transition-colors">
                  Help & Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Links */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">
              Customer Area
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => onNavigate('cart')} className="hover:text-emerald-400 transition-colors">
                  Shopping Cart
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('checkout')} className="hover:text-emerald-400 transition-colors">
                  Express Checkout
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('orders')} className="hover:text-emerald-400 transition-colors">
                  Track My Orders
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('profile')} className="hover:text-emerald-400 transition-colors">
                  Saved Address & Account
                </button>
              </li>
            </ul>
          </div>

          {/* Support & Contact */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">
              Farmer Support & Help
            </h4>
            <p className="text-sm text-stone-400 mb-3">
              Need assistance with your fresh produce order or bulk farmer procurement?
            </p>
            <div className="space-y-2 text-sm text-stone-300">
              <p className="flex items-center gap-2">
                <span>📞</span> <span className="font-semibold">+91 99999 99999</span>
              </p>
              <p className="flex items-center gap-2">
                <span>💬</span> <span className="font-semibold">WhatsApp Available 24/7</span>
              </p>
              <p className="flex items-center gap-2">
                <span>✉️</span> <span>support@fasalsetu.in</span>
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} Fasal Setu Marketplace. Empowering Indian Agriculture.</p>
          <p className="text-emerald-500/80 font-medium">100% Direct Farmer Compensation Guaranteed</p>
        </div>
      </div>
    </footer>
  );
};

export const BottomNav: React.FC<{
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
}> = ({ currentView, onNavigate }) => {
  const { cartCount } = useCart();

  const tabs = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'products', label: 'Products', icon: '🥬' },
    { id: 'cart', label: 'Cart', icon: '🛒', isCart: true },
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'profile', label: 'Account', icon: '👤' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-stone-200 shadow-2xl py-2 px-3">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map(tab => {
          const isActive = currentView === tab.id;
          if (tab.isCart) {
            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className="relative -top-3 w-12 h-12 rounded-full bg-emerald-700 text-white shadow-lg flex items-center justify-center text-xl hover:scale-105 active:scale-95 transition-all"
                aria-label="Cart"
              >
                <span>{tab.icon}</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-600 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors ${
                isActive ? 'text-emerald-700 font-bold' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <span className="text-xl mb-0.5">{tab.icon}</span>
              <span className="text-[11px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

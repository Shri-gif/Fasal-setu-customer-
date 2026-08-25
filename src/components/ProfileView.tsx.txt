import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { CustomerProfile } from '../types';

interface ProfileViewProps {
  onNavigate: (view: string, param?: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onNavigate }) => {
  const { profile, saveProfile, cartCount, orders } = useCart();
  const [formData, setFormData] = useState<CustomerProfile>({
    name: '',
    mobile: '',
    email: '',
    address: '',
    city: '',
    pincode: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMobile = formData.mobile.replace(/\D/g, '');
    saveProfile({
      ...formData,
      mobile: cleanMobile,
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Page Header */}
      <div className="pb-6 border-b border-stone-200">
        <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase block mb-1">
          👤 Saved Customer Account
        </span>
        <h1 className="text-3xl font-black text-stone-900 tracking-tight">
          My Account & Delivery Profile
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Stored directly on your browser for 1-click hassle-free checkouts without passwords.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-4 border-b border-stone-100 pb-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 text-2xl flex items-center justify-center font-bold">
              {formData.name ? formData.name.charAt(0).toUpperCase() : '👤'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                {formData.name ? `Hello, ${formData.name}` : 'Customer Profile'}
              </h2>
              <p className="text-xs text-stone-500">
                {formData.mobile ? `+91 ${formData.mobile}` : 'Keep your address updated for fast delivery'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 uppercase tracking-wider">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  name="mobile"
                  maxLength={10}
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="10-digit mobile"
                  required
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 uppercase tracking-wider">
                Email Address (Optional)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                placeholder="email@domain.com"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 uppercase tracking-wider">
                Delivery Address
              </label>
              <textarea
                name="address"
                rows={3}
                value={formData.address}
                onChange={handleChange}
                placeholder="House no., street, landmark"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 uppercase tracking-wider">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City name"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 uppercase tracking-wider">
                  PIN Code
                </label>
                <input
                  type="text"
                  name="pincode"
                  maxLength={6}
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="6-digit PIN"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95"
            >
              Save Profile Details
            </button>
          </form>
        </div>

        {/* Right Quick Shortcuts */}
        <div className="lg:col-span-5 space-y-4">
          <div
            onClick={() => onNavigate('orders')}
            className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-emerald-300 hover:shadow-md cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 text-xl flex items-center justify-center">
                📦
              </span>
              <div>
                <h4 className="font-bold text-stone-900 text-sm">My Orders</h4>
                <p className="text-xs text-stone-500">{orders.length} past orders placed</p>
              </div>
            </div>
            <span className="text-stone-400 group-hover:text-emerald-700 font-bold">→</span>
          </div>

          <div
            onClick={() => onNavigate('cart')}
            className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-emerald-300 hover:shadow-md cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 text-xl flex items-center justify-center">
                🛒
              </span>
              <div>
                <h4 className="font-bold text-stone-900 text-sm">Shopping Cart</h4>
                <p className="text-xs text-stone-500">{cartCount} items pending</p>
              </div>
            </div>
            <span className="text-stone-400 group-hover:text-emerald-700 font-bold">→</span>
          </div>

          <div
            onClick={() => onNavigate('contact')}
            className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-emerald-300 hover:shadow-md cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 text-xl flex items-center justify-center">
                💬
              </span>
              <div>
                <h4 className="font-bold text-stone-900 text-sm">Support & WhatsApp</h4>
                <p className="text-xs text-stone-500">Need help or bulk orders?</p>
              </div>
            </div>
            <span className="text-stone-400 group-hover:text-emerald-700 font-bold">→</span>
          </div>
        </div>

      </div>

    </div>
  );
};

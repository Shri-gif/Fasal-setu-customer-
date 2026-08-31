import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { calculatePlatformPrice, formatPlatformCurrency } from '../platform-fee';

interface CheckoutViewProps {
  onNavigate: (view: string, param?: string) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({ onNavigate }) => {
  const { cart, cartTotal, cartCount, platformSettings, profile, checkoutOrder } = useCart();

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    address: '',
    city: '',
    pincode: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Prepopulate from saved profile if available
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        name: profile.name || prev.name,
        mobile: profile.mobile || prev.mobile,
        email: profile.email || prev.email,
        address: profile.address || prev.address,
        city: profile.city || prev.city,
        pincode: profile.pincode || prev.pincode
      }));
    }
  }, [profile]);

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <span className="text-5xl block mb-4">🛒</span>
        <h2 className="text-2xl font-bold text-stone-900">Your Cart is Empty</h2>
        <p className="text-stone-500 text-sm mt-1 mb-6">
          Add fresh fruits, veggies or grains before proceeding to checkout.
        </p>
        <button
          onClick={() => onNavigate('products')}
          className="px-6 py-2.5 bg-emerald-700 text-white rounded-xl font-bold text-xs"
        >
          Browse Products
        </button>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }
    const cleanMobile = formData.mobile.replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!formData.address.trim()) {
      setErrorMsg('Please enter your full delivery address');
      return;
    }
    if (!formData.city.trim()) {
      setErrorMsg('Please enter your city');
      return;
    }
    const cleanPincode = formData.pincode.replace(/\D/g, '');
    if (cleanPincode.length !== 6) {
      setErrorMsg('Please enter a valid 6-digit PIN code');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await checkoutOrder({
        ...formData,
        mobile: cleanMobile,
        pincode: cleanPincode
      });

      if (res.success) {
        onNavigate('order-success');
      } else {
        setErrorMsg(res.error || 'Failed to place order. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Header */}
      <div className="pb-6 border-b border-stone-200 mb-8">
        <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase block mb-1">
          📦 Doorstep Delivery
        </span>
        <h1 className="text-3xl font-black text-stone-900 tracking-tight">
          Express Farm Checkout
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          No passwords required. Your details are saved locally for ultra-fast repeat orders.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-6">
          <h2 className="text-xl font-bold text-stone-900 border-b border-stone-100 pb-3">
            1. Delivery Address & Contact
          </h2>

          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Rajesh Kumar"
                required
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
                10-Digit Mobile *
              </label>
              <input
                type="tel"
                name="mobile"
                maxLength={10}
                value={formData.mobile}
                onChange={handleChange}
                placeholder="e.g. 9876543210"
                required
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
              Email Address (Optional)
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. rajesh@example.com"
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
              Complete Delivery Address (House/Street/Locality) *
            </label>
            <textarea
              name="address"
              rows={3}
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. Flat 402, Green Meadows Apartment, Near City Hospital"
              required
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
                City / Town *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Meerut / New Delhi"
                required
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
                PIN Code *
              </label>
              <input
                type="text"
                name="pincode"
                maxLength={6}
                value={formData.pincode}
                onChange={handleChange}
                placeholder="e.g. 110001"
                required
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
              Special Delivery Notes / Instructions (Optional)
            </label>
            <input
              type="text"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="e.g. Please call before arriving or leave with security"
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Right Summary & Confirm */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-6">
            <h2 className="text-xl font-bold text-stone-900 border-b border-stone-100 pb-3">
              2. Order Summary ({cartCount} Items)
            </h2>

            {/* Cart Preview List */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {cart.map(item => {
                const priceBreakdown = calculatePlatformPrice(item.price_per_unit, platformSettings);
                return (
                <div key={item.id} className="flex items-center justify-between text-xs py-2 border-b border-stone-100">
                  <div className="flex-1 pr-3">
                    <span className="font-bold text-stone-900 block truncate">{item.name}</span>
                    <span className="text-stone-500">{item.quantity} × {formatPlatformCurrency(priceBreakdown.customerPrice)} / {item.unit}</span>
                  </div>
                  <span className="font-extrabold text-stone-900">
                    {formatPlatformCurrency(priceBreakdown.customerPrice * item.quantity)}
                  </span>
                </div>
                );
              })}
            </div>

            <div className="space-y-2.5 text-sm pt-2">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-bold text-stone-900">{formatPlatformCurrency(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Platform Fee Included</span>
                <span className="font-bold text-stone-900">{formatPlatformCurrency(cart.reduce((sum, item) => sum + calculatePlatformPrice(item.price_per_unit, platformSettings).feeAmount * item.quantity, 0))}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Doorstep Delivery</span>
                <span className="font-bold text-emerald-700">FREE</span>
              </div>
              <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
                <span className="text-base font-bold text-stone-900">Total Payable</span>
                <span className="text-2xl font-black text-emerald-800">{formatPlatformCurrency(cartTotal)}</span>
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl text-xs text-stone-600 space-y-1">
              <p className="font-semibold text-stone-800">💵 Payment on Delivery / UPI Available</p>
              <p>Pay cash or scan QR at your doorstep once you verify the freshness of the produce.</p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-xl font-extrabold text-sm shadow-md transition-all active:scale-95 text-center ${
                isSubmitting
                  ? 'bg-emerald-900 text-stone-300 cursor-wait'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white hover:shadow-lg'
              }`}
            >
              {isSubmitting ? 'Placing Order with Farmers...' : `Place Order ({formatPlatformCurrency(cartTotal)}) →`}
            </button>

            <button
              type="button"
              onClick={() => onNavigate('cart')}
              className="w-full text-center text-xs font-bold text-stone-500 hover:text-stone-800"
            >
              ← Edit Items in Cart
            </button>
          </div>
        </div>

      </form>

    </div>
  );
};

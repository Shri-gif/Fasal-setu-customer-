import React from 'react';
import { useCart } from '../context/CartContext';

interface CartViewProps {
  onNavigate: (view: string, param?: string) => void;
}

export const CartView: React.FC<CartViewProps> = ({ onNavigate }) => {
  const { cart, cartCount, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 rounded-3xl bg-emerald-50 text-emerald-700 text-5xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          🛒
        </div>
        <h1 className="text-3xl font-black text-stone-900 tracking-tight">Your Cart is Empty</h1>
        <p className="text-stone-500 text-sm max-w-sm mx-auto mt-2 mb-8">
          You haven't added any harvest from our farmers yet. Explore fresh fruits, vegetables, and grains!
        </p>
        <button
          onClick={() => onNavigate('products')}
          className="px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95"
        >
          Browse Fresh Farm Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-stone-200">
        <div>
          <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase block mb-1">
            🛒 Review Your Harvest
          </span>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">
            Shopping Cart ({cartCount} {cartCount === 1 ? 'item' : 'items'})
          </h1>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline"
        >
          Clear Cart
        </button>
      </div>

      {/* Cart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Items List */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map(item => (
            <div
              key={item.id}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              {/* Product Info */}
              <div className="flex items-center gap-4 flex-1">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-emerald-50 border border-stone-200 overflow-hidden shrink-0 flex items-center justify-center text-3xl">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>🌱</span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-sm sm:text-base leading-tight">
                    {item.name}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    ₹{item.price_per_unit} / {item.unit}
                  </p>
                  {item.farm_location && (
                    <span className="text-[11px] text-emerald-700 font-medium">
                      📍 {item.farm_location}
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6">
                <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden bg-stone-50">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center text-stone-600 hover:bg-stone-200 font-bold transition-colors"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-stone-800">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center text-stone-600 hover:bg-stone-200 font-bold transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Subtotal */}
                <div className="text-right min-w-[80px]">
                  <span className="text-sm sm:text-base font-extrabold text-stone-900 block">
                    ₹{item.price_per_unit * item.quantity}
                  </span>
                </div>

                {/* Remove Trash */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-stone-400 hover:text-red-600 p-1 transition-colors"
                  aria-label="Remove item"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}

          <div className="pt-2">
            <button
              onClick={() => onNavigate('products')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5"
            >
              <span>←</span> Add More Products from Farmers
            </button>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <aside className="lg:col-span-4 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-6">
          <h2 className="text-lg font-black text-stone-900 border-b border-stone-100 pb-3">
            Order Breakdown
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-stone-600">
              <span>Items Total ({cartCount})</span>
              <span className="font-semibold text-stone-900">₹{cartTotal}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Direct Farm Packaging</span>
              <span className="font-bold text-emerald-700">FREE</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Delivery Charges</span>
              <span className="font-bold text-emerald-700">FREE</span>
            </div>
            <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
              <span className="text-base font-bold text-stone-900">Grand Total</span>
              <span className="text-2xl font-black text-emerald-800">₹{cartTotal}</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('checkout')}
            className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-extrabold text-sm shadow-md hover:shadow-lg transition-all active:scale-95 text-center block"
          >
            Proceed to Checkout →
          </button>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] text-emerald-900 leading-relaxed">
            🛡️ <strong>Direct Farmer Promise:</strong> 100% of your payment is disbursed directly to our cultivator partners upon verified delivery.
          </div>
        </aside>

      </div>

    </div>
  );
};

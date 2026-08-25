import React from 'react';
import { useCart } from '../context/CartContext';

interface OrderSuccessViewProps {
  onNavigate: (view: string, param?: string) => void;
}

export const OrderSuccessView: React.FC<OrderSuccessViewProps> = ({ onNavigate }) => {
  const { lastOrder } = useCart();

  if (!lastOrder) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <span className="text-5xl block mb-4">📦</span>
        <h2 className="text-2xl font-bold text-stone-900">No Recent Order Found</h2>
        <p className="text-stone-500 text-sm mt-1 mb-6">
          You haven't placed an order in this current session.
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-emerald-100 shadow-xl text-center space-y-6">
        
        {/* Animated Checkmark badge */}
        <div className="w-20 h-20 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center text-4xl mx-auto ring-8 ring-emerald-50 shadow-inner">
          ✓
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase">
            Order Successfully Placed!
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Thank You, {lastOrder.customerName}!
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
            Your fresh harvest order has been received by our farmer partners and will be prepared with natural care.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 text-left space-y-3 text-xs sm:text-sm">
          <div className="flex justify-between border-b border-stone-200 pb-2">
            <span className="text-stone-500">Order Reference:</span>
            <span className="font-bold text-stone-900">
              {lastOrder.orderIds.length === 1 ? lastOrder.orderIds[0] : `${lastOrder.orderIds.length} Farm Items`}
            </span>
          </div>
          <div className="flex justify-between border-b border-stone-200 pb-2">
            <span className="text-stone-500">Contact Number:</span>
            <span className="font-bold text-stone-900">******{lastOrder.mobile.slice(-4)}</span>
          </div>
          <div className="flex justify-between border-b border-stone-200 pb-2">
            <span className="text-stone-500">Total Amount:</span>
            <span className="font-black text-emerald-800 text-base">₹{lastOrder.totalAmount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Delivery Status:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-xs">
              🟡 Pending Farmer Dispatch
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => onNavigate('orders')}
            className="flex-1 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-95"
          >
            Track in My Orders 📦
          </button>
          <button
            onClick={() => onNavigate('products')}
            className="flex-1 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold text-xs transition-colors"
          >
            Continue Shopping 🛒
          </button>
        </div>

      </div>
    </div>
  );
};

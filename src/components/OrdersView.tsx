import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Order } from '../types';

interface OrdersViewProps {
  onNavigate: (view: string, param?: string) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ onNavigate }) => {
  const { orders, profile, cancelOrder, loadOrdersForMobile } = useCart();
  const [mobileQuery, setMobileQuery] = useState(profile?.mobile || '');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchOrder, setSearchOrder] = useState('');

  useEffect(() => {
    if (profile?.mobile) {
      loadOrdersForMobile(profile.mobile);
    }
  }, [profile]);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileQuery.trim()) {
      loadOrdersForMobile(mobileQuery.trim());
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchOrder.trim() || 
      String(order.id).toLowerCase().includes(searchOrder.toLowerCase()) ||
      (order.product_name || '').toLowerCase().includes(searchOrder.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchOrder.toLowerCase()) ||
      order.city.toLowerCase().includes(searchOrder.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.order_status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-xs">🔵 Confirmed</span>;
      case 'processing':
        return <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 font-bold text-xs">🟣 Processing</span>;
      case 'shipped':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">🚚 In Transit</span>;
      case 'completed':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-700 text-white font-bold text-xs">✓ Delivered</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 font-bold text-xs">✕ Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-xs">🟡 Pending</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase block mb-1">
            📦 Track & Manage
          </span>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">
            Customer Orders
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Real-time status of your farm deliveries
          </p>
        </div>

        {/* Mobile Lookup Form */}
        <form onSubmit={handleLookup} className="flex items-center gap-2">
          <input
            type="tel"
            placeholder="Search by 10-digit Mobile"
            value={mobileQuery}
            onChange={(e) => setMobileQuery(e.target.value)}
            className="px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-xs font-medium focus:outline-hidden focus:border-emerald-600 sm:w-56"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-colors"
          >
            Find Orders
          </button>
        </form>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-400'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <input
          type="search"
          placeholder="Filter by Order ID or item..."
          value={searchOrder}
          onChange={(e) => setSearchOrder(e.target.value)}
          className="px-3.5 py-1.5 bg-white border border-stone-300 rounded-xl text-xs sm:w-60 focus:outline-hidden"
        />
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-stone-50 rounded-3xl border border-stone-200 p-8">
          <span className="text-5xl block mb-3">📦</span>
          <h2 className="text-xl font-bold text-stone-900">No Orders Found</h2>
          <p className="text-stone-500 text-sm max-w-sm mx-auto mt-1 mb-6">
            No orders match your mobile number or status filter. Try entering your order phone number above!
          </p>
          <button
            onClick={() => onNavigate('products')}
            className="px-6 py-2.5 bg-emerald-700 text-white rounded-xl font-bold text-xs"
          >
            Start Shopping Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const canCancel = ['pending', 'confirmed'].includes(order.status.toLowerCase());
            return (
              <div
                key={order.id}
                className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-xs hover:border-emerald-200 transition-all space-y-4"
              >
                {/* Top Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-stone-400">Order ID:</span>
                    <span className="font-extrabold text-stone-900 text-sm">#{order.id}</span>
                  </div>
                  <div>
                    {getStatusBadge(order.order_status)}
                  </div>
                </div>

                {/* Body Row */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  
                  {/* Item info */}
                  <div className="sm:col-span-6 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 text-2xl flex items-center justify-center shrink-0">
                      🌱
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm">{order.product_name || 'Farm Product'}</h4>
                      <p className="text-xs text-stone-500">
                        Qty: {order.quantity} × ₹{order.price_per_unit}
                      </p>
                    </div>
                  </div>

                  {/* Delivery destination */}
                  <div className="sm:col-span-3 text-xs text-stone-600 space-y-0.5">
                    <span className="text-stone-400 font-medium block">Delivery Location</span>
                    <p className="font-bold text-stone-800 truncate">{order.delivery_address}</p>
                    <p className="text-stone-500">{order.city} - {order.pincode}</p>
                  </div>

                  {/* Price & Date */}
                  <div className="sm:col-span-3 text-right">
                    <span className="text-xs text-stone-400 block">Total Amount</span>
                    <span className="text-lg font-black text-emerald-800">₹{order.total_amount}</span>
                  </div>

                </div>

                {/* Bottom action if cancellable */}
                {canCancel && (
                  <div className="pt-2 flex justify-end border-t border-stone-100">
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to cancel this order?')) {
                          cancelOrder(order.id);
                        }
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      Cancel Order
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

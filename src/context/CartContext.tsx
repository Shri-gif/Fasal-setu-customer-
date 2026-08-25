import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, CustomerProfile, Order, PlacedOrderSummary } from '../types';
import { placeOrderInDb, SAMPLE_PRODUCTS } from '../lib/supabase';

const CART_KEY = "khet2ghar_customer_cart";
const PROFILE_KEY = "fasal_setu_customer_profile";
const ORDERS_KEY = "khet2ghar_customer_orders";
const LAST_ORDER_KEY = "khet2ghar_last_order";

interface ToastInfo {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (product: Product, quantity?: number) => boolean;
  updateQuantity: (productId: string | number, quantity: number) => void;
  removeFromCart: (productId: string | number) => void;
  clearCart: () => void;
  profile: CustomerProfile | null;
  saveProfile: (profile: CustomerProfile) => void;
  orders: Order[];
  loadOrdersForMobile: (mobile: string) => Promise<Order[]>;
  cancelOrder: (orderId: string | number) => Promise<boolean>;
  lastOrder: PlacedOrderSummary | null;
  checkoutOrder: (formData: {
    name: string;
    mobile: string;
    email?: string;
    address: string;
    city: string;
    pincode: string;
    notes?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  toasts: ToastInfo[];
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [profile, setProfile] = useState<CustomerProfile | null>(() => {
    try {
      const stored = localStorage.getItem(PROFILE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const stored = localStorage.getItem(ORDERS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [lastOrder, setLastOrder] = useState<PlacedOrderSummary | null>(() => {
    try {
      const stored = sessionStorage.getItem(LAST_ORDER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  };

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error("Cart save error", e);
    }
  }, [cart]);

  const cartCount = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.price_per_unit * (item.quantity || 1)), 0);

  const addToCart = (product: Product, quantity = 1): boolean => {
    if (!product || !product.id) return false;
    const stock = Number(product.stock) || 999;
    if (stock <= 0) {
      showToast("This product is out of stock", "error");
      return false;
    }

    setCart(prev => {
      const existing = prev.find(item => String(item.id) === String(product.id));
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, stock);
        return prev.map(item =>
          String(item.id) === String(product.id) ? { ...item, quantity: newQty } : item
        );
      } else {
        const newItem: CartItem = {
          id: product.id,
          farmer_id: product.farmer_id,
          farmer_name: product.farmer_name || 'Local Farmer',
          category_id: product.category_id,
          name: product.name,
          description: product.description,
          price_per_unit: product.price_per_unit,
          unit: product.unit || 'kg',
          image_url: product.image_url,
          stock: stock,
          farm_location: product.farm_location,
          quantity: Math.min(quantity, stock)
        };
        return [...prev, newItem];
      }
    });

    showToast(`${product.name} added to cart 🛒`, "success");
    return true;
  };

  const updateQuantity = (productId: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item => {
        if (String(item.id) === String(productId)) {
          const maxStock = item.stock || 999;
          return { ...item, quantity: Math.min(quantity, maxStock) };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string | number) => {
    setCart(prev => {
      const item = prev.find(p => String(p.id) === String(productId));
      if (item) {
        showToast(`${item.name} removed from cart`, 'info');
      }
      return prev.filter(p => String(p.id) !== String(productId));
    });
  };

  const clearCart = () => {
    setCart([]);
    showToast('Cart cleared', 'info');
  };

  const saveProfile = (newProfile: CustomerProfile) => {
    setProfile(newProfile);
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile));
      showToast('Profile saved successfully', 'success');
    } catch (e) {
      console.error('Error saving profile', e);
    }
  };

  const loadOrdersForMobile = async (mobile: string): Promise<Order[]> => {
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    if (!cleanMobile) return [];
    
    // In actual database, query by customer_mobile
    try {
      const stored = localStorage.getItem(ORDERS_KEY);
      const localOrders: Order[] = stored ? JSON.parse(stored) : [];
      const userOrders = localOrders.filter(o => o.customer_mobile.slice(-10) === cleanMobile);
      setOrders(userOrders);
      return userOrders;
    } catch {
      return [];
    }
  };

  const cancelOrder = async (orderId: string | number): Promise<boolean> => {
    try {
      const updated = orders.map(o =>
        String(o.id) === String(orderId) ? { ...o, status: 'cancelled' } : o
      );
      setOrders(updated);
      localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
      showToast('Order cancelled successfully', 'success');
      return true;
    } catch {
      showToast('Failed to cancel order', 'error');
      return false;
    }
  };

  const checkoutOrder = async (formData: {
    name: string;
    mobile: string;
    email?: string;
    address: string;
    city: string;
    pincode: string;
    notes?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (cart.length === 0) {
      return { success: false, error: 'Your cart is empty' };
    }

    const cleanMobile = formData.mobile.replace(/\D/g, '').slice(-10);
    if (cleanMobile.length !== 10) {
      return { success: false, error: 'Please provide a valid 10-digit mobile number' };
    }

    // Auto-save/update user profile for future checkouts
    const newProfile: CustomerProfile = {
      name: formData.name,
      mobile: cleanMobile,
      email: formData.email,
      address: formData.address,
      city: formData.city,
      pincode: formData.pincode,
      updatedAt: new Date().toISOString()
    };
    saveProfile(newProfile);

    const generatedOrderIds: string[] = [];
    const newOrderRows: Order[] = cart.map(item => {
      const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
      generatedOrderIds.push(orderId);
      return {
        id: orderId,
        product_id: item.id,
        farmer_id: item.farmer_id,
        product_name: item.name,
        customer_name: formData.name,
        customer_mobile: cleanMobile,
        delivery_address: formData.address,
        city: formData.city,
        pincode: formData.pincode,
        quantity: item.quantity,
        price_per_unit: item.price_per_unit,
        total_amount: item.price_per_unit * item.quantity,
        notes: formData.notes || null,
        status: 'pending',
        created_at: new Date().toISOString()
      };
    });

    // Try Supabase insert
    await placeOrderInDb(newOrderRows.map(o => ({
      product_id: o.product_id,
      farmer_id: o.farmer_id,
      customer_name: o.customer_name,
      customer_mobile: o.customer_mobile,
      delivery_address: o.delivery_address,
      city: o.city,
      pincode: o.pincode,
      quantity: o.quantity,
      price_per_unit: o.price_per_unit,
      total_amount: o.total_amount,
      notes: o.notes,
      status: 'pending'
    })));

    // Save in local storage history
    const existingOrdersStored = localStorage.getItem(ORDERS_KEY);
    const existingOrders: Order[] = existingOrdersStored ? JSON.parse(existingOrdersStored) : [];
    const combinedOrders = [...newOrderRows, ...existingOrders];
    localStorage.setItem(ORDERS_KEY, JSON.stringify(combinedOrders));
    setOrders(combinedOrders);

    const summary: PlacedOrderSummary = {
      orderIds: generatedOrderIds,
      orderCount: newOrderRows.length,
      totalAmount: cartTotal,
      customerName: formData.name,
      mobile: cleanMobile,
      createdAt: new Date().toISOString()
    };

    sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(summary));
    setLastOrder(summary);

    // Clear Cart
    setCart([]);
    showToast('Order placed successfully! 🎉', 'success');

    return { success: true };
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartTotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        profile,
        saveProfile,
        orders,
        loadOrdersForMobile,
        cancelOrder,
        lastOrder,
        checkoutOrder,
        toasts,
        showToast
      }}
    >
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium text-white flex items-center gap-2 pointer-events-auto transition-all animate-bounce-short ${
              toast.type === 'error'
                ? 'bg-red-600'
                : toast.type === 'warning'
                ? 'bg-amber-600'
                : toast.type === 'info'
                ? 'bg-stone-800'
                : 'bg-emerald-700'
            }`}
          >
            <span>{toast.type === 'error' ? '⚠️' : toast.type === 'info' ? 'ℹ️' : '✓'}</span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

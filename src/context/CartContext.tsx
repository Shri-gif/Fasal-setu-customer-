import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CartItem,
  Product,
  CustomerProfile,
  Order,
  PlacedOrderSummary
} from '../types';
import { supabase } from '../lib/supabase';

const CART_KEY = 'khet2ghar_customer_cart';
const PROFILE_KEY = 'fasal_setu_customer_profile';
const ORDERS_KEY = 'khet2ghar_customer_orders';
const LAST_ORDER_KEY = 'khet2ghar_last_order';

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
  saveProfile: (profile: CustomerProfile) => Promise<boolean>;

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
  showToast: (
    message: string,
    type?: 'success' | 'error' | 'warning' | 'info'
  ) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

/* =========================================================
   HELPERS
========================================================= */

const cleanMobileNumber = (mobile: string): string => {
  return String(mobile || '')
    .replace(/\D/g, '')
    .slice(-10);
};

const normalizeOrder = (row: any): Order => ({
  id: row.id,
  product_id: row.product_id,
  farmer_id: row.farmer_id ?? null,
  product_name: row.product_name || 'Farm Produce',
  customer_name: row.customer_name || '',
  customer_mobile: cleanMobileNumber(row.customer_mobile || ''),
  delivery_address: row.delivery_address || '',
  city: row.city || '',
  pincode: row.pincode || '',
  quantity: Number(row.quantity) || 0,
  price_per_unit: Number(row.price_per_unit) || 0,
  total_amount: Number(row.total_amount) || 0,
  notes: row.notes ?? null,
  // Farmer updates the canonical order_status field. Prefer it
  // and fall back to the legacy status field for older orders.
  status: row.order_status || row.status || 'pending',
  created_at: row.created_at
});

/* =========================================================
   PROVIDER
========================================================= */

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  /* =======================================================
     CART
  ======================================================= */

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  /* =======================================================
     PROFILE
  ======================================================= */

  const [profile, setProfile] = useState<CustomerProfile | null>(() => {
    try {
      const stored = localStorage.getItem(PROFILE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  /* =======================================================
     ORDERS
  ======================================================= */

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const stored = localStorage.getItem(ORDERS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  /* =======================================================
     LAST ORDER
  ======================================================= */

  const [lastOrder, setLastOrder] =
    useState<PlacedOrderSummary | null>(() => {
      try {
        const stored = sessionStorage.getItem(LAST_ORDER_KEY);
        return stored ? JSON.parse(stored) : null;
      } catch {
        return null;
      }
    });

  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  /* =======================================================
     TOAST
  ======================================================= */

  const showToast = (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'success'
  ) => {
    const id = Date.now() + Math.random();

    setToasts(prev => [
      ...prev,
      {
        id,
        message,
        type
      }
    ]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  };

  /* =======================================================
     SAVE CART
  ======================================================= */

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Cart save error:', error);
    }
  }, [cart]);

  /* =======================================================
     CART TOTALS
  ======================================================= */

  const cartCount = cart.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0
  );

  const cartTotal = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.price_per_unit || 0) *
        Number(item.quantity || 1),
    0
  );

  /* =======================================================
     ADD TO CART
  ======================================================= */

  const addToCart = (
    product: Product,
    quantity = 1
  ): boolean => {
    if (!product || !product.id) {
      return false;
    }

    const stock = Number(product.stock) || 999;

    if (stock <= 0) {
      showToast(
        'This product is out of stock',
        'error'
      );
      return false;
    }

    setCart(prev => {
      const existing = prev.find(
        item =>
          String(item.id) === String(product.id)
      );

      if (existing) {
        const newQty = Math.min(
          existing.quantity + quantity,
          stock
        );

        return prev.map(item =>
          String(item.id) === String(product.id)
            ? {
                ...item,
                quantity: newQty
              }
            : item
        );
      }

      const newItem: CartItem = {
        id: product.id,
        farmer_id: product.farmer_id,
        farmer_name:
          product.farmer_name || 'Local Farmer',
        category_id: product.category_id,
        name: product.name,
        description: product.description,
        price_per_unit: product.price_per_unit,
        unit: product.unit || 'kg',
        image_url: product.image_url,
        stock,
        farm_location: product.farm_location,
        quantity: Math.min(quantity, stock)
      };

      return [...prev, newItem];
    });

    showToast(
      `${product.name} added to cart 🛒`,
      'success'
    );

    return true;
  };

  /* =======================================================
     UPDATE QUANTITY
  ======================================================= */

  const updateQuantity = (
    productId: string | number,
    quantity: number
  ) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prev =>
      prev.map(item => {
        if (
          String(item.id) ===
          String(productId)
        ) {
          const maxStock =
            Number(item.stock) || 999;

          return {
            ...item,
            quantity: Math.min(
              quantity,
              maxStock
            )
          };
        }

        return item;
      })
    );
  };

  /* =======================================================
     REMOVE FROM CART
  ======================================================= */

  const removeFromCart = (
    productId: string | number
  ) => {
    setCart(prev => {
      const item = prev.find(
        p =>
          String(p.id) ===
          String(productId)
      );

      if (item) {
        showToast(
          `${item.name} removed from cart`,
          'info'
        );
      }

      return prev.filter(
        p =>
          String(p.id) !==
          String(productId)
      );
    });
  };

  /* =======================================================
     CLEAR CART
  ======================================================= */

  const clearCart = () => {
    setCart([]);
    showToast(
      'Cart cleared',
      'info'
    );
  };

  /* =======================================================
     ENSURE CUSTOMER AUTH SESSION
     
     Customer does NOT need to enter email/password.
     Anonymous Supabase Auth is used only as the identity
     behind the profile row.
  ======================================================= */

  const ensureCustomerSession = async () => {
    try {
      const {
        data: sessionData,
        error: sessionError
      } = await supabase.auth.getSession();

      if (
        !sessionError &&
        sessionData?.session?.user
      ) {
        return sessionData.session.user;
      }

      const {
        data,
        error
      } = await supabase.auth.signInAnonymously();

      if (error) {
        console.error(
          'Anonymous customer auth error:',
          error
        );

        return null;
      }

      return data?.user || null;
    } catch (error) {
      console.error(
        'Customer session error:',
        error
      );

      return null;
    }
  };

  /* =======================================================
     SAVE CUSTOMER PROFILE
     
     IMPORTANT:
     Previously this only saved to localStorage.
     Now it writes to public.profiles.
  ======================================================= */

  const saveProfile = async (
    newProfile: CustomerProfile
  ): Promise<boolean> => {
    const cleanMobile =
      cleanMobileNumber(newProfile.mobile);

    if (cleanMobile.length !== 10) {
      showToast(
        'Please provide a valid 10-digit mobile number',
        'error'
      );

      return false;
    }

    const profileToSave: CustomerProfile = {
      ...newProfile,
      mobile: cleanMobile,
      updatedAt: new Date().toISOString()
    };

    try {
      /*
       * First get an existing Supabase Auth session.
       * If customer has no session, create an anonymous
       * session so every customer gets a stable user_id.
       */
      const user =
        await ensureCustomerSession();

      /*
       * Build the profile row.
       *
       * role = customer is important because the admin
       * dashboard counts customer profiles using this role.
       */
      const profileRow: Record<string, any> = {
        role: 'customer',
        full_name: profileToSave.name,
        phone: cleanMobile,
        email:
          profileToSave.email || null,
        address:
          profileToSave.address || null,
        city:
          profileToSave.city || null,
        pincode:
          profileToSave.pincode || null,
        updated_at:
          profileToSave.updatedAt
      };

      if (user?.id) {
        profileRow.user_id = user.id;
      }

      /*
       * If we have a user_id, update that customer's profile.
       */
      let dbResult;

      if (user?.id) {
        dbResult = await supabase
          .from('profiles')
          .upsert(
            profileRow,
            {
              onConflict: 'user_id'
            }
          )
          .select()
          .maybeSingle();
      } else {
        /*
         * Fallback for projects where anonymous Auth
         * is not enabled and user_id is nullable.
         *
         * Match using phone.
         */
        dbResult = await supabase
          .from('profiles')
          .upsert(
            profileRow,
            {
              onConflict: 'phone'
            }
          )
          .select()
          .maybeSingle();
      }

      if (dbResult.error) {
        console.error(
          'Supabase profile save error:',
          dbResult.error
        );

        /*
         * Keep the local copy so the customer's entered
         * information is not lost.
         */
        setProfile(profileToSave);

        try {
          localStorage.setItem(
            PROFILE_KEY,
            JSON.stringify(profileToSave)
          );
        } catch (_) {}

        showToast(
          `Profile could not be saved to database: ${
            dbResult.error.message ||
            'Unknown error'
          }`,
          'error'
        );

        return false;
      }

      /*
       * Database save succeeded.
       */
      setProfile(profileToSave);

      try {
        localStorage.setItem(
          PROFILE_KEY,
          JSON.stringify(profileToSave)
        );
      } catch (_) {}

      showToast(
        'Profile saved successfully',
        'success'
      );

      return true;
    } catch (error: any) {
      console.error(
        'Profile save exception:',
        error
      );

      showToast(
        error?.message ||
          'Could not save profile',
        'error'
      );

      return false;
    }
  };

  /* =======================================================
     LOAD ORDERS BY MOBILE
     
     Previously this read ONLY localStorage.
     Now it reads the real Supabase orders table.
  ======================================================= */

  const loadOrdersForMobile = async (
    mobile: string
  ): Promise<Order[]> => {
    const cleanMobile =
      cleanMobileNumber(mobile);

    if (cleanMobile.length !== 10) {
      return [];
    }

    try {
      const {
        data,
        error
      } = await supabase
        .from('orders')
        .select('*')
        .eq(
          'customer_mobile',
          cleanMobile
        )
        .order(
          'created_at',
          {
            ascending: false
          }
        );

      if (error) {
        console.error(
          'Supabase orders load error:',
          error
        );

        /*
         * Local fallback.
         */
        const stored =
          localStorage.getItem(
            ORDERS_KEY
          );

        const localOrders: Order[] =
          stored
            ? JSON.parse(stored)
            : [];

        const userOrders =
          localOrders.filter(
            order =>
              cleanMobileNumber(
                order.customer_mobile
              ) === cleanMobile
          );

        setOrders(userOrders);

        return userOrders;
      }

      const dbOrders: Order[] =
        Array.isArray(data)
          ? data.map(normalizeOrder)
          : [];

      setOrders(dbOrders);

      try {
        localStorage.setItem(
          ORDERS_KEY,
          JSON.stringify(dbOrders)
        );
      } catch (_) {}

      return dbOrders;
    } catch (error) {
      console.error(
        'Orders exception:',
        error
      );

      return [];
    }
  };

  /* =======================================================
     CANCEL ORDER
  ======================================================= */

  const cancelOrder = async (
    orderId: string | number
  ): Promise<boolean> => {
    try {
      const {
        error
      } = await supabase
        .from('orders')
        .update({
          // Keep both status columns synchronized.
          status: 'cancelled',
          order_status: 'cancelled'
        })
        .eq(
          'id',
          orderId
        );

      if (error) {
        console.error(
          'Supabase cancel error:',
          error
        );

        showToast(
          error.message ||
            'Failed to cancel order',
          'error'
        );

        return false;
      }

      const updatedOrders =
        orders.map(order =>
          String(order.id) ===
          String(orderId)
            ? {
                ...order,
                status: 'cancelled'
              }
            : order
        );

      setOrders(updatedOrders);

      try {
        localStorage.setItem(
          ORDERS_KEY,
          JSON.stringify(
            updatedOrders
          )
        );
      } catch (_) {}

      showToast(
        'Order cancelled successfully',
        'success'
      );

      return true;
    } catch (error) {
      console.error(
        'Cancel order exception:',
        error
      );

      showToast(
        'Failed to cancel order',
        'error'
      );

      return false;
    }
  };

  /* =======================================================
     CHECKOUT
  ======================================================= */

  const checkoutOrder = async (
    formData: {
      name: string;
      mobile: string;
      email?: string;
      address: string;
      city: string;
      pincode: string;
      notes?: string;
    }
  ): Promise<{
    success: boolean;
    error?: string;
  }> => {
    if (cart.length === 0) {
      return {
        success: false,
        error: 'Your cart is empty'
      };
    }

    const cleanMobile =
      cleanMobileNumber(
        formData.mobile
      );

    if (cleanMobile.length !== 10) {
      return {
        success: false,
        error:
          'Please provide a valid 10-digit mobile number'
      };
    }

    /* -------------------------------------------------------
       SAVE CUSTOMER PROFILE TO SUPABASE FIRST
    ------------------------------------------------------- */

    const newProfile: CustomerProfile = {
      name: formData.name.trim(),
      mobile: cleanMobile,
      email:
        formData.email?.trim() || '',
      address:
        formData.address.trim(),
      city:
        formData.city.trim(),
      pincode:
        formData.pincode.trim(),
      updatedAt:
        new Date().toISOString()
    };

    const profileSaved =
      await saveProfile(
        newProfile
      );

    if (!profileSaved) {
      return {
        success: false,
        error:
          'Could not save customer profile. Please try again.'
      };
    }

    /* -------------------------------------------------------
       PREPARE ORDER ROWS
    ------------------------------------------------------- */

    const newOrderRows =
      cart.map(item => ({
        product_id: item.id,
        farmer_id:
          item.farmer_id ?? null,
        customer_name:
          formData.name.trim(),
        customer_mobile:
          cleanMobile,
        delivery_address:
          formData.address.trim(),
        city:
          formData.city.trim(),
        pincode:
          formData.pincode.trim(),
        quantity:
          Number(item.quantity) || 1,
        price_per_unit:
          Number(item.price_per_unit) || 0,
        total_amount:
          Number(item.price_per_unit || 0) *
          Number(item.quantity || 1),
        notes:
          formData.notes?.trim() || null,
        status: 'pending'
      }));

    /* -------------------------------------------------------
       INSERT ORDERS DIRECTLY INTO SUPABASE
       
       We use .select() so we get the actual DB order IDs.
    ------------------------------------------------------- */

    const {
      data: insertedOrders,
      error: orderError
    } = await supabase
      .from('orders')
      .insert(newOrderRows)
      .select('*');

    if (orderError) {
      console.error(
        'Supabase order insert error:',
        orderError
      );

      return {
        success: false,
        error:
          orderError.message ||
          'Could not place order'
      };
    }

    if (
      !insertedOrders ||
      insertedOrders.length === 0
    ) {
      return {
        success: false,
        error:
          'Order was not returned by database'
      };
    }

    /* -------------------------------------------------------
       NORMALIZE REAL DATABASE ORDERS
    ------------------------------------------------------- */

    const savedOrders: Order[] =
      insertedOrders.map(
        normalizeOrder
      );

    const generatedOrderIds =
      savedOrders.map(
        order => order.id
      );

    /* -------------------------------------------------------
       UPDATE LOCAL ORDER CACHE
    ------------------------------------------------------- */

    const existingOrdersStored =
      localStorage.getItem(
        ORDERS_KEY
      );

    const existingOrders: Order[] =
      existingOrdersStored
        ? JSON.parse(
            existingOrdersStored
          )
        : [];

    const combinedOrders = [
      ...savedOrders,
      ...existingOrders.filter(
        oldOrder =>
          !savedOrders.some(
            newOrder =>
              String(
                newOrder.id
              ) ===
              String(
                oldOrder.id
              )
          )
      )
    ];

    try {
      localStorage.setItem(
        ORDERS_KEY,
        JSON.stringify(
          combinedOrders
        )
      );
    } catch (_) {}

    setOrders(
      combinedOrders
    );

    /* -------------------------------------------------------
       LAST ORDER SUMMARY
    ------------------------------------------------------- */

    const summary: PlacedOrderSummary = {
      orderIds:
        generatedOrderIds,
      orderCount:
        savedOrders.length,
      totalAmount:
        savedOrders.reduce(
          (sum, order) =>
            sum +
            Number(
              order.total_amount ||
                0
            ),
          0
        ),
      customerName:
        formData.name.trim(),
      mobile:
        cleanMobile,
      createdAt:
        new Date().toISOString()
    };

    try {
      sessionStorage.setItem(
        LAST_ORDER_KEY,
        JSON.stringify(
          summary
        )
      );
    } catch (_) {}

    setLastOrder(
      summary
    );

    /* -------------------------------------------------------
       CLEAR CART
    ------------------------------------------------------- */

    setCart([]);

    showToast(
      'Order placed successfully! 🎉',
      'success'
    );

    return {
      success: true
    };
  };

  /* =======================================================
     PROVIDER
  ======================================================= */

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
            <span>
              {toast.type ===
              'error'
                ? '⚠️'
                : toast.type ===
                  'info'
                ? 'ℹ️'
                : '✓'}
            </span>

            <span>
              {toast.message}
            </span>
          </div>
        ))}
      </div>
    </CartContext.Provider>
  );
};

/* =========================================================
   HOOK
========================================================= */

export const useCart = () => {
  const context =
    useContext(
      CartContext
    );

  if (!context) {
    throw new Error(
      'useCart must be used within a CartProvider'
    );
  }

  return context;
};

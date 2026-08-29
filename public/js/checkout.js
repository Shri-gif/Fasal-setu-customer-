/* =========================================================
   FASAL SETU / KHET2GHAR - js/checkout.js (Fixed & Resilient)
   ========================================================= */

import { supabase } from "./supabase.js";
import { getCart, saveCart, formatRupees, showToast, updateCartCount, escapeHTML } from "./app.js";

const checkoutForm = document.getElementById("checkoutForm");
const checkoutItems = document.getElementById("checkoutItems");
const checkoutSubtotal = document.getElementById("checkoutSubtotal");
const checkoutTotal = document.getElementById("checkoutTotal");
const placeOrderBtn = document.getElementById("placeOrderBtn");
const checkoutMessage = document.getElementById("checkoutMessage");

let isPlacingOrder = false;

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  loadCheckout();
  setupCheckoutForm();
});

function getItemCustomerPrice(item) {
  const price = Number(item?.customer_price);
  if (Number.isFinite(price) && price >= 0) return price;
  return Number(item?.price_per_unit) || 0;
}

async function refreshCartWithCustomerPrices(cart) {
  if (!Array.isArray(cart) || cart.length === 0) return [];

  const ids = [...new Set(cart.map(item => item?.id).filter(Boolean))];
  if (ids.length === 0) return cart;

  const { data, error } = await supabase
    .from("products")
    .select("id, customer_price, price_per_unit, unit, stock, is_active")
    .in("id", ids);

  if (error) {
    console.warn("Could not refresh customer prices:", error);
    return cart;
  }

  const byId = new Map((data || []).map(p => [String(p.id), p]));

  return cart.map(item => {
    const product = byId.get(String(item.id));
    const customerPrice = Number(product?.customer_price);

    if (!product || !Number.isFinite(customerPrice) || customerPrice < 0) {
      return item;
    }

    return {
      ...item,
      customer_price: customerPrice,
      farmer_price: Number(product.price_per_unit) || 0,
      // Customer-side cart price.
      price_per_unit: customerPrice,
      unit: product.unit || item.unit
    };
  });
}

async function loadCheckout() {
  const storedCart = getCart();
  const cart = await refreshCartWithCustomerPrices(storedCart);
  saveCart(cart);
  if (!cart || cart.length === 0) {
    if (checkoutItems) {
      checkoutItems.innerHTML = `
        <div style="text-align: center; padding: 40px 10px;">
          <span style="font-size: 40px; display: block; margin-bottom: 8px;">🛒</span>
          <h3>Your cart is empty</h3>
          <p style="color: #666; font-size: 13px; margin: 6px 0 16px;">Add some fresh items from local farmers first.</p>
          <a href="products.html" class="primary-btn">Browse Products</a>
        </div>
      `;
    }
    if (checkoutSubtotal) checkoutSubtotal.textContent = "₹0";
    if (checkoutTotal) checkoutTotal.textContent = "₹0";
    if (placeOrderBtn) placeOrderBtn.disabled = true;
    return;
  }

  const subtotal = cart.reduce((sum, item) => sum + (getItemCustomerPrice(item) * (Number(item.quantity) || 1)), 0);

  if (checkoutItems) {
    checkoutItems.innerHTML = cart.map(item => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee;">
        <div>
          <strong style="display: block; font-size: 14px;">${escapeHTML(item.name)}</strong>
          <span style="font-size: 12px; color: #666;">${item.quantity} × ₹${getItemCustomerPrice(item)} / ${escapeHTML(item.unit || 'kg')}</span>
        </div>
        <strong style="font-size: 14px;">₹${getItemCustomerPrice(item) * (Number(item.quantity) || 1)}</strong>
      </div>
    `).join("");
  }

  if (checkoutSubtotal) checkoutSubtotal.textContent = formatRupees(subtotal);
  if (checkoutTotal) checkoutTotal.textContent = formatRupees(subtotal);
  if (placeOrderBtn) placeOrderBtn.disabled = false;
}

function setupCheckoutForm() {
  if (!checkoutForm) return;

  // Auto-fill from profile if stored
  try {
    const profileStored = localStorage.getItem("fasal_setu_customer_profile");
    if (profileStored) {
      const p = JSON.parse(profileStored);
      if (checkoutForm.elements["name"]) checkoutForm.elements["name"].value = p.name || "";
      if (checkoutForm.elements["mobile"]) checkoutForm.elements["mobile"].value = p.mobile || "";
      if (checkoutForm.elements["address"]) checkoutForm.elements["address"].value = p.address || "";
      if (checkoutForm.elements["city"]) checkoutForm.elements["city"].value = p.city || "";
      if (checkoutForm.elements["pincode"]) checkoutForm.elements["pincode"].value = p.pincode || "";
    }
  } catch (e) {}

  checkoutForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (isPlacingOrder) return;
    await placeOrder();
  });
}

async function placeOrder() {
  const cart = getCart();
  if (!cart || cart.length === 0) {
    showToast("Your cart is empty", "error");
    return;
  }

  const formData = new FormData(checkoutForm);
  const name = String(formData.get("name") || "").trim();
  const mobile = String(formData.get("mobile") || "").replace(/\D/g, "").slice(-10);
  const address = String(formData.get("address") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const pincode = String(formData.get("pincode") || "").replace(/\D/g, "").slice(-6);
  const notes = String(formData.get("notes") || "").trim();

  if (!name) {
    showErrorMsg("Please enter your full name.");
    return;
  }
  if (mobile.length !== 10) {
    showErrorMsg("Please enter a valid 10-digit mobile number.");
    return;
  }
  if (!address) {
    showErrorMsg("Please enter your complete delivery address.");
    return;
  }
  if (!city) {
    showErrorMsg("Please enter your city.");
    return;
  }
  if (pincode.length !== 6) {
    showErrorMsg("Please enter a valid 6-digit PIN code.");
    return;
  }

  isPlacingOrder = true;
  if (placeOrderBtn) {
    placeOrderBtn.disabled = true;
    placeOrderBtn.textContent = "Placing Order...";
  }

  try {
    const generatedOrderIds = [];
    const orderRows = cart.map(item => {
      const oid = "ORD-" + Math.floor(100000 + Math.random() * 900000);
      generatedOrderIds.push(oid);
      return {
        id: oid,
        product_id: item.id,
        farmer_id: item.farmer_id || null,
        product_name: item.name,
        customer_name: name,
        customer_mobile: mobile,
        delivery_address: address,
        city: city,
        pincode: pincode,
        quantity: item.quantity,
        price_per_unit: getItemCustomerPrice(item),
        total_amount: getItemCustomerPrice(item) * (Number(item.quantity) || 1),
        notes: notes || null,
        status: "pending",
        created_at: new Date().toISOString()
      };
    });

    const totalAmount = orderRows.reduce((sum, o) => sum + o.total_amount, 0);

    // Save profile
    localStorage.setItem("fasal_setu_customer_profile", JSON.stringify({
      name, mobile, address, city, pincode, updatedAt: new Date().toISOString()
    }));

    // Try Supabase insert
    try {
      await supabase.from("orders").insert(orderRows.map(o => ({
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
        status: "pending"
      })));
    } catch (dbErr) {
      console.warn("Supabase order insert warn, saved locally:", dbErr);
    }

    // Save locally
    const existingOrdersStored = localStorage.getItem("khet2ghar_customer_orders");
    const existingOrders = existingOrdersStored ? JSON.parse(existingOrdersStored) : [];
    localStorage.setItem("khet2ghar_customer_orders", JSON.stringify([...orderRows, ...existingOrders]));

    // Critical Bug Fix: store generated orderIds so order-success.html renders!
    const successData = {
      orderIds: generatedOrderIds,
      orderCount: orderRows.length,
      totalAmount: totalAmount,
      customerName: name,
      mobile: mobile,
      createdAt: new Date().toISOString()
    };

    sessionStorage.setItem("khet2ghar_last_order", JSON.stringify(successData));

    // Clear cart
    saveCart([]);
    updateCartCount();

    window.location.href = "order-success.html";
  } catch (err) {
    console.error("Order error:", err);
    showErrorMsg(err?.message || "Failed to place order. Please try again.");
    if (placeOrderBtn) {
      placeOrderBtn.disabled = false;
      placeOrderBtn.textContent = "Place Order";
    }
  } finally {
    isPlacingOrder = false;
  }
}

function showErrorMsg(msg) {
  if (checkoutMessage) {
    checkoutMessage.textContent = msg;
    checkoutMessage.style.display = "block";
    checkoutMessage.style.color = "#dc2626";
  } else {
    showToast(msg, "error");
  }
}

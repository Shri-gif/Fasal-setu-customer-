/* =========================================================
   FASAL SETU / KHET2GHAR - app.js (Core utilities & state)
   ========================================================= */

export const CART_KEY = "khet2ghar_customer_cart";
export const PROFILE_KEY = "fasal_setu_customer_profile";
export const ORDERS_KEY = "khet2ghar_customer_orders";
export const LAST_ORDER_KEY = "khet2ghar_last_order";

export function escapeHTML(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function escapeAttribute(value) {
  return escapeHTML(value);
}

export function formatRupees(amount) {
  const number = Number(amount);
  if (!Number.isFinite(number)) return "₹0";
  return "₹" + number.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

export function getCart() {
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Cart load error", e);
    return [];
  }
}

export function saveCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(Array.isArray(cart) ? cart : []));
  } catch (e) {
    console.error("Cart save error", e);
    return false;
  }
  updateCartCount();
  window.dispatchEvent(new CustomEvent("cartUpdated", { detail: cart }));
  return true;
}

export function addToCart(product, quantity = 1) {
  if (!product || !product.id) return false;
  const stock = Number(product.stock) || 999;
  if (stock <= 0) {
    showToast("This product is out of stock", "error");
    return false;
  }

  const cart = getCart();
  const existing = cart.find(item => String(item.id) === String(product.id));

  if (existing) {
    existing.quantity = Math.min(Number(existing.quantity || 1) + Number(quantity || 1), stock);
  } else {
    cart.push({
      id: product.id,
      farmer_id: product.farmer_id || null,
      farmer_name: product.farmer_name || "Local Farmer",
      category_id: product.category_id || null,
      name: product.name || "Farm Product",
      description: product.description || "",
      price_per_unit: Number(product.price_per_unit) || 0,
      unit: product.unit || "kg",
      image_url: product.image_url || null,
      stock: stock,
      farm_location: product.farm_location || null,
      quantity: Math.min(Number(quantity) || 1, stock)
    });
  }

  return saveCart(cart);
}

export function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  document.querySelectorAll("#cartCount, #mobileCartCount, [data-cart-count]").forEach(el => {
    el.textContent = String(count);
  });
  return count;
}

export function showToast(message, type = "success") {
  let toast = document.getElementById("customerToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "customerToast";
    toast.className = "customer-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = String(message || "");
  toast.dataset.type = type;
  toast.className = `customer-toast show ${type}`;

  clearTimeout(window.__khetToastTimer);
  window.__khetToastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
});

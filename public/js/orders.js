/* =========================================================
   FASAL SETU / KHET2GHAR - js/orders.js (Fixed & Resilient)
   ========================================================= */

import { supabase } from "./supabase.js";
import { formatRupees, escapeHTML, escapeAttribute, showToast, updateCartCount } from "./app.js";

const ordersContainer =
  document.getElementById("ordersContainer") ||
  document.getElementById("ordersList");

const ordersLoading = document.getElementById("ordersLoading");
const ordersEmpty = document.getElementById("emptyOrders") || document.getElementById("ordersEmpty");
const ordersError = document.getElementById("ordersError");
const orderSearch = document.getElementById("orderSearch");
const orderFilter = document.getElementById("orderStatusFilter") || document.getElementById("orderFilter");

let allOrders = [];

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  setupOrdersPage();
});

function setupOrdersPage() {
  if (orderSearch) {
    orderSearch.addEventListener("input", renderOrders);
  }
  if (orderFilter) {
    orderFilter.addEventListener("change", renderOrders);
  }
  loadOrders();
}

function getCustomerMobile() {
  try {
    const profile = localStorage.getItem("fasal_setu_customer_profile");
    if (profile) {
      const parsed = JSON.parse(profile);
      if (parsed.mobile) return String(parsed.mobile).replace(/\D/g, "").slice(-10);
    }
  } catch (e) {}

  try {
    const last = sessionStorage.getItem("khet2ghar_last_order");
    if (last) {
      const parsed = JSON.parse(last);
      if (parsed.mobile) return String(parsed.mobile).replace(/\D/g, "").slice(-10);
    }
  } catch (e) {}

  return "";
}

async function loadOrders() {
  showLoading();
  const mobile = getCustomerMobile();

  // Load from local storage history first
  try {
    const localStored = localStorage.getItem("khet2ghar_customer_orders");
    allOrders = localStored ? JSON.parse(localStored) : [];
  } catch (e) {
    allOrders = [];
  }

  // Attempt database query if mobile exists
  if (mobile) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_mobile", mobile)
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        allOrders = data;
        localStorage.setItem("khet2ghar_customer_orders", JSON.stringify(data));
      }
    } catch (e) {
      console.warn("Database order fetch warn, showing local:", e);
    }
  }

  renderOrders();
}

function renderOrders() {
  if (!ordersContainer) return;
  hideLoading();

  const search = (orderSearch?.value || "").trim().toLowerCase();
  const filter = (orderFilter?.value || "all").trim().toLowerCase();

  let filtered = [...allOrders];

  if (search) {
    filtered = filtered.filter(o => {
      const text = `${o.id} ${o.product_name} ${o.customer_name} ${o.city} ${o.delivery_address}`.toLowerCase();
      return text.includes(search);
    });
  }

  if (filter && filter !== "all") {
    filtered = filtered.filter(o => String(o.order_status || o.status || "pending").toLowerCase() === filter);
  }

  if (filtered.length === 0) {
    ordersContainer.style.display = "none";
    if (ordersEmpty) ordersEmpty.style.display = "block";
    return;
  }

  if (ordersEmpty) ordersEmpty.style.display = "none";
  ordersContainer.style.display = "block";
  ordersContainer.innerHTML = filtered.map(createOrderCard).join("");
  setupCancelButtons();
}

function createOrderCard(order) {
  const oid = escapeHTML(order.id);
  const status = String(order.order_status || order.status || "pending").toLowerCase();
  const canCancel = ["pending", "confirmed"].includes(status);
  const total = Number(order.total_amount) || ((Number(order.price_per_unit) || 0) * (Number(order.quantity) || 1));

  return `
    <article class="order-card" style="background: white; border-radius: 16px; border: 1px solid #e5e7eb; padding: 20px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f3f4f6; padding-bottom: 12px; margin-bottom: 12px;">
        <div>
          <span style="font-size: 11px; color: #6b7280; font-weight: bold; text-transform: uppercase;">Order ID</span>
          <strong style="display: block; font-size: 14px; color: #111827;">#${oid}</strong>
        </div>
        <span class="order-status order-status-${escapeAttribute(status)}" style="padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: bold; background: #ecfdf5; color: #047857;">
          ${escapeHTML(status.toUpperCase())}
        </span>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 24px;">🌱</span>
          <div>
            <h4 style="font-size: 14px; font-weight: bold; color: #1f2937; margin: 0;">${escapeHTML(order.product_name || "Farm Produce")}</h4>
            <span style="font-size: 12px; color: #6b7280;">Qty: ${order.quantity} × ₹${order.price_per_unit}</span>
          </div>
        </div>
        <strong style="font-size: 16px; color: #047857;">${formatRupees(total)}</strong>
      </div>

      <div style="font-size: 12px; color: #4b5563; background: #f9fafb; padding: 8px 12px; border-radius: 8px; margin-bottom: 10px;">
        <span>📍 ${escapeHTML(order.delivery_address || "")}, ${escapeHTML(order.city || "")} (${escapeHTML(order.pincode || "")})</span>
      </div>

      ${canCancel ? `
        <div style="text-align: right; pt-2;">
          <button type="button" class="secondary-btn" data-cancel-id="${escapeAttribute(order.id)}" style="font-size: 11px; color: #dc2626; border-color: #fecaca; background: #fef2f2; padding: 5px 12px; border-radius: 8px; cursor: pointer;">
            Cancel Order
          </button>
        </div>
      ` : ""}
    </article>
  `;
}

function setupCancelButtons() {
  if (!ordersContainer) return;
  ordersContainer.querySelectorAll("[data-cancel-id]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.cancelId;
      if (!confirm("Are you sure you want to cancel this order?")) return;

      allOrders = allOrders.map(o => String(o.id) === String(id) ? { ...o, status: "cancelled", order_status: "cancelled" } : o);
      localStorage.setItem("khet2ghar_customer_orders", JSON.stringify(allOrders));
      renderOrders();
      showToast("Order cancelled successfully", "success");
    });
  });
}

function showLoading() {
  if (ordersLoading) ordersLoading.style.display = "block";
  if (ordersContainer) ordersContainer.style.display = "none";
  if (ordersEmpty) ordersEmpty.style.display = "none";
}

function hideLoading() {
  if (ordersLoading) ordersLoading.style.display = "none";
}

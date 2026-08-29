/* =========================================================
   FASAL SETU / KHET2GHAR - js/product.js (Fixed & Resilient)
   ========================================================= */

import { supabase } from "./supabase.js";
import { formatRupees, escapeHTML, escapeAttribute, addToCart, showToast, updateCartCount } from "./app.js";

const productsContainer =
  document.getElementById("productsGrid") ||
  document.getElementById("productsContainer");

const emptyProducts =
  document.getElementById("productsEmpty") ||
  document.getElementById("emptyProducts");

const productSearch =
  document.getElementById("productSearch");

const categoryFilterSelect =
  document.getElementById("categoryFilter");

const categoryFilterButtons =
  document.querySelectorAll(".category-filter");

const productCount =
  document.getElementById("productCount");

let allProducts = [];
let currentCategory = "all";
const categoryMap = new Map();

document.addEventListener("DOMContentLoaded", async () => {
  if (!productsContainer) return;
  showLoading();
  updateCartCount();

  await Promise.allSettled([loadCategories(), loadProducts()]);
  setupSearch();
  setupCategoryFilters();
});

async function loadCategories() {
  try {
    const { data, error } = await supabase
      .from("product_categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;

    categoryMap.clear();
    (data || []).forEach(cat => {
      if (cat.id !== null && cat.id !== undefined) {
        categoryMap.set(String(cat.id), String(cat.name || cat.title || "Farm Product"));
      }
    });

    if (categoryFilterSelect) {
      categoryFilterSelect.innerHTML = `<option value="all">All Categories</option>`;
      (data || []).forEach(cat => {
        const opt = document.createElement("option");
        opt.value = String(cat.id);
        opt.textContent = String(cat.name || "Category");
        categoryFilterSelect.appendChild(opt);
      });
    }
  } catch (err) {
    console.warn("Category load warning:", err);
  }
}

async function loadProducts() {
  if (!productsContainer) return;

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    allProducts = Array.isArray(data) ? data : [];
    applyFilters();
  } catch (err) {
    console.error("Products error:", err);
    showError(err?.message || "Could not load products.");
  }
}

function setupSearch() {
  if (!productSearch) return;
  const urlParams = new URLSearchParams(window.location.search);
  const q = urlParams.get("search");
  if (q) {
    productSearch.value = q;
  }
  productSearch.addEventListener("input", applyFilters);
}

function setupCategoryFilters() {
  if (categoryFilterSelect) {
    categoryFilterSelect.addEventListener("change", (e) => {
      currentCategory = e.target.value;
      applyFilters();
    });
  }

  if (categoryFilterButtons && categoryFilterButtons.length > 0) {
    categoryFilterButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        categoryFilterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentCategory = btn.dataset.category || "all";
        applyFilters();
      });
    });
  }

  // Handle ?category= query param
  const urlParams = new URLSearchParams(window.location.search);
  const catParam = urlParams.get("category");
  if (catParam) {
    currentCategory = catParam;
  }
}

function applyFilters() {
  const query = (productSearch?.value || "").trim().toLowerCase();
  
  let filtered = [...allProducts];

  if (query) {
    filtered = filtered.filter(p => {
      const name = (p.name || "").toLowerCase();
      const desc = (p.description || "").toLowerCase();
      const loc = (p.farm_location || "").toLowerCase();
      const cat = (categoryMap.get(String(p.category_id)) || "").toLowerCase();
      return name.includes(query) || desc.includes(query) || loc.includes(query) || cat.includes(query);
    });
  }

  if (currentCategory && currentCategory !== "all") {
    filtered = filtered.filter(p => {
      const catName = (categoryMap.get(String(p.category_id)) || "").toLowerCase();
      return String(p.category_id) === currentCategory || catName.includes(currentCategory.toLowerCase());
    });
  }

  renderProducts(filtered);
}

function renderProducts(products) {
  if (!productsContainer) return;

  if (!products || products.length === 0) {
    productsContainer.innerHTML = "";
    if (emptyProducts) {
      emptyProducts.style.display = "block";
    }
    if (productCount) productCount.textContent = "0";
    return;
  }

  if (emptyProducts) {
    emptyProducts.style.display = "none";
  }

  productsContainer.style.display = "grid";
  productsContainer.innerHTML = products.map(createProductCard).join("");
  setupProductButtons();
  if (productCount) productCount.textContent = String(products.length);
}

function createProductCard(product) {
  const name = escapeHTML(product.name || "Farm Product");
  const desc = escapeHTML(product.description || "");
  const price = Number(product.customer_price ?? product.price_per_unit) || 0;
  const unit = escapeHTML(product.unit || "kg");
  const stock = Number(product.stock) || 0;
  const location = escapeHTML(product.farm_location || "Local Farm");
  const image = String(product.image_url || "").trim();

  return `
    <article class="product-card" data-product-id="${escapeAttribute(product.id)}">
      <div class="product-image-container">
        ${image ? `
          <img src="${escapeAttribute(image)}" alt="${name}" class="product-image" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'product-image-placeholder\\'>🌱</div>'" />
        ` : `
          <div class="product-image-placeholder">🌱</div>
        `}
      </div>
      <div class="product-content">
        <div class="product-location">📍 ${location}</div>
        <h3 class="product-title">${name}</h3>
        <p class="product-description">${desc}</p>
        <div class="product-price-row">
          <strong class="product-price">${formatRupees(price)}</strong>
          <span class="product-unit">/ ${unit}</span>
        </div>
        <div class="product-actions">
          <a href="product-details.html?id=${encodeURIComponent(product.id)}" class="secondary-btn">Details</a>
          <button type="button" class="primary-btn" data-add-cart="${escapeAttribute(product.id)}">🛒 Add</button>
        </div>
      </div>
    </article>
  `;
}

function setupProductButtons() {
  if (!productsContainer) return;
  productsContainer.querySelectorAll("[data-add-cart]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.addCart;
      const product = allProducts.find(p => String(p.id) === String(id));
      if (product) {
        addToCart(product, 1);
        btn.textContent = "✓ Added";
        setTimeout(() => { btn.textContent = "🛒 Add"; }, 1000);
      }
    });
  });
}

function showLoading() {
  if (productsContainer) {
    productsContainer.innerHTML = `
      <div class="loading-state" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
        <span style="font-size: 40px; display: block;">🌱</span>
        <p>Loading fresh produce...</p>
      </div>
    `;
  }
}

function showError(msg) {
  if (productsContainer) {
    productsContainer.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
        <span style="font-size: 40px; display: block;">⚠️</span>
        <h3>Could not load products</h3>
        <p>${escapeHTML(msg)}</p>
        <button onclick="location.reload()" class="primary-btn" style="margin-top: 12px;">Retry</button>
      </div>
    `;
  }
}

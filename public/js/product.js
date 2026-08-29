/* =========================================================
   FASAL SETU / KHET2GHAR - js/product.js
   Customer Product Listing + Platform Fee Pricing
   ========================================================= */

import { supabase } from "./supabase.js";

import {
  formatRupees,
  escapeHTML,
  escapeAttribute,
  addToCart,
  showToast,
  updateCartCount
} from "./app.js";


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


const categoryMap =
  new Map();


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    if (!productsContainer) {

      return;

    }


    showLoading();


    updateCartCount();


    await Promise.allSettled([
      loadCategories(),
      loadProducts()
    ]);


    setupSearch();


    setupCategoryFilters();

  }
);


/* =========================================================
   CUSTOMER PRICE
   =========================================================

   Database structure:

   price_per_unit
   → Farmer ka original/base price

   platform_fee
   → Is product par platform fee amount

   customer_price
   → Final price jo customer ko dikhega

   Example:

   Farmer price: ₹60
   Platform fee: ₹6
   Customer price: ₹66

   Customer ko sirf ₹66 dikhega.
   ========================================================= */

function getCustomerPrice(product) {

  const value = Number(product?.customer_price);

  // Customer site MUST use the database customer_price.
  // No fallback to price_per_unit is allowed.
  if (!Number.isFinite(value) || value < 0) {
    return null;
  }

  return value;

}

/* =========================================================
   PREPARE PRODUCT FOR CUSTOMER
   =========================================================

   Card, cart aur checkout ko final customer price
   consistently milna chahiye.

   Original farmer price bhi preserve rahega as:

   farmer_price

   Cart compatibility ke liye:

   price_per_unit = final customer price
   ========================================================= */

function prepareCustomerProduct(product) {

  const customerPrice =
    getCustomerPrice(product);

  return {
    ...product,
    customer_price: customerPrice,
    // Compatibility only: cart UI may still read this field.
    // Its value is copied FROM customer_price, never from farmer price.
    price_per_unit: customerPrice
  };

}

/* =========================================================
   LOAD CATEGORIES
   ========================================================= */

async function loadCategories() {

  try {

    const {
      data,
      error
    } = await supabase
      .from("product_categories")
      .select("*")
      .order(
        "name",
        {
          ascending: true
        }
      );


    if (error) {

      throw error;

    }


    categoryMap.clear();


    (data || []).forEach(cat => {

      if (
        cat.id !== null &&
        cat.id !== undefined
      ) {

        categoryMap.set(

          String(cat.id),

          String(
            cat.name ||
            cat.title ||
            cat.category_name ||
            cat.slug ||
            "Farm Product"
          )

        );

      }

    });


    if (categoryFilterSelect) {

      categoryFilterSelect.innerHTML = `
        <option value="all">
          All Categories
        </option>
      `;


      (data || []).forEach(cat => {

        const option =
          document.createElement("option");


        option.value =
          String(cat.id);


        option.textContent =
          String(
            cat.name ||
            cat.title ||
            cat.category_name ||
            "Category"
          );


        categoryFilterSelect.appendChild(
          option
        );

      });

    }

  } catch (error) {

    console.warn(
      "Category load warning:",
      error
    );

  }

}


/* =========================================================
   LOAD PRODUCTS
   ========================================================= */

async function loadProducts() {

  if (!productsContainer) {

    return;

  }


  try {

    const {
      data,
      error
    } = await supabase
      .from("products")
      .select("*")
      .eq(
        "is_active",
        true
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      );


    if (error) {

      throw error;

    }


    /*
    Every product is prepared with
    final customer price before rendering.
    */

    allProducts =
      Array.isArray(data)

        ? data.map(
            prepareCustomerProduct
          )

        : [];


    applyFilters();

  } catch (error) {

    console.error(
      "Products error:",
      error
    );


    showError(

      error?.message ||

      "Could not load products."

    );

  }

}


/* =========================================================
   SEARCH
   ========================================================= */

function setupSearch() {

  if (!productSearch) {

    return;

  }


  const urlParams =
    new URLSearchParams(
      window.location.search
    );


  const searchQuery =
    urlParams.get("search");


  if (searchQuery) {

    productSearch.value =
      searchQuery;

  }


  productSearch.addEventListener(
    "input",
    applyFilters
  );

}


/* =========================================================
   CATEGORY FILTERS
   ========================================================= */

function setupCategoryFilters() {

  if (categoryFilterSelect) {

    categoryFilterSelect.addEventListener(
      "change",

      event => {

        currentCategory =
          event.target.value;


        applyFilters();

      }
    );

  }


  if (
    categoryFilterButtons &&
    categoryFilterButtons.length > 0
  ) {

    categoryFilterButtons.forEach(
      button => {

        button.addEventListener(
          "click",

          () => {

            categoryFilterButtons.forEach(
              item => {

                item.classList.remove(
                  "active"
                );

              }
            );


            button.classList.add(
              "active"
            );


            currentCategory =
              button.dataset.category ||
              "all";


            applyFilters();

          }
        );

      }
    );

  }


  /*
  Handle category from URL.
  */

  const urlParams =
    new URLSearchParams(
      window.location.search
    );


  const categoryParam =
    urlParams.get("category");


  if (categoryParam) {

    currentCategory =
      categoryParam;

  }

}


/* =========================================================
   APPLY FILTERS
   ========================================================= */

function applyFilters() {

  const query =
    (
      productSearch?.value ||
      ""
    )
      .trim()
      .toLowerCase();


  let filteredProducts =
    [...allProducts];


  /*
  SEARCH
  */

  if (query) {

    filteredProducts =
      filteredProducts.filter(product => {

        const name =
          String(
            product.name ||
            ""
          )
          .toLowerCase();


        const description =
          String(
            product.description ||
            ""
          )
          .toLowerCase();


        const location =
          String(
            product.farm_location ||
            ""
          )
          .toLowerCase();


        const category =
          String(
            categoryMap.get(
              String(
                product.category_id
              )
            ) ||
            ""
          )
          .toLowerCase();


        return (

          name.includes(query) ||

          description.includes(query) ||

          location.includes(query) ||

          category.includes(query)

        );

      });

  }


  /*
  CATEGORY
  */

  if (
    currentCategory &&
    currentCategory !== "all"
  ) {

    filteredProducts =
      filteredProducts.filter(product => {

        const categoryName =
          String(

            categoryMap.get(
              String(
                product.category_id
              )
            ) ||

            ""

          )
          .toLowerCase();


        return (

          String(
            product.category_id
          ) === currentCategory ||

          categoryName.includes(
            currentCategory.toLowerCase()
          )

        );

      });

  }


  renderProducts(
    filteredProducts
  );

}


/* =========================================================
   RENDER PRODUCTS
   ========================================================= */

function renderProducts(products) {

  if (!productsContainer) {

    return;

  }


  if (
    !products ||
    products.length === 0
  ) {

    productsContainer.innerHTML =
      "";


    if (emptyProducts) {

      emptyProducts.style.display =
        "block";

    }


    if (productCount) {

      productCount.textContent =
        "0";

    }


    return;

  }


  if (emptyProducts) {

    emptyProducts.style.display =
      "none";

  }


  productsContainer.style.display =
    "grid";


  productsContainer.innerHTML =
    products
      .map(
        createProductCard
      )
      .join("");


  setupProductButtons();


  if (productCount) {

    productCount.textContent =
      String(
        products.length
      );

  }

}


/* =========================================================
   CREATE PRODUCT CARD
   ========================================================= */

function createProductCard(product) {

  const name =
    escapeHTML(
      product.name ||
      "Farm Product"
    );


  const description =
    escapeHTML(
      product.description ||
      ""
    );


  /*
  IMPORTANT:

  Customer price is used here.
  Not farmer's original price.
  */

  const customerPrice =
    getCustomerPrice(
      product
    );


  const unit =
    escapeHTML(
      product.unit ||
      "kg"
    );


  const stock =
    Number(
      product.stock
    ) || 0;


  const location =
    escapeHTML(
      product.farm_location ||
      "Local Farm"
    );


  const image =
    String(
      product.image_url ||
      ""
    )
    .trim();


  return `

    <article
      class="product-card"
      data-product-id="${escapeAttribute(product.id)}"
    >

      <div class="product-image-container">

        ${
          image

            ? `

              <img
                src="${escapeAttribute(image)}"
                alt="${name}"
                class="product-image"
                loading="lazy"
                onerror="
                  this.parentElement.innerHTML =
                  '<div class=\\'product-image-placeholder\\'>🌱</div>'
                "
              >

            `

            : `

              <div
                class="product-image-placeholder"
              >
                🌱
              </div>

            `

        }

      </div>


      <div class="product-content">


        <div class="product-location">

          📍 ${location}

        </div>


        <h3 class="product-title">

          ${name}

        </h3>


        <p class="product-description">

          ${description}

        </p>


        <div class="product-price-row">

          <strong
            class="product-price"
          >

            ${formatRupees(
              customerPrice
            )}

          </strong>


          <span
            class="product-unit"
          >

            / ${unit}

          </span>

        </div>


        <div class="product-actions">


          <a
            href="product-details.html?id=${encodeURIComponent(product.id)}"
            class="secondary-btn"
          >

            Details

          </a>


          <button
            type="button"
            class="primary-btn"
            data-add-cart="${escapeAttribute(product.id)}"
          >

            🛒 Add

          </button>


        </div>


      </div>


    </article>

  `;

}


/* =========================================================
   ADD TO CART
   ========================================================= */

function setupProductButtons() {

  if (!productsContainer) {

    return;

  }


  productsContainer
    .querySelectorAll(
      "[data-add-cart]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",

          () => {

            const productId =
              button.dataset.addCart;


            const product =
              allProducts.find(

                item =>

                  String(item.id) ===
                  String(productId)

              );


            if (product) {

              /*
              Product is already prepared
              with final customer price.

              price_per_unit =
              customer final price.
              */

              addToCart(
                product,
                1
              );


              updateCartCount();


              button.textContent =
                "✓ Added";


              setTimeout(

                () => {

                  button.textContent =
                    "🛒 Add";

                },

                1000

              );

            }

          }

        );

      }
    );

}


/* =========================================================
   LOADING
   ========================================================= */

function showLoading() {

  if (!productsContainer) {

    return;

  }


  productsContainer.innerHTML = `

    <div
      class="loading-state"
      style="
        grid-column:1 / -1;
        text-align:center;
        padding:40px;
      "
    >

      <span
        style="
          font-size:40px;
          display:block;
        "
      >

        🌱

      </span>


      <p>

        Loading fresh produce...

      </p>

    </div>

  `;

}


/* =========================================================
   ERROR
   ========================================================= */

function showError(message) {

  if (!productsContainer) {

    return;

  }


  productsContainer.innerHTML = `

    <div
      class="empty-state"
      style="
        grid-column:1 / -1;
        text-align:center;
        padding:40px;
      "
    >

      <span
        style="
          font-size:40px;
          display:block;
        "
      >

        ⚠️

      </span>


      <h3>

        Could not load products

      </h3>


      <p>

        ${escapeHTML(message)}

      </p>


      <button
        onclick="location.reload()"
        class="primary-btn"
        style="
          margin-top:12px;
        "
      >

        Retry

      </button>

    </div>

  `;

}

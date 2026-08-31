import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { fetchProductById } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { calculatePlatformPrice, formatPlatformCurrency } from '../platform-fee';

interface ProductDetailViewProps {
  productId: string | number;
  onNavigate: (view: string, param?: string) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({ productId, onNavigate }) => {
  const { addToCart, platformSettings } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const p = await fetchProductById(productId);
        setProduct(p);
        setQuantity(1);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [productId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <span className="text-5xl animate-spin block mb-4">🌱</span>
        <h2 className="text-lg font-bold text-stone-800">Loading produce details...</h2>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center bg-stone-50 rounded-3xl border border-stone-200 my-10">
        <span className="text-5xl block mb-3">⚠️</span>
        <h2 className="text-2xl font-bold text-stone-900">Product Not Found</h2>
        <p className="text-stone-500 text-sm mt-1 mb-6">
          This product is no longer available or was removed by the farmer.
        </p>
        <button
          onClick={() => onNavigate('products')}
          className="px-6 py-2.5 bg-emerald-700 text-white rounded-xl font-bold text-xs"
        >
          Browse All Products
        </button>
      </div>
    );
  }

  const stock = product.stock || 0;
  const priceBreakdown = calculatePlatformPrice(product.price_per_unit, platformSettings);
  const isAvailable = stock > 0;

  const handleAddToCart = () => {
    if (!isAvailable) return;
    const ok = addToCart(product, quantity);
    if (ok) {
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1500);
    }
  };

  const handleBuyNow = () => {
    if (!isAvailable) return;
    addToCart(product, quantity);
    onNavigate('checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-stone-500 mb-8">
        <button onClick={() => onNavigate('home')} className="hover:text-emerald-700">Home</button>
        <span>›</span>
        <button onClick={() => onNavigate('products')} className="hover:text-emerald-700">Products</button>
        <span>›</span>
        <span className="text-stone-800 font-bold truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 bg-white p-6 sm:p-10 rounded-3xl border border-stone-200/80 shadow-xs">
        
        {/* Left Image Section */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-4/3 sm:aspect-square w-full rounded-2xl bg-emerald-50/50 border border-stone-200 overflow-hidden relative shadow-inner">
            {product.image_url && !imageError ? (
              <img
                src={product.image_url}
                alt={product.name}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-7xl text-emerald-600">
                <span>🌱</span>
                <span className="text-sm font-bold text-emerald-800 mt-3">Direct Farm Harvest</span>
              </div>
            )}
            
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 bg-emerald-800 text-white text-xs font-extrabold rounded-full shadow-md">
                100% Chemical Free
              </span>
            </div>
          </div>
        </div>

        {/* Right Info Section */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            
            {/* Category & Status */}
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-extrabold uppercase tracking-wider">
                🌾 Farm Harvest
              </span>
              {isAvailable ? (
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
                  🟢 In Stock ({stock} {product.unit} available)
                </span>
              ) : (
                <span className="text-xs font-bold text-red-600">
                  🔴 Out of Stock
                </span>
              )}
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-3xl sm:text-4xl font-black text-emerald-800">
                {formatPlatformCurrency(priceBreakdown.customerPrice)}
              </span>
              <span className="text-base text-stone-500 font-medium">
                per {product.unit}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed pt-2 border-t border-stone-100">
              {product.description || "Directly cultivated by local agricultural workers with traditional methods, sun-cured and delivered fresh without intermediate warehouses."}
            </p>

            {/* Farmer Card Box */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 text-2xl flex items-center justify-center shrink-0">
                👨‍🌾
              </div>
              <div className="text-xs space-y-0.5">
                <span className="text-stone-400 font-medium">Cultivated & Sold By</span>
                <h4 className="font-extrabold text-stone-900 text-sm">
                  {product.farmer_name || "Local Farmer Partner"}
                </h4>
                <p className="text-emerald-700 font-semibold flex items-center gap-1">
                  📍 {product.farm_location || "Regional Farm"}
                </p>
              </div>
            </div>

          </div>

          {/* Quantity & Actions */}
          {isAvailable ? (
            <div className="space-y-4 pt-4 border-t border-stone-100">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">Select Quantity:</span>
                <div className="flex items-center border border-stone-300 rounded-xl overflow-hidden bg-stone-50">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3.5 py-1.5 text-stone-600 hover:bg-stone-200 font-bold transition-colors"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={stock}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setQuantity(Math.min(Math.max(1, val), stock));
                    }}
                    className="w-14 text-center text-sm font-bold text-stone-800 bg-transparent focus:outline-hidden"
                  />
                  <button
                    onClick={() => setQuantity(q => Math.min(stock, q + 1))}
                    className="px-3.5 py-1.5 text-stone-600 hover:bg-stone-200 font-bold transition-colors"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-stone-500 font-medium">
                  Total: {formatPlatformCurrency(priceBreakdown.customerPrice * quantity)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  className={`py-3.5 px-6 rounded-xl font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 active:scale-95 ${
                    isAdded
                      ? 'bg-emerald-800 text-white'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                  }`}
                >
                  {isAdded ? '✓ Added to Cart' : '🛒 Add to Cart'}
                </button>
                <button
                  onClick={handleBuyNow}
                  className="py-3.5 px-6 rounded-xl font-extrabold text-sm bg-emerald-700 hover:bg-emerald-800 text-white shadow-md hover:shadow-lg transition-all active:scale-95"
                >
                  Buy Now →
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-center">
              <p className="text-sm font-bold text-red-800">
                This item is currently sold out.
              </p>
              <button
                onClick={() => onNavigate('products')}
                className="mt-2 text-xs font-bold text-emerald-800 underline"
              >
                Explore other farm fresh items
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

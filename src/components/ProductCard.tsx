import React, { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { calculatePlatformPrice, formatPlatformCurrency } from '../platform-fee';

interface ProductCardProps {
  product: Product;
  onViewDetails: (productId: string | number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails }) => {
  const { addToCart, platformSettings } = useCart();
  const priceBreakdown = calculatePlatformPrice(product.price_per_unit, platformSettings);
  const [imageError, setImageError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    addToCart(product, 1);
    setTimeout(() => setIsAdding(false), 800);
  };

  const isAvailable = (product.stock || 0) > 0;

  return (
    <article
      onClick={() => onViewDetails(product.id)}
      className="group bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-emerald-200 transition-all duration-300 flex flex-col cursor-pointer relative"
    >
      {/* Image Container */}
      <div className="relative aspect-4/3 w-full bg-emerald-50 overflow-hidden">
        {product.image_url && !imageError ? (
          <img
            src={product.image_url}
            alt={product.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-4xl text-emerald-600/70 bg-gradient-to-br from-emerald-50 to-emerald-100">
            <span>🌱</span>
            <span className="text-xs font-semibold text-emerald-800 mt-2">Farm Fresh</span>
          </div>
        )}

        {/* Stock status overlay */}
        <div className="absolute top-2.5 right-2.5">
          {isAvailable ? (
            <span className="px-2.5 py-1 bg-white/90 backdrop-blur-xs text-emerald-800 text-[11px] font-bold rounded-full shadow-xs border border-emerald-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              {product.stock} {product.unit} left
            </span>
          ) : (
            <span className="px-2.5 py-1 bg-red-100 text-red-800 text-[11px] font-bold rounded-full shadow-xs">
              Out of stock
            </span>
          )}
        </div>
      </div>

      {/* Product Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Farm origin */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
            <span className="truncate flex items-center gap-1 font-medium text-emerald-800">
              📍 {product.farm_location || 'Local Farm'}
            </span>
            {product.farmer_name && (
              <span className="text-[11px] text-stone-400 truncate max-w-[110px]">
                👨‍🌾 {product.farmer_name}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-bold text-stone-900 text-base group-hover:text-emerald-700 transition-colors line-clamp-1">
            {product.name}
          </h3>

          {/* Description */}
          {product.description && (
            <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* Price & Action Row */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          <div>
            <div className="text-lg font-extrabold text-emerald-700 leading-tight">
              {formatPlatformCurrency(priceBreakdown.customerPrice)}
              <span className="text-xs font-normal text-stone-500 ml-1">
                / {product.unit}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(product.id);
              }}
              className="px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
            >
              Details
            </button>
            <button
              disabled={!isAvailable || isAdding}
              onClick={handleAdd}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 shadow-xs active:scale-95 ${
                !isAvailable
                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  : isAdding
                  ? 'bg-emerald-800 text-white'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white hover:shadow-md'
              }`}
            >
              {isAdding ? '✓ Added' : '🛒 Add'}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

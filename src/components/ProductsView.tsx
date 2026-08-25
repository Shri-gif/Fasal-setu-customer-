import React, { useState, useEffect, useMemo } from 'react';
import { Product, ProductCategory } from '../types';
import { fetchCategories, fetchProducts } from '../lib/supabase';
import { ProductCard } from '../components/ProductCard';

interface ProductsViewProps {
  initialSearch?: string;
  onViewProduct: (productId: string | number) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({ initialSearch = '', onViewProduct }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [cats, prods] = await Promise.all([
          fetchCategories(),
          fetchProducts()
        ]);
        setCategories(cats);
        setProducts(prods);
        
        // If initialSearch matches a category, preselect that category
        if (initialSearch) {
          const matchedCat = cats.find(c => c.name.toLowerCase().includes(initialSearch.toLowerCase()));
          if (matchedCat) {
            setSelectedCategory(matchedCat.name);
            setSearch('');
          }
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [initialSearch]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const q = search.trim().toLowerCase();
      const matchesSearch = !q || (
        product.name.toLowerCase().includes(q) ||
        (product.description || '').toLowerCase().includes(q) ||
        (product.farm_location || '').toLowerCase().includes(q) ||
        (product.farmer_name || '').toLowerCase().includes(q)
      );

      const matchesCat = selectedCategory === 'all' || (() => {
        const targetCategory = categories.find(c => c.name.toLowerCase() === selectedCategory.toLowerCase());
        if (targetCategory && String(product.category_id) === String(targetCategory.id)) return true;
        // fallback match by name
        return (product.description || '').toLowerCase().includes(selectedCategory.toLowerCase()) ||
               product.name.toLowerCase().includes(selectedCategory.toLowerCase());
      })();

      return matchesSearch && matchesCat;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price_per_unit - b.price_per_unit;
      if (sortBy === 'price-high') return b.price_per_unit - a.price_per_unit;
      if (sortBy === 'stock') return b.stock - a.stock;
      return 0; // featured/default
    });
  }, [products, search, selectedCategory, categories, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase block mb-1">
            🌾 FARM FRESH CATALOGUE
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
            Fresh Farm Products
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Showing {filteredProducts.length} harvested agricultural products
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 sm:w-72">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm">🔍</span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products or locations..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-stone-300 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-sm font-medium text-stone-700 focus:outline-hidden focus:border-emerald-600"
          >
            <option value="featured">Sort: Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="stock">Highest Stock</option>
          </select>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
            selectedCategory === 'all'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white text-stone-600 border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/50'
          }`}
        >
          All Produce
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.name)}
            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
              selectedCategory.toLowerCase() === cat.name.toLowerCase()
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/50'
            }`}
          >
            <span>{cat.icon || '🌱'}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-24">
          <span className="text-5xl animate-spin block mb-3">🌱</span>
          <p className="text-stone-600 font-medium text-base">Loading fresh farm items...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-stone-50 rounded-3xl border border-stone-200 p-8">
          <span className="text-5xl block mb-3">🌱</span>
          <h2 className="text-xl font-bold text-stone-900">No Products Found</h2>
          <p className="text-stone-500 text-sm max-w-sm mx-auto mt-1 mb-6">
            We couldn't find any products matching your current search or category filter.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('all');
            }}
            className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs"
          >
            Clear Filters & View All
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetails={onViewProduct}
            />
          ))}
        </div>
      )}

    </div>
  );
};

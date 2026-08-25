import React, { useState, useEffect } from 'react';
import { Product, ProductCategory } from '../types';
import { fetchCategories, fetchProducts } from '../lib/supabase';
import { ProductCard } from '../components/ProductCard';

interface HomeViewProps {
  onNavigate: (view: string, param?: string) => void;
  onViewProduct: (productId: string | number) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onViewProduct }) => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [cats, prods] = await Promise.all([
          fetchCategories(),
          fetchProducts()
        ]);
        setCategories(cats);
        setFeaturedProducts(prods.slice(0, 8));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('products', searchQuery.trim());
    } else {
      onNavigate('products');
    }
  };

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/80 via-emerald-50/30 to-white pt-10 pb-16 lg:py-20 border-b border-emerald-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                <span>🌾</span> 100% Farm Fresh & Direct
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.1]">
                Pure harvest from <br className="hidden sm:inline" />
                <span className="text-emerald-700 underline decoration-emerald-300 decoration-wavy decoration-2">
                  khet to your ghar
                </span>.
              </h1>

              <p className="text-base sm:text-lg text-stone-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Discover unadulterated seasonal fruits, pesticide-free vegetables, cold-pressed oils, and farm-milled grains direct from verified Indian cultivators.
              </p>

              {/* Quick Search Bar */}
              <form onSubmit={handleSearch} className="max-w-md mx-auto lg:mx-0 flex items-center bg-white p-1.5 rounded-2xl border border-emerald-200 shadow-md focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
                <span className="pl-3 text-stone-400 text-lg">🔍</span>
                <input
                  type="text"
                  placeholder="Search tomatoes, wheat, mangoes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm text-stone-800 focus:outline-hidden bg-transparent"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                >
                  Search
                </button>
              </form>

              {/* Trust Badges */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-stone-600 font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">✓</span>
                  No Middlemen Markups
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">✓</span>
                  Harvested On Order
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">✓</span>
                  Fair Farmer Pricing
                </div>
              </div>
            </div>

            {/* Right Hero Graphic Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md aspect-square rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-1 shadow-2xl flex items-center justify-center overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"
                  alt="Fresh Organic Vegetables"
                  className="w-full h-full object-cover rounded-[22px] brightness-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent rounded-[22px]" />
                
                {/* Floating highlights */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-white/40 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Today's Highlight</span>
                      <h4 className="font-extrabold text-stone-900 text-sm">Naturally Ripened Mangoes & Desi Greens</h4>
                    </div>
                    <button
                      onClick={() => onNavigate('products')}
                      className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 transition-colors"
                    >
                      Shop Now
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Categories Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase block mb-1">
              Farm Categories
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
              Shop by Agricultural Produce
            </h2>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            View All <span>→</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => onNavigate('products', cat.name)}
              className="p-5 rounded-2xl bg-white border border-stone-200/80 hover:border-emerald-300 hover:shadow-md transition-all text-center group flex flex-col items-center justify-center gap-2"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">
                {cat.icon || '🌱'}
              </span>
              <span className="text-xs sm:text-sm font-bold text-stone-800 group-hover:text-emerald-700">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase block mb-1">
              Fresh Listings
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
              Featured Farm Produce
            </h2>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            Explore <span>→</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <span className="text-4xl animate-spin block mb-3">🌱</span>
            <p className="text-stone-500 font-medium text-sm">Loading freshest farm stock...</p>
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-16 bg-emerald-50/50 rounded-3xl border border-emerald-100">
            <span className="text-4xl block mb-2">🚜</span>
            <h3 className="text-lg font-bold text-stone-800">Fresh products are coming soon</h3>
            <p className="text-sm text-stone-500 max-w-sm mx-auto mt-1 mb-4">
              Local farmers are packing their harvest. Check back in a few minutes!
            </p>
            <button
              onClick={() => onNavigate('products')}
              className="px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold"
            >
              Browse Catalog
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={onViewProduct}
              />
            ))}
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="bg-stone-50 py-16 border-y border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase block mb-1">
              Transparent & Simple
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
              How Fasal Setu Delivers Freshness
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                icon: '🔎',
                title: 'Choose Local Harvest',
                desc: 'Select crops, grains, and greens direct from individual farmer profiles.'
              },
              {
                step: '02',
                icon: '🛒',
                title: 'One-Click Order',
                desc: 'Add to cart and enter your doorstep address with no complicated logins.'
              },
              {
                step: '03',
                icon: '👨‍🌾',
                title: 'Farmer Harvests',
                desc: 'The farmer receives your order and harvests the produce fresh that very morning.'
              },
              {
                step: '04',
                icon: '🚚',
                title: 'Direct To Doorstep',
                desc: 'Safe, hygienic packing and express delivery directly from farm to table.'
              }
            ].map(step => (
              <div key={step.step} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs relative">
                <span className="text-2xl font-black text-emerald-100 absolute top-4 right-4">
                  {step.step}
                </span>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 text-2xl flex items-center justify-center mb-4">
                  {step.icon}
                </div>
                <h3 className="font-bold text-stone-900 text-base mb-1.5">{step.title}</h3>
                <p className="text-xs text-stone-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Farmers Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase block mb-1">
              Meet The Growers
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
              Empowering India's Annadatas
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Rameshwar Lal Patel',
              location: 'Meerut, Uttar Pradesh',
              crops: 'Desi Tomatoes, Organic Spinach, Ladyfinger',
              exp: '18 Years Experience • Organic Certified'
            },
            {
              name: 'Gurpreet Singh Dhillon',
              location: 'Hoshangabad, Madhya Pradesh',
              crops: 'Sharbati Wheat, Basmati Rice, Mustard',
              exp: '24 Years Experience • Multi-crop Farming'
            },
            {
              name: 'Mahadev Anna Patil',
              location: 'Ratnagiri, Maharashtra',
              crops: 'Alphonso Mangoes, Cashews, Kokum',
              exp: '15 Years Experience • GI Tagged Orchards'
            }
          ].map((farmer, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 text-3xl flex items-center justify-center shrink-0">
                👨‍🌾
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-stone-900 text-base">{farmer.name}</h3>
                <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  📍 {farmer.location}
                </p>
                <p className="text-xs text-stone-600 font-medium pt-1">
                  Specialties: {farmer.crops}
                </p>
                <span className="inline-block text-[11px] text-stone-400 font-normal">
                  {farmer.exp}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Big CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 p-8 sm:p-12 text-white shadow-xl text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <span className="text-3xl block">🥕 🌾 🍎</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to taste real, unadulterated farm produce?
            </h2>
            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
              Order directly from farmer fields today and get your delivery right at your door with pure farm freshness.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <button
                onClick={() => onNavigate('products')}
                className="px-6 py-3 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-sm font-extrabold shadow-lg transition-transform active:scale-95"
              >
                Browse All Harvest →
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

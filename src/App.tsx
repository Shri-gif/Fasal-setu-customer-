import React, { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer, BottomNav } from './components/Footer';
import { HomeView } from './components/HomeView';
import { ProductsView } from './components/ProductsView';
import { ProductDetailView } from './components/ProductDetailView';
import { CartView } from './components/CartView';
import { CheckoutView } from './components/CheckoutView';
import { OrderSuccessView } from './components/OrderSuccessView';
import { OrdersView } from './components/OrdersView';
import { ProfileView } from './components/ProfileView';
import { AboutView, ContactView } from './components/AboutView';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | number | null>(null);
  const [searchParam, setSearchParam] = useState<string>('');

  // Handle browser back/forward or hash changes if any
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView, selectedProductId]);

  const handleNavigate = (view: string, param?: string) => {
    if (view === 'products' && param) {
      setSearchParam(param);
    } else if (view === 'products') {
      setSearchParam('');
    }
    setSelectedProductId(null);
    setCurrentView(view);
  };

  const handleViewProduct = (productId: string | number) => {
    setSelectedProductId(productId);
    setCurrentView('product-detail');
  };

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-[#fbfdfb] text-stone-800 antialiased selection:bg-emerald-200 selection:text-emerald-900">
        
        {/* Navigation Bar */}
        <Navbar currentView={currentView} onNavigate={handleNavigate} />

        {/* Dynamic Main View */}
        <main className="flex-1">
          {currentView === 'home' && (
            <HomeView
              onNavigate={handleNavigate}
              onViewProduct={handleViewProduct}
            />
          )}

          {currentView === 'products' && (
            <ProductsView
              initialSearch={searchParam}
              onViewProduct={handleViewProduct}
            />
          )}

          {currentView === 'product-detail' && selectedProductId && (
            <ProductDetailView
              productId={selectedProductId}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'cart' && (
            <CartView onNavigate={handleNavigate} />
          )}

          {currentView === 'checkout' && (
            <CheckoutView onNavigate={handleNavigate} />
          )}

          {currentView === 'order-success' && (
            <OrderSuccessView onNavigate={handleNavigate} />
          )}

          {currentView === 'orders' && (
            <OrdersView onNavigate={handleNavigate} />
          )}

          {currentView === 'profile' && (
            <ProfileView onNavigate={handleNavigate} />
          )}

          {currentView === 'about' && (
            <AboutView onNavigate={handleNavigate} />
          )}

          {currentView === 'contact' && (
            <ContactView onNavigate={handleNavigate} />
          )}
        </main>

        {/* Footer */}
        <Footer onNavigate={handleNavigate} />

        {/* Mobile Sticky Bottom Bar */}
        <BottomNav currentView={currentView} onNavigate={handleNavigate} />

      </div>
    </CartProvider>
  );
}

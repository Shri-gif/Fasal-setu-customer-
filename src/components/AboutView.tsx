import React, { useState } from 'react';

export const AboutView: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-16">
      
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase">
          🌱 ABOUT FASAL SETU
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-stone-900 tracking-tight">
          Connecting India's Farms Directly to Your Kitchen
        </h1>
        <p className="text-stone-600 text-base sm:text-lg leading-relaxed">
          Fasal Setu is built with one clear mission: eliminating unfair middleman commissions and bringing unadulterated, wholesome food from local farmers straight to conscious consumers.
        </p>
      </div>

      {/* 3 Value Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 text-2xl flex items-center justify-center">
            🌾
          </div>
          <h3 className="text-xl font-bold text-stone-900">Direct Farmer Remuneration</h3>
          <p className="text-sm text-stone-600 leading-relaxed">
            Every rupee spent on Fasal Setu goes directly to the producer, enabling farmers to invest in sustainable soil health and natural bio-fertilizers.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 text-2xl flex items-center justify-center">
            🥬
          </div>
          <h3 className="text-xl font-bold text-stone-900">Pesticide-Free Wholesomeness</h3>
          <p className="text-sm text-stone-600 leading-relaxed">
            Our cultivators practice natural farming methods, preserving the vitamins, crunch, and authentic rustic flavors that store-bought produce lacks.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 text-2xl flex items-center justify-center">
            🤝
          </div>
          <h3 className="text-xl font-bold text-stone-900">Complete Traceability</h3>
          <p className="text-sm text-stone-600 leading-relaxed">
            Know who grew your food, where the farm is located, and when it was harvested. Complete transparency from root to dining table.
          </p>
        </div>
      </div>

      {/* Big Impact Numbers */}
      <div className="p-10 rounded-3xl bg-stone-900 text-white grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div>
          <span className="text-3xl sm:text-4xl font-black text-emerald-400 block">500+</span>
          <span className="text-xs text-stone-400 mt-1 uppercase tracking-wider block">Farmer Partners</span>
        </div>
        <div>
          <span className="text-3xl sm:text-4xl font-black text-emerald-400 block">10,000+</span>
          <span className="text-xs text-stone-400 mt-1 uppercase tracking-wider block">Deliveries Made</span>
        </div>
        <div>
          <span className="text-3xl sm:text-4xl font-black text-emerald-400 block">100%</span>
          <span className="text-xs text-stone-400 mt-1 uppercase tracking-wider block">Natural Produce</span>
        </div>
        <div>
          <span className="text-3xl sm:text-4xl font-black text-emerald-400 block">0%</span>
          <span className="text-xs text-stone-400 mt-1 uppercase tracking-wider block">Middlemen Markups</span>
        </div>
      </div>

      <div className="text-center pt-4">
        <button
          onClick={() => onNavigate('products')}
          className="px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm shadow-md transition-all"
        >
          Explore Fresh Farm Catalog →
        </button>
      </div>

    </div>
  );
};

export const ContactView: React.FC<{ onNavigate: (view: string) => void }> = () => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    subject: '',
    message: ''
  });
  const [sent, setSent] = useState(false);

  const handleWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Hello Fasal Setu,
Name: ${formData.name}
Mobile: ${formData.mobile}
Subject: ${formData.subject}
Message: ${formData.message}`;

    const url = `https://wa.me/919999999999?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setSent(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase">
          💬 WE ARE HERE TO HELP
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
          Get in Touch with Fasal Setu
        </h1>
        <p className="text-stone-600 text-sm sm:text-base">
          Questions about farmer deliveries, bulk farm orders, or partnership? Connect with our dedicated support team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-stone-200 flex items-start gap-4">
            <span className="text-3xl">📞</span>
            <div>
              <h3 className="font-bold text-stone-900 text-base">Direct Phone Support</h3>
              <p className="text-xs text-stone-500 mt-0.5">Mon to Sat, 7:00 AM – 8:00 PM</p>
              <a href="tel:+919999999999" className="text-emerald-700 font-extrabold text-sm block mt-2">
                +91 99999 99999
              </a>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200 flex items-start gap-4">
            <span className="text-3xl">💬</span>
            <div>
              <h3 className="font-bold text-stone-900 text-base">WhatsApp Support</h3>
              <p className="text-xs text-stone-500 mt-0.5">Instant assistance & order updates</p>
              <a
                href="https://wa.me/919999999999"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 font-extrabold text-sm block mt-2"
              >
                Chat on WhatsApp →
              </a>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200 flex items-start gap-4">
            <span className="text-3xl">✉️</span>
            <div>
              <h3 className="font-bold text-stone-900 text-base">Email Assistance</h3>
              <p className="text-xs text-stone-500 mt-0.5">For corporate or farmer onboarding</p>
              <a href="mailto:support@fasalsetu.in" className="text-emerald-700 font-extrabold text-sm block mt-2">
                support@fasalsetu.in
              </a>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
          <h2 className="text-xl font-bold text-stone-900 border-b border-stone-100 pb-3">
            Send Us a Message
          </h2>

          {sent && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
              ✓ Message prepared! WhatsApp opened in a new tab to send your query directly.
            </div>
          )}

          <form onSubmit={handleWhatsApp} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 uppercase tracking-wider">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Ramesh"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 uppercase tracking-wider">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={formData.mobile}
                  onChange={(e) => setFormData(p => ({ ...p, mobile: e.target.value }))}
                  placeholder="10-digit mobile"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 uppercase tracking-wider">
                Subject *
              </label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData(p => ({ ...p, subject: e.target.value }))}
                placeholder="e.g. Bulk Wheat Order / Delivery Inquiry"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 uppercase tracking-wider">
                Message Details *
              </label>
              <textarea
                rows={4}
                required
                value={formData.message}
                onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))}
                placeholder="Write your question or request..."
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>💬</span> Send via WhatsApp
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};

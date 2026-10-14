/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { WhatsAppFloatingWidget } from './components/WhatsAppFloatingWidget';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { HomeView } from './components/HomeView';
import { CourierBookingForm } from './components/CourierBookingForm';
import { ShopView } from './components/ShopView';
import { RequestProductForm } from './components/RequestProductForm';
import { NriServicesView } from './components/NriServicesView';
import { TrackShipmentView } from './components/TrackShipmentView';
import { MyOrdersView } from './components/MyOrdersView';
import { AdminDashboard } from './components/AdminDashboard';
import {
  ContactView,
  FaqView,
  PrivacyView,
  RefundPolicyView,
  TermsView,
} from './components/PolicyAndInfoViews';
import { api } from './services/api';
import { BusinessSettings, Order } from './types';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [pageParams, setPageParams] = useState<any>(null);
  const [settings, setSettings] = useState<BusinessSettings | undefined>(undefined);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    // Load business settings on startup
    api.getSettings().then((s) => setSettings(s)).catch((err) => console.error(err));
  }, []);

  const handleNavigate = (page: string, params?: any) => {
    setCurrentPage(page);
    setPageParams(params || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (order: Order) => {
    // Can optionally navigate to my-orders
  };

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-[#F5F7FA] text-[#102A43] font-sans antialiased">
        {/* Main Navbar */}
        <Navbar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          settings={settings}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12">
          {currentPage === 'home' && (
            <HomeView onNavigate={handleNavigate} settings={settings} />
          )}

          {currentPage === 'domestic-courier' && (
            <div className="space-y-6">
              <div className="text-center space-y-2 mb-4">
                <h1 className="text-3xl font-black text-[#102A43]">
                  Domestic Courier Booking
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
                  Doorstep collection and priority express delivery to 17,500+ Indian PIN codes via official DTDC Express network.
                </p>
              </div>
              <CourierBookingForm
                initialShipmentType="domestic"
                settings={settings}
                onTrackRedirect={(id) => handleNavigate('track', { query: id })}
              />
            </div>
          )}

          {currentPage === 'international-courier' && (
            <div className="space-y-6">
              <div className="text-center space-y-2 mb-4">
                <h1 className="text-3xl font-black text-[#102A43]">
                  International Courier Booking
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
                  Priority air freight and customs clearance to USA, UK, Canada, UAE, Singapore, Australia, and 220+ worldwide destinations.
                </p>
              </div>
              <CourierBookingForm
                initialShipmentType="international"
                settings={settings}
                onTrackRedirect={(id) => handleNavigate('track', { query: id })}
              />
            </div>
          )}

          {currentPage === 'shop' && (
            <ShopView
              onNavigateToRequest={() => handleNavigate('request-product')}
              onProceedToCheckout={() => setIsCheckoutOpen(true)}
              primaryPhone={settings?.primaryPhone}
            />
          )}

          {currentPage === 'request-product' && (
            <RequestProductForm settings={settings} />
          )}

          {currentPage === 'nri-services' && (
            <NriServicesView settings={settings} />
          )}

          {currentPage === 'track' && (
            <TrackShipmentView
              initialQuery={pageParams?.query || ''}
              settings={settings}
            />
          )}

          {currentPage === 'my-orders' && (
            <MyOrdersView
              onTrackShipment={(consignmentNum) =>
                handleNavigate('track', { query: consignmentNum })
              }
              settings={settings}
            />
          )}

          {currentPage === 'contact' && (
            <ContactView settings={settings} onNavigate={handleNavigate} />
          )}

          {currentPage === 'faq' && (
            <FaqView settings={settings} onNavigate={handleNavigate} />
          )}

          {currentPage === 'refund-policy' && (
            <RefundPolicyView settings={settings} onNavigate={handleNavigate} />
          )}

          {currentPage === 'terms' && (
            <TermsView settings={settings} onNavigate={handleNavigate} />
          )}

          {currentPage === 'privacy' && (
            <PrivacyView settings={settings} onNavigate={handleNavigate} />
          )}

          {currentPage === 'admin' && (
            <AdminDashboard
              settings={settings}
              onSettingsUpdated={(newSettings) => setSettings(newSettings)}
              onClose={() => handleNavigate('home')}
            />
          )}
        </main>

        {/* Global Cart Drawer */}
        <CartDrawer
          onProceedToCheckout={() => setIsCheckoutOpen(true)}
          onNavigateToShop={() => handleNavigate('shop')}
        />

        {/* Global Checkout Modal */}
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          settings={settings}
          onOrderSuccess={handleOrderSuccess}
        />

        {/* Global Floating WhatsApp Widget */}
        <WhatsAppFloatingWidget settings={settings} />

        {/* Global Footer */}
        <Footer onNavigate={handleNavigate} settings={settings} />
      </div>
    </CartProvider>
  );
}

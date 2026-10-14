import React, { useState } from 'react';
import {
  Phone,
  Mail,
  Search,
  ShoppingCart,
  Menu,
  X,
  Package,
  Globe,
  Sparkles,
  ShoppingBag,
  Clock,
  Shield,
  Lock,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { BusinessSettings } from '../types';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string, params?: any) => void;
  settings?: BusinessSettings;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  settings,
}) => {
  const { totalItems, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickTrackInput, setQuickTrackInput] = useState('');

  const primaryPhone = settings?.primaryPhone || '9445341812';
  const secondaryPhone = settings?.secondaryPhone || '9080656894';
  const supportEmail = settings?.supportEmail || 'milanexpress3515@gmail.com';

  const handleQuickTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickTrackInput.trim()) {
      onNavigate('track', { query: quickTrackInput.trim() });
      setQuickTrackInput('');
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'domestic-courier', label: 'Domestic Courier', icon: Package },
    { id: 'international-courier', label: 'International Courier', icon: Globe },
    { id: 'shop', label: 'Shop Indian Products', icon: ShoppingBag },
    { id: 'request-product', label: 'Request Product', icon: Sparkles },
    { id: 'nri-services', label: 'NRI Services', badge: 'Popular' },
    { id: 'track', label: 'Track Consignment', icon: Search },
    { id: 'my-orders', label: 'My Orders' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full shadow-sm">
      {/* Top Utility Bar */}
      <div className="bg-[#0B1C2D] text-slate-300 text-xs py-2 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          {/* Left contact info */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
            <div className="flex items-center gap-1.5 text-slate-200">
              <Phone className="w-3.5 h-3.5 text-[#F28C28]" />
              <span className="text-slate-400">Call / WhatsApp:</span>
              <a href={`tel:${primaryPhone}`} className="hover:text-white font-semibold">
                {primaryPhone}
              </a>
              <span className="text-slate-600">|</span>
              <a href={`tel:${secondaryPhone}`} className="hover:text-white font-semibold">
                {secondaryPhone}
              </a>
            </div>
            <div className="hidden lg:flex items-center gap-1.5 text-slate-300">
              <Mail className="w-3.5 h-3.5 text-[#F28C28]" />
              <a href={`mailto:${supportEmail}`} className="hover:text-white">
                {supportEmail}
              </a>
            </div>
          </div>

          {/* Right Partner & Quick Track */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-[11px] bg-slate-800/80 px-2.5 py-0.5 rounded border border-slate-700">
              <span className="font-extrabold text-red-500">DTDC</span>
              <span className="text-slate-400">Authorized Channel Partner #{settings?.dtdcPartnerBranch ? 'Franchise' : 'TN-CHN-3515'}</span>
            </div>

            {/* Quick Track Input form */}
            <form onSubmit={handleQuickTrackSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder="Enter DTDC Tracking Number / AWB Number"
                value={quickTrackInput}
                onChange={(e) => setQuickTrackInput(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-full px-3 py-1 pr-7 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#F28C28] w-40 sm:w-64 transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 text-slate-400 hover:text-[#F28C28]"
                aria-label="Quick Track"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>

            <button
              onClick={() => onNavigate('admin')}
              className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 pl-2 border-l border-slate-700"
              title="Staff & Admin Portal"
            >
              <Lock className="w-3 h-3 text-[#F28C28]" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 text-left focus:outline-none group"
          >
            <div className="w-11 h-11 rounded-xl bg-[#102A43] flex items-center justify-center text-white font-black text-xl shadow-md border border-[#243B53] group-hover:scale-105 transition-transform">
              <span className="text-[#F28C28]">M</span>
              <span>E</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl text-[#102A43] tracking-tight">
                  MILAN EXPRESS
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-[#F28C28] uppercase tracking-wide">
                  Channel Partner
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium tracking-tight">
                Your Trusted Partner for Shipping & Shopping
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all relative flex items-center gap-1.5 ${
                    active
                      ? 'bg-[#102A43] text-white shadow-xs'
                      : 'text-slate-700 hover:text-[#102A43] hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                  {link.badge && (
                    <span className="bg-[#F28C28] text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold ml-0.5">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons & Mobile Hamburger */}
          <div className="flex items-center gap-2.5">
            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:text-[#102A43] hover:bg-slate-50 transition-colors focus:outline-none"
              aria-label="View Cart"
            >
              <ShoppingCart className="w-5 h-5 text-[#102A43]" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#F28C28] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-scale">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Quick Book CTA button */}
            <button
              onClick={() => onNavigate('domestic-courier')}
              className="hidden sm:inline-flex items-center gap-1.5 bg-[#F28C28] hover:bg-[#E07817] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <Package className="w-4 h-4" />
              <span>Book Courier</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-2 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={() => {
                onNavigate('domestic-courier');
                setMobileMenuOpen(false);
              }}
              className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 font-bold text-xs flex items-center gap-2"
            >
              <Package className="w-4 h-4 text-blue-700" />
              <span>Book Courier</span>
            </button>
            <button
              onClick={() => {
                onNavigate('shop');
                setMobileMenuOpen(false);
              }}
              className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-[#102A43] font-bold text-xs flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-[#F28C28]" />
              <span>Shop Products</span>
            </button>
          </div>

          <div className="space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  onNavigate(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between ${
                  currentPage === link.id
                    ? 'bg-[#102A43] text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[10px] bg-[#F28C28] text-white px-2 py-0.5 rounded-full font-bold">
                    {link.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2 text-xs text-slate-600">
            <div className="flex items-center gap-2 font-medium">
              <Phone className="w-3.5 h-3.5 text-[#F28C28]" />
              <span>Call: {primaryPhone} / {secondaryPhone}</span>
            </div>
            <div className="flex items-center gap-2 font-medium">
              <Mail className="w-3.5 h-3.5 text-[#F28C28]" />
              <span>{supportEmail}</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

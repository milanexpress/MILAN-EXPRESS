import React, { useState, useEffect } from 'react';
import {
  Package,
  Globe,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
  Truck,
  CheckCircle2,
  Star,
  Layers,
  Phone,
  MessageCircle,
  Clock,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import { api } from '../services/api';
import { BusinessSettings, Product } from '../types';
import { useCart } from '../context/CartContext';
import { openWhatsAppChat } from '../utils/whatsapp';
import { DtdcPartnerBadge } from './DtdcPartnerBadge';

interface HomeViewProps {
  onNavigate: (page: string, params?: any) => void;
  settings?: BusinessSettings;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, settings }) => {
  const { addToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [heroTrackInput, setHeroTrackInput] = useState('');
  const primaryPhone = settings?.primaryPhone || '9445341812';
  const secondaryPhone = settings?.secondaryPhone || '9080656894';

  useEffect(() => {
    api.getProducts().then((prods) => {
      setFeaturedProducts(prods.slice(0, 4));
    });
  }, []);

  const handleHeroTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroTrackInput.trim()) {
      onNavigate('track', { query: heroTrackInput.trim() });
    }
  };

  return (
    <div className="space-y-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#102A43] via-[#0B1C2D] to-[#102A43] text-white p-6 sm:p-12 lg:p-16 border border-slate-800 shadow-2xl">
        {/* Subtle decorative glowing background shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F28C28]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

        <div className="relative z-10 max-w-4xl space-y-6">
          {/* Channel Partner Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#F28C28] animate-pulse"></span>
            <span className="text-[#F28C28] font-black uppercase tracking-wider">Milan Express</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-200">Authorized DTDC Channel Partner</span>
          </div>

          {/* Headline & Subhead */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
            Your Trusted Partner for <br />
            <span className="text-[#F28C28] underline decoration-wavy decoration-[#F28C28]/40 underline-offset-8">
              Shipping & Shopping.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Direct priority domestic and international courier booking through DTDC, authentic Indian food & pooja e-commerce, NRI package consolidation, and personal procurement assistance worldwide.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('domestic-courier')}
              className="px-6 py-3.5 rounded-2xl bg-[#F28C28] hover:bg-[#E07817] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
            >
              <Package className="w-4 h-4" />
              <span>Book Courier (Domestic & Global)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('shop')}
              className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm flex items-center gap-2 backdrop-blur-sm transition-all duration-200"
            >
              <ShoppingBag className="w-4 h-4 text-[#F28C28]" />
              <span>Shop Indian Products</span>
            </button>

            <button
              onClick={() => onNavigate('nri-services')}
              className="px-5 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>NRI Services</span>
            </button>
          </div>

          {/* Quick Consignment Tracking Bar right in Hero */}
          <div className="pt-6 border-t border-white/10 max-w-xl">
            <div className="text-xs text-slate-400 font-semibold mb-2 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-[#F28C28]" />
              <span>Quick Consignment Tracking:</span>
            </div>
            <form onSubmit={handleHeroTrack} className="flex gap-2">
              <input
                type="text"
                value={heroTrackInput}
                onChange={(e) => setHeroTrackInput(e.target.value)}
                placeholder="Enter DTDC Tracking Number / AWB Number"
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#F28C28] backdrop-blur-md"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-white text-[#102A43] hover:bg-slate-100 font-extrabold text-xs transition-colors shrink-0"
              >
                Track Shipment
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 2. OFFICIAL DTDC PARTNER SPOTLIGHT */}
      <DtdcPartnerBadge branchCode={settings?.dtdcPartnerBranch || 'TN-CHN-3515'} />

      {/* 3. FOUR CORE SERVICES */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-[#102A43] tracking-tight">
            Comprehensive Logistics & Procurement Services
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Tailored solutions for individuals, e-commerce buyers, businesses, and global NRIs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Domestic Courier */}
          <div
            onClick={() => onNavigate('domestic-courier')}
            className="p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-[#102A43] shadow-xs hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center group-hover:bg-[#102A43] group-hover:text-white transition-colors">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#102A43] group-hover:text-[#F28C28] transition-colors">
                Domestic Courier Booking
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Doorstep pickup and express air/surface courier to over 17,500 PIN codes across India via DTDC Priority network.
              </p>
            </div>
            <div className="pt-2 text-xs font-bold text-[#102A43] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Book Domestic Parcel</span>
              <ChevronRight className="w-4 h-4 text-[#F28C28]" />
            </div>
          </div>

          {/* Card 2: International Courier */}
          <div
            onClick={() => onNavigate('international-courier')}
            className="p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-[#102A43] shadow-xs hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-800 flex items-center justify-center group-hover:bg-purple-700 group-hover:text-white transition-colors">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#102A43] group-hover:text-[#F28C28] transition-colors">
                International Express Courier
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Reliable worldwide delivery to USA, UK, Canada, UAE, Singapore, Australia, and 220+ countries with full customs assistance.
              </p>
            </div>
            <div className="pt-2 text-xs font-bold text-[#102A43] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>International Booking</span>
              <ChevronRight className="w-4 h-4 text-[#F28C28]" />
            </div>
          </div>

          {/* Card 3: NRI Package Consolidation */}
          <div
            onClick={() => onNavigate('nri-services')}
            className="p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-[#102A43] shadow-xs hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#F28C28] flex items-center justify-center group-hover:bg-[#F28C28] group-hover:text-white transition-colors">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#102A43] group-hover:text-[#F28C28] transition-colors">
                NRI Package Consolidation
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Order from multiple Indian stores or relatives to our hub. We combine and repack compactly to save up to 60% on air freight.
              </p>
            </div>
            <div className="pt-2 text-xs font-bold text-[#102A43] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Explore NRI Services</span>
              <ChevronRight className="w-4 h-4 text-[#F28C28]" />
            </div>
          </div>

          {/* Card 4: Request Product from India */}
          <div
            onClick={() => onNavigate('request-product')}
            className="p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-[#102A43] shadow-xs hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#102A43] group-hover:text-[#F28C28] transition-colors">
                Request a Product from India
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Cannot find your desired product online? Our procurement team visits specific shops in Tamil Nadu or across India on your behalf.
              </p>
            </div>
            <div className="pt-2 text-xs font-bold text-[#102A43] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Submit Custom Request</span>
              <ChevronRight className="w-4 h-4 text-[#F28C28]" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/80 shadow-xs space-y-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#F28C28]">
            Simple & Transparent Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#102A43] tracking-tight">
            How Milan Express Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            From pickup to final delivery — professional logistics backed by DTDC.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {/* Step 1 */}
          <div className="space-y-3 text-center sm:text-left relative">
            <div className="w-12 h-12 rounded-2xl bg-[#102A43] text-[#F28C28] font-black text-lg flex items-center justify-center shadow-md mx-auto sm:mx-0">
              01
            </div>
            <h4 className="font-bold text-sm text-[#102A43]">Submit Request Online</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Fill in sender & receiver addresses, contents, and approximate weight. Receive instant booking reference.
            </p>
          </div>

          {/* Step 2 */}
          <div className="space-y-3 text-center sm:text-left relative">
            <div className="w-12 h-12 rounded-2xl bg-[#102A43] text-white font-black text-lg flex items-center justify-center shadow-md mx-auto sm:mx-0">
              02
            </div>
            <h4 className="font-bold text-sm text-[#102A43]">Tariff Quotation & Pickup</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Our specialist reviews your parcel, shares discounted DTDC tariff quotation, and dispatches pickup executive.
            </p>
          </div>

          {/* Step 3 */}
          <div className="space-y-3 text-center sm:text-left relative">
            <div className="w-12 h-12 rounded-2xl bg-[#102A43] text-white font-black text-lg flex items-center justify-center shadow-md mx-auto sm:mx-0">
              03
            </div>
            <h4 className="font-bold text-sm text-[#102A43]">DTDC AWB Booking</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upon physical weighing at the counter, your official DTDC consignment number is generated and linked for tracking.
            </p>
          </div>

          {/* Step 4 */}
          <div className="space-y-3 text-center sm:text-left relative">
            <div className="w-12 h-12 rounded-2xl bg-[#F28C28] text-white font-black text-lg flex items-center justify-center shadow-md mx-auto sm:mx-0">
              04
            </div>
            <h4 className="font-bold text-sm text-[#102A43]">Doorstep Delivery</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Express air transit, customs clearance, and verified final handover to recipient in India or abroad.
            </p>
          </div>
        </div>
      </section>

      {/* 5. FEATURED E-COMMERCE PRODUCTS */}
      {featuredProducts.length > 0 && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#F28C28]">
                Authentic Indian Store
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#102A43] tracking-tight">
                Featured Indian Specialties
              </h2>
            </div>
            <button
              onClick={() => onNavigate('shop')}
              className="text-xs font-bold text-[#102A43] hover:text-[#F28C28] flex items-center gap-1 group"
            >
              <span>View Full Catalogue ({featuredProducts.length}+ Items)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => onNavigate('shop')}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
              >
                <div className="relative h-48 bg-slate-50 p-4">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 bg-[#102A43] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    Authentic
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-[#F28C28] uppercase">
                      {product.category}
                    </span>
                    <h4 className="font-bold text-xs sm:text-sm text-[#102A43] line-clamp-2 mt-0.5">
                      {product.title}
                    </h4>
                  </div>
                  <div className="flex items-baseline justify-between pt-1 border-t border-slate-100">
                    <span className="font-black text-base text-[#102A43]">
                      ₹{product.priceINR.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {product.weightGrams}g
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. GENUINE CUSTOMER REVIEWS */}
      <section className="bg-slate-50 rounded-3xl p-8 sm:p-12 border border-slate-200/80 space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-[#102A43] tracking-tight">
            Trusted by Customers Across the World
          </h2>
          <p className="text-xs text-slate-500">
            Real feedback from shippers, families, and NRI clients relying on Milan Express.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex text-amber-400 gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "Sent 12kg of homemade sweets and pooja brass deepams to my son in Dallas, USA. Milan Express vacuum-sealed each sweet box and packed them compactly. Reached within 5 days through DTDC International without a single scratch!"
            </p>
            <div className="pt-2 border-t border-slate-100">
              <div className="font-bold text-xs text-slate-900">Lakshmi Narayanan</div>
              <div className="text-[11px] text-slate-500">Mylapore, Chennai → Dallas, TX</div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex text-amber-400 gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "Their NRI package consolidation is a game changer. I had 4 different packages arriving from Flipkart and local relatives. Milan Express repacked everything into one sturdy carton and saved me nearly ₹4,500 on courier charges."
            </p>
            <div className="pt-2 border-t border-slate-100">
              <div className="font-bold text-xs text-slate-900">Dr. Karthik S.</div>
              <div className="text-[11px] text-slate-500">London, United Kingdom</div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex text-amber-400 gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "Super fast domestic courier pickup. Booked online at 10 AM, courier was collected from my office in T. Nagar by 1 PM, and delivered to my client in Bengaluru next morning with live DTDC tracking."
            </p>
            <div className="pt-2 border-t border-slate-100">
              <div className="font-bold text-xs text-slate-900">Suresh K.</div>
              <div className="text-[11px] text-slate-500">Chennai → Bengaluru Domestic Express</div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. BOTTOM CTA & WHATSAPP SUPPORT BANNER */}
      <section className="bg-gradient-to-r from-[#102A43] to-[#1E3A5F] rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-2xl sm:text-3xl font-black">Ready to Book or Need an Instant Quote?</h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Our logistics desk at Milan Express is ready to assist you on WhatsApp with doorstep collection, packaging recommendations, and international customs guidance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('domestic-courier')}
            className="px-6 py-3.5 rounded-2xl bg-[#F28C28] hover:bg-[#E07817] text-white font-bold text-xs sm:text-sm shadow-md transition-all"
          >
            Book Courier Now
          </button>

          <button
            onClick={() => openWhatsAppChat({ type: 'general' }, primaryPhone)}
            className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat: +91 {primaryPhone}</span>
          </button>
        </div>
      </section>
    </div>
  );
};

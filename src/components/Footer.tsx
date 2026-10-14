import React from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Package,
  Globe,
  ShoppingBag,
  ExternalLink,
  Heart,
} from 'lucide-react';
import { BusinessSettings } from '../types';

interface FooterProps {
  onNavigate: (page: string) => void;
  settings?: BusinessSettings;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, settings }) => {
  const primaryPhone = settings?.primaryPhone || '9445341812';
  const secondaryPhone = settings?.secondaryPhone || '9080656894';
  const supportEmail = settings?.supportEmail || 'milanexpress3515@gmail.com';
  const branchName = settings?.dtdcPartnerBranch || 'Chennai Central DTDC Authorized Franchise #TN-CHN-3515';

  return (
    <footer className="bg-[#0B1C2D] text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Top Partner Certification Bar */}
        <div className="mb-12 p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-[#102A43] border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
          <div className="flex items-center gap-4 text-left">
            <div className="bg-red-600 text-white font-black text-xl px-3 py-1.5 rounded tracking-wider shadow-sm shrink-0">
              DTDC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base">Authorized Channel Partner</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Franchise
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {branchName} — Authorized to accept, book, and dispatch priority domestic and worldwide consignments.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://www.dtdc.com/track-your-shipment/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <span>Official DTDC Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => onNavigate('track')}
              className="px-4 py-2 rounded-xl bg-[#F28C28] hover:bg-[#E07817] text-white text-xs font-bold transition-colors"
            >
              Track Live AWB
            </button>
          </div>
        </div>

        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#102A43] border border-[#243B53] flex items-center justify-center font-black text-xl">
                <span className="text-[#F28C28]">M</span>
                <span className="text-white">E</span>
              </div>
              <div>
                <h3 className="font-extrabold text-white text-lg tracking-tight">
                  MILAN EXPRESS
                </h3>
                <p className="text-xs text-[#F28C28] font-bold uppercase tracking-wider">
                  Channel Partner
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Your Trusted Partner for Shipping & Shopping. Connecting families, businesses, and non-resident Indians across the globe through reliable DTDC express courier networks and authentic Indian e-commerce procurement.
            </p>

            <div className="space-y-2 pt-2 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#F28C28] shrink-0 mt-0.5" />
                <a
                  href="https://www.google.com/maps/search/?api=1&query=No.42D%2C+Ground+Floor%2C+Bharani+Street%2C+Bharathi+Nagar%2C+Velachery%2C+Chennai+600042"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors group"
                  title="Open in Google Maps / Get Directions"
                >
                  <span className="font-semibold text-white block">MILAN EXPRESS</span>
                  <span className="text-slate-300 group-hover:text-white transition-colors">
                    No. 42D, Ground Floor, Bharani Street, Bharathi Nagar, Velachery, Chennai – 600042, Tamil Nadu, India.
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#F28C28] font-bold mt-1 block group-hover:underline">
                    Get Directions on Google Maps ↗
                  </span>
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#F28C28] shrink-0" />
                <div className="space-x-1">
                  <a href={`tel:${primaryPhone}`} className="hover:text-white font-medium">
                    +91 {primaryPhone}
                  </a>
                  <span>/</span>
                  <a href={`tel:${secondaryPhone}`} className="hover:text-white font-medium">
                    +91 {secondaryPhone}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#F28C28] shrink-0" />
                <a href={`mailto:${supportEmail}`} className="hover:text-white">
                  {supportEmail}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#F28C28] shrink-0" />
                <span>Mon - Sat: 9:00 AM - 9:00 PM | Sun: 10:00 AM - 2:00 PM</span>
              </div>
            </div>
          </div>

          {/* Col 2: Courier Services */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4 border-l-2 border-[#F28C28] pl-2.5">
              Courier Services
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onNavigate('domestic-courier')}
                  className="hover:text-white hover:underline transition-colors"
                >
                  Domestic Courier Booking
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('international-courier')}
                  className="hover:text-white hover:underline transition-colors"
                >
                  International Courier Booking
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('track')}
                  className="hover:text-white hover:underline transition-colors"
                >
                  DTDC AWB Consignment Tracking
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-white hover:underline transition-colors"
                >
                  Doorstep Pickup Request
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('domestic-courier')}
                  className="hover:text-white hover:underline transition-colors"
                >
                  Commercial Bulk Parcel Rates
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Shopping & NRI */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4 border-l-2 border-[#F28C28] pl-2.5">
              Shopping & NRI
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onNavigate('shop')}
                  className="hover:text-white hover:underline transition-colors"
                >
                  Shop Authentic Indian Products
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('request-product')}
                  className="hover:text-white hover:underline transition-colors"
                >
                  Request a Product from India
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('nri-services')}
                  className="hover:text-white hover:underline transition-colors"
                >
                  NRI Personal Shopper
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('nri-services')}
                  className="hover:text-white hover:underline transition-colors"
                >
                  Consolidated International Shipping
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('my-orders')}
                  className="hover:text-white hover:underline transition-colors"
                >
                  Order Status & Receipts
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust, Support & Policies */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4 border-l-2 border-[#F28C28] pl-2.5">
              Trust & Policies
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onNavigate('faq')}
                  className="hover:text-white hover:underline transition-colors"
                >
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('refund-policy')}
                  className="hover:text-white hover:underline transition-colors"
                >
                  Shipping, Cancellation & Refunds
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('privacy')}
                  className="hover:text-white hover:underline transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('terms')}
                  className="hover:text-white hover:underline transition-colors"
                >
                  Terms and Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-white hover:underline transition-colors"
                >
                  Contact & Branch Locator
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright and disclaimer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} Milan Express Channel Partner. All rights reserved.
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <span>DTDC is a registered trademark of DTDC Express Limited. Milan Express operates as an authorized franchisee channel partner.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

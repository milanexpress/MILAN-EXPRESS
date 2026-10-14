import React, { useState } from 'react';
import { MessageCircle, X, Package, ShoppingBag, FileText, Globe, PhoneCall } from 'lucide-react';
import { openWhatsAppChat } from '../utils/whatsapp';
import { BusinessSettings } from '../types';

interface WhatsAppFloatingWidgetProps {
  settings?: BusinessSettings;
}

export const WhatsAppFloatingWidget: React.FC<WhatsAppFloatingWidgetProps> = ({ settings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const primaryPhone = settings?.primaryPhone || '9445341812';
  const secondaryPhone = settings?.secondaryPhone || '9080656894';

  const handleSelectOption = (type: 'courier' | 'quotation' | 'product' | 'order' | 'nri') => {
    openWhatsAppChat({ type }, primaryPhone);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Options Popup */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-[#102A43] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-md">
                <MessageCircle className="w-6 h-6 fill-current" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Milan Express Support</h4>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Online | +91 {primaryPhone}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subheader info */}
          <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span>Choose topic for instant WhatsApp reply:</span>
            <span className="font-semibold text-[#F28C28]">Direct DTDC Partner</span>
          </div>

          {/* Action List */}
          <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
            <button
              onClick={() => handleSelectOption('courier')}
              className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all flex items-center gap-3 group"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                  Domestic & International Courier
                </div>
                <div className="text-[11px] text-slate-500">Book parcel pickup or tariff enquiry</div>
              </div>
            </button>

            <button
              onClick={() => handleSelectOption('quotation')}
              className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all flex items-center gap-3 group"
            >
              <div className="w-9 h-9 rounded-lg bg-orange-100 text-[#F28C28] flex items-center justify-center group-hover:bg-[#F28C28] group-hover:text-white transition-colors shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                  Instant Shipping Quotation
                </div>
                <div className="text-[11px] text-slate-500">Get discounted rates for heavy or urgent parcels</div>
              </div>
            </button>

            <button
              onClick={() => handleSelectOption('nri')}
              className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all flex items-center gap-3 group"
            >
              <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                  NRI Shopping & Consolidation
                </div>
                <div className="text-[11px] text-slate-500">Procure from Indian stores & combine parcels</div>
              </div>
            </button>

            <button
              onClick={() => handleSelectOption('product')}
              className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all flex items-center gap-3 group"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                  Product Purchase & Store Enquiry
                </div>
                <div className="text-[11px] text-slate-500">Enquire about traditional Indian products</div>
              </div>
            </button>

            <button
              onClick={() => handleSelectOption('order')}
              className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all flex items-center gap-3 group"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-slate-700 group-hover:text-white transition-colors shrink-0">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                  Order & Consignment Support
                </div>
                <div className="text-[11px] text-slate-500">Track delivery status or payment help</div>
              </div>
            </button>
          </div>

          {/* Quick numbers footer */}
          <div className="p-3 bg-slate-100 border-t border-slate-200 text-xs text-slate-700 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Need direct call?</span>
            <div className="flex gap-2">
              <a
                href={`tel:${primaryPhone}`}
                className="font-bold text-blue-700 hover:underline"
              >
                {primaryPhone}
              </a>
              <span>/</span>
              <a
                href={`tel:${secondaryPhone}`}
                className="font-bold text-blue-700 hover:underline"
              >
                {secondaryPhone}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white px-4 py-3.5 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
        aria-label="Contact on WhatsApp"
      >
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400"></span>
        </span>
        <MessageCircle className="w-6 h-6 fill-current" />
        <span className="hidden sm:inline-block font-bold text-sm">Chat on WhatsApp</span>
      </button>
    </div>
  );
};

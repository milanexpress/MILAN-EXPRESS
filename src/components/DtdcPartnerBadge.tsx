import React from 'react';
import { ShieldCheck, Truck, Globe, Award } from 'lucide-react';

interface DtdcPartnerBadgeProps {
  branchCode?: string;
  variant?: 'banner' | 'card' | 'pill';
  className?: string;
}

export const DtdcPartnerBadge: React.FC<DtdcPartnerBadgeProps> = ({
  branchCode = 'TN-CHN-3515',
  variant = 'banner',
  className = '',
}) => {
  if (variant === 'pill') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-semibold text-red-900 ${className}`}>
        <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
        <span className="font-bold text-red-700 tracking-wider">DTDC</span>
        <span className="text-gray-500">|</span>
        <span>Authorized Channel Partner #{branchCode}</span>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-gradient-to-br from-white to-red-50/40 p-5 rounded-2xl border border-red-200/80 shadow-sm ${className}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="bg-red-600 text-white font-black text-sm px-2.5 py-0.5 rounded tracking-widest shadow-xs">
                DTDC
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Official Franchise
              </span>
            </div>
            <h4 className="font-bold text-[#102A43] text-sm sm:text-base">
              Authorized DTDC Channel Partner
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Branch Franchise Code: <span className="font-mono font-bold text-slate-800">{branchCode}</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
            <Award className="w-5 h-5" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-red-100/80 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-red-600" />
            <span>17,500+ Indian PIN Codes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>220+ Global Destinations</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#102A43] text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden border border-slate-700 shadow-xl ${className}`}>
      {/* Decorative background glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F28C28]/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Crisp DTDC Badge */}
            <div className="inline-flex items-center gap-1.5 bg-white px-3 py-1 rounded-md shadow-sm">
              <span className="font-black text-base text-red-600 tracking-wider">DTDC</span>
              <span className="text-[10px] font-bold text-blue-900 uppercase tracking-tight">Express</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Authorized Channel Partner
            </span>
            <span className="text-xs text-slate-300 font-mono bg-slate-800/80 px-2 py-0.5 rounded">
              Franchise: {branchCode}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Direct Booking & Consignment Processing with DTDC
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            As an authorized DTDC Channel Partner, Milan Express delivers privileged commercial tariffs, priority counter handling, direct DTDC AWB consignment generation, and end-to-end doorstep collection for domestic and international shipments.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0 w-full sm:w-auto">
          <div className="bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-3 rounded-xl">
            <div className="text-xs text-slate-300">DTDC Domestic Priority</div>
            <div className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
              <Truck className="w-4 h-4 text-[#F28C28]" /> Next Day & Air Express
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-3 rounded-xl">
            <div className="text-xs text-slate-300">DTDC Global Network</div>
            <div className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
              <Globe className="w-4 h-4 text-emerald-400" /> USA, UK, UAE, Canada, SG & 220+
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

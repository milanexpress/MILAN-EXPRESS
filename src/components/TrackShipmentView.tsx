import React, { useState, useEffect } from 'react';
import {
  Search,
  Truck,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  Info,
  ArrowRight,
  Globe,
  Package,
} from 'lucide-react';
import { BusinessSettings } from '../types';
import { DtdcPartnerBadge } from './DtdcPartnerBadge';

interface TrackShipmentViewProps {
  initialQuery?: string;
  settings?: BusinessSettings;
}

export const TrackShipmentView: React.FC<TrackShipmentViewProps> = ({
  initialQuery = '',
  settings,
}) => {
  const [trackingNumber, setTrackingNumber] = useState(initialQuery);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastTrackedNumber, setLastTrackedNumber] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialQuery.trim()) {
      setTrackingNumber(initialQuery.trim());
    }
  }, [initialQuery]);

  const handleTrack = (numberToTrack: string) => {
    const trimmed = numberToTrack.trim();

    // Requirement 8: Validate input. If empty, show specific message
    if (!trimmed) {
      setErrorMessage('Please enter a valid DTDC tracking number.');
      return;
    }

    setErrorMessage('');
    setLastTrackedNumber(trimmed);

    // Requirement 6 & 7: URL format with encoded parameter
    // https://www.dtdc.com/track-your-shipment/?awb=TRACKING_NUMBER
    const encodedAwb = encodeURIComponent(trimmed);
    const dtdcUrl = `https://www.dtdc.com/track-your-shipment/?awb=${encodedAwb}`;

    // Requirement 9: Open in a new browser tab and preserve MILAN EXPRESS in the original tab
    window.open(dtdcUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleTrack(trackingNumber);
  };

  const handleOpenDtdcDirect = () => {
    // Requirement 13: Open official tracking page without parameter for manual entry
    window.open('https://www.dtdc.com/track-your-shipment/', '_blank', 'noopener,noreferrer');
  };

  const handleCopyAwb = () => {
    if (lastTrackedNumber) {
      navigator.clipboard.writeText(lastTrackedNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Top Banner & Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-100 text-[#102A43] text-xs font-bold uppercase tracking-wider">
          <Truck className="w-3.5 h-3.5 text-[#F28C28]" />
          <span>Official DTDC Consignment Tracking</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#102A43] tracking-tight">
          Track Your DTDC Consignment
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
          Authorized DTDC Channel Partner tracking. Live, authentic shipment status directly from DTDC's official tracking network.
        </p>
      </div>

      {/* Main Tracking Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              {/* Requirement 3: placeholder: “Enter DTDC Tracking Number / AWB Number” */}
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => {
                  setTrackingNumber(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="Enter DTDC Tracking Number / AWB Number"
                className={`w-full pl-12 pr-4 py-3.5 text-xs sm:text-sm font-mono border-2 rounded-2xl focus:outline-none transition-colors ${
                  errorMessage
                    ? 'border-red-400 focus:border-red-500 bg-red-50/20'
                    : 'border-slate-200 focus:border-[#102A43]'
                }`}
              />
            </div>

            {/* Requirement 4: Button labeled “Track Shipment” */}
            <button
              type="submit"
              className="bg-[#102A43] hover:bg-[#243B53] text-white px-8 py-3.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all shrink-0 cursor-pointer"
            >
              <Search className="w-4 h-4 text-[#F28C28]" />
              <span>Track Shipment</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>
          </div>

          {/* Requirement 8: Validation message if empty */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span className="font-semibold">{errorMessage}</span>
            </div>
          )}

          {/* Requirement 11: Supporting text below the button */}
          <p className="text-xs text-slate-500 text-center sm:text-left flex items-center justify-center sm:justify-start gap-1.5 pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Track your domestic and international shipments securely through the official DTDC website.</span>
          </p>
        </form>

        {/* Post-track helper / fallback instructions (Requirement 13) */}
        {lastTrackedNumber && (
          <div className="mt-4 pt-5 border-t border-slate-200 bg-slate-50 rounded-2xl p-4 sm:p-5 space-y-3 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Tracking Number:</span>
                <span className="font-mono font-black text-sm text-[#102A43] bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  {lastTrackedNumber}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyAwb}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Copy tracking number"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy AWB</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleTrack(lastTrackedNumber)}
                  className="px-3 py-1.5 rounded-lg bg-[#102A43] text-white text-xs font-bold hover:bg-[#243B53] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Re-open Tracking</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Requirement 13: Clear fallback instructions if DTDC does not auto-populate parameter */}
            <div className="p-3 bg-white rounded-xl border border-blue-100 text-xs text-slate-600 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-[#102A43]">
                <Info className="w-3.5 h-3.5 text-[#F28C28]" />
                <span>Having trouble viewing tracking status?</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                We forwarded your AWB directly to DTDC’s portal. If the official page does not automatically display the tracking status for your consignment, click below to open the official DTDC portal directly, copy your AWB number above, and paste it into the DTDC search bar manually.
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleOpenDtdcDirect}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 hover:text-red-800 underline cursor-pointer"
                >
                  <span>Open DTDC Official Tracking Portal (Manual Entry)</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DTDC Authorized Channel Partner Badge */}
      <DtdcPartnerBadge branchCode={settings?.dtdcPartnerBranch || 'TN-CHN-3515'} />

      {/* Official Network Information Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-[#102A43]">Official DTDC Verification</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Consignment statuses are retrieved in real-time straight from DTDC Express Limited servers for 100% authenticity.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-[#102A43]">17,500+ Indian PIN Codes</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Track domestic consignments, document pouches, festival sweets, and commercial parcels across India.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#F28C28] flex items-center justify-center font-bold">
            <Globe className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-[#102A43]">220+ Global Destinations</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Track DTDC International express airway bills to USA, UK, Canada, UAE, Singapore, Australia, and worldwide.
          </p>
        </div>
      </div>
    </div>
  );
};

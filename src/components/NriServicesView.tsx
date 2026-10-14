import React, { useState } from 'react';
import {
  Globe,
  Package,
  Layers,
  Sparkles,
  Gift,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Plane,
  Scale,
  MessageCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { BusinessSettings, NRIShoppingRequest } from '../types';
import { openWhatsAppChat } from '../utils/whatsapp';
import { DtdcPartnerBadge } from './DtdcPartnerBadge';

interface NriServicesViewProps {
  settings?: BusinessSettings;
  onRequestSubmitted?: (req: NRIShoppingRequest) => void;
}

export const NriServicesView: React.FC<NriServicesViewProps> = ({
  settings,
  onRequestSubmitted,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedNri, setSubmittedNri] = useState<NRIShoppingRequest | null>(null);

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerWhatsApp, setCustomerWhatsApp] = useState('');
  const [destinationCountry, setDestinationCountry] = useState('United States');
  const [serviceType, setServiceType] = useState<
    'personal_shopper' | 'package_consolidation' | 'festival_hampers' | 'wedding_bulk'
  >('package_consolidation');
  const [isConsolidatedShipment, setIsConsolidatedShipment] = useState(true);
  const [expectedPackagesCount, setExpectedPackagesCount] = useState<number>(3);
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Dynamic Item List
  const [items, setItems] = useState<
    { itemName: string; details?: string; quantity: number; preferredShopOrBrand?: string }[]
  >([
    { itemName: '', details: '', quantity: 1, preferredShopOrBrand: '' },
  ]);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { itemName: '', details: '', quantity: 1, preferredShopOrBrand: '' },
    ]);
  };

  const handleRemoveItem = (idx: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx: number, field: string, value: any) => {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerWhatsApp) {
      setErrorMsg('Please provide your name and WhatsApp number for international correspondence.');
      return;
    }
    const validItems = items.filter((i) => i.itemName.trim().length > 0);
    if (validItems.length === 0) {
      setErrorMsg('Please specify at least one product or package you wish to consolidate or purchase.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload: Partial<NRIShoppingRequest> = {
        customerName,
        customerEmail,
        customerWhatsApp,
        destinationCountry,
        serviceType,
        itemList: validItems,
        isConsolidatedShipment,
        expectedPackagesCount: isConsolidatedShipment ? Number(expectedPackagesCount) : 1,
        additionalNotes,
      };

      const res = await api.createNriRequest(payload);
      if (res.success && res.request) {
        setSubmittedNri(res.request);
        onRequestSubmitted?.(res.request);
      } else {
        setErrorMsg('Failed to save NRI request. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while saving request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-100 text-[#102A43] text-xs font-bold uppercase tracking-wider">
          <Globe className="w-3.5 h-3.5 text-[#F28C28]" />
          <span>Worldwide NRI Assistance & Consolidated Shipping</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#102A43] tracking-tight">
          Shop Anywhere in India. <br />
          <span className="text-[#F28C28]">We Pack & Deliver Worldwide.</span>
        </h1>
        <p className="text-xs sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Living in the USA, UK, Canada, UAE, Singapore, or Australia? Milan Express acts as your personal shopping assistant and consolidated transit hub in India. We collect parcels from multiple stores or your family, discard redundant packaging, repack efficiently to cut volumetric air freight by up to 60%, and dispatch via DTDC International Express.
        </p>
      </div>

      {/* 4 Pillars Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#F28C28] flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[#102A43]">Package Consolidation</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Order from Amazon, Flipkart, Myntra, or local sweet shops to our Chennai hub. We combine multiple boxes into 1 rigid export carton.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[#102A43]">Personal Shopper</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Need items from local bazaars (T. Nagar silks, Mylapore brass, authentic herbs)? Our staff visits the physical market on your behalf.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Gift className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[#102A43]">Festival & Wedding Hampers</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Custom gift hampers, vacuum-sealed savouries, return gifts, and pooja sets curated and shipped directly to overseas guests.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
            <Plane className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[#102A43]">DTDC Global Air Cargo</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Express 4-7 business days customs-cleared transit with door-to-door tracking across 220+ international destinations.
          </p>
        </div>
      </div>

      {/* DTDC Global Partner Section */}
      <DtdcPartnerBadge branchCode={settings?.dtdcPartnerBranch || 'TN-CHN-3515'} />

      {/* Submitted Success Confirmation */}
      {submittedNri ? (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-[#102A43] text-lg">
                  NRI Consolidation Request Created!
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  {submittedNri.id}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                We have registered your destination ({submittedNri.destinationCountry}) and {submittedNri.itemList.length} item requirements. Our international logistics manager will prepare a custom consolidated freight quotation and contact you on WhatsApp.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3">
            <div className="font-bold text-slate-800">Next Steps:</div>
            <ol className="list-decimal pl-4 space-y-1 text-slate-600">
              <li>Our team will share our Milan Express Chennai Warehouse Hub address for routing your vendor parcels.</li>
              <li>Upon arrival, we inspect contents, send photos on WhatsApp, discard excess bulk boxes, and weigh the consolidated package.</li>
              <li>You approve the finalized DTDC international airway bill quotation and we dispatch.</li>
            </ol>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
            <button
              onClick={() => setSubmittedNri(null)}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Submit Another Request
            </button>

            <button
              onClick={() =>
                openWhatsAppChat(
                  {
                    type: 'nri',
                    context: {
                      bookingId: submittedNri.id,
                      destination: submittedNri.destinationCountry,
                    },
                  },
                  settings?.primaryPhone
                )
              }
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Connect on WhatsApp with NRI Desk</span>
            </button>
          </div>
        </div>
      ) : (
        /* NRI Request Form */
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8">
          <div>
            <h2 className="text-2xl font-black text-[#102A43] tracking-tight">
              Request NRI Shopping or Package Consolidation
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Share the products or parcels you want to source or combine. We will reply with an exact itemized quotation.
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service & Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Required NRI Service *
                </label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-[#102A43]"
                >
                  <option value="package_consolidation">
                    Package Consolidation (Combine parcels from multiple stores)
                  </option>
                  <option value="personal_shopper">
                    Personal Shopper (Milan Express buys from Indian markets)
                  </option>
                  <option value="festival_hampers">
                    Festival & Sweets Hamper (Diwali, Pongal, Special Occasions)
                  </option>
                  <option value="wedding_bulk">
                    Wedding & Return Gifts Procurement & Shipping
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Delivery Destination Country *
                </label>
                <select
                  value={destinationCountry}
                  onChange={(e) => setDestinationCountry(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-[#102A43]"
                >
                  <option value="United States">United States (USA)</option>
                  <option value="United Kingdom">United Kingdom (UK)</option>
                  <option value="Canada">Canada</option>
                  <option value="United Arab Emirates">United Arab Emirates (UAE)</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Australia">Australia</option>
                  <option value="Malaysia">Malaysia</option>
                  <option value="Germany">Germany / Europe</option>
                  <option value="Other">Other Global Destination</option>
                </select>
              </div>
            </div>

            {/* Customer Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Anand Chandrasekar"
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#102A43]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  WhatsApp Number (with Country Code) *
                </label>
                <input
                  type="tel"
                  required
                  value={customerWhatsApp}
                  onChange={(e) => setCustomerWhatsApp(e.target.value)}
                  placeholder="e.g. +1 408 555 0123"
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#102A43]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="e.g. anand@example.com"
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#102A43]"
                />
              </div>
            </div>

            {/* Items Checklist Builder */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-[#102A43]">
                    Itemized Procurement / Consolidation Manifest
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Add the products or vendor parcels you want us to collect or buy
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 py-1.5 rounded-lg bg-[#102A43] text-white text-xs font-semibold flex items-center gap-1 hover:bg-[#243B53]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Item</span>
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                  >
                    <div className="sm:col-span-4">
                      <input
                        type="text"
                        required
                        placeholder="Item Name (e.g. Mysore Pak 1kg)"
                        value={item.itemName}
                        onChange={(e) => handleItemChange(idx, 'itemName', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#102A43]"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        placeholder="Preferred Brand / Store"
                        value={item.preferredShopOrBrand || ''}
                        onChange={(e) =>
                          handleItemChange(idx, 'preferredShopOrBrand', e.target.value)
                        }
                        className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#102A43]"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        placeholder="Notes (size, flavor)"
                        value={item.details || ''}
                        onChange={(e) => handleItemChange(idx, 'details', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#102A43]"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(idx, 'quantity', parseInt(e.target.value) || 1)
                        }
                        className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg text-center"
                      />
                    </div>
                    <div className="sm:col-span-1 text-right">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Consolidation Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-orange-50/60 border border-orange-200/80">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isConsolidatedShipment}
                  onChange={(e) => setIsConsolidatedShipment(e.target.checked)}
                  className="mt-1 text-[#F28C28] rounded"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">
                    Consolidate into single compact shipment
                  </span>
                  <span className="text-slate-600 text-[11px]">
                    We will remove individual bulky vendor boxes and repack securely to minimize dimensional weight.
                  </span>
                </div>
              </label>

              {isConsolidatedShipment && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Expected Number of Incoming Packages
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={expectedPackagesCount}
                    onChange={(e) => setExpectedPackagesCount(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Additional Instructions & Destination Address
              </label>
              <textarea
                rows={2}
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Mention overseas delivery address, target delivery date, or any special customs declarations..."
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#102A43]"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#F28C28] hover:bg-[#E07817] disabled:opacity-50 text-white px-8 py-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                {isSubmitting ? (
                  <span>Saving Request...</span>
                ) : (
                  <>
                    <span>Submit for International Quotation</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

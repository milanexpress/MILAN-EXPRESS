import React, { useState } from 'react';
import {
  Sparkles,
  Upload,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  MessageCircle,
  HelpCircle,
  ShoppingBag,
  Store,
  Globe,
} from 'lucide-react';
import { api } from '../services/api';
import { BusinessSettings, ProductPurchaseRequest } from '../types';
import { openWhatsAppChat } from '../utils/whatsapp';

interface RequestProductFormProps {
  settings?: BusinessSettings;
  onRequestSubmitted?: (req: ProductPurchaseRequest) => void;
}

export const RequestProductForm: React.FC<RequestProductFormProps> = ({
  settings,
  onRequestSubmitted,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedReq, setSubmittedReq] = useState<ProductPurchaseRequest | null>(null);

  // Form fields
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerWhatsApp, setCustomerWhatsApp] = useState('');
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [referenceUrlOrStore, setReferenceUrlOrStore] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [deliveryCountry, setDeliveryCountry] = useState('United States');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Image size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerWhatsApp || !productName || !productDescription) {
      setErrorMsg('Please fill in your contact information and detailed product description.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload: Partial<ProductPurchaseRequest> = {
        customerName,
        customerEmail,
        customerWhatsApp,
        productName,
        productDescription,
        referenceUrlOrStore,
        imageUrl: imagePreview,
        quantity: Number(quantity) || 1,
        deliveryCountry,
        deliveryAddress,
        additionalInstructions,
      };

      const res = await api.createPurchaseRequest(payload);
      if (res.success && res.request) {
        setSubmittedReq(res.request);
        onRequestSubmitted?.(res.request);
      } else {
        setErrorMsg('Failed to submit purchase request. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while saving request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedReq(null);
    setProductName('');
    setProductDescription('');
    setReferenceUrlOrStore('');
    setImagePreview(undefined);
    setQuantity(1);
    setAdditionalInstructions('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Intro Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-[#102A43] text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#F28C28]" />
          <span>India Personal Procurement Service</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#102A43] tracking-tight">
          Request Any Product from India
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          Cannot find what you need in our shop? Tell us the item, store, or artisan in India (Sweets, Silks, Brassware, Books, Spices, Herbal medicines). Milan Express procures it, checks quality, and couriers it to your doorstep worldwide!
        </p>
      </div>

      {submittedReq ? (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-[#102A43] text-lg">
                  Procurement Request Registered!
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  {submittedReq.id}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Our procurement executive in Chennai will visit the store / verify item availability, compute product cost + DTDC international shipping charges, and share a formal quotation with you on WhatsApp.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block">Requested Product:</span>
              <span className="font-bold text-slate-900 text-sm">{submittedReq.productName}</span>
              <p className="text-slate-600 mt-1">{submittedReq.productDescription}</p>
            </div>
            <div>
              <span className="text-slate-500 block">Store / Reference:</span>
              <span className="font-semibold text-slate-800">
                {submittedReq.referenceUrlOrStore || 'Any authentic vendor in India'}
              </span>
              <div className="mt-2 text-slate-600">
                Destination: <span className="font-bold text-slate-800">{submittedReq.deliveryCountry}</span> (Qty: {submittedReq.quantity})
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
            <button
              onClick={handleReset}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Submit Another Request
            </button>

            <button
              onClick={() =>
                openWhatsAppChat(
                  {
                    type: 'product',
                    context: { productName: `${submittedReq.productName} (Req: ${submittedReq.id})` },
                  },
                  settings?.primaryPhone
                )
              }
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Discuss Details on WhatsApp</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Details */}
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
                  placeholder="e.g. S. Meenakshi"
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#102A43]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  WhatsApp Number (with country code) *
                </label>
                <input
                  type="tel"
                  required
                  value={customerWhatsApp}
                  onChange={(e) => setCustomerWhatsApp(e.target.value)}
                  placeholder="e.g. +1 408 555 0199 or 9445341812"
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
                  placeholder="e.g. meena@gmail.com"
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#102A43]"
                />
              </div>
            </div>

            {/* Product Details */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Product Name / Item You Want Procured *
                  </label>
                  <input
                    type="text"
                    required
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g. Nalli Silks Peacock Blue Soft Silk Saree / Sri Krishna Sweets Mysurpa"
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-[#102A43]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Quantity Required *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-[#102A43]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Detailed Item Description & Specifications *
                </label>
                <textarea
                  required
                  rows={3}
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  placeholder="Mention color, size, material, brand, spice level, festival requirement, or any specific instructions..."
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-[#102A43]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Preferred Shop, Market or Web Link
                  </label>
                  <input
                    type="text"
                    value={referenceUrlOrStore}
                    onChange={(e) => setReferenceUrlOrStore(e.target.value)}
                    placeholder="e.g. T. Nagar Nalli, Mylapore Giri Trading, or Amazon.in URL"
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-[#102A43]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Upload Reference Photo / Catalog Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#102A43] file:text-white hover:file:bg-[#243B53]"
                  />
                  {imagePreview && (
                    <div className="mt-2 flex items-center gap-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-12 h-12 object-cover rounded-lg border border-slate-300"
                      />
                      <span className="text-[11px] text-emerald-600 font-semibold">
                        Image attached
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Delivery Destination Country *
                </label>
                <select
                  value={deliveryCountry}
                  onChange={(e) => setDeliveryCountry(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-[#102A43]"
                >
                  <option value="United States">United States (USA)</option>
                  <option value="United Kingdom">United Kingdom (UK)</option>
                  <option value="Canada">Canada</option>
                  <option value="United Arab Emirates">United Arab Emirates (UAE)</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Australia">Australia</option>
                  <option value="Malaysia">Malaysia</option>
                  <option value="India">India (Inter-State Procurement)</option>
                  <option value="Other">Other Global Destination</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Destination City & Postal Code (Optional)
                </label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="e.g. San Jose, CA 95123"
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-[#102A43]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Additional Instructions
              </label>
              <textarea
                rows={2}
                value={additionalInstructions}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
                placeholder="e.g. Need vacuum packaging for food items, gift wrapping for wedding prasad..."
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
                  <span>Submitting Request...</span>
                ) : (
                  <>
                    <span>Submit Procurement Request</span>
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

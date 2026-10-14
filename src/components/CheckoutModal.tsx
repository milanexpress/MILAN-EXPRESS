import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import {
  X,
  ShieldCheck,
  CreditCard,
  QrCode,
  CheckCircle,
  Copy,
  AlertCircle,
  ArrowRight,
  Printer,
  MessageCircle,
  Clock,
  Truck,
  ExternalLink,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { BusinessSettings, Order } from '../types';
import { openWhatsAppChat } from '../utils/whatsapp';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings?: BusinessSettings;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  settings,
  onOrderSuccess,
}) => {
  const { items, subtotalINR, totalWeightGrams, clearCart } = useCart();

  const [step, setStep] = useState<'details' | 'payment' | 'receipt'>('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Form Fields
  const [destinationType, setDestinationType] = useState<'domestic' | 'international'>('domestic');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [country, setCountry] = useState('India');
  const [orderNotes, setOrderNotes] = useState('');

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<'upi_qr' | 'razorpay'>('upi_qr');
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string | undefined>(undefined);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Settings defaults
  const upiId = settings?.upiId || 'milanexpress3515@okaxis';
  const upiPayee = settings?.upiPayeeName || 'Milan Express Logistics & Services';
  const domesticFlatRate = settings?.domesticFlatShippingINR ?? 80;
  const freeThreshold = settings?.freeShippingThresholdINR ?? 1500;
  const internationalRatePerKg = settings?.internationalBaseRatePerKgINR ?? 1150;

  // Shipping calculation
  const totalWeightKg = Math.max(0.5, totalWeightGrams / 1000);
  let shippingCharges = 0;
  if (destinationType === 'domestic') {
    shippingCharges = subtotalINR >= freeThreshold ? 0 : domesticFlatRate;
  } else {
    shippingCharges = Math.ceil(totalWeightKg) * internationalRatePerKg;
  }

  const grandTotalINR = subtotalINR + shippingCharges;

  // Generate dynamic QR code when moving to payment step or when grandTotal changes
  useEffect(() => {
    if (step === 'payment' && paymentMethod === 'upi_qr') {
      const tempId = `MEX-${Date.now().toString().slice(-6)}`;
      const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
        upiPayee
      )}&am=${grandTotalINR}&cu=INR&tn=${encodeURIComponent('Milan Express Order ' + tempId)}`;

      QRCode.toDataURL(upiUrl, {
        width: 260,
        margin: 2,
        color: { dark: '#102A43', light: '#FFFFFF' },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('Failed to generate QR code', err));
    }
  }, [step, paymentMethod, grandTotalINR, upiId, upiPayee]);

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Proof file must be under 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setScreenshotDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerMobile.trim() || !deliveryAddress.trim() || !pinCode.trim()) {
      setErrorMsg('Please fill in all required delivery details.');
      return;
    }
    setErrorMsg('');
    setStep('payment');
  };

  const handleCompleteOrder = async () => {
    if (paymentMethod === 'upi_qr' && !utrNumber.trim()) {
      setErrorMsg('Please enter the 12-digit UPI Reference / UTR Number from your payment app.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const orderPayload: Partial<Order> = {
        customerName,
        customerEmail: customerEmail || `${customerMobile}@milanexpress.in`,
        customerMobile,
        deliveryAddress,
        city: city || 'City',
        state: state || 'State',
        pinCode,
        country: destinationType === 'domestic' ? 'India' : country,
        orderNotes,
        items: items.map((i) => ({
          productId: i.product.id,
          title: i.product.title,
          priceINR: i.product.priceINR,
          quantity: i.quantity,
          image: i.product.image,
          weightGrams: i.product.weightGrams,
        })),
        subtotalINR,
        shippingChargesINR: shippingCharges,
        totalINR: grandTotalINR,
        paymentMethod,
        paymentTransactionRef:
          paymentMethod === 'upi_qr'
            ? utrNumber.trim()
            : `RZP_PAY_${Date.now().toString().slice(-8)}`,
        paymentScreenshotUrl: screenshotDataUrl,
      };

      const res = await api.createOrder(orderPayload);
      if (res.success && res.order) {
        setConfirmedOrder(res.order);
        setStep('receipt');
        clearCart();
        onOrderSuccess(res.order);
        try {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } catch {}
      } else {
        setErrorMsg('Failed to process order. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment processing failed. Please check network.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-[#102A43] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F28C28] flex items-center justify-center text-white font-bold">
              ME
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">
                {step === 'details' && 'Secure Checkout — Shipping Details'}
                {step === 'payment' && 'Complete Payment — Milan Express'}
                {step === 'receipt' && 'Order Confirmed & Payment Receipt'}
              </h3>
              <p className="text-xs text-slate-300">
                DTDC Channel Partner Fulfillment • Authenticated Orders
              </p>
            </div>
          </div>
          {step !== 'receipt' && (
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Step Indicator */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                step === 'details'
                  ? 'bg-[#102A43] text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              1
            </span>
            <span className={step === 'details' ? 'text-[#102A43] font-bold' : 'text-slate-500'}>
              Delivery Info
            </span>
          </div>

          <div className="w-12 h-0.5 bg-slate-300"></div>

          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                step === 'payment'
                  ? 'bg-[#102A43] text-white'
                  : step === 'receipt'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              2
            </span>
            <span className={step === 'payment' ? 'text-[#102A43] font-bold' : 'text-slate-500'}>
              Payment & Verification
            </span>
          </div>

          <div className="w-12 h-0.5 bg-slate-300"></div>

          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                step === 'receipt' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              3
            </span>
            <span className={step === 'receipt' ? 'text-emerald-700 font-bold' : 'text-slate-500'}>
              Confirmed Receipt
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {/* STEP 1: DELIVERY DETAILS */}
          {step === 'details' && (
            <form onSubmit={handleDetailsSubmit} className="space-y-5">
              {/* Destination selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Shipping Destination Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setDestinationType('domestic');
                      setCountry('India');
                    }}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      destinationType === 'domestic'
                        ? 'border-[#102A43] bg-blue-50/60 ring-2 ring-[#102A43]/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-[#102A43]">Domestic Delivery (India)</div>
                      <div className="text-[11px] text-slate-500">
                        DTDC Priority Air / Surface
                      </div>
                    </div>
                    {destinationType === 'domestic' && <CheckCircle className="w-4 h-4 text-[#102A43]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDestinationType('international');
                      setCountry('United States');
                    }}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      destinationType === 'international'
                        ? 'border-[#102A43] bg-orange-50/60 ring-2 ring-[#F28C28]/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-[#102A43]">International (NRI / Global)</div>
                      <div className="text-[11px] text-slate-500">
                        DTDC Global Courier Network
                      </div>
                    </div>
                    {destinationType === 'international' && <CheckCircle className="w-4 h-4 text-[#F28C28]" />}
                  </button>
                </div>
              </div>

              {/* Customer Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Customer Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. S. Venkatesh"
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#102A43]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    WhatsApp / Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value)}
                    placeholder="e.g. 9840123456"
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#102A43]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g. venkat@example.com"
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#102A43]"
                  />
                </div>

                {destinationType === 'international' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Destination Country *
                    </label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#102A43] bg-white"
                    >
                      <option value="United States">United States (USA)</option>
                      <option value="United Kingdom">United Kingdom (UK)</option>
                      <option value="Canada">Canada</option>
                      <option value="United Arab Emirates">UAE (Dubai, Abu Dhabi)</option>
                      <option value="Singapore">Singapore</option>
                      <option value="Australia">Australia</option>
                      <option value="Malaysia">Malaysia</option>
                      <option value="Germany">Germany</option>
                      <option value="Other">Other Global Destination</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Street Address & Landmark *
                </label>
                <textarea
                  required
                  rows={2}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Door number, building, street name, nearest landmark..."
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#102A43]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    City / Town *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Chennai"
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#102A43]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    State / Province *
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Tamil Nadu"
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#102A43]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    PIN / Postal Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder="e.g. 600028"
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#102A43]"
                  />
                </div>
              </div>

              {/* Order Cost Breakdown Preview */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Product Subtotal ({items.length} items)</span>
                  <span className="font-semibold text-slate-800">
                    ₹{subtotalINR.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>
                    Shipping Charges (
                    {destinationType === 'domestic'
                      ? subtotalINR >= freeThreshold
                        ? 'Free domestic delivery applied'
                        : `Standard DTDC Flat Rate`
                      : `DTDC International Air (~${totalWeightKg.toFixed(1)}kg)`}
                    )
                  </span>
                  <span className="font-semibold text-slate-800">
                    {shippingCharges === 0 ? 'FREE' : `₹${shippingCharges.toLocaleString('en-IN')}`}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold text-[#102A43]">
                  <span>Total Payable Amount</span>
                  <span className="text-[#F28C28] text-base">
                    ₹{grandTotalINR.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  Back to Cart
                </button>
                <button
                  type="submit"
                  className="bg-[#102A43] hover:bg-[#243B53] text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: PAYMENT & VERIFICATION */}
          {step === 'payment' && (
            <div className="space-y-6">
              {/* Order Summary Pill */}
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-slate-600">Shipping to:</div>
                  <div className="text-xs font-bold text-[#102A43]">
                    {customerName} • {deliveryAddress}, {city} ({pinCode})
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">Payable Total:</div>
                  <div className="text-lg font-black text-[#F28C28]">
                    ₹{grandTotalINR.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  Select Verified Payment Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi_qr')}
                    className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                      paymentMethod === 'upi_qr'
                        ? 'border-[#102A43] bg-orange-50/40 ring-2 ring-[#F28C28]/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-orange-100 text-[#F28C28] flex items-center justify-center shrink-0">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#102A43] flex items-center gap-1.5">
                        <span>Instant Business UPI QR</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                          Recommended
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Pay via Google Pay, PhonePe, Paytm, BHIM, or any bank UPI app with zero transaction surcharge.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('razorpay')}
                    className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                      paymentMethod === 'razorpay'
                        ? 'border-[#102A43] bg-blue-50/40 ring-2 ring-[#102A43]/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#102A43]">
                        Cards / Netbanking / Razorpay
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Secure gateway checkout with signature validation.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* UPI QR Payment View */}
              {paymentMethod === 'upi_qr' && (
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-5">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    {/* Dynamic QR Code */}
                    <div className="bg-white p-3 rounded-2xl shadow-md border border-slate-200 flex flex-col items-center shrink-0">
                      {qrCodeDataUrl ? (
                        <img
                          src={qrCodeDataUrl}
                          alt="Milan Express UPI QR Code"
                          className="w-48 h-48 rounded-lg"
                        />
                      ) : (
                        <div className="w-48 h-48 flex items-center justify-center bg-slate-100 rounded-lg text-slate-400 text-xs">
                          Generating QR...
                        </div>
                      )}
                      <div className="text-center mt-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Scan with any UPI App
                        </span>
                        <span className="text-xs font-extrabold text-[#102A43]">
                          ₹{grandTotalINR.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Step-by-step instructions */}
                    <div className="space-y-3 flex-1 text-xs">
                      <div>
                        <h4 className="font-bold text-[#102A43] text-sm">
                          Milan Express Official Merchant Account
                        </h4>
                        <p className="text-slate-500 text-[11px]">
                          Payee: <span className="font-semibold text-slate-800">{upiPayee}</span>
                        </p>
                      </div>

                      {/* Copy UPI ID */}
                      <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200">
                        <div className="flex-1 font-mono text-xs text-slate-800 truncate">
                          {upiId}
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyUpi}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copiedUpi ? 'Copied!' : 'Copy UPI'}</span>
                        </button>
                      </div>

                      <ol className="list-decimal pl-4 space-y-1.5 text-slate-600 text-[11px]">
                        <li>Open GPay / PhonePe / Paytm / BHIM and scan this QR code or enter UPI ID.</li>
                        <li>Verify payee is <strong>{upiPayee}</strong> and payable total is <strong>₹{grandTotalINR}</strong>.</li>
                        <li>Complete the payment and copy the <strong>12-digit UTR / Reference number</strong> below.</li>
                      </ol>
                    </div>
                  </div>

                  {/* UTR Reference input */}
                  <div className="pt-3 border-t border-slate-200">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Enter UPI Reference / UTR Number (12 digits) *
                    </label>
                    <input
                      type="text"
                      required
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value.replace(/[^0-9A-Za-z]/g, ''))}
                      placeholder="e.g. 428901847192 (found in payment success receipt)"
                      className="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-300 rounded-xl focus:outline-none focus:border-[#102A43] bg-white"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Our accounts team cross-verifies the UTR with our banking statement to prevent duplicate or fabricated entries.
                    </p>
                  </div>

                  {/* Optional screenshot upload */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Payment Screenshot Proof (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#102A43] file:text-white hover:file:bg-[#243B53]"
                    />
                    {screenshotDataUrl && (
                      <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
                        ✓ Screenshot attached successfully
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Razorpay Gateway Mode */}
              {paymentMethod === 'razorpay' && (
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-3">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span>Razorpay Secure Gateway Channel</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    You will be processed via test/live payment token for order amount{' '}
                    <strong>₹{grandTotalINR}</strong>. Card numbers and bank credentials are never stored on Milan Express servers.
                  </p>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-500 text-[11px]">
                    Gateway Reference Order ID:{' '}
                    <span className="font-mono font-semibold text-slate-800">
                      order_MEX_{Date.now().toString().slice(-8)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Back to Details
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleCompleteOrder}
                  className="bg-[#F28C28] hover:bg-[#E07817] disabled:opacity-50 text-white px-7 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg transition-all"
                >
                  {isSubmitting ? (
                    <span>Verifying Order...</span>
                  ) : (
                    <>
                      <span>
                        Confirm Order (₹{grandTotalINR.toLocaleString('en-IN')})
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIRMED RECEIPT */}
          {step === 'receipt' && confirmedOrder && (
            <div className="space-y-6">
              {/* Top Success Banner */}
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-emerald-950 text-base">
                    Order Received Successfully!
                  </h4>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Order Reference ID:{' '}
                    <span className="font-mono font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded">
                      {confirmedOrder.id}
                    </span>
                  </p>
                </div>
              </div>

              {/* Printable Official Receipt Card */}
              <div
                id="milan-express-printable-receipt"
                className="p-6 bg-white rounded-2xl border-2 border-slate-200 shadow-sm space-y-5"
              >
                {/* Receipt Header */}
                <div className="flex items-start justify-between border-b pb-4 border-slate-200">
                  <div>
                    <h3 className="font-black text-lg text-[#102A43]">
                      MILAN EXPRESS CHANNEL PARTNER
                    </h3>
                    <p className="text-xs text-[#F28C28] font-bold">
                      Official E-Commerce Order & Payment Receipt
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      DTDC Authorized Franchise TN-CHN-3515 • Phone: +91 9445341812
                    </p>
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-mono font-bold text-slate-800">{confirmedOrder.id}</div>
                    <div className="text-slate-500">
                      {new Date(confirmedOrder.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>

                {/* Customer & Shipping Details */}
                <div className="grid grid-cols-2 gap-4 text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl">
                  <div>
                    <span className="text-[11px] text-slate-500 font-bold block uppercase">
                      Billed & Shipped To:
                    </span>
                    <div className="font-bold text-slate-900 mt-0.5">{confirmedOrder.customerName}</div>
                    <div>{confirmedOrder.deliveryAddress}</div>
                    <div>
                      {confirmedOrder.city}, {confirmedOrder.state} - {confirmedOrder.pinCode}
                    </div>
                    <div className="text-slate-500">
                      {confirmedOrder.country} • Ph: {confirmedOrder.customerMobile}
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 font-bold block uppercase">
                      Payment & Courier Status:
                    </span>
                    <div className="mt-0.5">
                      <span className="font-semibold text-slate-800">Mode: </span>
                      {confirmedOrder.paymentMethod === 'upi_qr' ? 'UPI QR Payment' : 'Razorpay Gateway'}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800">Payment Status: </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        {confirmedOrder.paymentStatus}
                      </span>
                    </div>
                    {confirmedOrder.paymentTransactionRef && (
                      <div className="font-mono text-[11px] text-slate-600 mt-1 truncate">
                        Ref / UTR: {confirmedOrder.paymentTransactionRef}
                      </div>
                    )}
                    <div className="text-slate-500 mt-1">
                      Courier Partner: <span className="font-bold text-red-600">DTDC Express</span>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 text-[11px]">
                        <th className="py-2">Item Description</th>
                        <th className="py-2 text-center">Qty</th>
                        <th className="py-2 text-right">Price</th>
                        <th className="py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {confirmedOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 font-medium text-slate-800">{item.title}</td>
                          <td className="py-2.5 text-center text-slate-600">{item.quantity}</td>
                          <td className="py-2.5 text-right text-slate-600">₹{item.priceINR}</td>
                          <td className="py-2.5 text-right font-bold text-slate-800">
                            ₹{(item.priceINR * item.quantity).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t-2 border-slate-200">
                      <tr>
                        <td colSpan={3} className="pt-2 text-right text-slate-600">
                          Subtotal:
                        </td>
                        <td className="pt-2 text-right font-semibold text-slate-800">
                          ₹{confirmedOrder.subtotalINR.toLocaleString('en-IN')}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="text-right text-slate-600">
                          Shipping & DTDC Handling:
                        </td>
                        <td className="text-right font-semibold text-slate-800">
                          {confirmedOrder.shippingChargesINR === 0
                            ? 'FREE'
                            : `₹${confirmedOrder.shippingChargesINR.toLocaleString('en-IN')}`}
                        </td>
                      </tr>
                      <tr className="text-sm font-black text-[#102A43]">
                        <td colSpan={3} className="pt-2 text-right">
                          Grand Total:
                        </td>
                        <td className="pt-2 text-right text-[#F28C28]">
                          ₹{confirmedOrder.totalINR.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span>
                    Consignment tracking number will be assigned upon packing and handed over to DTDC.
                  </span>
                  <span className="font-bold text-slate-700">milanexpress3515@gmail.com</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      openWhatsAppChat(
                        {
                          type: 'order',
                          context: {
                            orderId: confirmedOrder.id,
                            customerName: confirmedOrder.customerName,
                          },
                        },
                        settings?.primaryPhone
                      )
                    }
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Order Update</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl bg-[#102A43] hover:bg-[#243B53] text-white text-xs font-bold"
                  >
                    Done & Track Orders
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

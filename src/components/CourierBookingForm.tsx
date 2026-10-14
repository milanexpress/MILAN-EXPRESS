import React, { useState } from 'react';
import {
  Package,
  Globe,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Info,
  Phone,
  MessageCircle,
  FileText,
} from 'lucide-react';
import { api } from '../services/api';
import { BusinessSettings, CourierBooking, ShipmentType } from '../types';
import { openWhatsAppChat } from '../utils/whatsapp';
import { DtdcPartnerBadge } from './DtdcPartnerBadge';

interface CourierBookingFormProps {
  initialShipmentType?: ShipmentType;
  settings?: BusinessSettings;
  onBookingCreated?: (booking: CourierBooking) => void;
  onTrackRedirect?: (bookingId: string) => void;
}

export const CourierBookingForm: React.FC<CourierBookingFormProps> = ({
  initialShipmentType = 'domestic',
  settings,
  onBookingCreated,
  onTrackRedirect,
}) => {
  const [shipmentType, setShipmentType] = useState<ShipmentType>(initialShipmentType);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdBooking, setCreatedBooking] = useState<CourierBooking | null>(null);

  // Form fields
  const [senderName, setSenderName] = useState('');
  const [senderMobile, setSenderMobile] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderAddress, setSenderAddress] = useState('');
  const [senderPinCode, setSenderPinCode] = useState('');

  const [receiverName, setReceiverName] = useState('');
  const [receiverMobile, setReceiverMobile] = useState('');
  const [receiverAddress, setReceiverAddress] = useState('');
  const [receiverPinCodeOrCountry, setReceiverPinCodeOrCountry] = useState('');
  const [destinationCountry, setDestinationCountry] = useState(
    shipmentType === 'domestic' ? 'India' : 'United States'
  );

  const [parcelContents, setParcelContents] = useState('');
  const [approxWeightKg, setApproxWeightKg] = useState<number>(1.5);
  const [lengthCm, setLengthCm] = useState<number | undefined>(undefined);
  const [widthCm, setWidthCm] = useState<number | undefined>(undefined);
  const [heightCm, setHeightCm] = useState<number | undefined>(undefined);

  const [pickupPreference, setPickupPreference] = useState<'counter_drop' | 'home_pickup'>('home_pickup');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTimeSlot, setPickupTimeSlot] = useState('10:00 AM - 01:00 PM');
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  // Tariff Estimator
  const domesticBaseRate = settings?.domesticFlatShippingINR || 80;
  const internationalRatePerKg = settings?.internationalBaseRatePerKgINR || 1150;

  const estimatedMinRate =
    shipmentType === 'domestic'
      ? Math.round(domesticBaseRate + Math.max(0, approxWeightKg - 0.5) * 60)
      : Math.round(Math.ceil(approxWeightKg) * internationalRatePerKg);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName || !senderMobile || !senderAddress || !senderPinCode) {
      setErrorMsg('Please complete all mandatory Sender contact and address fields.');
      return;
    }
    if (!receiverName || !receiverMobile || !receiverAddress || !receiverPinCodeOrCountry) {
      setErrorMsg('Please complete all mandatory Receiver contact and address fields.');
      return;
    }
    if (!parcelContents.trim()) {
      setErrorMsg('Please describe the parcel contents for courier security and customs clearance.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload: Partial<CourierBooking> = {
        shipmentType,
        senderName,
        senderMobile,
        senderEmail,
        senderAddress,
        senderPinCode,
        receiverName,
        receiverMobile,
        receiverAddress,
        receiverPinCodeOrCountry,
        destinationCountry: shipmentType === 'domestic' ? 'India' : destinationCountry,
        parcelContents,
        approxWeightKg: Number(approxWeightKg),
        dimensions: {
          lengthCm: lengthCm ? Number(lengthCm) : undefined,
          widthCm: widthCm ? Number(widthCm) : undefined,
          heightCm: heightCm ? Number(heightCm) : undefined,
        },
        pickupPreference,
        pickupDate: pickupPreference === 'home_pickup' ? pickupDate : undefined,
        pickupTimeSlot: pickupPreference === 'home_pickup' ? pickupTimeSlot : undefined,
        additionalInstructions,
        courierPartner: shipmentType === 'international' ? 'DTDC International' : 'DTDC',
      };

      const res = await api.createCourierBooking(payload);
      if (res.success && res.booking) {
        setCreatedBooking(res.booking);
        onBookingCreated?.(res.booking);
      } else {
        setErrorMsg('Failed to register courier booking request. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error occurred while submitting booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setCreatedBooking(null);
    setSenderName('');
    setSenderMobile('');
    setSenderAddress('');
    setSenderPinCode('');
    setReceiverName('');
    setReceiverMobile('');
    setReceiverAddress('');
    setReceiverPinCodeOrCountry('');
    setParcelContents('');
    setApproxWeightKg(1.5);
  };

  return (
    <div className="space-y-8">
      {/* Top DTDC Partner Badge Section */}
      <DtdcPartnerBadge branchCode={settings?.dtdcPartnerBranch || 'TN-CHN-3515'} />

      {/* Confirmation View if booking was just submitted */}
      {createdBooking ? (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-amber-50 border border-amber-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-[#102A43] text-lg">
                    Courier Booking Request Registered
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider">
                    Pending Quotation
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Reference ID:{' '}
                  <span className="font-mono font-bold text-slate-900 text-sm bg-white px-2 py-0.5 rounded border border-amber-300">
                    {createdBooking.id}
                  </span>
                </p>
              </div>
            </div>
            <div className="text-right sm:border-l sm:pl-6 border-amber-200 text-xs">
              <div className="text-slate-500">Service Mode:</div>
              <div className="font-bold text-[#102A43] capitalize">
                {createdBooking.shipmentType} Courier (DTDC Network)
              </div>
            </div>
          </div>

          {/* Critical Disclaimer: Not yet confirmed courier booking */}
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <Info className="w-4 h-4 text-blue-700 shrink-0" />
              <span>Important Booking Notice</span>
            </div>
            <p className="leading-relaxed">
              Per DTDC compliance policy, this request is <strong>not yet labeled as a confirmed courier consignment</strong>. Our logistics specialist at Milan Express will review your parcel contents, verify accurate volumetric dimensions, calculate our discounted channel partner tariff, and confirm your doorstep pickup time. The official DTDC AWB Consignment Number will be generated once physical parcel verification is completed.
            </p>
          </div>

          {/* Booking Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div className="space-y-2">
              <h4 className="font-bold text-slate-700 uppercase tracking-wider border-b pb-1">
                Sender Information
              </h4>
              <div className="text-sm font-bold text-slate-900">{createdBooking.senderName}</div>
              <div className="text-slate-600">{createdBooking.senderAddress}</div>
              <div className="text-slate-600">PIN: {createdBooking.senderPinCode}</div>
              <div className="text-slate-700 font-semibold">Mobile: +91 {createdBooking.senderMobile}</div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-700 uppercase tracking-wider border-b pb-1">
                Receiver & Destination
              </h4>
              <div className="text-sm font-bold text-slate-900">{createdBooking.receiverName}</div>
              <div className="text-slate-600">{createdBooking.receiverAddress}</div>
              <div className="text-slate-600">
                Destination: {createdBooking.receiverPinCodeOrCountry || createdBooking.destinationCountry}
              </div>
              <div className="text-slate-700 font-semibold">Mobile: {createdBooking.receiverMobile}</div>
            </div>

            <div className="md:col-span-2 pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Contents:</span>
                <span className="font-semibold text-slate-800">{createdBooking.parcelContents}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Declared Weight:</span>
                <span className="font-semibold text-slate-800">{createdBooking.approxWeightKg} kg</span>
              </div>
              <div>
                <span className="text-slate-500 block">Pickup Preference:</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {createdBooking.pickupPreference.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
            <button
              onClick={handleReset}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Book Another Parcel
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() =>
                  openWhatsAppChat(
                    {
                      type: 'courier',
                      context: {
                        bookingId: createdBooking.id,
                        destination: createdBooking.receiverPinCodeOrCountry,
                        weightKg: createdBooking.approxWeightKg,
                      },
                    },
                    settings?.primaryPhone
                  )
                }
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Confirm on WhatsApp with Milan Express</span>
              </button>

              <button
                onClick={() => onTrackRedirect?.(createdBooking.id)}
                className="px-5 py-2.5 rounded-xl bg-[#102A43] hover:bg-[#243B53] text-white text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <span>Track Request Status</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* The Booking Form */
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#102A43] tracking-tight">
                  Book a Courier Parcel
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Authorized DTDC Doorstep Pickup & Counter Booking across India and 220+ Countries.
                </p>
              </div>

              {/* Service Type Switcher */}
              <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShipmentType('domestic');
                    setDestinationCountry('India');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    shipmentType === 'domestic'
                      ? 'bg-[#102A43] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Package className="w-4 h-4 text-[#F28C28]" />
                  <span>Domestic Courier</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShipmentType('international');
                    setDestinationCountry('United States');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    shipmentType === 'international'
                      ? 'bg-[#102A43] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>International (NRI)</span>
                </button>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Sender & Receiver Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* SENDER COLUMN */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#102A43]">Sender (Pickup) Details</h3>
                    <p className="text-[11px] text-slate-500">Where our courier executive will collect the parcel</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sender Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#102A43] bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Sender Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={senderMobile}
                      onChange={(e) => setSenderMobile(e.target.value)}
                      placeholder="e.g. 9445341812"
                      className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#102A43] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      placeholder="e.g. ramesh@example.com"
                      className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#102A43] bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Pickup Street Address *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={senderAddress}
                    onChange={(e) => setSenderAddress(e.target.value)}
                    placeholder="Door No, Building, Street, Area, City"
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#102A43] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sender PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={senderPinCode}
                    onChange={(e) => setSenderPinCode(e.target.value)}
                    placeholder="e.g. 600042 (Chennai)"
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#102A43] bg-white"
                  />
                </div>
              </div>

              {/* RECEIVER COLUMN */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                  <div className="w-7 h-7 rounded-lg bg-orange-100 text-[#F28C28] flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#102A43]">Receiver (Destination) Details</h3>
                    <p className="text-[11px] text-slate-500">Destination address where the parcel must be delivered</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Receiver Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    placeholder="e.g. S. Lakshmi"
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#102A43] bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Receiver Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={receiverMobile}
                      onChange={(e) => setReceiverMobile(e.target.value)}
                      placeholder={shipmentType === 'international' ? '+1 408 555 0199' : '9840123456'}
                      className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#102A43] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {shipmentType === 'domestic' ? 'Destination State' : 'Destination Country *'}
                    </label>
                    {shipmentType === 'domestic' ? (
                      <input
                        type="text"
                        value={destinationCountry}
                        onChange={(e) => setDestinationCountry(e.target.value)}
                        placeholder="e.g. Karnataka / Maharashtra"
                        className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#102A43] bg-white"
                      />
                    ) : (
                      <select
                        value={destinationCountry}
                        onChange={(e) => setDestinationCountry(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#102A43] bg-white"
                      >
                        <option value="United States">United States (USA)</option>
                        <option value="United Kingdom">United Kingdom (UK)</option>
                        <option value="Canada">Canada</option>
                        <option value="United Arab Emirates">United Arab Emirates (UAE)</option>
                        <option value="Singapore">Singapore</option>
                        <option value="Australia">Australia</option>
                        <option value="Malaysia">Malaysia</option>
                        <option value="Europe">Europe</option>
                        <option value="Other">Other Global Destination</option>
                      </select>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Destination Delivery Address *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={receiverAddress}
                    onChange={(e) => setReceiverAddress(e.target.value)}
                    placeholder="Full street address, apartment/suite, city"
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#102A43] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {shipmentType === 'domestic' ? 'Receiver PIN Code *' : 'ZIP / Postal Code *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={receiverPinCodeOrCountry}
                    onChange={(e) => setReceiverPinCodeOrCountry(e.target.value)}
                    placeholder={shipmentType === 'domestic' ? 'e.g. 560038 (Bengaluru)' : 'e.g. 95123 (USA)'}
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#102A43] bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Parcel Specs & Pickup Preferences */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#102A43]">Parcel Contents & Weight Specification</h3>
                  <p className="text-[11px] text-slate-500">Provide accurate weight and description for courier manifest and customs</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Parcel Contents Description *
                  </label>
                  <input
                    type="text"
                    required
                    value={parcelContents}
                    onChange={(e) => setParcelContents(e.target.value)}
                    placeholder="e.g. Traditional sweets, clothing, brass pooja items, documents..."
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#102A43] bg-white"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    * Prohibited items: flammable liquids, lithium batteries without declaration, currency, narcotics.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Approximate Weight (KG) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="100"
                    required
                    value={approxWeightKg}
                    onChange={(e) => setApproxWeightKg(parseFloat(e.target.value) || 0.5)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#102A43] bg-white font-bold"
                  />
                </div>
              </div>

              {/* Dimensions (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Parcel Dimensions in CM (Optional / if available)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="number"
                    min="1"
                    placeholder="Length (cm)"
                    value={lengthCm ?? ''}
                    onChange={(e) => setLengthCm(e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white"
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="Width (cm)"
                    value={widthCm ?? ''}
                    onChange={(e) => setWidthCm(e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white"
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="Height (cm)"
                    value={heightCm ?? ''}
                    onChange={(e) => setHeightCm(e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white"
                  />
                </div>
              </div>

              {/* Pickup Option Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Pickup Preference *
                  </label>
                  <div className="flex gap-3">
                    <label className="flex-1 p-3 rounded-xl border border-slate-300 bg-white flex items-center gap-2 cursor-pointer hover:border-[#102A43]">
                      <input
                        type="radio"
                        name="pickupPref"
                        checked={pickupPreference === 'home_pickup'}
                        onChange={() => setPickupPreference('home_pickup')}
                        className="text-[#102A43]"
                      />
                      <span className="text-xs font-semibold text-slate-800">Doorstep Pickup</span>
                    </label>
                    <label className="flex-1 p-3 rounded-xl border border-slate-300 bg-white flex items-center gap-2 cursor-pointer hover:border-[#102A43]">
                      <input
                        type="radio"
                        name="pickupPref"
                        checked={pickupPreference === 'counter_drop'}
                        onChange={() => setPickupPreference('counter_drop')}
                        className="text-[#102A43]"
                      />
                      <span className="text-xs font-semibold text-slate-800">Counter Drop-off</span>
                    </label>
                  </div>
                </div>

                {pickupPreference === 'home_pickup' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Time Slot
                      </label>
                      <select
                        value={pickupTimeSlot}
                        onChange={(e) => setPickupTimeSlot(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white"
                      >
                        <option>10:00 AM - 01:00 PM</option>
                        <option>02:00 PM - 05:00 PM</option>
                        <option>05:00 PM - 08:00 PM</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Additional Instructions / Special Handling Notes
                </label>
                <textarea
                  rows={2}
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  placeholder="e.g. Call before coming, food packing vacuum sealing required, fragile brass lamp inside..."
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-[#102A43]"
                />
              </div>
            </div>

            {/* Tariff Estimation Card & Transparency Note */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 to-[#102A43] text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#F28C28]">
                  Indicative Tariff Estimate
                </span>
                <div className="text-2xl font-black">
                  ~₹{estimatedMinRate.toLocaleString('en-IN')}{' '}
                  <span className="text-xs font-normal text-slate-300">
                    ({approxWeightKg} kg declared)
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Exact quotation will be finalized by admin after actual volumetric weigh-in at the counter.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto bg-[#F28C28] hover:bg-[#E07817] disabled:opacity-50 text-white px-8 py-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
                >
                  {isSubmitting ? (
                    <span>Registering Booking...</span>
                  ) : (
                    <>
                      <span>Submit Booking Request</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

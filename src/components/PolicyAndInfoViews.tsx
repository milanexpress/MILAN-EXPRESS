import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  FileText,
  Truck,
  RotateCcw,
  Send,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api';
import { BusinessSettings } from '../types';
import { openWhatsAppChat } from '../utils/whatsapp';
import { DtdcPartnerBadge } from './DtdcPartnerBadge';

interface PolicyProps {
  settings?: BusinessSettings;
  onNavigate?: (page: string) => void;
}

// 1. FAQ VIEW
export const FaqView: React.FC<PolicyProps> = ({ settings }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does Milan Express Channel Partner work with DTDC?',
      a: 'Milan Express is an authorized DTDC Channel Partner franchise (Branch #TN-CHN-3515). When you book through us, your parcels are processed directly into the official DTDC Express network with discounted commercial tariffs, priority counter handling, and an official DTDC Airway Bill (AWB) consignment number for real-time tracking.',
    },
    {
      q: 'What is the procedure for booking a courier pickup?',
      a: 'Submit the courier booking form with sender and receiver address details, parcel contents, and approximate weight. Our logistics team will review your request, calculate the exact tariff, and schedule a pickup executive to collect the parcel from your home or office. Once weighed at the counter, your DTDC consignment number is generated.',
    },
    {
      q: 'How does the NRI Shopping & Package Consolidation service work?',
      a: 'Non-resident Indians can order items from multiple Indian platforms (Amazon, Flipkart, local sweet shops, relatives) directly to our Milan Express fulfillment hub in Chennai. We inspect each package, remove redundant bulky packaging, repack into a single rigid international box to save up to 60% on volumetric freight, and dispatch via DTDC International Air Express.',
    },
    {
      q: 'Can I request Milan Express to buy products from local Chennai or Indian shops?',
      a: 'Yes! Use our "Request a Product from India" page. Mention the product, store (e.g. Nalli Silks, Sri Krishna Sweets, Giri Trading, or local spice market), and quantity. Our personal shopper will procure the item, share photos on WhatsApp, and arrange worldwide delivery.',
    },
    {
      q: 'Which payment methods are accepted?',
      a: 'We accept instant bank UPI payments (GPay, PhonePe, Paytm, BHIM) via dynamic QR code and verified UTR submission, as well as cards and netbanking via secure payment gateway channels.',
    },
    {
      q: 'How are international customs duties handled?',
      a: 'All international consignments include mandatory DTDC customs declarations, commercial invoice generation, and packing lists. Any import duty or VAT levied by the destination country (e.g. UK, EU, Canada) per local customs regulations will be payable by the recipient upon arrival.',
    },
    {
      q: 'What items are prohibited from courier dispatch?',
      a: 'Per airline and postal regulations, prohibited items include cash/currency notes, flammable liquids, perfumes without DG packaging, lithium batteries without manufacturer documentation, narcotics, and precious bullion.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-[#102A43] tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Common queries about courier booking, DTDC consignment tracking, Indian product procurement, and international consolidation.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition-all"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-[#102A43] hover:text-[#F28C28] transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-[#F28C28]' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-6 bg-slate-100 rounded-3xl text-center space-y-3">
        <h4 className="font-bold text-slate-800 text-sm">Have a unique shipping requirement?</h4>
        <p className="text-xs text-slate-500">
          Our customer service team is available 6 days a week via phone and WhatsApp.
        </p>
        <button
          onClick={() => openWhatsAppChat({ type: 'general' }, settings?.primaryPhone)}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-2 shadow-sm"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Ask on WhatsApp: +91 {settings?.primaryPhone || '9445341812'}</span>
        </button>
      </div>
    </div>
  );
};

// 2. CONTACT US VIEW
export const ContactView: React.FC<PolicyProps> = ({ settings }) => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [enquiryType, setEnquiryType] = useState('courier');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const primaryPhone = settings?.primaryPhone || '9445341812';
  const secondaryPhone = settings?.secondaryPhone || '9080656894';
  const supportEmail = settings?.supportEmail || 'milanexpress3515@gmail.com';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile || !message) {
      setErrorMsg('Please fill in your name, mobile, and message.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await api.createEnquiry({
        name,
        mobile,
        email,
        enquiryType: enquiryType as any,
        message,
      });
      if (res.success) {
        setIsSent(true);
      }
    } catch {
      setErrorMsg('Failed to send message. Please reach out via WhatsApp or Phone directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-[#102A43] tracking-tight">
          Contact Milan Express Channel Partner
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Reach our counter desk for parcel drop-offs, doorstep pickup requests, NRI procurement queries, or commercial volume tariffs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Information & Hours Card */}
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#102A43] text-white shadow-xl space-y-6 relative overflow-hidden">
            <div className="relative z-10 space-y-5">
              <h3 className="font-extrabold text-xl text-white">Branch Office & Counter Desk</h3>

              <div className="space-y-4 text-xs text-slate-300">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#F28C28] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">MILAN EXPRESS Counter Address:</span>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=No.42D%2C+Ground+Floor%2C+Bharani+Street%2C+Bharathi+Nagar%2C+Velachery%2C+Chennai+600042"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-200 hover:text-white group block transition-colors mt-0.5 leading-relaxed"
                      title="Open in Google Maps / Get Directions"
                    >
                      <span className="font-semibold text-white block">MILAN EXPRESS</span>
                      <span>No. 42D, Ground Floor, Bharani Street, Bharathi Nagar, Velachery, Chennai – 600042, Tamil Nadu, India.</span>
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-[#F28C28] font-bold mt-2 bg-white/10 px-2.5 py-1 rounded-lg group-hover:bg-[#F28C28] group-hover:text-white transition-all">
                        <span>Get Directions on Google Maps</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#F28C28] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Official Phone Numbers:</span>
                    <div className="space-x-2 text-slate-200 font-semibold mt-0.5">
                      <a href={`tel:${primaryPhone}`} className="hover:text-white underline">
                        +91 {primaryPhone}
                      </a>
                      <span>/</span>
                      <a href={`tel:${secondaryPhone}`} className="hover:text-white underline">
                        +91 {secondaryPhone}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#F28C28] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Email:</span>
                    <a href={`mailto:${supportEmail}`} className="text-slate-200 hover:text-white underline">
                      {supportEmail}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#F28C28] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Working Hours:</span>
                    <span>Monday to Saturday: 9:00 AM – 9:00 PM</span>
                    <br />
                    <span>Sunday: 10:00 AM – 2:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DtdcPartnerBadge variant="card" branchCode={settings?.dtdcPartnerBranch || 'TN-CHN-3515'} />
        </div>

        {/* Contact Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="font-bold text-lg text-[#102A43]">Send an Enquiry</h3>

          {isSent ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-emerald-950 text-base">Message Sent Successfully!</h4>
              <p className="text-xs text-emerald-800">
                Our support desk has received your message and will respond shortly on WhatsApp or Phone.
              </p>
              <button
                onClick={() => setIsSent(false)}
                className="mt-2 text-xs font-bold text-emerald-900 underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rajesh Kumar"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#102A43]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="e.g. 9840123456"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#102A43]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rajesh@example.com"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#102A43]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Service Type *</label>
                  <select
                    value={enquiryType}
                    onChange={(e) => setEnquiryType(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-[#102A43]"
                  >
                    <option value="courier">Domestic / International Courier</option>
                    <option value="ecommerce">E-Commerce Product Enquiry</option>
                    <option value="nri_service">NRI Shopping & Consolidation</option>
                    <option value="tracking">Consignment Tracking Help</option>
                    <option value="other">General / Business Partnership</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Your Message / Query *</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you'd like to ship or buy, destination, weight..."
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#102A43]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#102A43] hover:bg-[#243B53] disabled:opacity-50 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                {isSubmitting ? <span>Sending...</span> : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message to Milan Express Desk</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// 3. SHIPPING, CANCELLATION & REFUND POLICY
export const RefundPolicyView: React.FC<PolicyProps> = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs text-slate-700 leading-relaxed">
      <div className="border-b pb-4 border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-black text-[#102A43]">
          Shipping, Cancellation and Refund Policy
        </h1>
        <p className="text-slate-500 text-[11px] mt-1">
          Last Updated: October 2026 • Milan Express Channel Partner (Authorized DTDC Franchise)
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-sm text-[#102A43] uppercase tracking-wider">
          1. Courier Booking & Quotation Terms
        </h3>
        <p>
          Online courier booking requests submitted through this website are initial requests for service. A booking is not labeled or treated as a confirmed courier consignment until our logistics personnel has verified the parcel physical contents, validated volumetric measurements at the Milan Express counter, and issued a verified quotation.
        </p>
        <p>
          Once a quotation is accepted and the consignment is physically booked with DTDC Express Limited, an official DTDC AWB Consignment Number is assigned. Cancellations are only permitted prior to parcel manifest dispatch from the Milan Express hub.
        </p>

        <h3 className="font-bold text-sm text-[#102A43] uppercase tracking-wider pt-2">
          2. E-Commerce Order Shipping & Delivery
        </h3>
        <p>
          Products ordered through our e-commerce catalogue are packed fresh and dispatched within 24 to 48 business hours. Domestic Indian deliveries via DTDC Priority generally arrive within 2 to 5 business days. International deliveries through DTDC International Express typically arrive within 4 to 8 business days, subject to destination customs inspection.
        </p>
        <p>
          Shipping charges are calculated transparently and shown separately at checkout. Free domestic shipping applies to qualifying orders exceeding ₹1,500.
        </p>

        <h3 className="font-bold text-sm text-[#102A43] uppercase tracking-wider pt-2">
          3. Cancellations & Modifications
        </h3>
        <ul className="list-disc pl-5 space-y-1 text-slate-600">
          <li><strong>E-Commerce Orders:</strong> Can be cancelled without penalty within 6 hours of placement or prior to dispatch packaging. Once shipped with a live DTDC tracking number, orders cannot be cancelled mid-transit.</li>
          <li><strong>Custom Procurement Requests:</strong> Cannot be cancelled after physical item purchase has been finalized with third-party vendors.</li>
          <li><strong>Consolidated Shipments:</strong> Repackaging fees are non-refundable once consolidation labour and custom packaging boxes have been utilized.</li>
        </ul>

        <h3 className="font-bold text-sm text-[#102A43] uppercase tracking-wider pt-2">
          4. Returns & Refund Policy
        </h3>
        <p>
          Due to the perishable nature of traditional sweets, savouries, spices, and pooja items, food and customized consumable products are non-returnable unless received in a damaged or spoiled condition caused by transit failure.
        </p>
        <p>
          In the rare event of transit damage or missing items, customers must report the discrepancy within 48 hours of delivery along with photographic proof of package exterior, DTDC label, and damaged contents to <span className="font-semibold text-slate-900">milanexpress3515@gmail.com</span> or WhatsApp <span className="font-semibold text-slate-900">+91 9445341812</span>. Valid claims will be refunded to the original payment source or UPI account within 5 to 7 working days.
        </p>
      </div>
    </div>
  );
};

// 4. TERMS AND CONDITIONS
export const TermsView: React.FC<PolicyProps> = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs text-slate-700 leading-relaxed">
      <div className="border-b pb-4 border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-black text-[#102A43]">
          Terms and Conditions
        </h1>
        <p className="text-slate-500 text-[11px] mt-1">
          Effective Date: October 2026
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-sm text-[#102A43] uppercase tracking-wider">
          1. Service Relationship & DTDC Franchise Notice
        </h3>
        <p>
          Milan Express Channel Partner operates as an independent authorized channel partner and franchisee of DTDC Express Limited. Courier transportation, carriage, airway operations, and terminal clearance are governed by DTDC Conditions of Carriage in accordance with Indian carriage laws and the Warsaw/Montreal Conventions.
        </p>

        <h3 className="font-bold text-sm text-[#102A43] uppercase tracking-wider pt-2">
          2. Customer Sender Declarations
        </h3>
        <p>
          By booking a shipment, the sender explicitly declares that the parcel does not contain dangerous goods, explosives, contraband, bullion, currency notes, or unauthorized items under IATA and Indian postal statutes. The sender is solely liable for any customs penalties or legal confiscations resulting from false contents declaration.
        </p>

        <h3 className="font-bold text-sm text-[#102A43] uppercase tracking-wider pt-2">
          3. Volumetric Weight Calculation
        </h3>
        <p>
          Courier tariff is billed on whichever is higher between actual dead weight and volumetric (dimensional) weight, calculated per standard airline formula: (Length × Width × Height in cm) / 5000.
        </p>

        <h3 className="font-bold text-sm text-[#102A43] uppercase tracking-wider pt-2">
          4. Payments and Gateway Verification
        </h3>
        <p>
          All payments made via UPI QR or card gateways are subject to server-side banking verification. Submitting fabricated UTR or transaction references is strictly prohibited and will void order processing.
        </p>
      </div>
    </div>
  );
};

// 5. PRIVACY POLICY
export const PrivacyView: React.FC<PolicyProps> = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs text-slate-700 leading-relaxed">
      <div className="border-b pb-4 border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-black text-[#102A43]">
          Privacy Policy
        </h1>
        <p className="text-slate-500 text-[11px] mt-1">
          Committed to protecting your personal & shipping data.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-sm text-[#102A43] uppercase tracking-wider">
          1. Information We Collect
        </h3>
        <p>
          To process courier bookings, customs manifests, and e-commerce orders, we collect essential shipping data including sender & receiver names, postal addresses, phone numbers, email addresses, and parcel contents descriptions.
        </p>

        <h3 className="font-bold text-sm text-[#102A43] uppercase tracking-wider pt-2">
          2. How Your Data is Used
        </h3>
        <p>
          Your information is utilized strictly to generate courier airway bills with DTDC Express, deliver orders, communicate tracking milestones via WhatsApp or email, and comply with international customs authorities. We never sell, rent, or trade customer contact information to third-party telemarketers.
        </p>

        <h3 className="font-bold text-sm text-[#102A43] uppercase tracking-wider pt-2">
          3. Security & Payment Data
        </h3>
        <p>
          Milan Express does not store debit card, credit card, or banking credentials on our web servers. Online transactions are routed through encrypted payment processors and banking UPI networks.
        </p>
      </div>
    </div>
  );
};

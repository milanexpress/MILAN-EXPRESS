export type ShipmentType = 'domestic' | 'international';

export type BookingStatus = 
  | 'requested'          // Initial submission by customer
  | 'quotation_ready'    // Admin reviewed and provided price
  | 'quotation_accepted' // Customer agreed to quote
  | 'pickup_scheduled'   // Pickup executive assigned
  | 'picked_up'          // Package in Milan Express custody
  | 'booked_with_dtdc'   // Consignment number generated & booked
  | 'in_transit'         // Traveling through DTDC network
  | 'out_for_delivery'   // Out for final delivery
  | 'delivered'          // Successfully handed over
  | 'cancelled';

export interface CourierBooking {
  id: string; // e.g. MEX-BK-2026-1042
  createdAt: string;
  shipmentType: ShipmentType;
  senderName: string;
  senderMobile: string;
  senderEmail?: string;
  senderAddress: string;
  senderPinCode: string;
  receiverName: string;
  receiverMobile: string;
  receiverAddress: string;
  receiverPinCodeOrCountry: string;
  destinationCountry: string;
  parcelContents: string;
  approxWeightKg: number;
  dimensions?: {
    lengthCm?: number;
    widthCm?: number;
    heightCm?: number;
  };
  pickupPreference: 'counter_drop' | 'home_pickup';
  pickupDate?: string;
  pickupTimeSlot?: string;
  additionalInstructions?: string;
  status: BookingStatus;
  
  // Quotation & Logistics fields updated by Admin
  quotationAmount?: number;
  quotationNotes?: string;
  quotationDate?: string;
  actualWeightKg?: number;
  courierPartner: 'DTDC' | 'DTDC International' | 'Other';
  dtdcConsignmentNumber?: string; // Official DTDC AWB number
  adminNotes?: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  priceINR: number;
  stock: number;
  image: string;
  weightGrams: number;
  tags?: string[];
  featured?: boolean;
  shelfLife?: string;
  origin?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 
  | 'pending_payment'
  | 'payment_verified'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'upi_qr' | 'razorpay' | 'cod_in_store';
export type PaymentStatus = 'pending' | 'submitted_verification' | 'verified' | 'failed';

export interface OrderItem {
  productId: string;
  title: string;
  priceINR: number;
  quantity: number;
  image: string;
  weightGrams: number;
}

export interface Order {
  id: string; // e.g. MEX-ORD-2026-9281
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  deliveryAddress: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  orderNotes?: string;
  items: OrderItem[];
  subtotalINR: number;
  shippingChargesINR: number;
  totalINR: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentTransactionRef?: string; // UTR or Razorpay Payment ID
  paymentScreenshotUrl?: string;
  paymentVerifiedAt?: string;
  paymentVerifiedBy?: string;
  dtdcConsignmentNumber?: string;
}

export interface ProductPurchaseRequest {
  id: string; // e.g. MEX-REQ-2026-3021
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerWhatsApp: string;
  productName: string;
  productDescription: string;
  referenceUrlOrStore?: string;
  imageUrl?: string;
  quantity: number;
  deliveryCountry: string;
  deliveryAddress?: string;
  additionalInstructions?: string;
  status: 'pending_review' | 'quotation_sent' | 'procuring' | 'procured_packed' | 'shipped' | 'completed' | 'cancelled';
  quotedProductPriceINR?: number;
  quotedProcurementFeeINR?: number;
  quotedShippingINR?: number;
  totalQuotedINR?: number;
  adminNotes?: string;
}

export interface NRIShoppingRequest {
  id: string; // e.g. MEX-NRI-2026-5082
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerWhatsApp: string;
  destinationCountry: string;
  serviceType: 'personal_shopper' | 'package_consolidation' | 'festival_hampers' | 'wedding_bulk';
  itemList: {
    itemName: string;
    details?: string;
    quantity: number;
    preferredShopOrBrand?: string;
  }[];
  isConsolidatedShipment: boolean;
  expectedPackagesCount?: number;
  additionalNotes?: string;
  status: 'pending_quote' | 'quoted' | 'receiving_packages' | 'consolidating' | 'repacked' | 'shipped' | 'delivered';
  quotedConsolidationINR?: number;
  quotedInternationalShippingINR?: number;
  adminNotes?: string;
}

export interface TrackingMilestone {
  id: string;
  timestamp: string;
  status: string;
  location: string;
  description: string;
}

export interface ShipmentTracking {
  consignmentNumber: string; // e.g. MEX-DTDC-7849120
  referenceId?: string; // Related order ID or booking request ID
  courierPartner: string;
  serviceType: string;
  origin: string;
  destination: string;
  senderName: string;
  receiverName: string;
  bookingDate: string;
  expectedDeliveryDate?: string;
  currentStatus: string;
  milestones: TrackingMilestone[];
}

export interface CustomerEnquiry {
  id: string;
  createdAt: string;
  name: string;
  mobile: string;
  email: string;
  enquiryType: 'courier' | 'ecommerce' | 'nri_service' | 'tracking' | 'other';
  message: string;
  status: 'new' | 'contacted' | 'resolved';
  adminNotes?: string;
}

export interface BusinessSettings {
  brandName: string;
  tagline: string;
  primaryPhone: string;
  secondaryPhone: string;
  supportEmail: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  dtdcPartnerBranch: string;
  upiId: string;
  upiPayeeName: string;
  upiQrCodeUrl?: string;
  domesticFlatShippingINR: number;
  freeShippingThresholdINR: number;
  internationalBaseRatePerKgINR: number;
  razorpayKeyId?: string;
  razorpayEnabled: boolean;
  upiPaymentEnabled: boolean;
}

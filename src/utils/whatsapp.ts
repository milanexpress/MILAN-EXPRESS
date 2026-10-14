/**
 * WhatsApp integration utility for Milan Express Channel Partner
 * Official numbers: 9445341812, 9080656894
 */

export function cleanPhoneNumber(phone: string): string {
  // Strip spaces, dashes, parentheses
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.length === 10) {
    return `91${cleaned}`; // Add India country code if 10 digits
  }
  return cleaned;
}

export type WhatsAppEnquiryType = 
  | 'courier'
  | 'quotation'
  | 'product'
  | 'order'
  | 'nri'
  | 'general';

interface WhatsAppOptions {
  phoneNumber?: string;
  type: WhatsAppEnquiryType;
  context?: {
    productName?: string;
    orderId?: string;
    bookingId?: string;
    weightKg?: number;
    destination?: string;
    customerName?: string;
  };
}

export function generateWhatsAppUrl(options: WhatsAppOptions, defaultPhone = '9445341812'): string {
  const targetPhone = cleanPhoneNumber(options.phoneNumber || defaultPhone);

  let message = '';
  switch (options.type) {
    case 'courier':
      message = `Hello Milan Express Channel Partner,\nI would like to enquire about booking a courier.\n` +
        (options.context?.destination ? `Destination: ${options.context.destination}\n` : '') +
        (options.context?.weightKg ? `Approx Weight: ${options.context.weightKg} kg\n` : '') +
        `Please share pickup availability and courier tariff.`;
      break;

    case 'quotation':
      message = `Hello Milan Express,\nI need a shipping quotation for my parcel.` +
        (options.context?.bookingId ? `\nBooking Reference: ${options.context.bookingId}` : '') +
        (options.context?.destination ? `\nDestination: ${options.context.destination}` : '') +
        `\nPlease advise rates and transit time.`;
      break;

    case 'product':
      message = `Hello Milan Express Shopping,\nI am interested in ordering: "${options.context?.productName || 'products from your store'}".\nPlease confirm availability and delivery timelines.`;
      break;

    case 'order':
      message = `Hello Milan Express Team,\nI need assistance regarding my order.` +
        (options.context?.orderId ? `\nOrder ID: ${options.context.orderId}` : '') +
        (options.context?.customerName ? `\nName: ${options.context.customerName}` : '') +
        `\nPlease update me on order status.`;
      break;

    case 'nri':
      message = `Hello Milan Express NRI Assistance,\nI am residing abroad and would like assistance with custom product purchase & consolidated international shipping from India.` +
        (options.context?.destination ? `\nDestination Country: ${options.context.destination}` : '') +
        `\nPlease guide me with the steps.`;
      break;

    default:
      message = `Hello Milan Express Channel Partner,\nI have a general enquiry regarding your shipping and shopping services.`;
  }

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}

export function openWhatsAppChat(options: WhatsAppOptions, defaultPhone = '9445341812') {
  const url = generateWhatsAppUrl(options, defaultPhone);
  window.open(url, '_blank', 'noopener,noreferrer');
}

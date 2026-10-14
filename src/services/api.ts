import {
  BusinessSettings,
  CourierBooking,
  CustomerEnquiry,
  NRIShoppingRequest,
  Order,
  Product,
  ProductPurchaseRequest,
  ShipmentTracking,
} from '../types';

const BASE_URL = '/api';

export const api = {
  // Settings
  async getSettings(): Promise<BusinessSettings> {
    const res = await fetch(`${BASE_URL}/settings`);
    if (!res.ok) throw new Error('Failed to load settings');
    return res.json();
  },

  async updateSettings(settings: Partial<BusinessSettings>): Promise<{ success: boolean; settings: BusinessSettings }> {
    const res = await fetch(`${BASE_URL}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },

  // Categories
  async getCategories(): Promise<{ id: string; name: string }[]> {
    const res = await fetch(`${BASE_URL}/categories`);
    if (!res.ok) throw new Error('Failed to load categories');
    return res.json();
  },

  // Products
  async getProducts(params?: { category?: string; search?: string }): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'all') query.set('category', params.category);
    if (params?.search) query.set('search', params.search);

    const res = await fetch(`${BASE_URL}/products?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to load products');
    return res.json();
  },

  async getProduct(id: string): Promise<Product> {
    const res = await fetch(`${BASE_URL}/products/${id}`);
    if (!res.ok) throw new Error('Product not found');
    return res.json();
  },

  async createProduct(product: Partial<Product>): Promise<Product> {
    const res = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (!res.ok) throw new Error('Failed to create product');
    return res.json();
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const res = await fetch(`${BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update product');
    return res.json();
  },

  async deleteProduct(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/products/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete product');
  },

  // Courier Bookings
  async getCourierBookings(): Promise<CourierBooking[]> {
    const res = await fetch(`${BASE_URL}/courier-bookings`);
    if (!res.ok) throw new Error('Failed to load courier bookings');
    return res.json();
  },

  async createCourierBooking(booking: Partial<CourierBooking>): Promise<{ success: boolean; booking: CourierBooking }> {
    const res = await fetch(`${BASE_URL}/courier-bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking),
    });
    if (!res.ok) throw new Error('Failed to submit courier booking');
    return res.json();
  },

  async updateCourierBooking(id: string, updates: Partial<CourierBooking>): Promise<{ success: boolean; booking: CourierBooking }> {
    const res = await fetch(`${BASE_URL}/courier-bookings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update courier booking');
    return res.json();
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    const res = await fetch(`${BASE_URL}/orders`);
    if (!res.ok) throw new Error('Failed to load orders');
    return res.json();
  },

  async getOrder(id: string): Promise<Order> {
    const res = await fetch(`${BASE_URL}/orders/${id}`);
    if (!res.ok) throw new Error('Order not found');
    return res.json();
  },

  async createOrder(order: Partial<Order>): Promise<{ success: boolean; order: Order }> {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (!res.ok) throw new Error('Failed to place order');
    return res.json();
  },

  async updateOrder(id: string, updates: Partial<Order>): Promise<{ success: boolean; order: Order }> {
    const res = await fetch(`${BASE_URL}/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update order');
    return res.json();
  },

  async submitPaymentUtr(orderId: string, utrNumber: string, screenshotUrl?: string) {
    const res = await fetch(`${BASE_URL}/payments/verify-submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, utrNumber, screenshotUrl }),
    });
    if (!res.ok) throw new Error('Failed to submit payment UTR');
    return res.json();
  },

  async confirmOrderPayment(orderId: string, status: 'verified' | 'failed', adminName?: string) {
    const res = await fetch(`${BASE_URL}/payments/${orderId}/confirm`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminName }),
    });
    if (!res.ok) throw new Error('Failed to confirm payment');
    return res.json();
  },

  // Purchase Requests
  async getPurchaseRequests(): Promise<ProductPurchaseRequest[]> {
    const res = await fetch(`${BASE_URL}/purchase-requests`);
    if (!res.ok) throw new Error('Failed to load purchase requests');
    return res.json();
  },

  async createPurchaseRequest(reqData: Partial<ProductPurchaseRequest>): Promise<{ success: boolean; request: ProductPurchaseRequest }> {
    const res = await fetch(`${BASE_URL}/purchase-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reqData),
    });
    if (!res.ok) throw new Error('Failed to submit purchase request');
    return res.json();
  },

  async updatePurchaseRequest(id: string, updates: Partial<ProductPurchaseRequest>): Promise<{ success: boolean; request: ProductPurchaseRequest }> {
    const res = await fetch(`${BASE_URL}/purchase-requests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update purchase request');
    return res.json();
  },

  // NRI Requests
  async getNriRequests(): Promise<NRIShoppingRequest[]> {
    const res = await fetch(`${BASE_URL}/nri-requests`);
    if (!res.ok) throw new Error('Failed to load NRI requests');
    return res.json();
  },

  async createNriRequest(reqData: Partial<NRIShoppingRequest>): Promise<{ success: boolean; request: NRIShoppingRequest }> {
    const res = await fetch(`${BASE_URL}/nri-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reqData),
    });
    if (!res.ok) throw new Error('Failed to submit NRI request');
    return res.json();
  },

  async updateNriRequest(id: string, updates: Partial<NRIShoppingRequest>): Promise<{ success: boolean; request: NRIShoppingRequest }> {
    const res = await fetch(`${BASE_URL}/nri-requests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update NRI request');
    return res.json();
  },

  // Tracking
  async trackNumber(number: string): Promise<{
    found: boolean;
    type?: string;
    record?: ShipmentTracking;
    booking?: CourierBooking;
    order?: Order;
    message?: string;
    dtdcOfficialUrl?: string;
  }> {
    const res = await fetch(`${BASE_URL}/track/${encodeURIComponent(number)}`);
    return res.json();
  },

  async addTrackingMilestone(consignmentNumber: string, milestone: { status: string; location: string; description: string; timestamp?: string }) {
    const res = await fetch(`${BASE_URL}/track/milestone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consignmentNumber, milestone }),
    });
    if (!res.ok) throw new Error('Failed to add tracking milestone');
    return res.json();
  },

  // Enquiries
  async getEnquiries(): Promise<CustomerEnquiry[]> {
    const res = await fetch(`${BASE_URL}/enquiries`);
    if (!res.ok) throw new Error('Failed to load enquiries');
    return res.json();
  },

  async createEnquiry(enquiry: Partial<CustomerEnquiry>): Promise<{ success: boolean; enquiry: CustomerEnquiry }> {
    const res = await fetch(`${BASE_URL}/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enquiry),
    });
    if (!res.ok) throw new Error('Failed to submit enquiry');
    return res.json();
  },

  async updateEnquiry(id: string, updates: Partial<CustomerEnquiry>): Promise<{ success: boolean; enquiry: CustomerEnquiry }> {
    const res = await fetch(`${BASE_URL}/enquiries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update enquiry');
    return res.json();
  },

  // Admin Auth & Stats
  async adminLogin(passcode: string) {
    const res = await fetch(`${BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode }),
    });
    return res.json();
  },

  async getAdminStats() {
    const res = await fetch(`${BASE_URL}/admin/stats`);
    if (!res.ok) throw new Error('Failed to load stats');
    return res.json();
  },

  getExportUrl(type: 'orders' | 'courier-bookings') {
    return `${BASE_URL}/export/${type}`;
  },
};

import React, { useState, useEffect } from 'react';
import {
  Lock,
  LogOut,
  LayoutDashboard,
  Package,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Globe,
  Truck,
  CreditCard,
  MessageSquare,
  Settings,
  Download,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  MessageCircle,
  Search,
  Filter,
  Save,
  Check,
  Eye,
  X,
} from 'lucide-react';
import { api } from '../services/api';
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
import { openWhatsAppChat } from '../utils/whatsapp';

interface AdminDashboardProps {
  settings?: BusinessSettings;
  onSettingsUpdated?: (settings: BusinessSettings) => void;
  onClose?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  settings: initialSettings,
  onSettingsUpdated,
  onClose,
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('milan_express_admin_token');
  });
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'bookings'
    | 'orders'
    | 'products'
    | 'purchase_requests'
    | 'nri_requests'
    | 'tracking'
    | 'enquiries'
    | 'settings'
  >('overview');

  // Data states
  const [stats, setStats] = useState<any>(null);
  const [bookings, setBookings] = useState<CourierBooking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [purchaseRequests, setPurchaseRequests] = useState<ProductPurchaseRequest[]>([]);
  const [nriRequests, setNriRequests] = useState<NRIShoppingRequest[]>([]);
  const [enquiries, setEnquiries] = useState<CustomerEnquiry[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [settingsForm, setSettingsForm] = useState<BusinessSettings | null>(initialSettings || null);
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Modals
  const [editingBooking, setEditingBooking] = useState<CourierBooking | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingPurchaseReq, setEditingPurchaseReq] = useState<ProductPurchaseRequest | null>(null);
  const [editingNriReq, setEditingNriReq] = useState<NRIShoppingRequest | null>(null);
  const [trackingModalData, setTrackingModalData] = useState<{
    consignmentNumber: string;
    status: string;
    location: string;
    description: string;
  } | null>(null);

  // New Product form state
  const [newProdTitle, setNewProdTitle] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('spices');
  const [newProdPrice, setNewProdPrice] = useState(250);
  const [newProdStock, setNewProdStock] = useState(25);
  const [newProdWeight, setNewProdWeight] = useState(500);
  const [newProdImage, setNewProdImage] = useState('');
  const [newProdOrigin, setNewProdOrigin] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadAllAdminData();
    }
  }, [isAuthenticated]);

  const loadAllAdminData = async () => {
    setIsLoading(true);
    try {
      const [
        statsData,
        bookingsData,
        ordersData,
        productsData,
        purchaseReqData,
        nriReqData,
        enquiriesData,
        categoriesData,
        settingsData,
      ] = await Promise.all([
        api.getAdminStats(),
        api.getCourierBookings(),
        api.getOrders(),
        api.getProducts(),
        api.getPurchaseRequests(),
        api.getNriRequests(),
        api.getEnquiries(),
        api.getCategories(),
        api.getSettings(),
      ]);

      setStats(statsData);
      setBookings(bookingsData);
      setOrders(ordersData);
      setProducts(productsData);
      setPurchaseRequests(purchaseReqData);
      setNriRequests(nriReqData);
      setEnquiries(enquiriesData);
      setCategories(categoriesData);
      setSettingsForm(settingsData);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setAuthError('');
    try {
      const res = await api.adminLogin(passcode.trim());
      if (res.success && res.token) {
        localStorage.setItem('milan_express_admin_token', res.token);
        setIsAuthenticated(true);
      } else {
        setAuthError('Invalid passcode. Use milan3515 for demo access.');
      }
    } catch {
      setAuthError('Connection error. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('milan_express_admin_token');
    setIsAuthenticated(false);
  };

  // Courier booking quote update
  const handleSaveBookingQuote = async () => {
    if (!editingBooking) return;
    try {
      const res = await api.updateCourierBooking(editingBooking.id, {
        status: editingBooking.status,
        quotationAmount: editingBooking.quotationAmount ? Number(editingBooking.quotationAmount) : undefined,
        quotationNotes: editingBooking.quotationNotes,
        dtdcConsignmentNumber: editingBooking.dtdcConsignmentNumber?.trim() || undefined,
        actualWeightKg: editingBooking.actualWeightKg ? Number(editingBooking.actualWeightKg) : undefined,
        adminNotes: editingBooking.adminNotes,
      });
      if (res.success) {
        setEditingBooking(null);
        loadAllAdminData();
        showNotification('Courier booking updated successfully!');
      }
    } catch (err) {
      alert('Failed to update booking');
    }
  };

  // Order status update
  const handleSaveOrderUpdate = async () => {
    if (!editingOrder) return;
    try {
      const res = await api.updateOrder(editingOrder.id, {
        status: editingOrder.status,
        paymentStatus: editingOrder.paymentStatus,
        dtdcConsignmentNumber: editingOrder.dtdcConsignmentNumber?.trim() || undefined,
      });
      if (res.success) {
        setEditingOrder(null);
        loadAllAdminData();
        showNotification('Order status updated!');
      }
    } catch (err) {
      alert('Failed to update order');
    }
  };

  // Add Product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createProduct({
        title: newProdTitle,
        description: newProdDesc,
        category: newProdCategory,
        priceINR: Number(newProdPrice),
        stock: Number(newProdStock),
        weightGrams: Number(newProdWeight),
        image: newProdImage || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
        origin: newProdOrigin || 'Chennai, India',
        featured: false,
      });
      setIsAddingProduct(false);
      setNewProdTitle('');
      setNewProdDesc('');
      loadAllAdminData();
      showNotification('Product added to catalogue!');
    } catch (err) {
      alert('Failed to add product');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to remove this product from the catalogue?')) {
      await api.deleteProduct(id);
      loadAllAdminData();
      showNotification('Product deleted');
    }
  };

  // Quick Stock Adjustment (+/-)
  const handleQuickStock = async (product: Product, delta: number) => {
    const newStock = Math.max(0, product.stock + delta);
    await api.updateProduct(product.id, { stock: newStock });
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, stock: newStock } : p))
    );
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm) return;
    try {
      const res = await api.updateSettings(settingsForm);
      if (res.success) {
        onSettingsUpdated?.(res.settings);
        showNotification('Business settings updated successfully!');
      }
    } catch (err) {
      alert('Failed to save settings');
    }
  };

  // Add Milestone to Tracking
  const handleAddTrackingMilestone = async () => {
    if (!trackingModalData) return;
    try {
      await api.addTrackingMilestone(trackingModalData.consignmentNumber, {
        status: trackingModalData.status,
        location: trackingModalData.location,
        description: trackingModalData.description,
      });
      setTrackingModalData(null);
      loadAllAdminData();
      showNotification('Tracking milestone recorded!');
    } catch (err) {
      alert('Failed to add milestone');
    }
  };

  const showNotification = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  // 1. LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#102A43] text-[#F28C28] flex items-center justify-center mx-auto shadow-md">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-[#102A43]">Staff & Admin Portal</h2>
            <p className="text-xs text-slate-500">
              Milan Express Authorized Personnel Access
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Enter Admin Passcode
              </label>
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode (Demo: milan3515)"
                className="w-full px-4 py-3 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-[#102A43]"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Default authorization PIN: <strong className="text-slate-700 font-mono">milan3515</strong>
              </span>
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full bg-[#102A43] hover:bg-[#243B53] text-white py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all disabled:opacity-50"
            >
              {isAuthenticating ? 'Authenticating...' : 'Unlock Admin Panel'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. MAIN ADMIN DASHBOARD
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Admin Header Bar */}
      <div className="bg-[#102A43] text-white p-4 sm:p-6 rounded-3xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F28C28] flex items-center justify-center text-white font-black text-lg shadow-sm">
            ME
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black">Milan Express Operations Center</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                Staff Verified
              </span>
            </div>
            <p className="text-xs text-slate-300">
              DTDC Franchise Partner #{settingsForm?.dtdcPartnerBranch || 'TN-CHN-3515'} • Live Order & Logistics Console
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {saveSuccessMsg && (
            <span className="text-xs bg-emerald-500 text-white px-3 py-1.5 rounded-xl font-bold animate-pulse">
              ✓ {saveSuccessMsg}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Admin Nav Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1 overflow-x-auto text-xs font-bold">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'bookings', label: `Courier Bookings (${bookings.length})`, icon: Package },
          { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingCart },
          { id: 'products', label: `Products & Stock (${products.length})`, icon: ShoppingBag },
          { id: 'purchase_requests', label: `Sourcing Reqs (${purchaseRequests.length})`, icon: Sparkles },
          { id: 'nri_requests', label: `NRI Consolidations (${nriRequests.length})`, icon: Globe },
          { id: 'tracking', label: 'Consignment Milestones', icon: Truck },
          { id: 'enquiries', label: `Enquiries (${enquiries.length})`, icon: MessageSquare },
          { id: 'settings', label: 'Settings & QR', icon: Settings },
        ].map((tab) => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2.5 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
                active
                  ? 'bg-[#102A43] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-[#F28C28]" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          {/* Key KPI Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Confirmed Revenue
              </span>
              <div className="text-2xl font-black text-[#102A43]">
                ₹{stats.totalRevenueINR.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-emerald-600 font-semibold">
                {orders.filter((o) => o.paymentStatus === 'verified').length} Paid E-Commerce Orders
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Courier Booking Requests
              </span>
              <div className="text-2xl font-black text-[#F28C28]">
                {stats.courierBookingsCount}
              </div>
              <p className="text-[11px] text-amber-700 font-semibold">
                {stats.pendingBookings} awaiting tariff quotation
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                NRI Procurements & Bundles
              </span>
              <div className="text-2xl font-black text-blue-900">
                {stats.purchaseRequestsCount + stats.nriRequestsCount}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {stats.nriRequestsCount} International Consolidations
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Inventory Catalogue
              </span>
              <div className="text-2xl font-black text-slate-800">
                {stats.totalProducts} Items
              </div>
              <p className="text-[11px] text-red-600 font-semibold">
                {stats.lowStockProducts} Low stock warnings (&lt;10)
              </p>
            </div>
          </div>

          {/* Quick Action Cards & CSV Downloads */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-[#102A43]">Logistics CSV Exports</h3>
              <p className="text-xs text-slate-500">
                Export comprehensive operational records for accounting, GST, and DTDC manifest audits.
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <a
                  href="/api/export/orders"
                  download
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                >
                  <span>Export Customer Orders CSV</span>
                  <Download className="w-4 h-4 text-[#F28C28]" />
                </a>
                <a
                  href="/api/export/courier-bookings"
                  download
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                >
                  <span>Export Courier Bookings CSV</span>
                  <Download className="w-4 h-4 text-[#F28C28]" />
                </a>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-blue-50/60 border border-blue-200 space-y-4">
              <h3 className="font-bold text-sm text-blue-950">Quick Operations</h3>
              <p className="text-xs text-blue-800">
                Direct access to high frequency counter operations.
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('bookings')}
                  className="w-full text-left p-2.5 rounded-xl bg-white border border-blue-200 text-xs font-bold text-blue-900 hover:bg-blue-100/50 flex items-center justify-between"
                >
                  <span>Review Pending Courier Quotes</span>
                  <span className="font-mono bg-blue-200 px-2 py-0.5 rounded text-[11px]">
                    {stats.pendingBookings}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="w-full text-left p-2.5 rounded-xl bg-white border border-blue-200 text-xs font-bold text-blue-900 hover:bg-blue-100/50 flex items-center justify-between"
                >
                  <span>Verify UPI Payment References</span>
                  <span className="font-mono bg-blue-200 px-2 py-0.5 rounded text-[11px]">
                    {orders.filter((o) => o.paymentStatus === 'submitted_verification').length}
                  </span>
                </button>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-amber-50/60 border border-amber-200 space-y-4">
              <h3 className="font-bold text-sm text-amber-950">Customer Inquiries</h3>
              <p className="text-xs text-amber-900">
                New contact inquiries and WhatsApp consultation requests.
              </p>
              <div className="space-y-2">
                <div className="text-2xl font-black text-amber-950">
                  {enquiries.filter((e) => e.status === 'new').length} New Enquiries
                </div>
                <button
                  onClick={() => setActiveTab('enquiries')}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  View Inquiry Inbox
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COURIER BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-[#102A43]">
                Courier Booking Requests & Quotations
              </h3>
              <p className="text-xs text-slate-500">
                Review sender/receiver addresses, assign confirmed quotations, and generate official DTDC AWB Consignment numbers.
              </p>
            </div>
            <a
              href="/api/export/courier-bookings"
              download
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 self-start"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-y border-slate-200 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Ref ID / Date</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Sender</th>
                  <th className="p-3">Receiver & Destination</th>
                  <th className="p-3">Contents / Weight</th>
                  <th className="p-3">Quotation</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">DTDC AWB</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3">
                      <div className="font-mono font-bold text-[#102A43]">{booking.id}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(booking.createdAt).toLocaleDateString('en-IN')}
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          booking.shipmentType === 'international'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {booking.shipmentType}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-800">{booking.senderName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{booking.senderMobile}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{booking.senderPinCode}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-800">{booking.receiverName}</div>
                      <div className="text-[11px] text-slate-500">
                        {booking.receiverPinCodeOrCountry || booking.destinationCountry}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-slate-800 font-medium truncate max-w-[150px]">
                        {booking.parcelContents}
                      </div>
                      <div className="text-[11px] text-slate-500 font-bold">
                        {booking.approxWeightKg} kg declared
                      </div>
                    </td>
                    <td className="p-3">
                      {booking.quotationAmount ? (
                        <span className="font-extrabold text-emerald-700">
                          ₹{booking.quotationAmount.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Not set</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                        {booking.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-xs text-red-600">
                      {booking.dtdcConsignmentNumber || (
                        <span className="text-slate-300 font-normal italic">Unassigned</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingBooking(booking)}
                          className="px-2.5 py-1 rounded-lg bg-[#102A43] text-white font-bold text-[11px] hover:bg-[#243B53]"
                        >
                          Quote / Manage
                        </button>
                        <button
                          onClick={() =>
                            openWhatsAppChat(
                              {
                                type: 'courier',
                                context: {
                                  bookingId: booking.id,
                                  destination: booking.receiverPinCodeOrCountry,
                                },
                              },
                              booking.senderMobile
                            )
                          }
                          className="p-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          title="WhatsApp Sender"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOMER ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-[#102A43]">
                Customer E-Commerce Orders
              </h3>
              <p className="text-xs text-slate-500">
                Manage order fulfillment, verify UPI UTR references, and attach DTDC consignment tracking.
              </p>
            </div>
            <a
              href="/api/export/orders"
              download
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 self-start"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Orders CSV</span>
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-y border-slate-200 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Order ID / Date</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Address</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Total Payable</th>
                  <th className="p-3">Payment Verification</th>
                  <th className="p-3">Fulfillment</th>
                  <th className="p-3">DTDC AWB</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-[#102A43]">
                      <div>{order.id}</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        {new Date(order.createdAt).toLocaleDateString('en-IN')}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-800">{order.customerName}</div>
                      <div className="text-[11px] text-slate-500">{order.customerMobile}</div>
                    </td>
                    <td className="p-3 text-slate-600 max-w-[160px] truncate">
                      {order.deliveryAddress}, {order.city} ({order.pinCode})
                    </td>
                    <td className="p-3 font-semibold text-slate-700">
                      {order.items.length} items
                    </td>
                    <td className="p-3 font-extrabold text-[#F28C28]">
                      ₹{order.totalINR.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          order.paymentStatus === 'verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                      {order.paymentTransactionRef && (
                        <div className="font-mono text-[10px] text-slate-500 mt-0.5 truncate max-w-[120px]">
                          UTR: {order.paymentTransactionRef}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-xs text-red-600">
                      {order.dtdcConsignmentNumber || (
                        <span className="text-slate-300 font-normal italic">Unassigned</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setEditingOrder(order)}
                        className="px-2.5 py-1 rounded-lg bg-[#102A43] text-white font-bold text-[11px] hover:bg-[#243B53]"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PRODUCTS & INVENTORY */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-[#102A43]">
                Catalogue Inventory & Stock Management
              </h3>
              <p className="text-xs text-slate-500">
                Add genuine items, update prices in INR, adjust stock counts, or delete discontinued products.
              </p>
            </div>
            <button
              onClick={() => setIsAddingProduct(true)}
              className="px-4 py-2 rounded-xl bg-[#F28C28] hover:bg-[#E07817] text-white text-xs font-bold flex items-center gap-1.5 self-start shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-y border-slate-200 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Item Details</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price (INR)</th>
                  <th className="p-3">Weight</th>
                  <th className="p-3">Stock Counter</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 flex items-center gap-3">
                      <img
                        src={p.image}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                      />
                      <div>
                        <div className="font-bold text-slate-900 leading-snug">{p.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{p.id}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold uppercase">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-3 font-extrabold text-[#102A43]">
                      ₹{p.priceINR.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-slate-600 font-medium">{p.weightGrams}g</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuickStock(p, -5)}
                          className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                          title="-5"
                        >
                          -5
                        </button>
                        <span
                          className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                            p.stock < 10
                              ? 'bg-red-100 text-red-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {p.stock} units
                        </span>
                        <button
                          onClick={() => handleQuickStock(p, 5)}
                          className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                          title="+5"
                        >
                          +5
                        </button>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: PRODUCT SOURCING REQUESTS */}
      {activeTab === 'purchase_requests' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-black text-[#102A43]">
              Custom Indian Product Sourcing Requests
            </h3>
            <p className="text-xs text-slate-500">
              Review custom procurement inquiries from customers, provide quotations, and update sourcing status.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-y border-slate-200 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Req ID / Date</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Item Requested</th>
                  <th className="p-3">Store Preference</th>
                  <th className="p-3">Destination</th>
                  <th className="p-3">Quoted Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchaseRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-[#102A43]">{req.id}</td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-800">{req.customerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{req.customerWhatsApp}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{req.productName}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">{req.productDescription}</div>
                    </td>
                    <td className="p-3 text-slate-600">
                      {req.referenceUrlOrStore || 'Any authentic vendor'}
                    </td>
                    <td className="p-3 font-semibold text-slate-700">{req.deliveryCountry}</td>
                    <td className="p-3 font-bold text-[#F28C28]">
                      {req.totalQuotedINR ? `₹${req.totalQuotedINR.toLocaleString('en-IN')}` : 'Pending Quote'}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                        {req.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setEditingPurchaseReq(req)}
                        className="px-2.5 py-1 rounded-lg bg-[#102A43] text-white font-bold text-[11px] hover:bg-[#243B53]"
                      >
                        Set Quote
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: NRI CONSOLIDATIONS */}
      {activeTab === 'nri_requests' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-black text-[#102A43]">
              NRI Shopping & Package Consolidation Requests
            </h3>
            <p className="text-xs text-slate-500">
              Manage incoming parcels, calculate combined volumetric weight, and quote DTDC international air freight.
            </p>
          </div>

          <div className="space-y-4">
            {nriRequests.map((nri) => (
              <div
                key={nri.id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#102A43]">{nri.id}</span>
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 text-[10px] font-bold uppercase">
                        {nri.serviceType.replace('_', ' ')}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                        {nri.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      Customer: <span className="font-semibold text-slate-900">{nri.customerName}</span> ({nri.customerWhatsApp}) • Destination: <strong className="text-slate-900">{nri.destinationCountry}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingNriReq(nri)}
                      className="px-3 py-1.5 rounded-xl bg-[#102A43] text-white font-bold text-xs"
                    >
                      Update Quote / Status
                    </button>
                    <button
                      onClick={() =>
                        openWhatsAppChat(
                          {
                            type: 'nri',
                            context: {
                              bookingId: nri.id,
                              destination: nri.destinationCountry,
                            },
                          },
                          nri.customerWhatsApp
                        )
                      }
                      className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                      title="WhatsApp Customer"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-xs">
                  <span className="font-bold text-slate-700 block mb-1">Packages / Items in this request:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {nri.itemList?.map((item, idx) => (
                      <div key={idx} className="p-2 bg-white rounded-lg border border-slate-200 text-[11px]">
                        <span className="font-bold text-slate-800">{item.itemName}</span>
                        <div className="text-slate-500">Qty: {item.quantity} {item.preferredShopOrBrand ? `• ${item.preferredShopOrBrand}` : ''}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {(nri.quotedConsolidationINR || nri.quotedInternationalShippingINR) && (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-600">
                      Consolidation: ₹{nri.quotedConsolidationINR || 0} + DTDC International Freight: ₹{nri.quotedInternationalShippingINR || 0}
                    </span>
                    <span className="font-extrabold text-[#F28C28]">
                      Total Quote: ₹{((nri.quotedConsolidationINR || 0) + (nri.quotedInternationalShippingINR || 0)).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: TRACKING & CONSIGNMENTS */}
      {activeTab === 'tracking' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-[#102A43]">
                Shipment Tracking & Milestone Manager
              </h3>
              <p className="text-xs text-slate-500">
                Log authenticated milestone updates for any active DTDC consignment.
              </p>
            </div>
            <button
              onClick={() =>
                setTrackingModalData({
                  consignmentNumber: 'MEX-DTDC-',
                  status: 'In Transit',
                  location: 'Milan Express Chennai Hub',
                  description: 'Package scanned and dispatched on overnight connection.',
                })
              }
              className="px-4 py-2 rounded-xl bg-[#102A43] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4 text-[#F28C28]" />
              <span>Add New Tracking Milestone</span>
            </button>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600">
            Official DTDC consignments linked to courier bookings and orders automatically appear in customer tracking. When a milestone is logged below, the recipient sees the live event immediately.
          </div>
        </div>
      )}

      {/* TAB 8: ENQUIRIES */}
      {activeTab === 'enquiries' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-black text-[#102A43]">Customer Contact Enquiries</h3>
            <p className="text-xs text-slate-500">
              Submissions from the Contact page and general WhatsApp inquiries.
            </p>
          </div>

          <div className="space-y-3">
            {enquiries.map((enq) => (
              <div
                key={enq.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{enq.name}</span>
                    <span className="text-slate-500 font-mono">({enq.mobile})</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 uppercase">
                      {enq.enquiryType}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(enq.createdAt).toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                  {enq.message}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">Status: {enq.status}</span>
                  <button
                    onClick={() =>
                      openWhatsAppChat(
                        {
                          type: 'general',
                        },
                        enq.mobile
                      )
                    }
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 text-[11px]"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Reply on WhatsApp</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 9: SETTINGS & QR */}
      {activeTab === 'settings' && settingsForm && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-black text-[#102A43]">
              Website & Payment Gateway Settings
            </h3>
            <p className="text-xs text-slate-500">
              Configure authorized WhatsApp contacts, official branch details, UPI QR credentials, and courier shipping parameters.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
            {/* Phone & Contacts */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <h4 className="font-bold text-sm text-[#102A43] uppercase tracking-wider">
                Authorized Contact Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Primary Phone / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.primaryPhone}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, primaryPhone: e.target.value })
                    }
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Secondary Contact Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.secondaryPhone}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, secondaryPhone: e.target.value })
                    }
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Support Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={settingsForm.supportEmail}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, supportEmail: e.target.value })
                    }
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl bg-white"
                  />
                </div>
              </div>
            </div>

            {/* DTDC Partner Branch Info */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <h4 className="font-bold text-sm text-[#102A43] uppercase tracking-wider">
                DTDC Channel Partner Credentials
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Franchise / Partner Branch Name
                  </label>
                  <input
                    type="text"
                    value={settingsForm.dtdcPartnerBranch}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, dtdcPartnerBranch: e.target.value })
                    }
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Counter Street Address
                  </label>
                  <input
                    type="text"
                    value={settingsForm.addressLine}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, addressLine: e.target.value })
                    }
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={settingsForm.city || 'Chennai'}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, city: e.target.value })
                    }
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={settingsForm.state || 'Tamil Nadu'}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, state: e.target.value })
                    }
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={settingsForm.pincode || '600042'}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, pincode: e.target.value })
                    }
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl bg-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* UPI & Payment Settings */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <h4 className="font-bold text-sm text-[#102A43] uppercase tracking-wider">
                Merchant UPI QR Configuration
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Official Merchant UPI ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.upiId}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, upiId: e.target.value })
                    }
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl bg-white font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Customers scan dynamic QR code encoded with this verified VPA.
                  </p>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Verified Payee Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.upiPayeeName}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, upiPayeeName: e.target.value })
                    }
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Rates Configuration */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <h4 className="font-bold text-sm text-[#102A43] uppercase tracking-wider">
                Configured Shipping Tariff Rates
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Domestic Flat Shipping (INR)
                  </label>
                  <input
                    type="number"
                    value={settingsForm.domesticFlatShippingINR}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        domesticFlatShippingINR: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Free Domestic Delivery Threshold (INR)
                  </label>
                  <input
                    type="number"
                    value={settingsForm.freeShippingThresholdINR}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        freeShippingThresholdINR: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    International Base Rate per KG (INR)
                  </label>
                  <input
                    type="number"
                    value={settingsForm.internationalBaseRatePerKgINR}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        internationalBaseRatePerKgINR: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-8 py-3 rounded-xl bg-[#F28C28] hover:bg-[#E07817] text-white font-bold flex items-center gap-2 shadow-md transition-all text-sm"
              >
                <Save className="w-4 h-4" />
                <span>Save All Business Settings</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT COURIER BOOKING MODAL */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h4 className="font-bold text-base text-[#102A43]">
                Manage Courier Booking {editingBooking.id}
              </h4>
              <button onClick={() => setEditingBooking(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="text-xs space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div>Sender: <strong>{editingBooking.senderName}</strong> ({editingBooking.senderMobile})</div>
                <div>Destination: <strong>{editingBooking.receiverAddress}, {editingBooking.receiverPinCodeOrCountry || editingBooking.destinationCountry}</strong></div>
                <div>Contents: <strong>{editingBooking.parcelContents}</strong> (~{editingBooking.approxWeightKg} kg)</div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Booking Status</label>
                <select
                  value={editingBooking.status}
                  onChange={(e) =>
                    setEditingBooking({ ...editingBooking, status: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="requested">Requested (Pending Counter Review)</option>
                  <option value="quotation_ready">Quotation Ready</option>
                  <option value="quotation_accepted">Quotation Accepted</option>
                  <option value="pickup_scheduled">Doorstep Pickup Scheduled</option>
                  <option value="picked_up">Parcel Picked Up by Executive</option>
                  <option value="booked_with_dtdc">Booked with DTDC (Consignment Assigned)</option>
                  <option value="in_transit">In Transit (DTDC Hub)</option>
                  <option value="delivered">Delivered to Consignee</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Confirmed Quotation Amount (INR)
                  </label>
                  <input
                    type="number"
                    value={editingBooking.quotationAmount || ''}
                    onChange={(e) =>
                      setEditingBooking({
                        ...editingBooking,
                        quotationAmount: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="e.g. 450"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Actual Weighed Weight (KG)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingBooking.actualWeightKg || ''}
                    onChange={(e) =>
                      setEditingBooking({
                        ...editingBooking,
                        actualWeightKg: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="e.g. 2.4"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Assign Actual DTDC AWB Consignment Number *
                </label>
                <input
                  type="text"
                  value={editingBooking.dtdcConsignmentNumber || ''}
                  onChange={(e) =>
                    setEditingBooking({
                      ...editingBooking,
                      dtdcConsignmentNumber: e.target.value,
                    })
                  }
                  placeholder="e.g. MEX-DTDC-7849120 or official DTDC 9-digit barcode"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Assigning a consignment number automatically updates the customer tracking view and syncs DTDC milestone events.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Quotation Notes / Remarks
                </label>
                <input
                  type="text"
                  value={editingBooking.quotationNotes || ''}
                  onChange={(e) =>
                    setEditingBooking({
                      ...editingBooking,
                      quotationNotes: e.target.value,
                    })
                  }
                  placeholder="e.g. Includes vacuum food packaging & priority air connection"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveBookingQuote}
                  className="px-5 py-2 bg-[#102A43] text-white rounded-xl font-bold"
                >
                  Save Booking Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT ORDER MODAL */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h4 className="font-bold text-base text-[#102A43]">
                Manage Order {editingOrder.id}
              </h4>
              <button onClick={() => setEditingOrder(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="text-xs space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div>Customer: <strong>{editingOrder.customerName}</strong> ({editingOrder.customerMobile})</div>
                <div>Amount: <strong className="text-[#F28C28]">₹{editingOrder.totalINR}</strong></div>
                {editingOrder.paymentTransactionRef && (
                  <div>Submitted UTR / Ref: <strong className="font-mono text-blue-800">{editingOrder.paymentTransactionRef}</strong></div>
                )}
                {editingOrder.paymentScreenshotUrl && (
                  <div className="pt-1">
                    <a
                      href={editingOrder.paymentScreenshotUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-700 underline font-bold"
                    >
                      View Uploaded Payment Screenshot Proof
                    </a>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={editingOrder.paymentStatus}
                    onChange={(e) =>
                      setEditingOrder({ ...editingOrder, paymentStatus: e.target.value as any })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="submitted_verification">Submitted for Verification</option>
                    <option value="verified">Verified (Approved)</option>
                    <option value="failed">Failed / Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Fulfillment Status
                  </label>
                  <select
                    value={editingOrder.status}
                    onChange={(e) =>
                      setEditingOrder({ ...editingOrder, status: e.target.value as any })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="pending_payment">Pending Payment</option>
                    <option value="processing">Processing & Packing</option>
                    <option value="shipped">Shipped via DTDC</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Assign DTDC AWB Consignment Tracking Number
                </label>
                <input
                  type="text"
                  value={editingOrder.dtdcConsignmentNumber || ''}
                  onChange={(e) =>
                    setEditingOrder({ ...editingOrder, dtdcConsignmentNumber: e.target.value })
                  }
                  placeholder="e.g. MEX-DTDC-8930211"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveOrderUpdate}
                  className="px-5 py-2 bg-[#102A43] text-white rounded-xl font-bold"
                >
                  Save Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      {isAddingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h4 className="font-bold text-base text-[#102A43]">Add Product to Catalogue</h4>
              <button onClick={() => setIsAddingProduct(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="text-xs space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={newProdTitle}
                  onChange={(e) => setNewProdTitle(e.target.value)}
                  placeholder="e.g. Authentic Kumbakonam Degree Coffee"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="spices">Spices & Masalas</option>
                    <option value="sweets">Traditional Sweets & Snacks</option>
                    <option value="pooja">Pooja & Spiritual Items</option>
                    <option value="beverages">Filter Coffee & Beverages</option>
                    <option value="wellness">Ayurveda & Herbal Care</option>
                    <option value="handicrafts">Brassware & Handicrafts</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price (INR) *</label>
                  <input
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Weight in Grams *</label>
                  <input
                    type="number"
                    required
                    value={newProdWeight}
                    onChange={(e) => setNewProdWeight(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={newProdImage}
                  onChange={(e) => setNewProdImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Detailed Description *</label>
                <textarea
                  required
                  rows={2}
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="Flavor notes, authentic ingredients, certifications..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingProduct(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#F28C28] text-white rounded-xl font-bold"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TRACKING MILESTONE MODAL */}
      {trackingModalData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h4 className="font-bold text-base text-[#102A43]">Log Tracking Milestone</h4>
              <button onClick={() => setTrackingModalData(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="text-xs space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">DTDC Consignment Number</label>
                <input
                  type="text"
                  required
                  value={trackingModalData.consignmentNumber}
                  onChange={(e) =>
                    setTrackingModalData({ ...trackingModalData, consignmentNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Status Event</label>
                <select
                  value={trackingModalData.status}
                  onChange={(e) =>
                    setTrackingModalData({ ...trackingModalData, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                >
                  <option>Booked with DTDC - AWB Assigned</option>
                  <option>Departed from Milan Express Origin Hub</option>
                  <option>In Transit at Regional Sorting Center</option>
                  <option>Customs Clearance Completed (Air Cargo)</option>
                  <option>Arrived at Destination Airport</option>
                  <option>Out for Delivery</option>
                  <option>Delivered</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Location / Hub</label>
                <input
                  type="text"
                  value={trackingModalData.location}
                  onChange={(e) =>
                    setTrackingModalData({ ...trackingModalData, location: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={trackingModalData.description}
                  onChange={(e) =>
                    setTrackingModalData({ ...trackingModalData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTrackingModalData(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddTrackingMilestone}
                  className="px-5 py-2 bg-[#102A43] text-white rounded-xl font-bold"
                >
                  Save Milestone Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

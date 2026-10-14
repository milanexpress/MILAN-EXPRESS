import React, { useState, useEffect } from 'react';
import {
  Search,
  Package,
  Calendar,
  Truck,
  CheckCircle,
  Clock,
  Printer,
  ExternalLink,
  MessageCircle,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { BusinessSettings, Order } from '../types';
import { openWhatsAppChat } from '../utils/whatsapp';

interface MyOrdersViewProps {
  onTrackShipment: (consignmentNumber: string) => void;
  settings?: BusinessSettings;
}

export const MyOrdersView: React.FC<MyOrdersViewProps> = ({
  onTrackShipment,
  settings,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await api.getOrders();
      setOrders(data);
      setFilteredOrders(data);
      if (data.length > 0) setSelectedOrder(data[0]);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchTerm.trim().toLowerCase();
    if (!q) {
      setFilteredOrders(orders);
      return;
    }
    const matching = orders.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.customerMobile.includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        (o.dtdcConsignmentNumber && o.dtdcConsignmentNumber.toLowerCase().includes(q))
    );
    setFilteredOrders(matching);
    if (matching.length > 0) setSelectedOrder(matching[0]);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-[#102A43] tracking-tight">
          My Orders & Invoices
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Look up order status, payment settlement, official invoices, and DTDC consignment details using your mobile number or Order ID.
        </p>
      </div>

      {/* Lookup Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Order ID (e.g. MEX-ORD-2026-9281) or Mobile Number..."
              className="w-full pl-11 pr-4 py-3 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-[#102A43]"
            />
          </div>
          <button
            type="submit"
            className="bg-[#102A43] hover:bg-[#243B53] text-white px-6 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2"
          >
            <span>Search Orders</span>
          </button>
        </form>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-400">Loading order records...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-base">No matching orders found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try searching with the mobile number you entered during checkout or your Order ID.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List Column */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
              Found Orders ({filteredOrders.length})
            </div>
            {filteredOrders.map((order) => {
              const isSelected = selectedOrder?.id === order.id;
              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white border-[#102A43] ring-2 ring-[#102A43]/10 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-mono font-bold text-xs text-[#102A43]">{order.id}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        order.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'shipped'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <span className="text-slate-600 font-medium">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </span>
                    <span className="font-extrabold text-[#F28C28]">
                      ₹{order.totalINR.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Details & Receipt Column */}
          <div className="lg:col-span-2">
            {selectedOrder ? (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-mono font-black text-lg text-[#102A43]">
                        {selectedOrder.id}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs uppercase">
                        {selectedOrder.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Customer: <span className="font-semibold text-slate-800">{selectedOrder.customerName}</span> ({selectedOrder.customerMobile})
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.print()}
                      className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print</span>
                    </button>

                    <button
                      onClick={() =>
                        openWhatsAppChat(
                          {
                            type: 'order',
                            context: {
                              orderId: selectedOrder.id,
                              customerName: selectedOrder.customerName,
                            },
                          },
                          settings?.primaryPhone
                        )
                      }
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Support</span>
                    </button>
                  </div>
                </div>

                {/* DTDC Consignment Dispatch Alert */}
                {selectedOrder.dtdcConsignmentNumber ? (
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-blue-950">
                        <Truck className="w-4 h-4 text-blue-700" />
                        <span>DTDC Consignment Dispatched</span>
                      </div>
                      <div className="font-mono font-bold text-blue-900 mt-0.5">
                        AWB: {selectedOrder.dtdcConsignmentNumber}
                      </div>
                    </div>
                    <button
                      onClick={() => onTrackShipment(selectedOrder.dtdcConsignmentNumber!)}
                      className="px-4 py-2 rounded-xl bg-[#102A43] hover:bg-[#243B53] text-white text-xs font-bold flex items-center gap-1.5"
                    >
                      <span>Track Live Movement</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>
                      Packaging & DTDC consignment assignment in progress at Milan Express warehouse.
                    </span>
                  </div>
                )}

                {/* Delivery & Payment details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block uppercase text-[10px] font-bold">
                      Delivery Address
                    </span>
                    <div className="font-semibold text-slate-900 mt-0.5">
                      {selectedOrder.deliveryAddress}
                    </div>
                    <div className="text-slate-600">
                      {selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pinCode}
                    </div>
                    <div className="text-slate-600 font-medium">{selectedOrder.country}</div>
                  </div>

                  <div>
                    <span className="text-slate-500 block uppercase text-[10px] font-bold">
                      Payment Verification
                    </span>
                    <div className="mt-0.5">
                      Mode: <span className="font-semibold text-slate-800 capitalize">{selectedOrder.paymentMethod.replace('_', ' ')}</span>
                    </div>
                    <div>
                      Status:{' '}
                      <span className="font-bold text-emerald-700">
                        {selectedOrder.paymentStatus}
                      </span>
                    </div>
                    {selectedOrder.paymentTransactionRef && (
                      <div className="font-mono text-[11px] text-slate-500 mt-1 truncate">
                        UTR / Ref: {selectedOrder.paymentTransactionRef}
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items Table */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Order Items
                  </h4>
                  <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="p-3">Product</th>
                          <th className="p-3 text-center">Qty</th>
                          <th className="p-3 text-right">Unit Price</th>
                          <th className="p-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedOrder.items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="p-3 font-medium text-slate-800 flex items-center gap-2">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt=""
                                  className="w-8 h-8 rounded object-cover bg-slate-100"
                                />
                              )}
                              <span>{item.title}</span>
                            </td>
                            <td className="p-3 text-center text-slate-600">{item.quantity}</td>
                            <td className="p-3 text-right text-slate-600">₹{item.priceINR}</td>
                            <td className="p-3 text-right font-bold text-slate-800">
                              ₹{(item.priceINR * item.quantity).toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-50 border-t border-slate-200 font-semibold text-slate-700">
                        <tr>
                          <td colSpan={3} className="p-2.5 text-right">
                            Subtotal:
                          </td>
                          <td className="p-2.5 text-right">
                            ₹{selectedOrder.subtotalINR.toLocaleString('en-IN')}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={3} className="p-2.5 text-right">
                            Shipping Fee:
                          </td>
                          <td className="p-2.5 text-right">
                            {selectedOrder.shippingChargesINR === 0
                              ? 'FREE'
                              : `₹${selectedOrder.shippingChargesINR.toLocaleString('en-IN')}`}
                          </td>
                        </tr>
                        <tr className="text-sm font-black text-[#102A43]">
                          <td colSpan={3} className="p-3 text-right">
                            Grand Total:
                          </td>
                          <td className="p-3 text-right text-[#F28C28]">
                            ₹{selectedOrder.totalINR.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

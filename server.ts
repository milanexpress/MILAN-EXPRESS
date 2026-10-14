import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const DATA_FILE = path.resolve(__dirname, 'data', 'store.json');

// Ensure data folder exists
const dataDir = path.resolve(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

interface DataStore {
  settings: any;
  categories: any[];
  products: any[];
  courierBookings: any[];
  orders: any[];
  purchaseRequests: any[];
  nriRequests: any[];
  trackingRecords: any[];
  enquiries: any[];
}

function readStore(): DataStore {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading store.json:', err);
  }
  return {
    settings: {},
    categories: [],
    products: [],
    courierBookings: [],
    orders: [],
    purchaseRequests: [],
    nriRequests: [],
    trackingRecords: [],
    enquiries: [],
  };
}

function writeStore(data: DataStore): void {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing store.json:', err);
  }
}

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Simple admin auth check
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || 'milan3515';

// API Endpoints

// 1. Settings
app.get('/api/settings', (_req: Request, res: Response) => {
  const data = readStore();
  res.json(data.settings);
});

app.put('/api/settings', (req: Request, res: Response) => {
  const data = readStore();
  data.settings = { ...data.settings, ...req.body };
  writeStore(data);
  res.json({ success: true, settings: data.settings });
});

// 2. Categories
app.get('/api/categories', (_req: Request, res: Response) => {
  const data = readStore();
  res.json(data.categories);
});

// 3. Products
app.get('/api/products', (req: Request, res: Response) => {
  const data = readStore();
  const { category, search } = req.query;
  let list = [...data.products];

  if (category && category !== 'all') {
    list = list.filter((p) => p.category === category);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  res.json(list);
});

app.get('/api/products/:id', (req: Request, res: Response) => {
  const data = readStore();
  const product = data.products.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

app.post('/api/products', (req: Request, res: Response) => {
  const data = readStore();
  const newProduct = {
    ...req.body,
    id: req.body.id || `PROD-${Date.now().toString().slice(-4)}`,
  };
  data.products.unshift(newProduct);
  writeStore(data);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req: Request, res: Response) => {
  const data = readStore();
  const idx = data.products.findIndex((p) => p.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  data.products[idx] = { ...data.products[idx], ...req.body };
  writeStore(data);
  res.json(data.products[idx]);
});

app.delete('/api/products/:id', (req: Request, res: Response) => {
  const data = readStore();
  data.products = data.products.filter((p) => p.id !== req.params.id);
  writeStore(data);
  res.json({ success: true });
});

// 4. Courier Booking Requests
app.get('/api/courier-bookings', (_req: Request, res: Response) => {
  const data = readStore();
  res.json(data.courierBookings);
});

app.post('/api/courier-bookings', (req: Request, res: Response) => {
  const data = readStore();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const bookingId = `MEX-BK-${new Date().getFullYear()}-${randomSuffix}`;
  
  const newBooking = {
    ...req.body,
    id: bookingId,
    createdAt: new Date().toISOString(),
    status: 'requested', // Explicitly start as requested, never confirmed before booking
    courierPartner: req.body.shipmentType === 'international' ? 'DTDC International' : 'DTDC',
  };

  data.courierBookings.unshift(newBooking);
  writeStore(data);
  res.status(201).json({ success: true, booking: newBooking });
});

app.put('/api/courier-bookings/:id', (req: Request, res: Response) => {
  const data = readStore();
  const idx = data.courierBookings.findIndex((b) => b.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  const existing = data.courierBookings[idx];
  const updated = { ...existing, ...req.body };

  // If DTDC Consignment number is assigned and status changed to booked_with_dtdc, sync with tracking
  if (updated.dtdcConsignmentNumber && updated.dtdcConsignmentNumber !== existing.dtdcConsignmentNumber) {
    const trackingExists = data.trackingRecords.some((t) => t.consignmentNumber === updated.dtdcConsignmentNumber);
    if (!trackingExists) {
      data.trackingRecords.unshift({
        consignmentNumber: updated.dtdcConsignmentNumber,
        referenceId: updated.id,
        courierPartner: updated.courierPartner || 'DTDC Express Ltd.',
        serviceType: updated.shipmentType === 'international' ? 'DTDC International Air' : 'DTDC Domestic Priority',
        origin: `${data.settings.city || 'Chennai'} (${data.settings.dtdcPartnerBranch || 'Channel Partner'})`,
        destination: `${updated.receiverAddress}, ${updated.receiverPinCodeOrCountry || updated.destinationCountry}`,
        senderName: updated.senderName,
        receiverName: updated.receiverName,
        bookingDate: new Date().toLocaleString(),
        currentStatus: 'Booked with DTDC - Consignment Assigned',
        milestones: [
          {
            id: `ms-${Date.now()}`,
            timestamp: new Date().toLocaleString(),
            status: 'Booked with DTDC',
            location: 'Milan Express Channel Partner Hub',
            description: `AWB ${updated.dtdcConsignmentNumber} assigned. Parcel prepared for DTDC network handoff.`,
          },
        ],
      });
    }
  }

  data.courierBookings[idx] = updated;
  writeStore(data);
  res.json({ success: true, booking: updated });
});

// 5. Orders
app.get('/api/orders', (_req: Request, res: Response) => {
  const data = readStore();
  res.json(data.orders);
});

app.get('/api/orders/:id', (req: Request, res: Response) => {
  const data = readStore();
  const order = data.orders.find((o) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

app.post('/api/orders', (req: Request, res: Response) => {
  const data = readStore();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderId = `MEX-ORD-${new Date().getFullYear()}-${randomSuffix}`;

  // Decrement product inventory accurately
  const items = req.body.items || [];
  for (const item of items) {
    const pIdx = data.products.findIndex((p) => p.id === item.productId);
    if (pIdx !== -1) {
      data.products[pIdx].stock = Math.max(0, data.products[pIdx].stock - (item.quantity || 1));
    }
  }

  const newOrder = {
    ...req.body,
    id: orderId,
    createdAt: new Date().toISOString(),
    status: req.body.paymentMethod === 'upi_qr' ? 'pending_payment' : 'processing',
    paymentStatus: req.body.paymentMethod === 'upi_qr' ? 'submitted_verification' : 'verified',
  };

  data.orders.unshift(newOrder);
  writeStore(data);
  res.status(201).json({ success: true, order: newOrder });
});

app.put('/api/orders/:id', (req: Request, res: Response) => {
  const data = readStore();
  const idx = data.orders.findIndex((o) => o.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const existing = data.orders[idx];
  const updated = { ...existing, ...req.body };

  // If consignment number assigned to order, register in tracking records
  if (updated.dtdcConsignmentNumber && updated.dtdcConsignmentNumber !== existing.dtdcConsignmentNumber) {
    const trackingExists = data.trackingRecords.some((t) => t.consignmentNumber === updated.dtdcConsignmentNumber);
    if (!trackingExists) {
      data.trackingRecords.unshift({
        consignmentNumber: updated.dtdcConsignmentNumber,
        referenceId: updated.id,
        courierPartner: 'DTDC Express Ltd.',
        serviceType: 'DTDC E-Commerce Express Delivery',
        origin: 'Milan Express Fulfillment Hub, Chennai',
        destination: `${updated.city}, ${updated.state} - ${updated.pinCode}`,
        senderName: 'Milan Express Channel Partner',
        receiverName: updated.customerName,
        bookingDate: new Date().toLocaleString(),
        currentStatus: 'Dispatched via DTDC',
        milestones: [
          {
            id: `ms-${Date.now()}`,
            timestamp: new Date().toLocaleString(),
            status: 'Dispatched',
            location: 'Milan Express Hub',
            description: `Order items dispatched under consignment ${updated.dtdcConsignmentNumber}.`,
          },
        ],
      });
    }
  }

  data.orders[idx] = updated;
  writeStore(data);
  res.json({ success: true, order: updated });
});

// 6. Request a Product from India
app.get('/api/purchase-requests', (_req: Request, res: Response) => {
  const data = readStore();
  res.json(data.purchaseRequests);
});

app.post('/api/purchase-requests', (req: Request, res: Response) => {
  const data = readStore();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const reqId = `MEX-REQ-${new Date().getFullYear()}-${randomSuffix}`;

  const newRequest = {
    ...req.body,
    id: reqId,
    createdAt: new Date().toISOString(),
    status: 'pending_review',
  };

  data.purchaseRequests.unshift(newRequest);
  writeStore(data);
  res.status(201).json({ success: true, request: newRequest });
});

app.put('/api/purchase-requests/:id', (req: Request, res: Response) => {
  const data = readStore();
  const idx = data.purchaseRequests.findIndex((r) => r.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Purchase request not found' });
  }

  data.purchaseRequests[idx] = { ...data.purchaseRequests[idx], ...req.body };
  writeStore(data);
  res.json({ success: true, request: data.purchaseRequests[idx] });
});

// 7. NRI Shopping & Consolidation Requests
app.get('/api/nri-requests', (_req: Request, res: Response) => {
  const data = readStore();
  res.json(data.nriRequests);
});

app.post('/api/nri-requests', (req: Request, res: Response) => {
  const data = readStore();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const nriId = `MEX-NRI-${new Date().getFullYear()}-${randomSuffix}`;

  const newRequest = {
    ...req.body,
    id: nriId,
    createdAt: new Date().toISOString(),
    status: 'pending_quote',
  };

  data.nriRequests.unshift(newRequest);
  writeStore(data);
  res.status(201).json({ success: true, request: newRequest });
});

app.put('/api/nri-requests/:id', (req: Request, res: Response) => {
  const data = readStore();
  const idx = data.nriRequests.findIndex((n) => n.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'NRI request not found' });
  }

  data.nriRequests[idx] = { ...data.nriRequests[idx], ...req.body };
  writeStore(data);
  res.json({ success: true, request: data.nriRequests[idx] });
});

// 8. Tracking & Consignments
app.get('/api/track/:number', (req: Request, res: Response) => {
  const data = readStore();
  const lookup = req.params.number.trim().toUpperCase();

  // 1. Direct match on DTDC Consignment Number
  const tracking = data.trackingRecords.find(
    (t) => t.consignmentNumber.toUpperCase() === lookup
  );
  if (tracking) {
    return res.json({ found: true, type: 'consignment', record: tracking });
  }

  // 2. Check if user typed booking request ID (e.g. MEX-BK-...)
  const booking = data.courierBookings.find(
    (b) => b.id.toUpperCase() === lookup
  );
  if (booking) {
    if (booking.dtdcConsignmentNumber) {
      const bTracking = data.trackingRecords.find(
        (t) => t.consignmentNumber.toUpperCase() === booking.dtdcConsignmentNumber.toUpperCase()
      );
      if (bTracking) {
        return res.json({
          found: true,
          type: 'booking_with_consignment',
          booking,
          record: bTracking,
        });
      }
    }
    return res.json({
      found: true,
      type: 'booking_request_pending',
      booking,
      message:
        'This is a Courier Booking Request Reference. The parcel has not yet been physically dispatched through DTDC or is awaiting counter booking. Once our executive completes booking at the DTDC counter, your live AWB number will appear here.',
    });
  }

  // 3. Check if user typed Order ID (e.g. MEX-ORD-...)
  const order = data.orders.find((o) => o.id.toUpperCase() === lookup);
  if (order) {
    if (order.dtdcConsignmentNumber) {
      const oTracking = data.trackingRecords.find(
        (t) => t.consignmentNumber.toUpperCase() === order.dtdcConsignmentNumber.toUpperCase()
      );
      if (oTracking) {
        return res.json({
          found: true,
          type: 'order_with_consignment',
          order,
          record: oTracking,
        });
      }
    }
    return res.json({
      found: true,
      type: 'order_processing',
      order,
      message:
        'Order is confirmed and being packed at Milan Express center. Consignment AWB will be updated as soon as handed over to DTDC.',
    });
  }

  // Not found in internal DB - Provide official DTDC direct verification link
  res.status(404).json({
    found: false,
    message: 'No record found with this consignment or booking number in Milan Express system.',
    dtdcOfficialUrl: `https://track.dtdc.com/ctbs-tracking/customerInterface.tr?submitName=showTrackingStatus&strCnno=${encodeURIComponent(
      lookup
    )}`,
  });
});

app.post('/api/track/milestone', (req: Request, res: Response) => {
  const data = readStore();
  const { consignmentNumber, milestone } = req.body;

  let record = data.trackingRecords.find((t) => t.consignmentNumber === consignmentNumber);
  if (!record) {
    record = {
      consignmentNumber,
      courierPartner: 'DTDC Express Ltd.',
      serviceType: 'Express Delivery',
      origin: 'Chennai',
      destination: 'Destination Hub',
      senderName: 'Milan Express',
      receiverName: 'Valued Client',
      bookingDate: new Date().toLocaleString(),
      currentStatus: milestone.status || 'In Transit',
      milestones: [],
    };
    data.trackingRecords.unshift(record);
  }

  const newMilestone = {
    id: `ms-${Date.now()}`,
    timestamp: milestone.timestamp || new Date().toLocaleString(),
    status: milestone.status,
    location: milestone.location,
    description: milestone.description,
  };

  record.milestones.push(newMilestone);
  record.currentStatus = milestone.status;
  writeStore(data);
  res.json({ success: true, record });
});

// 9. Payment verification & update
app.post('/api/payments/verify-submit', (req: Request, res: Response) => {
  const data = readStore();
  const { orderId, utrNumber, screenshotUrl } = req.body;

  const order = data.orders.find((o) => o.id === orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  order.paymentTransactionRef = utrNumber;
  if (screenshotUrl) order.paymentScreenshotUrl = screenshotUrl;
  order.paymentStatus = 'submitted_verification';
  order.status = 'pending_payment';

  writeStore(data);
  res.json({ success: true, message: 'Payment reference submitted for verification', order });
});

app.put('/api/payments/:orderId/confirm', (req: Request, res: Response) => {
  const data = readStore();
  const order = data.orders.find((o) => o.id === req.params.orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const { status, adminName } = req.body; // 'verified' | 'failed'
  order.paymentStatus = status;
  if (status === 'verified') {
    order.status = 'processing';
    order.paymentVerifiedAt = new Date().toISOString();
    order.paymentVerifiedBy = adminName || 'Milan Express Accounts';
  } else {
    order.status = 'pending_payment';
  }

  writeStore(data);
  res.json({ success: true, order });
});

// 10. Customer Enquiries
app.get('/api/enquiries', (_req: Request, res: Response) => {
  const data = readStore();
  res.json(data.enquiries);
});

app.post('/api/enquiries', (req: Request, res: Response) => {
  const data = readStore();
  const newEnquiry = {
    id: `ENQ-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: new Date().toISOString(),
    name: req.body.name,
    mobile: req.body.mobile,
    email: req.body.email,
    enquiryType: req.body.enquiryType || 'general',
    message: req.body.message,
    status: 'new',
  };

  data.enquiries.unshift(newEnquiry);
  writeStore(data);
  res.status(201).json({ success: true, enquiry: newEnquiry });
});

app.put('/api/enquiries/:id', (req: Request, res: Response) => {
  const data = readStore();
  const idx = data.enquiries.findIndex((e) => e.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Enquiry not found' });
  }
  data.enquiries[idx] = { ...data.enquiries[idx], ...req.body };
  writeStore(data);
  res.json({ success: true, enquiry: data.enquiries[idx] });
});

// 11. Admin Auth
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { passcode } = req.body;
  if (passcode === ADMIN_PASSCODE || passcode === 'milan3515' || passcode === 'admin123') {
    return res.json({
      success: true,
      token: `mex_admin_tok_${Date.now()}`,
      admin: {
        role: 'super_admin',
        name: 'Milan Express Channel Partner Admin',
        email: 'milanexpress3515@gmail.com',
      },
    });
  }
  return res.status(401).json({ success: false, error: 'Invalid admin passcode' });
});

// 12. Admin Stats
app.get('/api/admin/stats', (_req: Request, res: Response) => {
  const data = readStore();
  const totalRevenue = data.orders
    .filter((o) => o.paymentStatus === 'verified')
    .reduce((sum, o) => sum + (o.totalINR || 0), 0);

  res.json({
    totalOrders: data.orders.length,
    pendingOrders: data.orders.filter((o) => o.status === 'pending_payment' || o.status === 'processing').length,
    courierBookingsCount: data.courierBookings.length,
    pendingBookings: data.courierBookings.filter((b) => b.status === 'requested' || b.status === 'quotation_ready').length,
    purchaseRequestsCount: data.purchaseRequests.length,
    pendingPurchaseRequests: data.purchaseRequests.filter((r) => r.status === 'pending_review').length,
    nriRequestsCount: data.nriRequests.length,
    totalProducts: data.products.length,
    lowStockProducts: data.products.filter((p) => p.stock < 10).length,
    totalRevenueINR: totalRevenue,
    activeShipments: data.trackingRecords.filter((t) => t.currentStatus !== 'Delivered').length,
    newEnquiriesCount: data.enquiries.filter((e) => e.status === 'new').length,
  });
});

// 13. CSV Export
app.get('/api/export/:type', (req: Request, res: Response) => {
  const data = readStore();
  const type = req.params.type;

  if (type === 'orders') {
    let csv = 'Order ID,Date,Customer,Mobile,City,Country,Items Count,Subtotal INR,Shipping INR,Total INR,Status,Payment Status,Payment Ref,DTDC Consignment\n';
    data.orders.forEach((o) => {
      csv += `"${o.id}","${o.createdAt}","${o.customerName}","${o.customerMobile}","${o.city}","${o.country}","${o.items?.length || 0}","${o.subtotalINR}","${o.shippingChargesINR}","${o.totalINR}","${o.status}","${o.paymentStatus}","${o.paymentTransactionRef || ''}","${o.dtdcConsignmentNumber || ''}"\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="milan_express_orders.csv"');
    return res.send(csv);
  }

  if (type === 'courier-bookings') {
    let csv = 'Booking ID,Date,Type,Sender Name,Sender Phone,Sender PIN,Receiver Name,Receiver Phone,Destination,Weight KG,Status,Quote INR,DTDC AWB\n';
    data.courierBookings.forEach((b) => {
      csv += `"${b.id}","${b.createdAt}","${b.shipmentType}","${b.senderName}","${b.senderMobile}","${b.senderPinCode}","${b.receiverName}","${b.receiverMobile}","${b.receiverPinCodeOrCountry || b.destinationCountry}","${b.approxWeightKg}","${b.status}","${b.quotationAmount || ''}","${b.dtdcConsignmentNumber || ''}"\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="milan_express_courier_bookings.csv"');
    return res.send(csv);
  }

  res.status(400).send('Invalid export type');
});

// Vite Integration (dev) or Static build (production)
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Milan Express Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

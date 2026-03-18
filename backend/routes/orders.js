const express = require('express');
const router = express.Router();
const CustomerOrder = require('../models/CustomerOrder');

// Allowed products - telecom services only
const ALLOWED_PRODUCTS = [
  'Fiber Internet 300 Mbps',
  '5GUnlimited Mobile Plan',
  'Fiber Internet 1 Gbps',
  'Business Internet 500 Mbps',
  'VoIP Corporate Package'
];

// Validate product is in allowed list
const isValidProduct = (product) => {
  return product && ALLOWED_PRODUCTS.includes(product.trim());
};

// Helper: Apply date filter
const applyDateFilter = (dateFilter) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (dateFilter) {
    case 'today':
      return { createdAt: { $gte: today } };
    case '7days':
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { createdAt: { $gte: sevenDaysAgo } };
    case '30days':
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { createdAt: { $gte: thirtyDaysAgo } };
    case '90days':
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      return { createdAt: { $gte: ninetyDaysAgo } };
    case 'all':
    default:
      return {};
  }
};

// GET all orders with optional date filter (filtered to valid products only)
router.get('/', async (req, res) => {
  try {
    const { dateFilter = 'all', sort = '-createdAt', limit = 100 } = req.query;
    const filter = applyDateFilter(dateFilter);
    const orders = await CustomerOrder.find(filter).sort(sort).limit(parseInt(limit));
    
    // Filter to only include valid products
    const validOrders = orders.filter(order => isValidProduct(order.product));
    
    res.json({ success: true, data: validOrders, count: validOrders.length, totalCount: orders.length });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders', error: error.message });
  }
});

// GET single order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await CustomerOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch order', error: error.message });
  }
});

// CREATE new order
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, address, city, state, postalCode, country, product, quantity, unitPrice, status, createdBy } = req.body;
    
    // Validation
    if (!firstName || !lastName || !email || !product || quantity === undefined || unitPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: firstName, lastName, email, product, quantity, unitPrice',
      });
    }

    // Validate product
    if (!isValidProduct(product)) {
      return res.status(400).json({
        success: false,
        message: `Invalid product. Must be one of: ${ALLOWED_PRODUCTS.join(', ')}`,
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1',
      });
    }

    if (unitPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Unit price cannot be negative',
      });
    }

    const newOrder = new CustomerOrder({
      firstName, lastName, email, phone, address, city, state, postalCode,
      country: country || 'US', product, quantity, unitPrice,
      totalAmount: quantity * unitPrice, status: status || 'pending', createdBy: createdBy || 'demo'
    });

    await newOrder.save();
    res.status(201).json({ success: true, data: newOrder, message: 'Order created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create order', error: error.message });
  }
});

// UPDATE order by ID
router.put('/:id', async (req, res) => {
  try {
    const order = await CustomerOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    
    // Validate product if being updated
    if (req.body.product && !isValidProduct(req.body.product)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid product. Must be one of: ${ALLOWED_PRODUCTS.join(', ')}` 
      });
    }

    if (req.body.quantity !== undefined && req.body.quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }
    if (req.body.unitPrice !== undefined && req.body.unitPrice < 0) {
      return res.status(400).json({ success: false, message: 'Unit price cannot be negative' });
    }

    Object.assign(order, req.body);
    if (req.body.quantity !== undefined || req.body.unitPrice !== undefined) {
      order.totalAmount = order.quantity * order.unitPrice;
    }

    await order.save();
    res.json({ success: true, data: order, message: 'Order updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update order', error: error.message });
  }
});

// DELETE order by ID
router.delete('/:id', async (req, res) => {
  try {
    const order = await CustomerOrder.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order, message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete order', error: error.message });
  }
});

// SEED demo data with dynamic dates
router.post('/seed/demo', async (req, res) => {
  try {
    await CustomerOrder.deleteMany({});
    
    // Calculate dynamic dates
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(today.getDate() - 2);
    
    const demoOrders = [
      { firstName: 'John', lastName: 'Smith', email: 'john@ex.com', phone: '555-0101', address: '123 Main', city: 'NYC', state: 'NY', postalCode: '10001', country: 'USA', product: 'Fiber Internet 300 Mbps', quantity: 2, unitPrice: 49.99, totalAmount: 2 * 49.99, status: 'delivered', createdBy: 'admin', createdAt: yesterday },
      { firstName: 'Emma', lastName: 'Johnson', email: 'emma@ex.com', phone: '555-0102', address: '456 Oak', city: 'LA', state: 'CA', postalCode: '90001', country: 'USA', product: '5GUnlimited Mobile Plan', quantity: 5, unitPrice: 69.99, totalAmount: 5 * 69.99, status: 'processing', createdBy: 'admin', createdAt: yesterday },
      { firstName: 'Michael', lastName: 'Davis', email: 'michael@ex.com', phone: '555-0103', address: '789 Pine', city: 'Chicago', state: 'IL', postalCode: '60601', country: 'USA', product: 'Fiber Internet 1 Gbps', quantity: 3, unitPrice: 99.99, totalAmount: 3 * 99.99, status: 'pending', createdBy: 'admin', createdAt: twoDaysAgo },
      { firstName: 'Sarah', lastName: 'Williams', email: 'sarah@ex.com', phone: '555-0104', address: '321 Elm', city: 'Houston', state: 'TX', postalCode: '77001', country: 'USA', product: 'Business Internet 500 Mbps', quantity: 4, unitPrice: 129.99, totalAmount: 4 * 129.99, status: 'shipped', createdBy: 'admin', createdAt: twoDaysAgo },
      { firstName: 'Robert', lastName: 'Brown', email: 'robert@ex.com', phone: '555-0105', address: '654 Maple', city: 'Phoenix', state: 'AZ', postalCode: '85001', country: 'USA', product: 'VoIP Corporate Package', quantity: 1, unitPrice: 199.99, totalAmount: 1 * 199.99, status: 'delivered', createdBy: 'admin', createdAt: twoDaysAgo },
    ];
    
    const result = await CustomerOrder.insertMany(demoOrders);
    res.json({ success: true, data: result, message: `${result.length} demo orders created with dynamic dates` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to seed demo data', error: error.message });
  }
});

module.exports = router;

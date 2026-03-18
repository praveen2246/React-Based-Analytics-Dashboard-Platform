const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });
const DashboardLayout = require('../models/DashboardLayout');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dashboard_db';

async function fixLayout() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const userId = 'demo';
    const widgets = [
      { id: 'w1', type: 'kpiCard', title: 'Total Revenue', metric: 'totalRevenue', width: 3, height: 2, position: { x: 0, y: 0 } },
      { id: 'w2', type: 'kpiCard', title: 'Total Orders', metric: 'totalOrders', width: 3, height: 2, position: { x: 3, y: 0 } },
      { id: 'w3', type: 'kpiCard', title: 'Avg Order Value', metric: 'avgOrderValue', width: 3, height: 2, position: { x: 6, y: 0 } },
      { id: 'w4', type: 'kpiCard', title: 'Pending Orders', metric: 'pendingOrders', width: 3, height: 2, position: { x: 9, y: 0 } },
      { id: 'w5', type: 'barChart', title: 'Revenue by Product', xAxis: 'product', yAxis: 'totalAmount', width: 6, height: 4, position: { x: 0, y: 2 } },
      { id: 'w6', type: 'pieChart', title: 'Orders by Status', xAxis: 'status', yAxis: 'count', width: 6, height: 4, position: { x: 6, y: 2 } },
      { id: 'w7', type: 'lineChart', title: 'Revenue Over Time', xAxis: 'createdAt', yAxis: 'totalAmount', width: 12, height: 4, position: { x: 0, y: 6 } },
    ];

    await DashboardLayout.findOneAndUpdate(
      { userId },
      { userId, widgets, name: 'My Dashboard' },
      { upsert: true, new: true }
    );

    console.log('🚀 Dashboard layout updated successfully for user: demo');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error fixing layout:', err);
    process.exit(1);
  }
}

fixLayout();

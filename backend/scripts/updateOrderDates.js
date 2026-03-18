/**
 * Update Order Dates Script
 * Sets dynamically calculated dates for all orders:
 * - First 2 orders: yesterday
 * - Remaining 3 orders: 2 days ago
 */

const mongoose = require('mongoose');
require('dotenv').config();

const CustomerOrder = require('../models/CustomerOrder');

async function updateOrderDates() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dashboard-db');
    console.log('✅ Connected to MongoDB');

    // Calculate dynamic dates
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(today.getDate() - 2);

    console.log('\n📅 Date Calculation:');
    console.log(`   Today: ${today.toISOString().split('T')[0]}`);
    console.log(`   Yesterday: ${yesterday.toISOString().split('T')[0]}`);
    console.log(`   2 Days Ago: ${twoDaysAgo.toISOString().split('T')[0]}`);

    // Get all orders sorted by creation date
    const allOrders = await CustomerOrder.find().sort({ createdAt: 1 });
    console.log(`\n📊 Total orders found: ${allOrders.length}`);

    if (allOrders.length === 0) {
      console.log('⚠️  No orders found to update');
      process.exit(0);
    }

    let updateCount = 0;

    // Update first 2 orders with yesterday's date
    for (let i = 0; i < Math.min(2, allOrders.length); i++) {
      allOrders[i].createdAt = yesterday;
      await allOrders[i].save();
      updateCount++;
      console.log(`✅ Order ${i + 1} (${allOrders[i].firstName} ${allOrders[i].lastName}): Set to ${yesterday.toISOString().split('T')[0]}`);
    }

    // Update remaining orders with 2 days ago date
    for (let i = 2; i < allOrders.length; i++) {
      allOrders[i].createdAt = twoDaysAgo;
      await allOrders[i].save();
      updateCount++;
      console.log(`✅ Order ${i + 1} (${allOrders[i].firstName} ${allOrders[i].lastName}): Set to ${twoDaysAgo.toISOString().split('T')[0]}`);
    }

    console.log(`\n✨ Successfully updated ${updateCount} orders with dynamic dates`);

    // Verify updates
    const updated = await CustomerOrder.find().sort({ createdAt: -1 });
    console.log('\n📋 Updated Order Summary:');
    updated.forEach((order, idx) => {
      console.log(`   ${idx + 1}. ${order.firstName} ${order.lastName} - ${order.product} - ${order.createdAt.toISOString().split('T')[0]}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error updating order dates:', error.message);
    process.exit(1);
  }
}

updateOrderDates();

/**
 * Database Cleanup Script - Remove Invalid Products
 * This script removes orders with invalid products and keeps only the 5 allowed telecom products
 * 
 * Usage: node backend/scripts/cleanupInvalidProducts.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const CustomerOrder = require('../models/CustomerOrder');

const ALLOWED_PRODUCTS = [
  'Fiber Internet 300 Mbps',
  '5GUnlimited Mobile Plan',
  'Fiber Internet 1 Gbps',
  'Business Internet 500 Mbps',
  'VoIP Corporate Package'
];

async function cleanupInvalidProducts() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dashboard_db');
    console.log('✅ Connected to MongoDB');

    // Find all orders
    const allOrders = await CustomerOrder.find({});
    console.log(`\n📊 Total orders in database: ${allOrders.length}`);

    // Find invalid products
    const invalidOrders = allOrders.filter(order => !ALLOWED_PRODUCTS.includes(order.product));
    console.log(`❌ Orders with invalid products: ${invalidOrders.length}`);

    if (invalidOrders.length > 0) {
      console.log('\n🗑️  Invalid products found:');
      const invalidProducts = [...new Set(invalidOrders.map(o => o.product))];
      invalidProducts.forEach((prod, idx) => {
        const count = invalidOrders.filter(o => o.product === prod).length;
        console.log(`   ${idx + 1}. "${prod}" (${count} orders)`);
      });
    }

    // Find valid products
    const validOrders = allOrders.filter(order => ALLOWED_PRODUCTS.includes(order.product));
    console.log(`\n✅ Valid orders: ${validOrders.length}`);

    if (validOrders.length > 0) {
      console.log('📁 Valid products in database:');
      const validProducts = [...new Set(validOrders.map(o => o.product))];
      validProducts.forEach((prod, idx) => {
        const count = validOrders.filter(o => o.product === prod).length;
        console.log(`   ${idx + 1}. "${prod}" (${count} orders)`);
      });
    }

    // Show allowed products
    console.log('\n📋 Allowed products (5):');
    ALLOWED_PRODUCTS.forEach((prod, idx) => {
      console.log(`   ${idx + 1}. ${prod}`);
    });

    // Cleanup: Remove invalid products
    if (invalidOrders.length > 0) {
      console.log('\n⚠️  Removing invalid products...');
      const result = await CustomerOrder.deleteMany({
        product: { $nin: ALLOWED_PRODUCTS }
      });
      console.log(`✨ Deleted ${result.deletedCount} orders with invalid products`);
    }

    // Final count
    const finalCount = await CustomerOrder.countDocuments();
    console.log(`\n✅ Final count: ${finalCount} valid orders remaining`);

    // Show final product distribution
    const finalOrders = await CustomerOrder.find({});
    const productDistribution = {};
    finalOrders.forEach(order => {
      productDistribution[order.product] = (productDistribution[order.product] || 0) + 1;
    });

    console.log('\n📊 Final product distribution:');
    Object.entries(productDistribution).forEach(([product, count]) => {
      console.log(`   ${product}: ${count} orders`);
    });

    console.log('\n✅ Cleanup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    process.exit(1);
  }
}

// Run cleanup
cleanupInvalidProducts();

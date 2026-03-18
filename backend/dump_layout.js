const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });
const DashboardLayout = require('./models/DashboardLayout');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dashboard_db';

async function dumpLayout() {
  try {
    await mongoose.connect(MONGO_URI);
    const layout = await DashboardLayout.findOne({ userId: 'demo' });
    console.log(JSON.stringify(layout, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

dumpLayout();

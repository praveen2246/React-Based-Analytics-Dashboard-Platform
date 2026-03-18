require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const orderRoutes = require('./routes/orders');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.options('*', cors()); // Enable pre-flight for all routes
app.use(express.json());

let isDbConnected = false;

// Middleware to check DB connection
app.use((req, res, next) => {
  if (!isDbConnected && req.url.startsWith('/api/') && req.url !== '/api/health') {
    return res.status(503).json({ 
      success: false, 
      message: 'Database not connected. Please check your MONGO_URI and IP Whitelist in MongoDB Atlas.' 
    });
  }
  next();
});

// Request Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// 404 Handler for undefined routes
app.use((req, res) => {
  console.warn(`⚠️ 404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ success: false, message: `Route ${req.url} not found on this server` });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dashboard_db';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    isDbConnected = true;
    console.log('✅ MongoDB connected');
    if (!process.env.VERCEL) { // Don't listen if in serverless env (though Render is fine)
       app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    }
  })
  .catch((err) => {
    isDbConnected = false;
    console.error('MongoDB connection error:', err);
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} (no DB)`));
  });

module.exports = app;

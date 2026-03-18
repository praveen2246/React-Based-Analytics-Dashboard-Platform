import axios from 'axios';

let baseURL = import.meta.env.VITE_API_URL || '/api';
if (baseURL.startsWith('http') && !baseURL.endsWith('/api')) {
  baseURL = `${baseURL.replace(/\/$/, '')}/api`;
}

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Mock Data for fallback
const MOCK_ORDERS = [
  { _id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', product: 'High Speed Fiber', quantity: 1, unitPrice: 79.99, totalAmount: 79.99, status: 'delivered', createdAt: new Date().toISOString() },
  { _id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', product: '5G Mobile Plan', quantity: 2, unitPrice: 45.00, totalAmount: 90.00, status: 'processing', createdAt: new Date().toISOString() },
  { _id: '3', firstName: 'Bob', lastName: 'Wilson', email: 'bob@example.com', product: 'Satellite TV Bundle', quantity: 1, unitPrice: 120.00, totalAmount: 120.00, status: 'pending', createdAt: new Date().toISOString() },
  { _id: '4', firstName: 'Alice', lastName: 'Brown', email: 'alice@example.com', product: 'Business VOIP', quantity: 5, unitPrice: 25.00, totalAmount: 125.00, status: 'shipped', createdAt: new Date().toISOString() },
];

const MOCK_DASHBOARD = {
  widgets: [
    { id: 'w1', type: 'kpiCard', x: 0, y: 0, w: 3, h: 2, config: { metric: 'totalRevenue', title: 'Revenue' } },
    { id: 'w2', type: 'kpiCard', x: 3, y: 0, w: 3, h: 2, config: { metric: 'totalOrders', title: 'Orders' } },
    { id: 'w3', type: 'barChart', x: 0, y: 2, w: 6, h: 4, config: { xAxis: 'product', yAxis: 'totalAmount', title: 'Revenue by Product' } },
    { id: 'w4', type: 'pieChart', x: 6, y: 0, w: 6, h: 6, config: { xAxis: 'status', yAxis: 'count', title: 'Order Status' } },
  ]
};

// Add response interceptor for error logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ API Error:', error.message);
    return Promise.reject(error);
  }
);

// ─── Orders ────────────────────────────────────────────────────────────────

export const getOrders = (dateFilter = 'all') =>
  api.get('/orders', { params: { dateFilter } })
    .then((r) => r.data)
    .catch((err) => {
      console.warn('⚠️ Using MOCK_ORDERS as fallback');
      return { success: true, data: MOCK_ORDERS };
    });

export const createOrder = (data) => api.post('/orders', data).then((r) => r.data);
export const updateOrder = (id, data) => api.put(`/orders/${id}`, data).then((r) => r.data);
export const deleteOrder = (id) => api.delete(`/orders/${id}`).then((r) => r.data);
export const seedDemoData = () => api.post('/orders/seed/demo').then((r) => r.data);

// ─── Dashboard ─────────────────────────────────────────────────────────────

export const getDashboard = (userId = 'demo') =>
  api.get('/dashboard', { params: { userId } })
    .then((r) => r.data)
    .catch((err) => {
      console.warn('⚠️ Using MOCK_DASHBOARD as fallback');
      return { success: true, data: MOCK_DASHBOARD };
    });

export const saveDashboard = (data) =>
  api.post('/dashboard', data)
    .then((r) => r.data)
    .catch((err) => {
      console.error('❌ Failed to save dashboard:', err);
      throw err;
    });

export default api;

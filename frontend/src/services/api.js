import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Add response interceptor for error logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.response?.request?.responseURL || error.config?.url,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

// ─── Orders ────────────────────────────────────────────────────────────────

export const getOrders = (dateFilter = 'all') =>
  api.get('/orders', { params: { dateFilter } })
    .then((r) => {
      console.log('✅ Orders loaded:', r.data);
      return r.data;
    })
    .catch((err) => {
      console.error('❌ Failed to load orders:', err);
      throw err;
    });

export const createOrder = (data) => api.post('/orders', data).then((r) => r.data);

export const updateOrder = (id, data) => api.put(`/orders/${id}`, data).then((r) => r.data);

export const deleteOrder = (id) => api.delete(`/orders/${id}`).then((r) => r.data);

export const seedDemoData = () => api.post('/orders/seed/demo').then((r) => r.data);

// ─── Dashboard ─────────────────────────────────────────────────────────────

export const getDashboard = (userId = 'demo') =>
  api.get('/dashboard', { params: { userId } })
    .then((r) => {
      console.log('✅ Dashboard loaded:', r.data);
      return r.data;
    })
    .catch((err) => {
      console.error('❌ Failed to load dashboard:', err);
      // Return default empty layout on error
      return { success: false, data: { widgets: [] } };
    });

export const saveDashboard = (data) =>
  api.post('/dashboard', data)
    .then((r) => {
      console.log('✅ Dashboard saved:', r.data);
      return r.data;
    })
    .catch((err) => {
      console.error('❌ Failed to save dashboard:', err);
      throw err;
    });

export default api;

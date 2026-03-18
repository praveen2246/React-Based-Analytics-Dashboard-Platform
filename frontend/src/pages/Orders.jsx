import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getOrders, createOrder, updateOrder, deleteOrder, seedDemoData } from '../services/api';
import { DATE_FILTERS } from '../widgets/widgetConfig';
import { ALLOWED_PRODUCTS, isValidProduct } from '../config/products';

const STATUS_COLORS = {
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  shipped: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  delivered: 'bg-rose-500/20 text-rose-600 border-rose-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

// Use fixed product list - telecom services only
const PRODUCTS = ALLOWED_PRODUCTS;

function OrderModal({ order, onClose, onSave }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: order || {
      firstName: '', lastName: '', email: '', phone: '',
      address: '', city: '', state: '', postalCode: '', country: 'US',
      product: '', quantity: 1, unitPrice: 0, status: 'pending',
    },
  });

  useEffect(() => {
    if (order) reset(order);
  }, [order]);

  const onSubmit = (data) => {
    data.quantity = Number(data.quantity);
    data.unitPrice = Number(data.unitPrice);
    data.totalAmount = data.quantity * data.unitPrice;
    onSave(data);
  };

  const inputCls = "w-full bg-white border border-rose-100 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-rose-300 focus:outline-none focus:border-rose-400 transition-all shadow-sm focus:ring-4 focus:ring-rose-400/10";
  const labelCls = "block text-xs font-black text-rose-400 mb-1 uppercase tracking-widest italic opacity-70";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-950/40 backdrop-blur-sm">
      <div className="bg-white border border-rose-100 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl fade-in overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-rose-50 bg-rose-50/50">
          <h2 className="text-lg font-black text-rose-600 italic tracking-tight">
            {order ? '✏️ Edit Order' : '➕ New Order'}
          </h2>
          <button onClick={onClose} className="text-rose-300 hover:text-rose-600 text-xl transition-colors">✕</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Customer Info */}
          <div>
            <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] mb-3 italic opacity-80 border-b border-rose-50 pb-1">Customer Information</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>First Name *</label>
                <input {...register('firstName', { required: true })} className={inputCls} placeholder="Alice" />
                {errors.firstName && <p className="text-red-400 text-xs mt-1">Required</p>}
              </div>
              <div>
                <label className={labelCls}>Last Name *</label>
                <input {...register('lastName', { required: true })} className={inputCls} placeholder="Johnson" />
                {errors.lastName && <p className="text-red-400 text-xs mt-1">Required</p>}
              </div>
              <div>
                <label className={labelCls}>Email *</label>
                <input {...register('email', { required: true })} type="email" className={inputCls} placeholder="alice@example.com" />
                {errors.email && <p className="text-red-400 text-xs mt-1">Required</p>}
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input {...register('phone')} className={inputCls} placeholder="555-0101" />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] mb-3 italic opacity-80 border-b border-rose-50 pb-1">Address</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={labelCls}>Street Address</label>
                <input {...register('address')} className={inputCls} placeholder="123 Main St" />
              </div>
              <div>
                <label className={labelCls}>City</label>
                <input {...register('city')} className={inputCls} placeholder="New York" />
              </div>
              <div>
                <label className={labelCls}>State</label>
                <input {...register('state')} className={inputCls} placeholder="NY" />
              </div>
              <div>
                <label className={labelCls}>Postal Code</label>
                <input {...register('postalCode')} className={inputCls} placeholder="10001" />
              </div>
              <div>
                <label className={labelCls}>Country</label>
                <input {...register('country')} className={inputCls} placeholder="US" />
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div>
            <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] mb-3 italic opacity-80 border-b border-rose-50 pb-1">Order Details</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={labelCls}>Product *</label>
                <select {...register('product', { required: true })} className={inputCls}>
                  <option value="">Select a product…</option>
                  {PRODUCTS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                {errors.product && <p className="text-red-400 text-xs mt-1">Required</p>}
              </div>
              <div>
                <label className={labelCls}>Quantity *</label>
                <input {...register('quantity', { required: true, min: 1 })} type="number" min="1" className={inputCls} />
                {errors.quantity && <p className="text-red-400 text-xs mt-1">Min 1</p>}
              </div>
              <div>
                <label className={labelCls}>Unit Price ($) *</label>
                <input {...register('unitPrice', { required: true, min: 0 })} type="number" step="0.01" min="0" className={inputCls} />
                {errors.unitPrice && <p className="text-red-400 text-xs mt-1">Required</p>}
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Status</label>
                <select {...register('status')} className={inputCls}>
                  {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-rose-100 text-rose-400 text-sm font-bold hover:bg-rose-50 transition-all active:scale-95">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-black transition-all shadow-lg shadow-rose-500/20 active:scale-95">
              {order ? 'Update Order' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Orders({ onOrdersChange }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getOrders(dateFilter);
      setOrders(res.data || []);
      onOrdersChange?.(res.data || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [dateFilter]);

  const handleSave = async (data) => {
    try {
      if (editingOrder) {
        await updateOrder(editingOrder._id, data);
        showToast('Order updated ✓');
      } else {
        await createOrder(data);
        showToast('Order created ✓');
      }
      setModalOpen(false);
      setEditingOrder(null);
      fetchOrders();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error saving order', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteOrder(id);
      showToast('Order deleted');
      setDeleteConfirm(null);
      fetchOrders();
    } catch (err) {
      showToast('Failed to delete order', 'error');
    }
  };

  const handleSeed = async () => {
    try {
      const res = await seedDemoData();
      showToast(`${res.count} demo orders loaded ✓`);
      fetchOrders();
    } catch (err) {
      showToast('Seed failed', 'error');
    }
  };

  const filtered = orders.filter((o) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      `${o.firstName} ${o.lastName}`.toLowerCase().includes(s) ||
      o.email?.toLowerCase().includes(s) ||
      o.product?.toLowerCase().includes(s) ||
      o.city?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="p-6 max-w-full">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-black shadow-2xl fade-in border
          ${toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-rose-50 border-rose-200 text-rose-600'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black gradient-text">Customer Orders</h1>
          <p className="text-rose-400 text-sm mt-1 font-bold italic opacity-70">✨ {orders.length} transactions processed</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleSeed}
            className="px-6 py-2.5 rounded-xl border border-rose-100 text-rose-400 hover:bg-rose-50 transition-all font-black shadow-sm italic uppercase tracking-tighter text-xs">
            🌱 Seed Demo
          </button>
          <button onClick={() => { setEditingOrder(null); setModalOpen(true); }}
            className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-black transition-all shadow-lg shadow-rose-500/20 active:scale-95">
            + New Order
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search orders…"
          className="input w-64 text-sm"
        />
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="select w-48 text-sm"
        >
          {DATE_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-rose-400 font-bold italic">
            <div className="inline-block w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p>Loading orders…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-rose-300 font-bold italic">
            <p className="text-5xl mb-3 opacity-50">🧁</p>
            <p className="font-black text-rose-400 uppercase tracking-tighter">No orders found</p>
            <p className="text-xs mt-1 text-rose-200">Load some demo data to see the magic</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 backdrop-blur-sm">
                  {['Customer', 'Email', 'Product', 'Qty', 'Unit Price', 'Total', 'Status', 'Date', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap italic">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, i) => (
                  <tr key={order._id}
                    className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group"
                    style={{ animationDelay: `${i * 30}ms` }}>
                    <td className="px-4 py-4 text-slate-900 font-bold whitespace-nowrap">
                      {order.firstName} {order.lastName}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{order.email}</td>
                    <td className="px-4 py-3 text-slate-500 font-medium italic">{order.product}</td>
                    <td className="px-4 py-3 text-slate-600 text-center font-bold">{order.quantity}</td>
                    <td className="px-4 py-3 text-slate-600 font-mono font-bold">${(order.unitPrice || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-rose-600 font-mono font-black whitespace-nowrap text-base">
                      ${(order.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full border text-[11px] font-medium capitalize ${STATUS_COLORS[order.status] || ''}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-400 text-xs italic whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingOrder(order); setModalOpen(true); }}
                          className="px-3 py-1.5 text-xs rounded-xl bg-rose-50/50 border border-rose-100 text-rose-500 hover:bg-rose-50 transition-colors font-black italic">
                          Edit
                        </button>
                        <button onClick={() => setDeleteConfirm(order._id)}
                          className="px-3 py-1.5 text-xs rounded-xl bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 transition-colors font-bold">
                          Del
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Modal */}
      {modalOpen && (
        <OrderModal
          order={editingOrder}
          onClose={() => { setModalOpen(false); setEditingOrder(null); }}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-950/40 backdrop-blur-sm">
          <div className="bg-white border border-rose-100 rounded-3xl p-8 max-w-sm w-full shadow-2xl fade-in overflow-hidden">
            <h3 className="text-rose-600 font-black text-2xl mb-2 tracking-tighter italic">Delete Order?</h3>
            <p className="text-rose-400 text-sm mb-8 font-bold italic opacity-70">✨ This action is permanent and cannot be undone.</p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 rounded-xl border border-rose-100 text-rose-400 text-sm font-bold hover:bg-rose-50 transition-all active:scale-95">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-all shadow-lg shadow-red-500/10 active:scale-95">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



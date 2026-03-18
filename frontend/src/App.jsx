import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Orders from './pages/Orders';
import Dashboard from './pages/Dashboard';
import ConfigureDashboard from './pages/ConfigureDashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { getOrders } from './services/api';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/' },
  { id: 'builder', label: 'Builder', icon: '🎛️', path: '/builder' },
  { id: 'orders', label: 'Orders', icon: '📦', path: '/orders' },
];

function AppContent({ orders, onOrdersChange }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="flex h-screen bg-rose-50 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm sm:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed sm:static inset-y-0 left-0 z-40
        w-64 bg-white/95 border-r border-rose-100
        flex flex-col
        transform transition-transform duration-300 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}
      `}>
        {/* Logo Section */}
        <div className="px-6 py-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-lg font-black shadow-lg shadow-rose-500/30 text-white">
              ◈
            </div>
            <div className="flex-1">
              <p className="gradient-text font-black text-base leading-tight">DataDash</p>
              <p className="text-rose-400 text-xs mt-0.5 font-bold uppercase tracking-widest italic opacity-70">Analytics</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1.5">
          {NAV.map((n) => (
            <Link
              key={n.id}
              to={n.path}
              onClick={() => setSidebarOpen(false)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                ${currentPath === n.path
                  ? 'bg-rose-50 text-rose-700 shadow-sm shadow-rose-500/5'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-rose-50/50'
                }`}
            >
              <span className="text-lg">{n.icon}</span>
              <span className="flex-1 text-left">{n.label}</span>
              {currentPath === n.path && (
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-glow shadow-rose-500/50" />
              )}
            </Link>
          ))}
        </nav>

        {/* User Profile */}
        <div className="px-6 py-5 border-t border-rose-50 bg-rose-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-xs font-black text-white shadow-lg shadow-rose-500/30 group-hover:rotate-6 transition-transform">
              👤
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-900 text-xs font-black group-hover:text-rose-600 transition-colors">Demo User</p>
              <p className="text-rose-400 text-[10px] font-bold uppercase tracking-tighter italic">📦 {orders.length} orders</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-rose-50/40">
        {/* Mobile Top Bar */}
        <div className="sticky top-0 z-20 sm:hidden flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-lg border-b border-rose-100 shadow-sm">
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="text-slate-500 hover:text-slate-900 text-xl transition-colors duration-200"
          >
            ☰
          </button>
          <p className="text-slate-900 font-bold text-base">
            {NAV.find((n) => n.path === currentPath)?.label || 'Page'}
          </p>
          <div className="w-6" />
        </div>

        {/* Page Content */}
        <div className="fade-in">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/builder" element={<ConfigureDashboard orders={orders} />} />
              <Route path="/orders" element={<Orders onOrdersChange={onOrdersChange} />} />
              {/* Fallback to Dashboard for unknown routes */}
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    getOrders().then((res) => setOrders(res.data || [])).catch(() => {});
  }, []);

  const handleOrdersChange = (newOrders) => setOrders(newOrders);

  return (
    <Router>
      <AppContent orders={orders} onOrdersChange={handleOrdersChange} />
    </Router>
  );
}

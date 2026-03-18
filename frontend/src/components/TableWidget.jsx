import React, { useState } from 'react';

const STATUS_COLORS = {
  pending: 'badge badge-warning',
  processing: 'badge bg-blue-50 text-blue-700 border border-blue-100',
  shipped: 'badge bg-purple-50 text-purple-700 border border-purple-100',
  delivered: 'badge bg-rose-50 text-rose-600 border border-rose-100',
  cancelled: 'badge bg-red-50 text-red-600 border border-red-100',
};

export default function TableWidget({ widget, orders }) {
  const [page, setPage] = useState(0);
  
  // Safe data validation
  const safeOrders = Array.isArray(orders) ? orders : [];
  const pageSize = Math.max(20, safeOrders.length); // Show all items on one page
  const totalPages = Math.max(1, Math.ceil(safeOrders.length / pageSize));
  
  // Ensure page is within bounds
  const safePage = Math.min(page, totalPages - 1);
  if (page !== safePage) setPage(safePage);
  
  const visible = safeOrders.slice(safePage * pageSize, (safePage + 1) * pageSize);

  return (
    <div className="h-full w-full glass-card flex flex-col bg-white p-6 shadow-sm hover:shadow-xl transition-all border border-rose-50 group">
      {/* Header */}
      {widget.title && (
        <div className="mb-4 pb-3 border-b border-rose-50">
          <p className="text-rose-600 text-sm font-black uppercase tracking-widest italic opacity-80">
            📋 {widget.title}
          </p>
        </div>
      )}
      
      {/* Table Container */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {safeOrders.length === 0 ? (
          <div className="flex items-center justify-center h-full text-rose-200 text-sm font-black italic uppercase tracking-tighter">
            <p>🧁 No orders to display</p>
          </div>
        ) : (
          <div className="overflow-auto flex-1 rounded-2xl border border-rose-50 shadow-inner bg-rose-50/10">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="text-rose-400 border-b border-rose-50 bg-rose-50/80 backdrop-blur-md">
                  <th className="text-left py-4 px-4 font-black uppercase tracking-tighter italic text-xs">Customer</th>
                  <th className="text-left py-4 px-4 font-black uppercase tracking-tighter italic text-xs">Product</th>
                  <th className="text-center py-4 px-4 font-black uppercase tracking-tighter italic text-xs">Qty</th>
                  <th className="text-right py-4 px-4 font-black uppercase tracking-tighter italic text-xs">Amount</th>
                  <th className="text-left py-4 px-4 font-black uppercase tracking-tighter italic text-xs">Status</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((order, idx) => (
                  <tr 
                    key={order._id} 
                    className={`border-b border-rose-50 hover:bg-rose-50/50 transition-colors duration-200 ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-rose-50/20'
                    }`}
                  >
                    <td className="py-4 px-4 text-slate-900 font-bold whitespace-nowrap">
                      {order.firstName} {order.lastName}
                    </td>
                    <td className="py-4 px-4 text-slate-500 font-medium truncate max-w-[200px] italic">{order.product}</td>
                    <td className="py-4 px-4 text-center text-slate-600 font-black">{order.quantity}</td>
                    <td className="py-4 px-4 text-right text-rose-600 font-mono font-black text-base">
                      ${(Number(order.totalAmount) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4">
                      <span className={STATUS_COLORS[order.status] || STATUS_COLORS.pending}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-rose-100 flex-shrink-0 gap-3">
          <span className="text-rose-300 text-[10px] font-black uppercase tracking-[0.2em] italic opacity-80">✨ {safeOrders.length} records traced</span>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              className="px-4 py-1.5 rounded-xl border border-rose-100 text-rose-400 text-xs font-black hover:bg-rose-50 transition-all disabled:opacity-30"
            >
              ←
            </button>
            <span className="px-3 py-1 text-xs text-rose-500 font-black italic bg-rose-50 border border-rose-100 rounded-lg">
              {safePage + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={safePage === totalPages - 1}
              className="px-4 py-1.5 rounded-xl border border-rose-100 text-rose-400 text-xs font-black hover:bg-rose-50 transition-all disabled:opacity-30"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

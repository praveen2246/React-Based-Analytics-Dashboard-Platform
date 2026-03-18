import React from 'react';
import { calculateKPIs, KPI_METRICS, formatValue } from '../widgets/widgetConfig';

const TREND_ICONS = {
  totalRevenue: '💰',
  totalOrders: '📦',
  avgOrderValue: '📊',
  pendingOrders: '⏳',
  deliveredOrders: '✅',
  cancelledOrders: '❌',
  totalQuantity: '🛒',
};

export default function KPIWidget({ widget, orders }) {
  console.log(`📊 KPIWidget - Metric: ${widget.metric}, Orders:`, orders);
  
  const kpis = calculateKPIs(orders);
  const metric = widget.metric || 'totalRevenue';
  const value = kpis[metric] ?? 0;
  
  console.log(`💰 KPI Value for ${metric}:`, value);

  const metaInfo = KPI_METRICS.find((m) => m.value === metric);
  const formatted = formatValue(value, metaInfo?.format || 'number');
  const icon = TREND_ICONS[metric] || '📊';

  const colorSchemes = {
    totalRevenue: {
      bg: 'bg-rose-50/50',
      border: 'border-rose-100',
      text: 'text-rose-700',
      icon: 'text-rose-600',
      label: 'text-rose-800',
      accent: 'bg-rose-100/50',
      glow: 'shadow-rose-500/5',
    },
    totalOrders: {
      bg: 'bg-pink-50/50',
      border: 'border-pink-100',
      text: 'text-pink-700',
      icon: 'text-pink-600',
      label: 'text-pink-800',
      accent: 'bg-pink-100/50',
      glow: 'shadow-pink-500/5',
    },
    avgOrderValue: {
      bg: 'bg-fuchsia-50/50',
      border: 'border-fuchsia-100',
      text: 'text-fuchsia-700',
      icon: 'text-fuchsia-600',
      label: 'text-fuchsia-800',
      accent: 'bg-fuchsia-100/50',
      glow: 'shadow-fuchsia-500/5',
    },
    pendingOrders: {
      bg: 'bg-rose-50/40',
      border: 'border-rose-100',
      text: 'text-rose-500',
      icon: 'text-rose-400',
      label: 'text-rose-600',
      accent: 'bg-rose-50/50',
      glow: 'shadow-rose-400/5',
    },
    deliveredOrders: {
      bg: 'bg-rose-50/60',
      border: 'border-rose-200',
      text: 'text-rose-700',
      icon: 'text-rose-600',
      label: 'text-rose-800',
      accent: 'bg-rose-100/50',
      glow: 'shadow-rose-500/10',
    },
    cancelledOrders: {
      bg: 'bg-red-50/50',
      border: 'border-red-100',
      text: 'text-red-700',
      icon: 'text-red-600',
      label: 'text-red-800',
      accent: 'bg-red-100/50',
      glow: 'shadow-red-500/5',
    },
    totalQuantity: {
      bg: 'bg-pink-50/40',
      border: 'border-pink-100',
      text: 'text-pink-600',
      icon: 'text-pink-500',
      label: 'text-pink-700',
      accent: 'bg-pink-50/50',
      glow: 'shadow-pink-400/5',
    },
  };

  const colors = colorSchemes[metric] || colorSchemes.totalRevenue;

  return (
    <div className={`h-full w-full kpi-card relative overflow-hidden ${colors.bg} border ${colors.border} ${colors.glow} hover:${colors.glow} group`}>
      {/* Animated corner glow on hover */}
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-0 group-hover:opacity-10 bg-gradient-radial from-white to-transparent blur-3xl transition-opacity duration-500" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full opacity-0 group-hover:opacity-5 bg-gradient-radial from-white to-transparent blur-3xl transition-opacity duration-500" />
      
      {/* Content Grid */}
      <div className="relative z-10 h-full flex flex-col justify-between p-1">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <p className={`text-xs font-black uppercase tracking-widest ${colors.label} mb-1 opacity-60 italic`}>
              {metaInfo?.label || 'Metric'}
            </p>
            <p className={`text-2xl sm:text-3xl font-black ${colors.text} leading-tight tracking-tighter`}>
              {formatted}
            </p>
          </div>
          
          {/* Icon Badge */}
          <div className={`flex-shrink-0 ml-3 ${colors.accent} ${colors.icon} text-2xl p-3 rounded-2xl flex items-center justify-center border ${colors.border} shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
            {icon}
          </div>
        </div>
      </div>
      
      {/* Footer Section */}
      <div className="relative z-10 pt-3 mt-1 border-t border-rose-100/50">
        <p className={`text-[10px] font-bold ${colors.label} opacity-50 uppercase tracking-tighter`}>
          ✨ {orders.length} order{orders.length !== 1 ? 's' : ''} tracked
        </p>
      </div>
    </div>
  );
}

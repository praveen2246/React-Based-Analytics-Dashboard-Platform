import React from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  ScatterChart, Scatter, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';
import { aggregateData, CHART_COLORS, formatValue } from '../widgets/widgetConfig';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white border border-rose-100 rounded-xl p-3 shadow-xl text-sm backdrop-blur-md">
      <p className="text-rose-600 font-black mb-2 italic tracking-tighter">📍 {label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-bold text-xs flex justify-between gap-4">
          <span className="opacity-50 uppercase tracking-tighter">{p.name}:</span>
          <span className="font-black italic">
            {typeof p.value === 'number' && p.value > 100
              ? `$${p.value.toLocaleString()}`
              : p.value?.toLocaleString()}
          </span>
        </p>
      ))}
    </div>
  );
};

export default function ChartWidget({ widget, orders }) {
  const { type, xAxis = 'product', yAxis = 'totalAmount', color = '#e11d48', title } = widget;
  
  console.log(`🎨 ChartWidget - Type: ${type}, xAxis: ${xAxis}, yAxis: ${yAxis}, Orders:`, orders);
  
  const data = aggregateData(orders, xAxis, yAxis);
  const strokeColor = color || '#e11d48';

  const axisStyle = { fill: '#fb7185', fontSize: 10, fontFamily: 'Inter, sans-serif', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em' };
  const gridStyle = { stroke: '#fff1f2', strokeDasharray: '4 4', opacity: 1 };

  const commonProps = {
    data,
    margin: { top: 10, right: 20, left: 0, bottom: 10 },
  };

  const renderChart = () => {
    switch (type) {
      case 'barChart':
        return (
          <BarChart {...commonProps}>
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity={0.8} />
                <stop offset="100%" stopColor={strokeColor} stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey="name" tick={axisStyle} />
            <YAxis tick={axisStyle} />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} />
            <Bar dataKey={yAxis} fill="url(#barGrad)" radius={[8, 8, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        );

      case 'lineChart':
        return (
          <LineChart {...commonProps}>
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey="name" tick={axisStyle} interval={0} />
            <YAxis tick={axisStyle} />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} />
            <Line 
              type="monotone" 
              dataKey={yAxis} 
              stroke={strokeColor} 
              strokeWidth={3} 
              dot={{ r: 5, fill: strokeColor, opacity: 0.8 }}
              activeDot={{ r: 7, opacity: 1 }}
              isAnimationActive={true}
            />
          </LineChart>
        );

      case 'areaChart':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.4} />
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey="name" tick={axisStyle} interval={0} />
            <YAxis tick={axisStyle} />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} />
            <Area type="monotone" dataKey={yAxis} stroke={strokeColor} fill="url(#areaGrad)" strokeWidth={2} />
          </AreaChart>
        );

      case 'scatterChart':
        return (
          <ScatterChart {...commonProps}>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey="count" name="Orders" tick={axisStyle} />
            <YAxis dataKey={yAxis} name={yAxis} tick={axisStyle} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} />
            <Scatter data={data} fill={strokeColor} />
          </ScatterChart>
        );

      case 'pieChart': {
        const RADIAN = Math.PI / 180;
        const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
          const r = innerRadius + (outerRadius - innerRadius) * 0.5;
          const x = cx + r * Math.cos(-midAngle * RADIAN);
          const y = cy + r * Math.sin(-midAngle * RADIAN);
          return percent > 0.05 ? (
            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11}>
              {`${(percent * 100).toFixed(0)}%`}
            </text>
          ) : null;
        };
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius="80%"
              dataKey={yAxis}
              nameKey="name"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend formatter={(v) => <span style={{ color: '#fb7185', fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }}>{v}</span>} />
          </PieChart>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="h-full w-full glass-card flex flex-col bg-white p-6 group shadow-sm hover:shadow-xl transition-all border border-rose-50">
      {/* Header */}
      {title && (
        <div className="mb-4 pb-3 border-b border-rose-50 flex items-center justify-between">
          <p className="text-rose-600 text-sm font-black uppercase tracking-widest italic opacity-80">
            💖 {title}
          </p>
        </div>
      )}
      
      {/* Chart Container */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

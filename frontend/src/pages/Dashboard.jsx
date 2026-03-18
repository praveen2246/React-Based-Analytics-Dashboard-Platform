import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import KPIWidget from '../components/KPIWidget';
import ChartWidget from '../components/ChartWidget';
import TableWidget from '../components/TableWidget';
import { getDashboard } from '../services/api';
import { getOrders } from '../services/api';
import { DATE_FILTERS, filterOrdersByValidProducts } from '../widgets/widgetConfig';
import { ALLOWED_PRODUCTS } from '../config/products';

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function Dashboard() {
  const [widgets, setWidgets] = useState([]);
  const [layouts, setLayouts] = useState({});
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [dateFilter, setDateFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboard(), getOrders(dateFilter)])
      .then(([dash, ord]) => {
        const data = dash.data;
        if (data?.widgets?.length) {
          setWidgets(data.widgets);
          
          // Separate widgets by type for professional grid layout
          const kpiCards = data.widgets.filter(w => w.type === 'kpiCard');
          const charts = data.widgets.filter(w => w.type !== 'table' && w.type !== 'kpiCard');
          const tables = data.widgets.filter(w => w.type === 'table');

          const baseLayout = [];
          let currentY = 0;

          // Row 1: Place all KPI cards in single row (x: 0, 3, 6, 9; w: 3 each)
          kpiCards.forEach((w, idx) => {
            baseLayout.push({
              i: String(w.id),
              x: typeof w.position?.x === 'number' ? w.position.x : idx * 3,
              y: typeof w.position?.y === 'number' ? w.position.y : 0,
              w: 3,
              h: 2,
            });
          });

          if (kpiCards.length > 0) currentY = 2;

          // Row 2+: Place charts in 2-column layout (w: 6 each)
          let chartX = 0;
          charts.forEach((w) => {
            baseLayout.push({
              i: String(w.id),
              x: typeof w.position?.x === 'number' ? w.position.x : chartX,
              y: typeof w.position?.y === 'number' ? w.position.y : currentY,
              w: 6,
              h: 4,
            });
            chartX = chartX === 0 ? 6 : 0;
            if (chartX === 0) currentY += 4;
          });

          if (charts.length % 2 === 1) currentY += 4;

          // Row 3+: Place tables full-width (w: 12)
          tables.forEach((w) => {
            baseLayout.push({
              i: String(w.id),
              x: typeof w.position?.x === 'number' ? w.position.x : 0,
              y: typeof w.position?.y === 'number' ? w.position.y : currentY,
              w: 12,
              h: 5,
            });
            currentY += 5;
          });
          
          setLayouts({
            lg: baseLayout,
            md: baseLayout.map(l => {
              if (l.w === 12) return { ...l, w: 8 };
              if (l.w === 6) return { ...l, w: 8, x: 0 };
              return l;
            }),
            sm: baseLayout.map(l => ({ ...l, w: 4, x: 0 })),
            xs: baseLayout.map(l => ({ ...l, w: 4, x: 0 })),
          });
        }
        const rawOrders = ord.data || [];
        console.log('📥 Raw orders from API:', rawOrders);
        setOrders(rawOrders);
        const filtered = filterOrdersByValidProducts(rawOrders, ALLOWED_PRODUCTS);
        console.log('🎯 Filtered orders:', filtered);
        setFilteredOrders(filtered);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getOrders(dateFilter).then((res) => {
      const rawOrders = res.data || [];
      console.log(`📥 Orders fetched with filter '${dateFilter}':`, rawOrders);
      setOrders(rawOrders);
      const filtered = filterOrdersByValidProducts(rawOrders, ALLOWED_PRODUCTS);
      console.log('🎯 Filtered orders:', filtered);
      setFilteredOrders(filtered);
    });
  }, [dateFilter]);

  const renderWidget = (widget) => {
    switch (widget.type) {
      case 'kpiCard': return <KPIWidget widget={widget} orders={filteredOrders} />;
      case 'table': return <TableWidget widget={widget} orders={filteredOrders} />;
      default: return <ChartWidget widget={widget} orders={filteredOrders} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-rose-500 font-bold italic">
        <div className="inline-block w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mr-3" />
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
          <div className="flex-1">
            <h1 className="text-4xl font-black gradient-text mb-2">
              💖 Analytics Dashboard
            </h1>
            <p className="text-rose-400 text-base font-bold italic opacity-70">
              ✨ {filteredOrders.length} live orders · {filteredOrders.length < orders.length && `(${orders.length - filteredOrders.length} filtered) · `}Analytics Pulse
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="select py-2.5 text-sm"
            >
              {DATE_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
        </div>

        {widgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed border-rose-100 rounded-3xl text-rose-300 bg-white/50 backdrop-blur-sm shadow-sm">
            <p className="text-6xl mb-4">🏠</p>
            <p className="font-black text-xl text-rose-400 uppercase tracking-tighter italic">No widgets configured</p>
            <p className="text-sm mt-2 text-rose-300 font-bold">Visit the Builder to personalize your dash</p>
          </div>
        ) : (
          <div className="p-2">
            {(() => {
              // Normalize layouts before render
              const normalize = (arr) => {
                if (!Array.isArray(arr)) return [];
                return arr
                  .filter(l => l && Number.isInteger(l.x) && Number.isInteger(l.y))
                  .map(l => ({
                    i: String(l.i),
                    x: l.x,
                    y: l.y,
                    w: Math.max(1, l.w),
                    h: Math.max(2, l.h),
                  }));
              };
              
              const normalizedLayouts = {
                lg: normalize(layouts.lg),
                md: normalize(layouts.md),
                sm: normalize(layouts.sm),
                xs: normalize(layouts.xs),
              };
              
              console.log('✅ Dashboard layouts:', normalizedLayouts);
              console.log('📦 Widgets:', widgets.map(w => ({ id: w.id, type: w.type })));
              
              return (
                <ResponsiveGridLayout
                  className="layout"
                  layouts={normalizedLayouts}
                  breakpoints={{ lg: 1100, md: 996, sm: 768, xs: 480 }}
                  cols={{ lg: 12, md: 8, sm: 4, xs: 4 }}
                  rowHeight={60}
                  isDraggable={true}
                  isResizable={true}
                  margin={[16, 16]}
                  containerPadding={[0, 0]}
                  compactType="vertical"
                  preventCollision={false}
                  useCSSTransforms={true}
                  verticalCompact={true}
                  onLayoutChange={(layout, allLayouts) => {
                    console.log('📐 Dashboard layout changed:', { layout, allLayouts });
                    setLayouts(allLayouts);
                  }}
                >
                  {widgets.map((widget) => (
                    <div key={String(widget.id)} className="rounded-xl overflow-hidden">
                      {renderWidget(widget)}
                    </div>
                  ))}
                </ResponsiveGridLayout>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

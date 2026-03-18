import React, { useState, useEffect, useCallback } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import KPIWidget from '../components/KPIWidget';
import ChartWidget from '../components/ChartWidget';
import TableWidget from '../components/TableWidget';
import { getDashboard, saveDashboard } from '../services/api';
import { WIDGET_TYPES, KPI_METRICS, AXIS_OPTIONS, Y_AXIS_OPTIONS, CHART_COLORS } from '../widgets/widgetConfig';

const ResponsiveGridLayout = WidthProvider(Responsive);

let widgetIdCounter = 100;

/**
 * PRODUCTION-READY: Validates single layout item with safe defaults
 * Uses Number.isFinite() for robust number checking
 */
const sanitizeLayoutItem = (item, index) => {
  // Ensure item exists
  if (!item) return null;
  
  // Fallback ID if missing
  const i = item?.i || `widget-${index}`;
  
  // Use Number.isFinite() for robust number validation
  const x = Number.isFinite(item?.x) ? item.x : 0;
  const y = Number.isFinite(item?.y) ? item.y : 0;
  const w = Number.isFinite(item?.w) ? item.w : 3;
  const h = Number.isFinite(item?.h) ? item.h : 2;
  
  // Ensure positive dimensions
  return {
    i: String(i),
    x: Math.max(0, x),
    y: Math.max(0, y),
    w: Math.max(1, w),
    h: Math.max(1, h),
    static: item?.static === true,
  };
};

/**
 * PRODUCTION-READY: Sanitizes entire layout array
 * Converts all items to safe format with numeric fallbacks
 */
const sanitizeLayoutArray = (layout) => {
  if (!Array.isArray(layout)) return [];
  const sanitized = layout.map((item, index) => sanitizeLayoutItem(item, index)).filter(Boolean);
  console.log(`✅ Sanitized ${layout.length} layout items → ${sanitized.length} valid items`);
  return sanitized;
};

/**
 * PRODUCTION-READY: Ensures new widget has complete layout
 * Called when adding widgets to dashboard
 */
const createWidgetLayout = (widgetId, yPosition = 0) => {
  return {
    i: String(widgetId),
    x: 0,
    y: Math.max(0, yPosition),
    w: 3,
    h: 2,
    static: false,
  };
};

/**
 * PRODUCTION-READY: Final render-time validation
 * Prevents any undefined/invalid values reaching ReactGridLayout
 */
const prepareLayoutsForRender = (layouts) => {
  const result = {};
  ['lg', 'md', 'sm', 'xs'].forEach(bp => {
    result[bp] = sanitizeLayoutArray(layouts?.[bp] || []);
  });
  return result;
};

function WidgetConfigPanel({ widget, onUpdate, onClose, onRemove }) {
  const [local, setLocal] = useState({ ...widget });

  const set = (key, val) => setLocal((p) => ({ ...p, [key]: val }));

  const handleSave = () => {
    onUpdate(local);
    onClose();
  };

  const inputCls = "w-full bg-white border border-rose-100 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-400/10 transition-all shadow-sm";
  const labelCls = "block text-xs font-black text-rose-400 mb-1 mt-3 uppercase tracking-widest italic opacity-80";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-rose-900/40 backdrop-blur-sm">
      <div className="bg-white border border-rose-100 rounded-3xl w-full max-w-sm shadow-2xl fade-in overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-rose-50 bg-rose-50/50">
          <h3 className="text-sm font-black text-rose-600 italic tracking-tight">⚙️ Configure Widget</h3>
          <button onClick={onClose} className="text-rose-300 hover:text-rose-600 text-xl transition-colors">✕</button>
        </div>
        <div className="p-5">
          <label className={labelCls}>Widget Title</label>
          <input value={local.title || ''} onChange={(e) => set('title', e.target.value)} className={inputCls} placeholder="My Widget" />

          {local.type === 'kpiCard' && (
            <>
              <label className={labelCls}>Metric</label>
              <select value={local.metric || 'totalRevenue'} onChange={(e) => set('metric', e.target.value)} className={inputCls}>
                {KPI_METRICS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </>
          )}

          {['barChart', 'lineChart', 'areaChart', 'scatterChart', 'pieChart'].includes(local.type) && (
            <>
              <label className={labelCls}>X Axis (Group By)</label>
              <select value={local.xAxis || 'product'} onChange={(e) => set('xAxis', e.target.value)} className={inputCls}>
                {AXIS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <label className={labelCls}>Y Axis (Value)</label>
              <select value={local.yAxis || 'totalAmount'} onChange={(e) => set('yAxis', e.target.value)} className={inputCls}>
                {Y_AXIS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <label className={labelCls}>Accent Color</label>
              <div className="flex gap-2 flex-wrap mt-1">
                {CHART_COLORS.slice(0, 8).map((c) => (
                  <button key={c} onClick={() => set('color', c)}
                    style={{ background: c }}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${local.color === c ? 'border-white scale-110' : 'border-transparent'}`} />
                ))}
              </div>
            </>
          )}

          <div className="flex gap-3 mt-6">
            <button onClick={() => { onRemove(widget.id); onClose(); }}
              className="px-4 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors border border-red-100">
              Remove
            </button>
            <div className="flex-1" />
            <button onClick={onClose}
              className="px-6 py-2 rounded-xl border border-rose-100 text-rose-400 text-sm font-bold hover:bg-rose-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave}
              className="px-6 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold transition-colors shadow-lg shadow-rose-500/20">
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfigureDashboard({ orders }) {
  const [widgets, setWidgets] = useState([]);
  const [layouts, setLayouts] = useState({ lg: [], md: [], sm: [], xs: [] });
  const [configWidget, setConfigWidget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Normalize layout entries to ensure all properties are valid numbers
  // CRITICAL: Normalize and validate all layouts to prevent undefined errors
  const normalizeLayouts = (layoutsObj) => {
    const safeLayouts = {
      lg: sanitizeLayoutArray(layoutsObj?.lg),
      md: sanitizeLayoutArray(layoutsObj?.md),
      sm: sanitizeLayoutArray(layoutsObj?.sm),
      xs: sanitizeLayoutArray(layoutsObj?.xs),
    };

    // CRITICAL: Ensure all widgets exist in all breakpoints
    const allWidgetIds = new Set(widgets.map(w => String(w.id)));
    
    // For each breakpoint, add missing widgets
    const syncBreakpoints = (breakpoint) => {
      const existing = new Set(safeLayouts[breakpoint].map(l => l.i));
      let maxY = safeLayouts[breakpoint].length > 0 
        ? Math.max(...safeLayouts[breakpoint].map(l => l.y + l.h))
        : 0;
      
      allWidgetIds.forEach(id => {
        if (!existing.has(id)) {
          safeLayouts[breakpoint].push({
            i: id,
            x: 0,
            y: maxY,
            w: 4,
            h: 4,
            static: false,
          });
          maxY += 4;
        }
      });
    };

    syncBreakpoints('lg');
    syncBreakpoints('md');
    syncBreakpoints('sm');
    syncBreakpoints('xs');

    console.log('✅ Layouts safe & synced:', {
      widgets: allWidgetIds.size,
      lg: safeLayouts.lg.length,
      md: safeLayouts.md.length,
      sm: safeLayouts.sm.length,
      xs: safeLayouts.xs.length,
    });

    return safeLayouts;
  };

  // Helper to create optimized layouts for all breakpoints with proper grid alignment
  const createLayoutsForBreakpoints = (widgetList) => {
    if (!widgetList || widgetList.length === 0) {
      return { lg: [], md: [], sm: [], xs: [] };
    }

    // Separate widgets by type for structured layout
    const kpiCards = widgetList.filter(w => w.type === 'kpiCard');
    const charts = widgetList.filter(w => w.type !== 'table' && w.type !== 'kpiCard');
    const tables = widgetList.filter(w => w.type === 'table');

    const layout = [];
    let currentY = 0;

    // Row 1: Place all KPI cards in a single row (4 cards × 3 width = 12 cols)
    kpiCards.forEach((w, idx) => {
      layout.push({
        i: String(w.id),
        x: typeof w.position?.x === 'number' ? w.position.x : idx * 3,
        y: typeof w.position?.y === 'number' ? w.position.y : currentY,
        w: 3,
        h: 2,
        static: false,
      });
    });
    
    // Move to next row after KPI cards
    if (kpiCards.length > 0) {
      currentY += 2;
    }

    // Row 2+: Place charts in 2-column layout (6 width each)
    let chartX = 0;
    charts.forEach((w) => {
      layout.push({
        i: String(w.id),
        x: typeof w.position?.x === 'number' ? w.position.x : chartX,
        y: typeof w.position?.y === 'number' ? w.position.y : currentY,
        w: 6,
        h: 4,
        static: false,
      });
      chartX = chartX === 0 ? 6 : 0;
      if (chartX === 0) {
        currentY += 4;
      }
    });
    
    // After charts, add spacing for tables
    if (charts.length % 2 === 1) {
      currentY += 4;
    }

    // Row 3+: Place tables full-width
    tables.forEach((w) => {
      layout.push({
        i: String(w.id),
        x: typeof w.position?.x === 'number' ? w.position.x : 0,
        y: typeof w.position?.y === 'number' ? w.position.y : currentY,
        w: 12,
        h: 5,
        static: false,
      });
      currentY += 5;
    });

    return {
      lg: layout,
      md: layout.map(l => {
        // Tablet: 8 columns - stack items appropriately
        if (l.w === 12) return { ...l, w: 8 };
        if (l.w === 6) return { ...l, w: 8, x: 0 };
        return l;
      }),
      sm: layout.map(l => {
        // Mobile: 4 columns (stack vertically)
        return { ...l, w: 4, x: 0 };
      }),
      xs: layout.map(l => ({ ...l, w: 4, x: 0 })), // Extra small: all 4 columns
    };
  };

  // Load saved layout
  useEffect(() => {
    getDashboard()
      .then((res) => {
        console.log('📥 Dashboard response:', res);
        // Handle nested response structure: { success, data: { widgets, ... } }
        const data = res.data || res;
        console.log('📊 Extracted data:', data);
        
        if (data?.widgets?.length) {
          console.log(`📦 Received ${data.widgets.length} widgets from backend`);
          
          // Deduplicate widgets by id (keep first occurrence)
          const seen = new Set();
          const deduped = data.widgets.filter(w => {
            if (seen.has(w.id)) return false;
            seen.add(w.id);
            return true;
          });
          
          // Ensure all widgets have proper position data
          const cleanedWidgets = deduped.map(w => ({
            ...w,
            position: {
              x: Number.isFinite(w.position?.x) ? w.position.x : 0,
              y: Number.isFinite(w.position?.y) ? w.position.y : 0
            },
            width: Math.max(1, Number(w.width) || 4),
            height: Math.max(2, Number(w.height) || 4)
          }));
          console.log('✅ Cleaned widgets:', cleanedWidgets.length, { ids: cleanedWidgets.map(w => w.id) });
          setWidgets(cleanedWidgets);
          
          // Create safe layouts for all loaded widgets
          const safeLayouts = createLayoutsForBreakpoints(cleanedWidgets);
          console.log('📐 Created layouts for all breakpoints:', {
            lg: safeLayouts.lg.length,
            md: safeLayouts.md.length,
            sm: safeLayouts.sm.length,
            xs: safeLayouts.xs.length,
          });
          
          const normalizedLayouts = normalizeLayouts(safeLayouts);
          console.log('✅ Normalized layouts ready:', {
            lg: normalizedLayouts.lg.map(l => ({ i: l.i, x: l.x, y: l.y, w: l.w, h: l.h })),
          });
          
          setLayouts(normalizedLayouts);
        } else {
          console.log('📭 No widgets from backend, using empty state');
          setWidgets([]);
          setLayouts({ lg: [], md: [], sm: [], xs: [] });
        }
      })
      .catch((err) => {
        console.error('❌ Error loading dashboard:', err);
        // Set empty state on error instead of crashing
        setWidgets([]);
        setLayouts({ lg: [], md: [], sm: [], xs: [] });
      })
      .finally(() => setLoading(false));
  }, []);

  const addWidget = (typeDef) => {
    const id = `w${++widgetIdCounter}`;
    
    // Separate existing widgets by type
    const kpiCards = widgets.filter(w => w.type === 'kpiCard');
    const charts = widgets.filter(w => w.type !== 'table' && w.type !== 'kpiCard');
    const tables = widgets.filter(w => w.type === 'table');

    let newX = 0;
    let newY = 0;
    let newW = 3;
    let newH = 2;

    // Position based on widget type
    if (typeDef.type === 'kpiCard') {
      // KPI cards go in the first row, up to 4 cards (each w=3)
      newY = 0;
      newX = kpiCards.length * 3; // 0, 3, 6, 9
      if (kpiCards.length >= 4) {
        // If 4+ KPI cards, wrap to next row
        newX = (kpiCards.length - 4) * 3;
        newY = 2;
      }
      newW = 3;
      newH = 2;
    } else if (typeDef.type === 'table') {
      // Tables go full-width below everything
      let tableY = 0;
      if (kpiCards.length > 0) tableY += 2;
      if (charts.length > 0) tableY += Math.ceil(charts.length / 2) * 4;
      tableY += tables.length * 5;
      
      newX = 0;
      newY = tableY;
      newW = 12;
      newH = 5;
    } else {
      // Charts go in 2-column layout (w=6 each) after KPI row
      let chartY = kpiCards.length > 0 ? 2 : 0;
      if (charts.length % 2 === 1) {
        newX = 6;
      } else {
        newX = 0;
        chartY += Math.floor(charts.length / 2) * 4;
      }
      newY = chartY;
      newW = 6;
      newH = 4;
    }

    const newWidget = {
      id,
      type: typeDef.type,
      title: typeDef.label,
      metric: 'totalRevenue',
      xAxis: 'product',
      yAxis: 'totalAmount',
      color: CHART_COLORS[0],
      width: newW,
      height: newH,
      position: { x: newX, y: newY },
    };
    const updatedWidgets = [...widgets, newWidget];
    setWidgets(updatedWidgets);

    // Create layout entries for all breakpoints
    const newLayout = {
      i: String(id),
      x: newX,
      y: newY,
      w: newW,
      h: newH,
      static: false,
    };
    
    setLayouts((prev) => ({
      lg: [...(prev.lg || []), { ...newLayout }],
      md: [...(prev.md || []), {
        ...newLayout,
        w: newW === 12 ? 8 : (newW === 6 ? 8 : 8),
        x: 0,
      }],
      sm: [...(prev.sm || []), { ...newLayout, w: 4, x: 0 }],
      xs: [...(prev.xs || []), { ...newLayout, w: 4, x: 0 }],
    }));
  };

  const removeWidget = (id) => {
    setWidgets((prev) => prev.filter((w) => w.id !== id));
    setLayouts((prev) => ({
      lg: (prev.lg || []).filter((l) => l.i !== id),
      md: (prev.md || []).filter((l) => l.i !== id),
      sm: (prev.sm || []).filter((l) => l.i !== id),
      xs: (prev.xs || []).filter((l) => l.i !== id),
    }));
  };

  const updateWidget = (updated) => {
    setWidgets((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
  };

  const onLayoutChange = useCallback((layout, allLayouts) => {
    try {
      // Validate and sanitize each layout array
      const sanitizeLayout = (layouts) => {
        if (!Array.isArray(layouts)) return [];
        return layouts
          .filter(l => l && l.i !== undefined && l.i !== null)
          .map(l => ({
            i: String(l.i),
            x: typeof l.x === 'number' ? Math.max(0, l.x) : 0,
            y: typeof l.y === 'number' ? Math.max(0, l.y) : 0,
            w: typeof l.w === 'number' ? Math.max(1, l.w) : 4,
            h: typeof l.h === 'number' ? Math.max(2, l.h) : 4,
            static: false,
          }));
      };

      const sanitized = {
        lg: sanitizeLayout(allLayouts?.lg),
        md: sanitizeLayout(allLayouts?.md),
        sm: sanitizeLayout(allLayouts?.sm),
        xs: sanitizeLayout(allLayouts?.xs),
      };

      console.log('📐 Layout Changed:', sanitized);
      setLayouts(sanitized);
      
      // Sync positions back to widgets using the lg layout (main layout)
      setWidgets((prev) =>
        prev.map((w) => {
          const l = sanitized.lg.find((l) => String(l.i) === String(w.id));
          if (l) {
            return {
              ...w,
              width: l.w,
              height: l.h,
              position: { x: l.x, y: l.y }
            };
          }
          return w;
        })
      );
    } catch (error) {
      console.error('❌ Layout Change Error:', error);
      showToast('Layout error - reverting', 'error');
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveDashboard({ userId: 'demo', widgets });
      showToast('Dashboard saved ✓');
    } catch {
      showToast('Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const renderWidget = (widget) => {
    switch (widget.type) {
      case 'kpiCard': return <KPIWidget widget={widget} orders={orders} />;
      case 'table': return <TableWidget widget={widget} orders={orders} />;
      default: return <ChartWidget widget={widget} orders={orders} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-rose-400 font-bold italic">
        <div className="inline-block w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mr-3" />
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="p-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-black shadow-2xl fade-in border
          ${toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-rose-50 border-rose-200 text-rose-600'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black gradient-text">Dashboard Builder</h1>
          <p className="text-rose-400 text-sm mt-1 font-bold italic opacity-70">✨ Sculpt and refine your dream dashboard</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-sm font-black transition-all flex items-center gap-2 shadow-lg shadow-rose-500/20 active:scale-95">
          {saving ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
          ) : '💖 Save Layout'}
        </button>
      </div>

      {/* Widget Palette */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Add Widget</p>
        <div className="flex flex-wrap gap-2">
          {WIDGET_TYPES.map((t) => (
            <button key={t.type} onClick={() => addWidget(t)}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-black rounded-xl bg-white border border-rose-100 text-rose-400 hover:border-rose-400 hover:text-rose-600 hover:bg-rose-50/50 transition-all shadow-sm hover:shadow-md uppercase tracking-tighter italic">
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hint */}
      {widgets.length === 0 && (
        <div className="flex flex-col items-center justify-center h-80 border-2 border-dashed border-rose-100 rounded-3xl text-rose-200 bg-white/30 backdrop-blur-sm">
          <p className="text-5xl mb-4 opacity-50">🍰</p>
          <p className="font-black text-rose-300 uppercase tracking-widest italic">Dashboard is Sweet</p>
          <p className="text-xs mt-2 text-rose-200 font-bold uppercase tracking-tighter">Add some widgets to start visualizing</p>
        </div>
      )}

      {/* Grid */}
      {(() => {
        try {
          // GUARD: Prevent rendering if layouts not ready
          if (!layouts || !layouts.lg || layouts.lg.length === 0) {
            if (widgets.length === 0) {
              return null; // Show "No widgets" hint instead
            }
            console.warn('⚠️ Layouts not ready, initializing...');
            const initialized = createLayoutsForBreakpoints(widgets);
            setLayouts(normalizeLayouts(initialized));
            return null;
          }

          // CRITICAL SAFETY CHECK: Before any rendering, ensure layouts are safe
          if (widgets.length === 0) {
            return null;
          }

          const normalized = normalizeLayouts(layouts);

          // Validate: every widget must have a layout entry
          const widgetIds = widgets.map(w => String(w.id));
          const layoutIds = normalized.lg.map(l => l.i);
          const missing = widgetIds.filter(id => !layoutIds.includes(id));

          if (missing.length > 0) {
            console.error('❌ CRITICAL: Widgets without layouts:', missing);
            // Auto-fix: regenerate layouts
            const fixed = createLayoutsForBreakpoints(widgets);
            setLayouts(normalizeLayouts(fixed));
            return (
              <div className="flex items-center justify-center h-64 text-slate-500">
                <p>Regenerating layout...</p>
              </div>
            );
          }

          // Deduplicate widgets by id (keep first occurrence) FIRST
          const seen = new Set();
          const uniqueWidgets = widgets.filter(w => {
            if (seen.has(w.id)) {
              console.warn(`⚠️ Duplicate widget: ${w.id}, skipping`);
              return false;
            }
            seen.add(w.id);
            return true;
          });
          const uniqueWidgetIds = uniqueWidgets.map(w => String(w.id));

          // FINAL VALIDATION: Use the comprehensive prepareLayoutsForRender function
          const safeLaouts = prepareLayoutsForRender(normalized);
          
          // FINAL RENDER-TIME VALIDATION: Ensure no undefined x/y/w/h escape to ReactGridLayout
          const validateBeforeRender = (layouts) => {
            const validated = {};
            Object.keys(layouts).forEach(bp => {
              validated[bp] = (layouts[bp] || []).map((item, idx) => {
                // Validate each property
                const x = item?.x, y = item?.y, w = item?.w, h = item?.h;
                
                if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(w) || !Number.isFinite(h)) {
                  console.error(`❌ INVALID item in ${bp}[${idx}]:`, {
                    i: item?.i,
                    x: x, x_type: typeof x, x_isFinite: Number.isFinite(x),
                    y: y, y_type: typeof y, y_isFinite: Number.isFinite(y),
                    w: w, w_type: typeof w, w_isFinite: Number.isFinite(w),
                    h: h, h_type: typeof h, h_isFinite: Number.isFinite(h),
                  });
                  // Return sanitized fallback
                  return {
                    i: item?.i || `fallback-${idx}`,
                    x: Number.isFinite(x) ? x : 0,
                    y: Number.isFinite(y) ? y : 0,
                    w: Number.isFinite(w) ? w : 3,
                    h: Number.isFinite(h) ? h : 2,
                  };
                }
                return item;
              });
            });
            console.log('✅ Final validation complete, safe layouts ready');
            return validated;
          };
          
          const finalLayouts = validateBeforeRender(safeLaouts);
          
          console.log('✅ All validations passed, rendering grid');

        return (
        <div className="p-1 min-h-[500px]">
          {(() => {
            return (
              <ResponsiveGridLayout
                className="layout"
                layouts={finalLayouts}
                breakpoints={{ lg: 1100, md: 996, sm: 768, xs: 480 }}
                cols={{ lg: 12, md: 8, sm: 4, xs: 4 }}
                rowHeight={60}
                onLayoutChange={onLayoutChange}
                isDraggable={true}
                isResizable={true}
                draggableHandle=".drag-handle"
                resizeHandles={['se']}
                margin={[10, 10]}
                containerPadding={[0, 0]}
                compactType="vertical"
                verticalCompact={true}
                preventCollision={false}
                useCSSTransforms={true}
              >
                {uniqueWidgets
                  .map((widget) => {
                    // Determine constraints based on widget type
                    const isKPI = widget.type === 'kpiCard';
                    const isTable = widget.type === 'table';
                    const constraints = isKPI 
                      ? 'data-grid="{&quot;minW&quot;:3,&quot;minH&quot;:2,&quot;maxW&quot;:3}"'
                      : isTable
                      ? 'data-grid="{&quot;minW&quot;:12,&quot;minH&quot;:3}"'
                      : 'data-grid="{&quot;minW&quot;:6,&quot;minH&quot;:3}"';
                    
                    return (
                    <div 
                      key={String(widget.id)} 
                      className="group relative touch-none cursor-pointer"
                      onClick={() => {
                        setConfigWidget(widget);
                      }}
                      {...(isKPI && { 'data-grid': { x: widget.position?.x || 0, y: widget.position?.y || 0, w: widget.width || 3, h: widget.height || 2, minW: 3, minH: 2, maxW: 3 } })}
                      {...(isTable && { 'data-grid': { x: widget.position?.x || 0, y: widget.position?.y || 0, w: widget.width || 12, h: widget.height || 5, minW: 12, minH: 3 } })}
                      {...(!isKPI && !isTable && { 'data-grid': { x: widget.position?.x || 0, y: widget.position?.y || 0, w: widget.width || 6, h: widget.height || 4, minW: 6, minH: 3 } })}
                    >
                {/* Drag handle - MUST be first for proper event capture */}
                <div className="drag-handle absolute top-1 left-3 z-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing hover:bg-slate-100 rounded-lg px-2 py-1">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                  </div>
                </div>
                
                {/* Widget Content */}
                {renderWidget(widget)}
                
                {/* Config/Remove buttons */}
                <div className="absolute top-2 right-2 z-30 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                  <button
                    onClick={() => setConfigWidget(widget)}
                    className="px-3 py-1.5 text-xs bg-white border border-rose-100 rounded-xl text-rose-400 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 transition-all cursor-pointer font-black italic shadow-sm pointer-events-auto"
                    title="Configure widget settings"
                  >
                    ⚙️ Settings
                  </button>
                  <button
                    onClick={() => removeWidget(widget.id)}
                    className="p-1.5 bg-white border border-rose-100 rounded-xl text-rose-400 hover:bg-rose-50 hover:border-rose-300 transition-all cursor-pointer font-black shadow-sm pointer-events-auto"
                    title="Remove widget"
                  >
                    ✕
                  </button>
                </div>
              </div>
                    );
                  })}
              </ResponsiveGridLayout>
            );
          })()}
        </div>
        );
        } catch (error) {
          console.error('❌ RENDER ERROR in grid section:', error);
          console.error('  Stack:', error.stack);
          return (
            <div className="flex flex-col items-center justify-center h-64 border border-red-500/30 rounded-2xl bg-red-950/20 text-red-300">
              <p className="font-semibold mb-2">⚠️ Layout Error</p>
              <p className="text-sm">{error.message}</p>
              <button onClick={() => {
                setWidgets([]);
                setLayouts({ lg: [], md: [], sm: [], xs: [] });
              }} className="mt-3 px-3 py-1 text-sm bg-red-600 hover:bg-red-500 rounded-lg">
                Reset Dashboard
              </button>
            </div>
          );
        }
      })()}

      {/* Config Panel */}
      {configWidget && (
        <WidgetConfigPanel
          widget={configWidget}
          onUpdate={updateWidget}
          onClose={() => setConfigWidget(null)}
          onRemove={removeWidget}
        />
      )}
    </div>
  );
}

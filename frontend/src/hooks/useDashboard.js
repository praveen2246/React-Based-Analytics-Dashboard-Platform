import { useState, useCallback, useEffect } from 'react';
import { getDashboard, saveDashboard, getOrders } from '../services/api';

export const useDashboard = () => {
  const [widgets, setWidgets] = useState([]);
  const [layouts, setLayouts] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Load dashboard on mount
  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getDashboard();
      const data = response.data;

      if (data?.widgets?.length) {
        setWidgets(data.widgets);
        const gridLayout = data.widgets.map((w) => ({
          i: w.id,
          x: w.position?.x ?? 0,
          y: w.position?.y ?? 0,
          w: w.width ?? 4,
          h: w.height ?? 4,
        }));
        setLayouts({ lg: gridLayout, md: gridLayout, sm: gridLayout, xs: gridLayout });
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      showToast('Failed to load dashboard', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveDashboardLayout = useCallback(async () => {
    try {
      setSaving(true);
      await saveDashboard({
        userId: 'demo',
        widgets: widgets.map((w) => ({
          ...w,
          position: { x: w.x ?? 0, y: w.y ?? 0 },
          width: w.w ?? 4,
          height: w.h ?? 4,
        })),
        name: 'My Dashboard',
      });
      showToast('Dashboard saved successfully!', 'success');
    } catch (error) {
      console.error('Failed to save dashboard:', error);
      showToast('Failed to save dashboard', 'error');
    } finally {
      setSaving(false);
    }
  }, [widgets]);

  const addWidget = useCallback((widgetTemplate) => {
    const newId = `w${Date.now()}`;
    const newWidget = {
      id: newId,
      type: widgetTemplate.type,
      title: widgetTemplate.label,
      metric: 'totalRevenue',
      xAxis: 'product',
      yAxis: 'totalAmount',
      color: '#10b981',
      x: 0,
      y: Infinity,
      w: widgetTemplate.defaultW,
      h: widgetTemplate.defaultH,
    };

    setWidgets((prev) => [...prev, newWidget]);
    setLayouts((prev) => ({
      ...prev,
      lg: [...(prev.lg || []), { i: newId, x: 0, y: Infinity, w: widgetTemplate.defaultW, h: widgetTemplate.defaultH }],
    }));

    showToast(`${widgetTemplate.label} added!`, 'success');
  }, []);

  const updateWidget = useCallback((widgetId, updates) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === widgetId ? { ...w, ...updates } : w))
    );
    showToast('Widget updated', 'success');
  }, []);

  const removeWidget = useCallback((widgetId) => {
    setWidgets((prev) => prev.filter((w) => w.id !== widgetId));
    setLayouts((prev) => ({
      ...prev,
      lg: (prev.lg || []).filter((l) => l.i !== widgetId),
    }));
    showToast('Widget removed', 'success');
  }, []);

  const updateLayout = useCallback((newLayout) => {
    setLayouts(newLayout);
    // Update widget positions based on new layout
    if (newLayout.lg) {
      setWidgets((prev) =>
        prev.map((w) => {
          const layout = newLayout.lg.find((l) => l.i === w.id);
          return layout ? { ...w, x: layout.x, y: layout.y, w: layout.w, h: layout.h } : w;
        })
      );
    }
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const clearToast = () => setToast(null);

  return {
    widgets,
    layouts,
    loading,
    saving,
    toast,
    loadDashboard,
    saveDashboardLayout,
    addWidget,
    updateWidget,
    removeWidget,
    updateLayout,
    showToast,
    clearToast,
  };
};

export const useOrders = (initialDateFilter = 'all') => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState(initialDateFilter);

  const fetchOrders = useCallback(async (filter = dateFilter) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getOrders(filter);
      setOrders(response.data || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [dateFilter]);

  useEffect(() => {
    fetchOrders(dateFilter);
  }, [dateFilter]);

  return {
    orders,
    loading,
    error,
    dateFilter,
    setDateFilter,
    fetchOrders,
  };
};

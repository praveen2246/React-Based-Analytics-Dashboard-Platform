export const WIDGET_TYPES = [
  { type: 'kpiCard', label: 'KPI Card', icon: '📊', defaultW: 3, defaultH: 2 },
  { type: 'barChart', label: 'Bar Chart', icon: '📈', defaultW: 6, defaultH: 4 },
  { type: 'lineChart', label: 'Line Chart', icon: '📉', defaultW: 6, defaultH: 4 },
  { type: 'areaChart', label: 'Area Chart', icon: '🏔️', defaultW: 6, defaultH: 4 },
  { type: 'scatterChart', label: 'Scatter Chart', icon: '✦', defaultW: 6, defaultH: 4 },
  { type: 'pieChart', label: 'Pie Chart', icon: '🥧', defaultW: 5, defaultH: 4 },
  { type: 'table', label: 'Data Table', icon: '📋', defaultW: 8, defaultH: 5 },
];

export const KPI_METRICS = [
  { value: 'totalRevenue', label: 'Total Revenue', format: 'currency' },
  { value: 'totalOrders', label: 'Total Orders', format: 'number' },
  { value: 'avgOrderValue', label: 'Avg Order Value', format: 'currency' },
  { value: 'pendingOrders', label: 'Pending Orders', format: 'number' },
  { value: 'deliveredOrders', label: 'Delivered Orders', format: 'number' },
  { value: 'cancelledOrders', label: 'Cancelled Orders', format: 'number' },
  { value: 'totalQuantity', label: 'Total Quantity Sold', format: 'number' },
];

export const AXIS_OPTIONS = [
  { value: 'product', label: 'Product (Telecom Services)' },
  { value: 'status', label: 'Status' },
  { value: 'city', label: 'City' },
  { value: 'country', label: 'Country' },
  { value: 'createdAt', label: 'Date' },
];

export const Y_AXIS_OPTIONS = [
  { value: 'totalAmount', label: 'Total Amount' },
  { value: 'quantity', label: 'Quantity' },
  { value: 'unitPrice', label: 'Unit Price' },
  { value: 'count', label: 'Order Count' },
];

export const CHART_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
  '#6366f1', '#84cc16',
];

export const DATE_FILTERS = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: '7days', label: 'Last 7 Days' },
  { value: '30days', label: 'Last 30 Days' },
  { value: '90days', label: 'Last 90 Days' },
];

/**
 * Filter orders to only include valid products from allowed list
 * @param {Array} orders - Raw orders from API
 * @param {Array} allowedProducts - List of allowed product names
 * @returns {Array} Filtered orders with only valid products
 */
export const filterOrdersByValidProducts = (orders, allowedProducts) => {
  if (!orders || !Array.isArray(orders)) return [];
  return orders.filter((order) => {
    return order.product && allowedProducts.includes(order.product.trim());
  });
};

/**
 * Calculate KPI metrics from orders array (assumes pre-filtered by valid products)
 * Ensures proper type conversion for all numeric values
 */
export const calculateKPIs = (orders) => {
  if (!orders || !Array.isArray(orders) || orders.length === 0) {
    return { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, pendingOrders: 0, deliveredOrders: 0, cancelledOrders: 0, totalQuantity: 0 };
  }
  
  const totalRevenue = orders.reduce((sum, o) => {
    const amount = Number(o.totalAmount) || 0;
    return sum + amount;
  }, 0);
  
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;
  const cancelledOrders = orders.filter((o) => o.status === 'cancelled').length;
  
  const totalQuantity = orders.reduce((sum, o) => {
    const qty = Number(o.quantity) || 0;
    return sum + qty;
  }, 0);

  console.log('📊 KPI Calculation:', { totalRevenue, totalOrders, avgOrderValue, pendingOrders, deliveredOrders, cancelledOrders, totalQuantity });
  return { totalRevenue, totalOrders, avgOrderValue, pendingOrders, deliveredOrders, cancelledOrders, totalQuantity };
};

/**
 * Aggregate orders data for charts (assumes pre-filtered by valid products)
 * Handles special case for status-based aggregation (pie charts)
 */
export const aggregateData = (orders, xAxis, yAxis) => {
  if (!orders || !Array.isArray(orders) || orders.length === 0) return [];
  
  const map = {};

  orders.forEach((order) => {
    let key;
    if (xAxis === 'createdAt') {
      key = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    } else {
      key = order[xAxis] || 'Unknown';
    }

    // Initialize aggregation object
    if (!map[key]) {
      map[key] = {
        name: key,
        totalAmount: 0,
        quantity: 0,
        unitPrice: 0,
        count: 0,
      };
    }

    // Ensure numeric conversion
    const totalAmount = Number(order.totalAmount) || 0;
    const quantity = Number(order.quantity) || 0;
    const unitPrice = Number(order.unitPrice) || 0;

    map[key].totalAmount += totalAmount;
    map[key].quantity += quantity;
    map[key].unitPrice = unitPrice; // Use last value for unit price
    map[key].count += 1;
  });

  const result = Object.values(map).sort((a, b) => {
    if (xAxis === 'createdAt') return new Date(a.name) - new Date(b.name);
    const aVal = Number(a[yAxis]) || 0;
    const bVal = Number(b[yAxis]) || 0;
    return bVal - aVal;
  });

  console.log(`📈 Aggregated Data (xAxis=${xAxis}, yAxis=${yAxis}):`, result);
  return result;
};

export const formatValue = (value, format) => {
  if (format === 'currency') return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return Number(value).toLocaleString();
};


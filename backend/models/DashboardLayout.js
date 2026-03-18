const mongoose = require('mongoose');

const widgetSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ['kpiCard', 'barChart', 'lineChart', 'areaChart', 'scatterChart', 'pieChart', 'table'],
      required: true,
    },
    title: { type: String },
    xAxis: { type: String },
    yAxis: { type: String },
    metric: { type: String }, // for KPI cards
    color: { type: String, default: '#54bd95' },
    width: { type: Number, default: 4 },
    height: { type: Number, default: 4 },
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
    },
  },
  { _id: false }
);

const dashboardLayoutSchema = new mongoose.Schema(
  {
    userId: { type: String, default: 'demo' },
    name: { type: String, default: 'My Dashboard' },
    widgets: [widgetSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('DashboardLayout', dashboardLayoutSchema);

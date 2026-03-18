# 🛠️ Developer Reference Card

## **Quick Command Reference**

### **Start Project**
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend  
cd frontend && npm run dev

# Terminal 3: Open Browser
http://localhost:5174
```

### **Seed Data**
```bash
# REST API call
curl -X POST http://localhost:5000/api/orders/seed/demo

# Or visit in browser
http://localhost:5000/api/orders/seed/demo
```

---

## **API Quick Reference**

### **Orders Endpoints**
```
GET    /api/orders
GET    /api/orders/:id
POST   /api/orders
PUT    /api/orders/:id
DELETE /api/orders/:id
POST   /api/orders/seed/demo
```

**Query Parameters:**
```
?dateFilter=all|today|7days|30days|90days
?sort=-createdAt|+createdAt
?limit=100
```

### **Dashboard Endpoints**
```
GET    /api/dashboard?userId=demo
POST   /api/dashboard
```

---

## **Form Fields & Validation**

### **Create Order - Required Fields**
| Field | Type | Validation |
|-------|------|-----------|
| firstName | text | Required, min 1 char |
| lastName | text | Required, min 1 char |
| email | email | Required, valid email |
| product | text | Required, from dropdown |
| quantity | number | Required, min 1 |
| unitPrice | number | Required, min 0 |

### **Optional Fields**
- phone, address, city, state, postalCode, country

### **Auto Fields**
- totalAmount (qty × unitPrice)
- status (default: pending)
- createdAt (server timestamp)

---

## **Widget Types Quick Access**

| Widget | Size | Use Case |
|--------|------|----------|
| KPI Card | 3×2 | Metrics |
| Bar Chart | 6×4 | Comparisons |
| Line Chart | 6×4 | Trends |
| Area Chart | 6×4 | Growth |
| Scatter | 6×4 | Correlation |
| Pie Chart | 5×4 | Distribution |
| Table | 8×5 | Details |

---

## **KPI Metrics Available**

```javascript
totalRevenue       // Sum of all amounts
totalOrders        // Count of orders
avgOrderValue      // Revenue / Orders
pendingOrders      // Pending status count
deliveredOrders    // Delivered status count
cancelledOrders    // Cancelled status count
totalQuantity      // Sum of quantities
```

---

## **Chart Axes Options**

### **X-Axis (Group By)**
```javascript
product    // Group by product name
status     // Group by order status
city       // Group by customer city
country    // Group by customer country
createdAt  // Group by date
```

### **Y-Axis (Value)**
```javascript
totalAmount  // Sum of amounts
quantity     // Sum of quantities
unitPrice    // Sum of unit prices
count        // Number of orders
```

---

## **Status Values**

```javascript
"pending"      // Order created
"processing"   // Being prepared
"shipped"      // On the way
"delivered"    // Received
"cancelled"    // Order cancelled
```

---

## **Response Format**

### **Success Response**
```javascript
{
  success: true,
  data: { /* object or array */ },
  message: "Operation successful",
  count: 5
}
```

### **Error Response**
```javascript
{
  success: false,
  message: "Error description",
  error: "Detailed error if available"
}
```

---

## **Common API Calls**

### **Get All Orders**
```bash
curl http://localhost:5000/api/orders
```

### **Get Last 7 Days**
```bash
curl "http://localhost:5000/api/orders?dateFilter=7days"
```

### **Create Order**
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@ex.com","product":"Laptop","quantity":1,"unitPrice":1000}'
```

### **Update Order**
```bash
curl -X PUT http://localhost:5000/api/orders/ORDERID \
  -H "Content-Type: application/json" \
  -d '{"quantity":2,"unitPrice":1000,"status":"shipped"}'
```

### **Delete Order**
```bash
curl -X DELETE http://localhost:5000/api/orders/ORDERID
```

### **Get Dashboard**
```bash
curl http://localhost:5000/api/dashboard?userId=demo
```

### **Save Dashboard**
```bash
curl -X POST http://localhost:5000/api/dashboard \
  -H "Content-Type: application/json" \
  -d '{"userId":"demo","widgets":[],"name":"My Dashboard"}'
```

---

## **Frontend Component Tree**

```
App.jsx
├── Sidebar Navigation
├── Dashboard Page
│   ├── ResponsiveGridLayout
│   │   ├── KPIWidget
│   │   ├── ChartWidget
│   │   └── TableWidget
│   └── DateFilter
├── Orders Page
│   ├── OrderModal (create/edit)
│   ├── OrderTable
│   └── ActionButtons
└── ConfigureDashboard Page
    ├── WidgetSelector
    ├── ResponsiveGridLayout
    │   └── Widgets
    ├── WidgetConfigPanel
    └── SaveButton
```

---

## **Keyboard Shortcuts**

| Shortcut | Action |
|----------|--------|
| F12 | Developer Console |
| Ctrl+Shift+Delete | Clear Cache |
| Ctrl+M | Mobile Responsive |
| Drag | Move widget (Builder) |
| Resize | Resize widget corner |

---

## **Common Errors & Fixes**

### **Can't connect to backend**
```bash
# Check if running
curl http://localhost:5000/api/health

# Restart backend
cd backend && npm run dev
```

### **No orders showing**
```bash
# Seed demo data
curl -X POST http://localhost:5000/api/orders/seed/demo

# Check orders
curl http://localhost:5000/api/orders
```

### **Widgets won't save**
```bash
# Check backend console for errors
# Verify MongoDB is running
# Try manual save via API
curl -X POST http://localhost:5000/api/dashboard \
  -H "Content-Type: application/json" \
  -d '{"userId":"demo","widgets":[]}'
```

### **Frontend won't load**
```bash
# Clear cache and restart
rm -rf frontend/node_modules package-lock.json
npm install
npm run dev
```

---

## **Database Queries (MongoDB)**

### **List All Orders**
```javascript
db.customerorders.find({})
```

### **Count Orders**
```javascript
db.customerorders.countDocuments()
```

### **Find by Status**
```javascript
db.customerorders.find({status: "pending"})
```

### **Find by Date Range**
```javascript
db.customerorders.find({
  createdAt: {
    $gte: new Date("2024-03-01"),
    $lte: new Date("2024-03-31")
  }
})
```

### **Get Dashboard Layout**
```javascript
db.dashboardlayouts.find({userId: "demo"})
```

---

## **Performance Tips**

| Tip | Benefit |
|-----|---------|
| Date filtering | Reduces data load |
| Limit 100 | Pagination |
| Index createdAt | Faster queries |
| Cache dashboard | Reduces DB calls |
| Lazy load widgets | Better UX |

---

## **Security Checklist**

- [ ] Validate all inputs (client + server)
- [ ] Use HTTPS in production
- [ ] Add authentication
- [ ] Implement rate limiting
- [ ] Use environment variables
- [ ] Sanitize outputs
- [ ] Enable CORS properly
- [ ] Add request logging
- [ ] Use secrets management
- [ ] Regular backups

---

## **Helpful Files**

| File | Purpose |
|------|---------|
| backend/models/CustomerOrder.js | Order schema |
| backend/models/DashboardLayout.js | Dashboard schema |
| backend/routes/orders.js | Order API |
| backend/routes/dashboard.js | Dashboard API |
| frontend/services/api.js | API client |
| frontend/widgets/widgetConfig.js | Widget settings |
| frontend/hooks/useDashboard.js | State management |

---

## **Useful Links**

- Vite Docs: https://vitejs.dev
- React Docs: https://react.dev
- Tailwind CSS: https://tailwindcss.com
- Recharts: https://recharts.org
- react-grid-layout: https://react-grid-layout.github.io/react-grid-layout/examples/0-showcase.html
- Express Docs: https://expressjs.com
- MongoDB Docs: https://docs.mongodb.com
- Mongoose Docs: https://mongoosejs.com

---

## **Notes**

- All times are UTC (MongoDB default)
- Date filters are server-side
- Totals auto-calculated (avoid manual entry)
- Grid: 12 desktop, 8 tablet, 4 mobile
- Color hex values for widgets
- Widget IDs are unique (timestamp-based)
- userId defaults to "demo"

---

**Print this card or bookmark for quick reference!**

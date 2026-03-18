# 🚀 Quick Start Guide - Custom Dashboard Builder

## **Prerequisites**
- Node.js >= 14.0
- npm or yarn
- MongoDB (local or Atlas connection)
- Modern web browser

## **Setup Steps**

### **1. Install Dependencies**

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### **2. Configure Environment**

Create `.env` file in backend folder:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/dashboard_db
NODE_ENV=development
```

### **3. Start MongoDB** (if local)
```bash
# Windows
mongod

# macOS/Linux
mongod --config /usr/local/etc/mongod.conf
```

### **4. Start Backend Server**
```bash
cd backend
npm run dev
```
Server runs on: **http://localhost:5000**

### **5. Start Frontend Development Server**
```bash
cd frontend
npm run dev
```
Frontend runs on: **http://localhost:5174**

### **6. Seed Demo Data**
Visit: http://localhost:5000/api/orders/seed/demo

Or run:
```bash
curl -X POST http://localhost:5000/api/orders/seed/demo
```

---

## **Quick Navigation**

| Page | URL | Purpose |
|------|-----|---------|
| Dashboard | http://localhost:5174 | View metrics & charts |
| Builder | http://localhost:5174/#/builder | Configure widgets |
| Orders | http://localhost:5174/#/orders | Manage orders |
| API Health | http://localhost:5000/api/health | Check backend |

---

## **First 5 Minutes**

1. **Open Dashboard**  
   → Visit http://localhost:5174  
   → Should see "No widgets configured" message

2. **Create Demo Data**  
   → Click "Orders" tab  
   → Should see 5+ orders (if seeded)

3. **Go to Builder**  
   → Click "Builder" tab  
   → Click "📊 KPI Card"  
   → Drag it onto the canvas  
   → Click ⚙️ to configure

4. **Save & View**  
   → Click "Save Dashboard"  
   → Click "Dashboard" tab  
   → Should see your KPI widget!

---

## **Common Commands**

```bash
# Backend development (with auto-reload)
npm run dev

# Backend production
npm start

# Frontend development
npm run dev

# Frontend production build
npm run build
npm run preview

# Seed demo data
curl -X POST http://localhost:5000/api/orders/seed/demo

# Test API
curl http://localhost:5000/api/health
curl http://localhost:5000/api/orders
```

---

## **API Endpoints Cheat Sheet**

```javascript
// Get all orders (with date filter)
GET /api/orders?dateFilter=all

// Create order
POST /api/orders
{ firstName, lastName, email, product, quantity, unitPrice }

// Update order
PUT /api/orders/:id
{ quantity, unitPrice, status }

// Delete order
DELETE /api/orders/:id

// Get dashboard
GET /api/dashboard?userId=demo

// Save dashboard
POST /api/dashboard
{ userId, widgets, name }

// Seed demo data
POST /api/orders/seed/demo
```

---

## **Demo Data Included**

- 5 sample orders
- Various products (Laptop, Mouse, Hub, Keyboard, Monitor)
- Different statuses (pending, processing, shipped, delivered, cancelled)
- Multiple customers across different cities

---

## **Widget Types Available**

| Widget | Size | Best For |
|--------|------|----------|
| KPI Card | 3×2 | Key metrics |
| Bar Chart | 6×4 | Comparisons |
| Line Chart | 6×4 | Trends |
| Area Chart | 6×4 | Growth |
| Scatter Plot | 6×4 | Correlations |
| Pie Chart | 5×4 | Distribution |
| Table | 8×5 | Details |

---

## **Troubleshooting**

### Backend won't start
```bash
# Check if port 5000 is in use
netstat -an | grep 5000

# Kill process on port 5000
lsof -ti:5000 | xargs kill -9  # macOS/Linux
```

### Frontend won't load
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### MongoDB connection error
```bash
# Check if MongoDB is running
mongosh  # or mongo

# Or use MongoDB Atlas (cloud)
# Update MONGO_URI in .env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dashboard_db
```

### No data appearing
1. Seed demo data:
   ```bash
   curl -X POST http://localhost:5000/api/orders/seed/demo
   ```
2. Refresh dashboard
3. Check browser console for errors

---

## **Project Structure**

```
dashboard-project/
├── backend/
│   ├── models/
│   │   ├── CustomerOrder.js
│   │   └── DashboardLayout.js
│   ├── routes/
│   │   ├── orders.js (CRUD + date filter)
│   │   └── dashboard.js (save/load)
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ConfigureDashboard.jsx
│   │   │   └── Orders.jsx
│   │   ├── components/
│   │   │   ├── KPIWidget.jsx
│   │   │   ├── ChartWidget.jsx
│   │   │   ├── TableWidget.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   └── Toast.jsx
│   │   ├── hooks/
│   │   │   └── useDashboard.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── widgets/
│   │   │   └── widgetConfig.js
│   │   └── App.jsx
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

---

## **Next Steps**

1. **Create an Order**
   - Go to Orders tab
   - Click "+ New Order"
   - Fill in details
   - See metrics update!

2. **Build Your Dashboard**
   - Go to Builder tab
   - Add widgets
   - Configure them
   - Save & view

3. **Explore Features**
   - Try date filters
   - Change widget configuration
   - Resize widgets
   - Test all chart types

4. **Customize**
   - Change colors
   - Add more widgets
   - Create multiple dashboards (future)
   - Export data (future)

---

## **Support**

For issues or questions:
1. Check browser console (F12)
2. Check backend logs (terminal)
3. Check network tab for API errors
4. Review IMPLEMENTATION_GUIDE.md

---

**Enjoy your new Dashboard! 🎉**

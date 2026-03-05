# 🛍️ TechShop - E-Commerce Platform (Swagger API Integrated)

> Modern e-commerce platform with full Swagger API integration, role-based access control, and responsive design.

## 🌟 Features

### ✅ Hoàn toàn tích hợp với Swagger API

- Authentication (Login/Register)
- Product Management (CRUD)
- Shopping Cart (Real-time sync)
- Order Management
- User Management

### 🎯 Role-Based Access Control

- **Admin**: Full dashboard với quản lý products, orders, users
- **Staff**: Dashboard quản lý orders và inventory
- **Customer**: Giao diện shopping với cart và order history

### 🔐 Authentication

- Login/Register với validation
- Login attempt limiting (5 attempts)
- Account lockout (5 phút sau 5 lần fail)
- Social login integration (Google, Facebook)
- Auto-redirect dựa trên role

### 📦 Product Features

- Product listing với categories
- Flash Sale section
- Product detail modal
- Stock status indicators
- Real-time inventory updates

### 🛒 Shopping Cart

- Add/Remove/Update items
- Real-time sync với backend
- Cart persistence per user
- Quantity adjustment
- Total calculation

### 📋 Order Management

- Create orders from cart
- Order history tracking
- Status updates (pending → processing → shipping → completed)
- Admin/Staff order management
- Order details với items list

## 🚀 Quick Start

### Prerequisites

```bash
Node.js >= 16.x
npm >= 8.x
```

### Installation

```bash
# Clone repository
git clone <repository-url>
cd SWD392-Frontend-main

# Install dependencies
npm install

# Start development server
npm run dev
```

Server sẽ chạy tại: `http://localhost:5174/` (hoặc port khác nếu 5173 đang được dùng)

## 📊 API Configuration

API được cấu hình trong `src/utils/api.js`:

```javascript
const API_BASE_URL = "https://swd392-api.taiduc1001.net";
```

Swagger Documentation: https://swd392-api.taiduc1001.net/swagger-ui/index.html

## 👥 Test Accounts

### Để test với role khác nhau, tạo accounts với backend:

#### Admin Account Example

```json
{
  "email": "admin@techshop.vn",
  "password": "admin123456",
  "fullName": "Admin User",
  "role": "ADMIN"
}
```

#### Staff Account Example

```json
{
  "email": "staff@techshop.vn",
  "password": "staff123456",
  "fullName": "Staff User",
  "role": "STAFF"
}
```

#### Customer Account (Default)

```json
{
  "email": "customer@example.com",
  "password": "customer123",
  "fullName": "Customer User",
  "role": "USER"
}
```

## 🗂️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AuthModal.jsx           # Login/Register modal
│   ├── CartSidebar.jsx         # Shopping cart sidebar
│   ├── CheckoutModal.jsx       # Checkout process
│   ├── OrderHistory.jsx        # User order history
│   ├── ProductGrid.jsx         # Product display grid
│   ├── ProductDetail.jsx       # Product detail modal
│   ├── FlashSale.jsx           # Flash sale section
│   ├── Header.jsx              # Site header
│   ├── Footer.jsx              # Site footer
│   └── ...
│
├── pages/              # Page components (role-based)
│   ├── AdminPage.jsx           # Admin dashboard
│   ├── StaffPage.jsx           # Staff dashboard
│   ├── ProfilePage.jsx         # User profile
│   └── ...
│
├── utils/              # Utility functions
│   ├── api.js                  # API service layer (Swagger integrated)
│   └── productData.js          # Mock data fallback
│
├── App.jsx             # Main app với role-based routing
├── main.jsx            # Entry point
└── index.css           # Global styles (Tailwind)
```

## 🎨 UI Components

### Admin Dashboard (`/admin`)

**Auto-redirect khi login với role="ADMIN"**

#### Tabs:

1. **Dashboard**: System overview với stats
2. **Products**: CRUD operations cho products
3. **Orders**: Order management với status updates
4. **Users**: User list và roles

#### Features:

- ✅ Stats cards (Revenue, Orders, Products, Users)
- ✅ Product search và filter
- ✅ Add/Edit/Delete products
- ✅ Update order status
- ✅ View all users

### Staff Dashboard (`/staff`)

**Auto-redirect khi login với role="STAFF"**

#### Tabs:

1. **Orders**: Order processing với quick actions
2. **Inventory**: Stock management

#### Features:

- ✅ Quick stats (Pending, Processing, Shipping, Low Stock)
- ✅ Order search và filter
- ✅ One-click status updates
- ✅ Stock quantity adjustment
- ✅ Stock status indicators

### Shop Interface (Default)

**Hiển thị cho all users hoặc role="USER"**

#### Sections:

- Hero Banner
- Flash Sale (countdown timer)
- Product Categories:
  - Laptop - Máy Tính
  - Điện Thoại - Smartphone
  - Âm Thanh - Tai Nghe
  - Phụ Kiện - Accessories

#### Features:

- ✅ Product browsing
- ✅ Shopping cart (requires login)
- ✅ Product details
- ✅ Checkout process
- ✅ Order history

## 📡 API Integration

### Authentication

```javascript
// Login
const response = await authAPI.login(email, password);
// Returns: { id, email, fullName, role, message }

// Register
const response = await authAPI.register(email, password, fullName, role);
// Returns: { id, email, fullName, role, message }
```

### Products

```javascript
// Get all products
const products = await productAPI.getAll();

// Create product (Admin/Staff)
const product = await productAPI.create({
  name,
  description,
  price,
  stockQuantity,
  category,
  status,
});

// Update product (Admin/Staff)
const updated = await productAPI.update({ id, ...productData });

// Delete product (Admin/Staff)
await productAPI.delete(productId);
```

### Cart

```javascript
// Get user cart
const cart = await cartAPI.getByUserId(userId);

// Add to cart
const updated = await cartAPI.addProduct(userId, productId, quantity);

// Update quantity
const updated = await cartAPI.updateQuantity(cartItemId, quantity);

// Remove item
await cartAPI.removeItem(cartItemId);

// Clear cart
await cartAPI.clearCart(userId);
```

### Orders

```javascript
// Get all orders (Admin/Staff)
const orders = await orderAPI.getAll();

// Get user orders
const orders = await orderAPI.getByUserId(userId);

// Create order (from cart)
const order = await orderAPI.create(userId);

// Update order status (Admin/Staff)
const updated = await orderAPI.updateStatus(orderId, status);
```

## 🎯 Data Flow

### Login Flow

```
1. User enters credentials
2. AuthModal → authAPI.login()
3. Receive AuthResponseDTO
4. Save to localStorage
5. Check role:
   - ADMIN → Navigate to AdminPage
   - STAFF → Navigate to StaffPage
   - USER → Stay on Shop
```

### Shopping Flow

```
1. User browses products (from productAPI.getAll())
2. Click "Add to Cart" → Requires login
3. cartAPI.addProduct() → Updates backend
4. Cart syncs with backend
5. Checkout → orderAPI.create(userId)
6. Backend creates order from cart
7. Cart cleared automatically
8. Order appears in history
```

### Order Management Flow (Admin/Staff)

```
1. View orders (orderAPI.getAll())
2. Select order status from dropdown
3. orderAPI.updateStatus(orderId, newStatus)
4. Backend updates order
5. UI refreshes to show new status
```

## 🎨 Styling

### Tailwind CSS

Project sử dụng Tailwind CSS cho styling:

- Utility-first approach
- Responsive design out of the box
- Custom color palette:
  - Primary: Red (#DC2626)
  - Secondary: Blue (#2563EB)
  - Success: Green (#16A34A)
  - Warning: Yellow (#CA8A04)

### Icons

Lucide React icons library:

```javascript
import { ShoppingCart, User, Package } from "lucide-react";
```

## 🔧 Configuration Files

### `vite.config.js`

Vite configuration cho build và dev server

### `tailwind.config.js`

Tailwind CSS configuration

### `eslint.config.js`

ESLint configuration cho code quality

### `package.json`

Dependencies và scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

## 📚 Documentation

- **[API_STRUCTURE.md](./API_STRUCTURE.md)**: Chi tiết về Swagger API endpoints và data structures
- **[UI_GUIDE.md](./UI_GUIDE.md)**: Hướng dẫn chi tiết về UI components và usage
- **[PROJECT_README.md](./PROJECT_README.md)**: Original project documentation

## 🔐 Security Features

1. **Authentication**: JWT-based (handled by backend)
2. **Login Limiting**: Max 5 attempts, 5-minute lockout
3. **Role-Based Access**: Different UIs cho different roles
4. **Input Validation**: Form validation trước khi gửi API
5. **Error Handling**: Comprehensive error messages

## 🐛 Troubleshooting

### API Connection Issues

```javascript
// Check API_BASE_URL in src/utils/api.js
const API_BASE_URL = "https://swd392-api.taiduc1001.net";

// Verify backend is running
// Check Swagger: https://swd392-api.taiduc1001.net/swagger-ui/index.html
```

### CORS Issues

Backend phải enable CORS cho frontend origin.

### Login Issues

1. Check credentials
2. Verify backend is running
3. Check browser console for errors
4. Clear localStorage và try again

### Cart Not Syncing

1. Ensure user is logged in
2. Check userId in localStorage
3. Verify cart API endpoint

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

Build output sẽ nằm trong folder `dist/`

### Preview Production Build

```bash
npm run preview
```

### Environment Variables

Tạo `.env` file:

```env
VITE_API_URL=https://swd392-api.taiduc1001.net
```

Update `src/utils/api.js`:

```javascript
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://swd392-api.taiduc1001.net";
```

## 📝 Development Guidelines

### Adding New Features

1. Create component in appropriate folder
2. Update API service if needed (`src/utils/api.js`)
3. Handle loading và error states
4. Test với all roles
5. Update documentation

### Code Style

- Use functional components với hooks
- Follow existing naming conventions
- Add comments cho complex logic
- Use TypeScript types (if migrating to TS)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly (all roles)
5. Submit pull request

## 📄 License

[Your License Here]

## 📞 Support

- Swagger API: https://swd392-api.taiduc1001.net/swagger-ui/index.html
- Frontend Issues: [GitHub Issues]
- Documentation: Check `API_STRUCTURE.md` và `UI_GUIDE.md`

---

**Built with ❤️ using React + Vite + Tailwind CSS + Swagger API**

**Last Updated**: Feb 28, 2026  
**Version**: 2.0.0  
**API Version**: v0

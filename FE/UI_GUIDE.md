# UI Components Guide - Updated for Swagger API

## Overview

Toàn bộ UI đã được cập nhật để tương thích 100% với Swagger API structure. Tất cả components đều sử dụng đúng field names và data structure từ backend.

## Main Features

### 1. Authentication Flow

**Component**: `AuthModal.jsx`

#### Login

- Gọi API: `POST /api/auth/login`
- Nhận response: `AuthResponseDTO` với fields: `id`, `email`, `fullName`, `role`, `message`
- Lưu user info vào localStorage
- Auto-redirect dựa trên role:
  - `ADMIN` → AdminPage
  - `STAFF` → StaffPage
  - `USER` → Shop Interface

#### Register

- Gọi API: `POST /api/auth/register`
- Required fields:
  - `fullName` (Họ và tên)
  - `email` (Email)
  - `password` (Mật khẩu - tối thiểu 6 ký tự)
- Auto-login sau khi đăng ký thành công

#### Security Features

- Login attempt limiting (5 attempts)
- Account lockout (5 minutes after 5 failed attempts)
- Remember me functionality
- Social login integration (Google, Facebook)

---

### 2. Product Management

#### Display Components

**Files**: `ProductGrid.jsx`, `FlashSale.jsx`, `ProductDetail.jsx`

**Data Mapping**:

```javascript
{
  id: product.id,                    // Product ID from API
  name: product.name,                // Product name
  image: product.imgUrl,             // ⚠️ Transformed from imgUrl
  price: product.price,              // Current price
  description: product.description,   // Product description
  stockQuantity: product.stockQuantity, // Available stock
  category: product.category,         // Product category
  status: product.status              // ACTIVE | INACTIVE | OUT_OF_STOCK
}
```

**Categories**:

- `laptop` - Laptop - Máy Tính
- `phone` - Điện Thoại - Smartphone
- `audio` - Âm Thanh - Tai Nghe
- `accessories` - Phụ Kiện

#### Admin Product Management

**Component**: `AdminPage.jsx` → Products Tab

**Features**:

- ✅ View all products
- ✅ Search products by name
- ✅ Filter by category
- ✅ Add new product
- ✅ Edit existing product
- ✅ Delete product
- ✅ View stock status with color indicators:
  - Green: Stock > 20
  - Yellow: 1 ≤ Stock ≤ 20
  - Red: Stock = 0

**Product Form Fields**:

- Tên sản phẩm (name) - Required
- Mô tả (description) - Required
- Giá (price) - Required, number
- Số lượng kho (stockQuantity) - Required, number
- Danh mục (category) - Required, dropdown
- Trạng thái (status) - Required, dropdown

---

### 3. Shopping Cart

**Component**: `CartSidebar.jsx`

**API Integration**:

- Load cart: `GET /api/cart/{userId}`
- Add to cart: `POST /api/cart/add`
- Update quantity: `PUT /api/cart/item/{cartItemId}?quantity={qty}`
- Remove item: `DELETE /api/cart/item/{cartItemId}`
- Clear cart: `DELETE /api/cart/{userId}/clear`

**Data Structure**:

```javascript
{
  id: cartItem.productId,
  cartItemId: cartItem.id,           // For update/delete operations
  name: cartItem.productName,
  price: cartItem.priceAtTime,       // Price when added to cart
  quantity: cartItem.quantity,
  image: transformedProductImage     // From products list
}
```

**Features**:

- Real-time cart sync with backend
- Quantity adjustment (+/-)
- Remove individual items
- Cart item count badge
- Total calculation
- Checkout button

---

### 4. Order Management

#### Customer Orders

**Component**: `OrderHistory.jsx`

**Display Fields**:

```javascript
{
  id: order.id,
  buyerName: order.buyerName,
  orderDate: order.orderDate,        // Date-time string
  status: order.status,              // Order status
  totalAmount: order.totalAmount,    // Total price
  orderItems: order.orderItems[]     // Array of order items
}
```

**Order Item Structure**:

```javascript
{
  id: item.id,
  productId: item.productId,
  productName: item.productName,
  quantity: item.quantity,
  price: item.price                  // Price per item
}
```

**Status Display**:

- `pending` → Yellow badge "Chờ xác nhận"
- `processing` → Blue badge "Đang xử lý"
- `shipping` → Purple badge "Đang giao"
- `completed` → Green badge "Hoàn thành"
- `cancelled` → Red badge "Đã hủy"

#### Admin Order Management

**Component**: `AdminPage.jsx` → Orders Tab

**Features**:

- View all orders from all users
- Filter by status
- Update order status
- Delete orders
- View order details (buyer, date, items, total)

#### Staff Order Management

**Component**: `StaffPage.jsx` → Orders Tab

**Features**:

- View all orders
- Quick status filters
- Update order status with one-click buttons
- Search orders by ID or buyer name
- Order statistics dashboard

---

### 5. Checkout Process

**Component**: `CheckoutModal.jsx`

**Flow**:

1. User clicks "Thanh toán" in cart
2. Modal shows with cart summary
3. User fills shipping info (optional for this version)
4. Click "Đặt hàng"
5. API Call: `POST /api/orders` with `{ userId }`
6. Backend creates order from user's current cart
7. Cart is cleared automatically
8. Success message shown
9. Orders list is refreshed

**Note**: Current implementation uses simple order creation. Shipping info can be added in future updates.

---

### 6. Admin Dashboard

**Component**: `AdminPage.jsx`

**Tabs**:

1. **Dashboard** - System overview
   - Total revenue
   - Total orders
   - Total products
   - Total users
   - Today's revenue
   - New orders count

2. **Products** - Product management
   - Full CRUD operations
   - Search & Filter
   - Stock management
   - Status management

3. **Orders** - Order management
   - View all orders
   - Update status
   - Delete orders
   - Filter by status

4. **Users** - User management
   - View all users
   - See user roles
   - User information display

**Stats Cards**:

- Blue: Total Revenue (from completed orders)
- Green: Total Orders
- Yellow: Total Products
- Purple: Total Users

---

### 7. Staff Dashboard

**Component**: `StaffPage.jsx`

**Tabs**:

1. **Orders** - Order processing
   - Quick stats (pending, processing, shipping)
   - Order list with search
   - One-click status update buttons
   - Expandable order details

2. **Inventory** - Stock management
   - View all products
   - Update stock quantities
   - Stock status indicators
   - Quick stock adjustment

**Quick Stats**:

- Yellow: Pending orders
- Blue: Processing orders
- Purple: Shipping orders
- Red: Low stock products (<10 items)

---

### 8. Role-Based UI

**File**: `App.jsx`

**Routing Logic**:

```javascript
if (user.role === "admin" && viewMode === "admin") {
  return <AdminPage />;
}

if (user.role === "staff" && viewMode === "staff") {
  return <StaffPage />;
}

// Default: Shop interface
return <ShopInterface />;
```

**Features**:

- Auto-redirect based on role after login
- "Back to Shop" button for admin/staff to view customer interface
- "Back to Admin/Staff" available from shop (if logged in as admin/staff)
- Logout returns to shop view

---

## Color Scheme & Theming

### Primary Colors

- **Brand Red**: `#DC2626` (red-600)
  - Buttons, highlights, prices
- **Brand Blue**: `#2563EB` (blue-600)
  - Staff interface, links
- **Success Green**: `#16A34A` (green-600)
  - Success states, in-stock
- **Warning Yellow**: `#CA8A04` (yellow-600)
  - Warnings, low stock
- **Danger Red**: `#DC2626` (red-600)
  - Errors, out of stock

### Status Colors

- **Pending**: Yellow background
- **Processing**: Blue background
- **Shipping**: Purple background
- **Completed**: Green background
- **Cancelled**: Red background

---

## Responsive Design

All components are fully responsive:

- **Mobile**: Single column, stacked layout
- **Tablet**: 2-column grid for products
- **Desktop**: Multi-column layouts, side panels

**Breakpoints**:

- `md:` - 768px and up
- `lg:` - 1024px and up

---

## Loading States

**Implementation**: Each page handles loading state

```javascript
const [loading, setLoading] = useState(true);

// During data fetch
setLoading(true);
const data = await api.getData();
setProducts(data);
setLoading(false);
```

**Fallback**: If API fails, uses mock data from `productData.js`

---

## Error Handling

### API Errors

```javascript
try {
  await api.call();
} catch (error) {
  alert("Error message: " + error.message);
  console.error(error);
}
```

### Common Error Messages

- "Không thể tải dữ liệu" - Failed to load data
- "Không thể thêm vào giỏ hàng" - Failed to add to cart
- "Không thể đặt hàng" - Failed to create order
- "Đăng nhập thất bại" - Login failed

---

## Data Transformation

### Products (API → UI)

```javascript
const transformedProducts = apiProducts.map((product) => ({
  ...product,
  image: product.imgUrl || product.image || "placeholder.jpg",
  rating: 4.5, // Default (API doesn't provide)
  reviews: 0, // Default (API doesn't provide)
}));
```

### Cart (API → UI)

```javascript
const transformedCart = cartItems.map((item) => ({
  id: item.productId,
  cartItemId: item.id,
  name: item.productName,
  price: item.priceAtTime,
  quantity: item.quantity,
  image: findProductImage(item.productId),
}));
```

---

## Best Practices

### 1. Always use try-catch for API calls

### 2. Transform API data immediately after fetching

### 3. Use optional chaining for nested properties

### 4. Provide fallback values for missing data

### 5. Keep UI responsive during API calls

### 6. Clear relevant caches after mutations

### 7. Reload data after create/update/delete operations

---

## Testing Tips

### Admin Account Testing

1. Register/Login with admin credentials
2. Auto-redirects to Admin Dashboard
3. Test all CRUD operations
4. Check "Back to Shop" functionality

### Staff Account Testing

1. Login with staff credentials
2. Auto-redirects to Staff Dashboard
3. Test order status updates
4. Test stock management

### Customer Account Testing

1. Register new account (default role: USER)
2. Browse products
3. Add to cart (requires login)
4. Checkout process
5. View order history

---

## Quick Reference: Component Props

### AuthModal

```javascript
<AuthModal
  isOpen={boolean}
  onClose={() => void}
  onLogin={(userInfo) => void}
/>
```

### ProductGrid

```javascript
<ProductGrid
  title="string"
  category="laptop|phone|audio|accessories"
  products={Product[]}
  onAddToCart={(product) => void}
  onProductClick={(product) => void}
/>
```

### CartSidebar

```javascript
<CartSidebar
  isOpen={boolean}
  onClose={() => void}
  cart={CartItem[]}
  onUpdateQuantity={(productId, quantity) => void}
  onRemove={(productId) => void}
  onCheckout={() => void}
/>
```

### AdminPage / StaffPage

```javascript
<AdminPage
  user={User}
  onLogout={() => void}
  onBackToShop={() => void}
/>
```

---

## Environment Variables

Currently using hardcoded API URL. For production, consider:

```javascript
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://swd392-api.taiduc1001.net";
```

---

## Future Enhancements

1. **Image Upload** - Allow admins to upload product images
2. **Advanced Filtering** - Price range, rating filters
3. **Payment Integration** - Real payment gateway
4. **Order Tracking** - Detailed tracking information
5. **Notifications** - Real-time order updates
6. **Reviews & Ratings** - Customer reviews system
7. **Wishlist** - Save products for later
8. **Analytics** - Detailed sales analytics for admin

---

**Last Updated**: Feb 28, 2026
**Version**: 2.0
**Swagger API**: https://swd392-api.taiduc1001.net/swagger-ui/index.html

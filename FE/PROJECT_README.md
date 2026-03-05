# 🎯 TechShop Admin & Staff Management System

## ✨ Tổng quan dự án

TechShop là hệ thống quản lý bán hàng trực tuyến hoàn chỉnh với giao diện hiện đại, hỗ trợ 3 loại tài khoản: **Admin**, **Staff**, và **Customer**.

### 🚀 Tính năng chính

#### 👑 Admin Dashboard

- **Tổng quan toàn diện:**
  - Thống kê doanh thu (tổng, hôm nay)
  - Quản lý đơn hàng (tổng, chờ xử lý)
  - Theo dõi sản phẩm & người dùng
  - Dashboard với biểu đồ trực quan

- **Quản lý sản phẩm:**
  - ➕ Thêm sản phẩm mới
  - ✏️ Chỉnh sửa thông tin sản phẩm
  - 🗑️ Xóa sản phẩm
  - 🔍 Tìm kiếm & lọc theo danh mục
  - 📊 Theo dõi tồn kho

- **Quản lý đơn hàng:**
  - Xác nhận đơn hàng mới
  - Cập nhật trạng thái (Pending → Processing → Shipping → Completed)
  - Hủy đơn hàng
  - Xóa đơn hàng
  - Xuất báo cáo

- **Quản lý người dùng:** (Đang phát triển)

#### 👨‍💼 Staff Dashboard

- **Tổng quan công việc:**
  - Thống kê đơn hàng cần xử lý
  - Đơn hàng đang xử lý
  - Hoàn thành trong ngày

- **Xử lý đơn hàng:**
  - Xác nhận đơn mới
  - Cập nhật trạng thái giao hàng
  - Hủy đơn khi cần

- **Xem sản phẩm:** (Read-only)
  - Tra cứu thông tin sản phẩm
  - Kiểm tra tồn kho
  - Hỗ trợ tư vấn khách hàng

#### 🛒 Customer Features

- Mua hàng trực tuyến
- Giỏ hàng thông minh
- Thanh toán đơn giản
- Xem lịch sử đơn hàng

---

## 🎨 Công nghệ sử dụng

- **Frontend Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **State Management:** React Hooks
- **Routing:** Custom routing
- **Storage:** LocalStorage

---

## 📦 Cài đặt

```bash
# Clone repository
git clone <repository-url>

# Di chuyển vào thư mục dự án
cd FE_TechShop

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build production
npm run build

# Preview production build
npm run preview
```

---

## 🔐 Tài khoản test

### Admin (Full quyền)

```
Email: admin@techshop.vn
Password: admin123
```

### Staff (Nhân viên)

```
Email: staff@techshop.vn
Password: staff123
```

### Customer (Khách hàng)

```
Email: customer@example.com
Password: customer123
```

---

## 🎯 Cách sử dụng

### 1. Đăng nhập

- Click nút **"Đăng nhập"** ở header
- Nhập email và password từ danh sách tài khoản test
- Click **"Đăng nhập"**

### 2. Truy cập Dashboard (Admin/Staff)

**Cách 1:** Click vào **avatar** → Chọn **"Quản trị hệ thống"**

**Cách 2:** Click nút **"Test"** (góc dưới trái) → Click **"TechShop Admin"**

### 3. Quản lý hệ thống

- Sử dụng các **tabs** để điều hướng
- **Admin:** Tổng quan | Sản phẩm | Đơn hàng | Người dùng
- **Staff:** Tổng quan | Đơn hàng | Sản phẩm

---

## 📂 Cấu trúc dự án

```
FE_TechShop/
├── src/
│   ├── components/
│   │   ├── AdminDashboard.jsx       # Dashboard cho Admin
│   │   ├── StaffDashboard.jsx       # Dashboard cho Staff
│   │   ├── Header.jsx               # Header chính
│   │   ├── ProductGrid.jsx          # Lưới sản phẩm
│   │   ├── CartSidebar.jsx          # Giỏ hàng
│   │   ├── CheckoutModal.jsx        # Thanh toán
│   │   ├── OrderHistory.jsx         # Lịch sử đơn hàng
│   │   ├── AuthModal.jsx            # Đăng nhập/Đăng ký
│   │   └── ...
│   ├── utils/
│   │   └── productData.js           # Dữ liệu sản phẩm
│   ├── App.jsx                      # Component chính
│   ├── main.jsx                     # Entry point
│   └── index.css                    # Global styles
├── public/                          # Static assets
├── ADMIN_STAFF_GUIDE.md            # Hướng dẫn chi tiết
└── package.json
```

---

## 🎨 Giao diện

### Màu sắc trạng thái

- 🟡 **Vàng** - Chờ xử lý
- 🔵 **Xanh dương** - Đang xử lý
- 🟣 **Tím** - Đang giao
- 🟢 **Xanh lá** - Hoàn thành
- 🔴 **Đỏ** - Đã hủy

### Responsive

- ✅ Mobile friendly
- ✅ Tablet optimized
- ✅ Desktop full features

---

## 🔐 Phân quyền

| Chức năng             | Admin |   Staff   | Customer |
| --------------------- | :---: | :-------: | :------: |
| Xem dashboard         |  ✅   |    ✅     |    ❌    |
| Thống kê doanh thu    |  ✅   |    ❌     |    ❌    |
| Thêm/Sửa/Xóa sản phẩm |  ✅   |    ❌     |    ❌    |
| Xem sản phẩm          |  ✅   | ✅ (Read) |    ❌    |
| Xử lý đơn hàng        |  ✅   |    ✅     |    ❌    |
| Xóa đơn hàng          |  ✅   |    ❌     |    ❌    |
| Mua hàng              |  ❌   |    ❌     |    ✅    |

---

## 📱 Screenshots

### Admin Dashboard - Tổng quan

![Admin Dashboard](docs/screenshots/admin-dashboard.png)

### Admin - Quản lý sản phẩm

![Products Management](docs/screenshots/admin-products.png)

### Admin - Quản lý đơn hàng

![Orders Management](docs/screenshots/admin-orders.png)

### Staff Dashboard

![Staff Dashboard](docs/screenshots/staff-dashboard.png)

---

## 🚀 Tính năng nổi bật

### 1. Dashboard thông minh

- Thống kê realtime
- Cards với gradient đẹp mắt
- Biểu tượng trực quan
- Cập nhật tự động

### 2. Quản lý sản phẩm mạnh mẽ

- Thêm/Sửa/Xóa nhanh chóng
- Tìm kiếm thông minh
- Lọc theo danh mục
- Hiển thị tồn kho trực quan

### 3. Xử lý đơn hàng hiệu quả

- Workflow rõ ràng
- Cập nhật trạng thái dễ dàng
- Hiển thị đầy đủ thông tin
- Filter theo trạng thái

### 4. UX/UI hiện đại

- Thiết kế clean, professional
- Animation mượt mà
- Icons đẹp từ Lucide
- Responsive hoàn hảo

---

## 🐛 Troubleshooting

### Không thấy Dashboard?

→ Đảm bảo đăng nhập với tài khoản admin/staff

### Dữ liệu bị mất?

→ Check localStorage, không dùng chế độ ẩn danh

### Đơn hàng không hiển thị?

→ Tạo đơn hàng mới từ tài khoản customer trước

---

## 🎯 Roadmap

### Version 2.0 (Sắp tới)

- [ ] Quản lý người dùng đầy đủ
- [ ] Biểu đồ thống kê (Chart.js)
- [ ] Export báo cáo Excel/PDF
- [ ] Thông báo realtime
- [ ] Upload hình ảnh sản phẩm
- [ ] Quản lý danh mục động
- [ ] Tích hợp thanh toán online
- [ ] Email notifications

### Version 2.1

- [ ] Multi-language support
- [ ] Dark mode
- [ ] Advanced analytics
- [ ] Inventory alerts
- [ ] Customer management
- [ ] Review & Rating system

---

## 📚 Tài liệu

- **Hướng dẫn chi tiết:** [ADMIN_STAFF_GUIDE.md](./ADMIN_STAFF_GUIDE.md)
- **API Documentation:** (Coming soon)
- **Component Documentation:** (Coming soon)

---

## 👥 Team

Developed with ❤️ by **TechShop Team**

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Credits

- **Icons:** [Lucide React](https://lucide.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Framework:** [React](https://react.dev/)

---

## 📞 Support

For support, email: support@techshop.vn

---

**Version:** 1.0.0  
**Last Updated:** February 3, 2026  
**Status:** ✅ Production Ready

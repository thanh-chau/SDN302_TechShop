# Hướng dẫn sử dụng Admin & Staff Dashboard - TechShop

## 📋 Tài khoản test

### Tài khoản Admin (Quản trị viên)

- **Email:** admin@techshop.vn
- **Password:** admin123
- **Quyền hạn:** Full quyền quản lý toàn bộ hệ thống

### Tài khoản Staff (Nhân viên)

- **Email:** staff@techshop.vn
- **Password:** staff123
- **Quyền hạn:** Quản lý đơn hàng và xem sản phẩm (không thể chỉnh sửa sản phẩm)

### Tài khoản Customer (Khách hàng)

- **Email:** customer@example.com
- **Password:** customer123
- **Quyền hạn:** Mua hàng, xem lịch sử đơn hàng

---

## 🎯 Chức năng Admin Dashboard

### 1. Tổng quan (Dashboard)

- **Thống kê tổng quan:**
  - Tổng doanh thu (từ đơn hàng hoàn thành)
  - Doanh thu hôm nay
  - Tổng số đơn hàng
  - Đơn hàng chờ xử lý
  - Tổng số sản phẩm
  - Tổng số người dùng

- **Đơn hàng gần đây:**
  - Hiển thị 5 đơn hàng mới nhất
  - Thông tin: Mã đơn, khách hàng, tổng tiền, trạng thái, ngày đặt

### 2. Quản lý sản phẩm

#### Danh sách sản phẩm

- Hiển thị toàn bộ sản phẩm
- Tìm kiếm sản phẩm theo tên
- Lọc theo danh mục (Laptop, Phone, Audio, Accessories)
- Thông tin hiển thị: Hình ảnh, tên, giá, danh mục, tồn kho

#### Thêm sản phẩm mới

- Nhấn nút "Thêm sản phẩm"
- Điền thông tin:
  - Tên sản phẩm \*
  - Danh mục \*
  - URL Hình ảnh
  - Giá bán \*
  - Giá gốc (tuỳ chọn)
  - Tồn kho \*
  - Mô tả sản phẩm
- Nhấn "Thêm sản phẩm" để lưu

#### Chỉnh sửa sản phẩm

- Nhấn icon Edit (✏️) tại sản phẩm muốn sửa
- Cập nhật thông tin
- Nhấn "Lưu thay đổi"

#### Xóa sản phẩm

- Nhấn icon Delete (🗑️) tại sản phẩm muốn xóa
- Xác nhận xóa

### 3. Quản lý đơn hàng

#### Bộ lọc đơn hàng

- **Tất cả:** Hiển thị toàn bộ đơn hàng
- **Chờ xử lý:** Đơn hàng mới, cần xác nhận
- **Đang xử lý:** Đơn đã xác nhận
- **Hoàn thành:** Đơn đã giao thành công

#### Xử lý đơn hàng

**Trạng thái: Chờ xử lý (Pending)**

- Nhấn "Xác nhận" → Chuyển sang "Đang xử lý"
- Nhấn "Hủy đơn" → Chuyển sang "Đã hủy"

**Trạng thái: Đang xử lý (Processing)**

- Nhấn "Đang giao hàng" → Chuyển sang "Đang giao"

**Trạng thái: Đang giao (Shipping)**

- Nhấn "Hoàn thành" → Chuyển sang "Hoàn thành"

#### Xóa đơn hàng

- Nhấn nút "Xóa" → Xác nhận xóa

#### Thông tin đơn hàng

Mỗi đơn hàng hiển thị:

- Mã đơn hàng
- Trạng thái
- Ngày đặt
- Thông tin khách hàng (tên, SĐT, địa chỉ)
- Danh sách sản phẩm
- Tổng tiền

### 4. Quản lý người dùng (Chỉ Admin)

- Chức năng đang phát triển
- Sẽ có trong phiên bản tiếp theo

---

## 👨‍💼 Chức năng Staff Dashboard

### 1. Tổng quan

- **Thống kê công việc:**
  - Chờ xử lý (màu vàng) - Số đơn cần xác nhận ngay
  - Đang xử lý (màu xanh) - Số đơn đang được xử lý
  - Hoàn thành hôm nay (màu xanh lá) - Số đơn giao thành công hôm nay
  - Tổng đơn hàng (màu tím) - Tất cả đơn hàng

- **Đơn hàng cần xử lý:**
  - Hiển thị các đơn đang chờ xử lý
  - Nút "Xử lý" nhanh chuyển sang tab đơn hàng

### 2. Quản lý đơn hàng

- Tính năng giống Admin
- Có thể xác nhận, hủy, cập nhật trạng thái đơn hàng
- Xem chi tiết đơn hàng đầy đủ

### 3. Xem sản phẩm

- **Chỉ xem (Read-only):**
  - Không thể thêm/sửa/xóa sản phẩm
  - Xem thông tin: tên, giá, danh mục, tồn kho
  - Hữu ích để tra cứu thông tin sản phẩm khi tư vấn khách hàng

---

## 🚀 Cách sử dụng

### Đăng nhập vào hệ thống

1. Click nút "Đăng nhập" ở header
2. Nhập email và password (sử dụng tài khoản test ở trên)
3. Click "Đăng nhập"

### Truy cập Dashboard

**Cách 1:** Click vào avatar/tên người dùng → Chọn "Quản trị hệ thống"

**Cách 2:** Click nút "Test" ở góc dưới bên trái → Click "TechShop Admin"

### Điều hướng

- Sử dụng các tab ở đầu dashboard để chuyển giữa các chức năng
- Admin có 4 tabs: Tổng quan, Sản phẩm, Đơn hàng, Người dùng
- Staff có 3 tabs: Tổng quan, Đơn hàng, Sản phẩm

### Đăng xuất

- Click vào avatar/tên → Chọn "Đăng xuất"

---

## 💡 Mẹo sử dụng

### Cho Admin:

1. **Kiểm tra đơn hàng mới thường xuyên:**
   - Badge đỏ ở tab "Quản lý đơn hàng" hiển thị số đơn chờ xử lý
2. **Quản lý tồn kho:**
   - Sản phẩm có màu xanh lá: tồn kho > 20 (an toàn)
   - Sản phẩm có màu vàng: tồn kho 1-20 (cảnh báo)
   - Sản phẩm có màu đỏ: hết hàng (cần nhập thêm)

3. **Thêm sản phẩm:**
   - Sử dụng URL hình ảnh từ nguồn tin cậy
   - Điền đầy đủ thông tin để khách hàng dễ tìm kiếm

### Cho Staff:

1. **Ưu tiên xử lý đơn chờ:**
   - Check tab "Tổng quan" để thấy đơn cần xử lý ngay
   - Click "Xử lý" để nhanh chóng xác nhận đơn

2. **Cập nhật trạng thái kịp thời:**
   - Xác nhận đơn ngay khi kiểm tra xong
   - Cập nhật "Đang giao hàng" khi shipper đã nhận hàng
   - Đánh dấu "Hoàn thành" sau khi giao thành công

3. **Tra cứu sản phẩm:**
   - Sử dụng tab "Sản phẩm" để check thông tin khi khách hàng hỏi
   - Xem tồn kho để tư vấn cho khách hàng

---

## 🎨 Giao diện

### Màu sắc trạng thái đơn hàng:

- 🟡 **Vàng** - Chờ xử lý (Pending)
- 🔵 **Xanh dương** - Đang xử lý (Processing)
- 🟣 **Tím** - Đang giao (Shipping)
- 🟢 **Xanh lá** - Hoàn thành (Completed)
- 🔴 **Đỏ** - Đã hủy (Cancelled)

### Icons:

- 📊 Tổng quan
- 📦 Sản phẩm
- 🛒 Đơn hàng
- 👥 Người dùng
- ✏️ Chỉnh sửa
- 🗑️ Xóa
- ✅ Xác nhận

---

## 🔐 Phân quyền

| Chức năng              | Admin | Staff | Customer |
| ---------------------- | ----- | ----- | -------- |
| Xem dashboard          | ✅    | ✅    | ❌       |
| Xem thống kê doanh thu | ✅    | ❌    | ❌       |
| Thêm sản phẩm          | ✅    | ❌    | ❌       |
| Sửa sản phẩm           | ✅    | ❌    | ❌       |
| Xóa sản phẩm           | ✅    | ❌    | ❌       |
| Xem sản phẩm           | ✅    | ✅    | ❌       |
| Xác nhận đơn hàng      | ✅    | ✅    | ❌       |
| Hủy đơn hàng           | ✅    | ✅    | ❌       |
| Cập nhật trạng thái    | ✅    | ✅    | ❌       |
| Xóa đơn hàng           | ✅    | ❌    | ❌       |
| Quản lý người dùng     | ✅    | ❌    | ❌       |

---

## 📱 Responsive Design

- Dashboard hoạt động tốt trên mọi thiết bị
- Tự động điều chỉnh layout cho mobile, tablet, desktop
- Scroll mượt mà, UX thân thiện

---

## 🐛 Troubleshooting

**Không thấy Dashboard sau khi đăng nhập:**

- Đảm bảo sử dụng đúng email/password admin hoặc staff
- Refresh lại trang
- Clear cache và đăng nhập lại

**Dữ liệu không lưu:**

- Kiểm tra localStorage của trình duyệt
- Không sử dụng chế độ ẩn danh

**Đơn hàng không hiển thị:**

- Tạo đơn hàng mới từ tài khoản customer
- Check filter trạng thái đơn hàng

---

## 🎯 Roadmap - Tính năng sắp có

1. **Quản lý người dùng:**
   - Thêm/Sửa/Xóa user
   - Phân quyền chi tiết
   - Theo dõi hoạt động

2. **Báo cáo & Thống kê:**
   - Biểu đồ doanh thu theo ngày/tháng
   - Top sản phẩm bán chạy
   - Phân tích khách hàng

3. **Xuất báo cáo:**
   - Export Excel/PDF
   - In hóa đơn
   - Báo cáo tồn kho

4. **Thông báo realtime:**
   - Thông báo đơn hàng mới
   - Alert tồn kho thấp
   - Cập nhật trạng thái

---

## 📞 Hỗ trợ

Nếu gặp vấn đề hoặc cần hỗ trợ, vui lòng liên hệ team phát triển.

---

**Phiên bản:** 1.0.0  
**Ngày cập nhật:** 03/02/2026  
**Phát triển bởi:** TechShop Team

# Debug Order API 400 Error

## Lỗi hiện tại

```
POST https://swd392-api.taiduc1001.net/api/orders 400 (Bad Request)
```

## Các nguyên nhân có thể

### 1. **Backend Cart trống** (Nguyên nhân phổ biến nhất)

- Backend yêu cầu user phải có items trong cart trước khi tạo order
- Frontend cart có items, nhưng chưa sync với backend

**Cách kiểm tra:**

```javascript
// Mở Console và chạy:
const userId = JSON.parse(localStorage.getItem("user")).id;
fetch(`https://swd392-api.taiduc1001.net/api/cart/${userId}`, {
  headers: {
    Authorization: "Bearer " + JSON.parse(localStorage.getItem("user")).token,
  },
})
  .then((r) => r.json())
  .then(console.log);
```

**Giải pháp:**

- Đảm bảo đã thêm sản phẩm vào giỏ hàng
- Reload page và thêm lại sản phẩm vào cart để sync với backend

### 2. **userId không hợp lệ**

- userId null hoặc undefined
- userId không tồn tại trong database

**Cách kiểm tra:**

```javascript
// Check user info
console.log(JSON.parse(localStorage.getItem("user")));
```

### 3. **Backend yêu cầu thêm fields**

- Backend có thể yêu cầu thêm fields ngoài `userId`
- Ví dụ: `address`, `phone`, `paymentMethod`, etc.

**Kiểm tra Swagger:**

- Xem endpoint `POST /api/orders` yêu cầu gì
- Có thể cần thêm fields vào request body

### 4. **Authentication issues**

- Token hết hạn
- Token không được gửi kèm request

## Cách debug chi tiết

### Bước 1: Xem error response từ backend

Sau khi code được update, khi bạn click "Đặt hàng", mở Console (F12) và xem:

```
API Error Response: {
  status: 400,
  statusText: "Bad Request",
  endpoint: "/api/orders",
  errorData: { /* Chi tiết lỗi từ backend */ }
}
```

### Bước 2: Test API trực tiếp với Postman/cURL

```bash
# 1. Login để lấy token
curl -X POST https://swd392-api.taiduc1001.net/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}'

# 2. Thêm product vào cart
curl -X POST https://swd392-api.taiduc1001.net/api/cart \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"productId":1,"quantity":1}'

# 3. Kiểm tra cart
curl https://swd392-api.taiduc1001.net/api/cart/1 \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Tạo order
curl -X POST https://swd392-api.taiduc1001.net/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId":1}'
```

### Bước 3: Kiểm tra flow hoàn chỉnh

1. **Đăng nhập**: User phải login
2. **Thêm vào cart**: Click "Thêm vào giỏ" → API `POST /api/cart`
3. **Xem cart**: Mở giỏ hàng → API `GET /api/cart/{userId}`
4. **Đặt hàng**: Click "Đặt hàng" → API `POST /api/orders`

## Giải pháp tạm thời

Nếu backend yêu cầu cart phải có items:

1. **Thêm sản phẩm vào cart trước:**
   - Vào trang shop
   - Click "Thêm vào giỏ" cho ít nhất 1 sản phẩm
   - Đợi API call thành công
   - Mới click "Thanh toán"

2. **Kiểm tra cart có items:**
   ```javascript
   // Frontend đã thêm validation
   if (cart.length === 0) {
     alert("Giỏ hàng trống...");
     return;
   }
   ```

## Liên hệ Backend Team

Nếu vẫn lỗi sau khi:

- Cart có items
- userId hợp lệ
- Token hợp lệ

Hãy hỏi backend team:

1. Endpoint `POST /api/orders` yêu cầu gì trong request body?
2. Có validation gì cho cart trước khi tạo order?
3. Có cần thêm fields nào khác ngoài `userId`?
4. Log error chi tiết từ backend là gì?

## Code đã được cải thiện

### api.js

- ✅ Log chi tiết error response từ backend
- ✅ Hiển thị status code và error message đầy đủ

### App.jsx

- ✅ Check cart trống trước khi đặt hàng
- ✅ Log userId và cart items
- ✅ Log response từ API

### CheckoutModal.jsx

- ✅ Disable button khi cart trống
- ✅ Loading state khi submit
- ✅ Error handling

## Next Steps

1. Click "Đặt hàng" lại và xem console log chi tiết
2. Share error message từ `API Error Response` để debug tiếp
3. Kiểm tra Swagger để xem backend yêu cầu gì chính xác

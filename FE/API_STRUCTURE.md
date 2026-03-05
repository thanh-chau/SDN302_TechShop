# API Structure Documentation

## Base URL

- **Production**: `https://swd392-api.taiduc1001.net`
- **Local**: `http://localhost:8080`

## Authentication

### Register

- **Endpoint**: `POST /api/auth/register`
- **Request Body** (RegisterRequestDTO):

```json
{
  "email": "string (required)",
  "password": "string (required, minLength: 6)",
  "fullName": "string (required)",
  "role": "string (optional, default: USER)"
}
```

- **Response** (AuthResponseDTO):

```json
{
  "id": 1,
  "email": "user@example.com",
  "fullName": "John Doe",
  "role": "USER",
  "message": "Registration successful"
}
```

### Login

- **Endpoint**: `POST /api/auth/login`
- **Request Body** (LoginRequestDTO):

```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

- **Response** (AuthResponseDTO):

```json
{
  "id": 1,
  "email": "user@example.com",
  "fullName": "John Doe",
  "role": "ADMIN | STAFF | USER",
  "message": "Login successful"
}
```

## Products

### Get All Products

- **Endpoint**: `GET /api/products`
- **Response** (ProductDTO[]):

```json
[
  {
    "id": 1,
    "name": "iPhone 15 Pro Max",
    "description": "Flagship smartphone with A17 Pro chip",
    "price": 29990000,
    "stockQuantity": 50,
    "status": "ACTIVE | INACTIVE | OUT_OF_STOCK",
    "imgUrl": "https://example.com/image.jpg",
    "category": "phone"
  }
]
```

### Get Product by ID

- **Endpoint**: `GET /api/products/{id}`
- **Response**: ProductDTO

### Create Product (Admin/Staff Only)

- **Endpoint**: `POST /api/products`
- **Request Body** (ProductDTO):

```json
{
  "name": "string (required)",
  "description": "string",
  "price": 0.0,
  "stockQuantity": 0,
  "status": "ACTIVE",
  "imgUrl": "string",
  "category": "string"
}
```

### Update Product (Admin/Staff Only)

- **Endpoint**: `PUT /api/products`
- **Request Body** (ProductDTO with id):

```json
{
  "id": 1,
  "name": "string",
  "description": "string",
  "price": 0.0,
  "stockQuantity": 0,
  "status": "ACTIVE",
  "category": "string"
}
```

### Delete Product (Admin/Staff Only)

- **Endpoint**: `DELETE /api/products/{id}`

## Cart

### Get Cart by User ID

- **Endpoint**: `GET /api/cart/{userId}`
- **Response** (CartDTO):

```json
{
  "id": 1,
  "buyerId": 1,
  "status": "ACTIVE",
  "cartItems": [
    {
      "id": 1,
      "cartId": 1,
      "productId": 10,
      "productName": "iPhone 15 Pro Max",
      "quantity": 2,
      "priceAtTime": 29990000
    }
  ]
}
```

### Add Product to Cart

- **Endpoint**: `POST /api/cart/add`
- **Request Body** (AddToCartRequestDTO):

```json
{
  "userId": 1,
  "productId": 10,
  "quantity": 1
}
```

- **Response**: CartDTO

### Update Cart Item Quantity

- **Endpoint**: `PUT /api/cart/item/{cartItemId}?quantity={quantity}`
- **Response**: CartDTO

### Remove Item from Cart

- **Endpoint**: `DELETE /api/cart/item/{cartItemId}`

### Clear Cart

- **Endpoint**: `DELETE /api/cart/{userId}/clear`

## Orders

### Get All Orders (Admin/Staff Only)

- **Endpoint**: `GET /api/orders`
- **Response** (OrderDTO[]):

```json
[
  {
    "id": 1,
    "buyerId": 1,
    "buyerName": "John Doe",
    "orderDate": "2024-02-28T10:30:00",
    "status": "pending | processing | shipping | completed | cancelled",
    "totalAmount": 59980000,
    "orderItems": [
      {
        "id": 1,
        "orderId": 1,
        "productId": 10,
        "productName": "iPhone 15 Pro Max",
        "quantity": 2,
        "price": 29990000
      }
    ]
  }
]
```

### Get Order by ID

- **Endpoint**: `GET /api/orders/{orderId}`
- **Response**: OrderDTO

### Get Orders by User ID

- **Endpoint**: `GET /api/orders/user/{userId}`
- **Response**: OrderDTO[]

### Get Order Items

- **Endpoint**: `GET /api/orders/{orderId}/items`
- **Response**: OrderItemDTO[]

### Create Order

- **Endpoint**: `POST /api/orders`
- **Request Body** (CreateOrderRequestDTO):

```json
{
  "userId": 1
}
```

- **Response**: OrderDTO

### Update Order Status (Admin/Staff Only)

- **Endpoint**: `PUT /api/orders/{orderId}/status?status={status}`
- **Parameters**:
  - `status`: pending | processing | shipping | completed | cancelled
- **Response**: OrderDTO

### Delete Order (Admin/Staff Only)

- **Endpoint**: `DELETE /api/orders/{orderId}`

## Users

### Get All Users (Admin Only)

- **Endpoint**: `GET /api/user`
- **Response** (UserDTO[]):

```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "password": "******",
    "fullName": "John Doe",
    "role": "ADMIN | STAFF | USER"
  }
]
```

### Get User by ID

- **Endpoint**: `GET /api/user/{id}`
- **Response**: UserDTO

## Data Mapping

### Frontend ↔ Backend Field Mapping

#### User/Auth

| Frontend           | Backend (Swagger)  |
| ------------------ | ------------------ |
| `name`             | `fullName`         |
| `email`            | `email`            |
| `role` (lowercase) | `role` (UPPERCASE) |

#### Product

| Frontend   | Backend (Swagger) |
| ---------- | ----------------- |
| `image`    | `imgUrl`          |
| `price`    | `price`           |
| `stock`    | `stockQuantity`   |
| `category` | `category`        |

#### Order

| Frontend    | Backend (Swagger) |
| ----------- | ----------------- |
| `total`     | `totalAmount`     |
| `items`     | `orderItems`      |
| `createdAt` | `orderDate`       |

#### Cart

| Frontend | Backend (Swagger) |
| -------- | ----------------- |
| `price`  | `priceAtTime`     |
| `name`   | `productName`     |

## Role-Based Access

### ADMIN

- Full access to all endpoints
- Can manage products, orders, and users
- Auto-redirects to Admin Dashboard on login

### STAFF

- Can manage orders and inventory
- Can update product stock
- Can update order status
- Auto-redirects to Staff Dashboard on login

### USER/Customer

- Can view products
- Can manage their own cart
- Can create orders
- Can view their own orders
- Shows shop interface on login

## Status Values

### Order Status

- `pending` - Chờ xử lý
- `processing` - Đang xử lý
- `shipping` - Đang giao
- `completed` - Hoàn thành
- `cancelled` - Đã hủy

### Product Status

- `ACTIVE` - Đang bán
- `INACTIVE` - Ngừng bán
- `OUT_OF_STOCK` - Hết hàng

### Cart Status

- `ACTIVE` - Giỏ hàng đang hoạt động
- `CHECKED_OUT` - Đã thanh toán

## Error Handling

All API errors return:

```json
{
  "message": "Error description",
  "status": 400 | 401 | 403 | 404 | 500
}
```

Common status codes:

- `400` - Bad Request (invalid data)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

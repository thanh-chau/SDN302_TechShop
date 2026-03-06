var path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

// Kiểm tra Google OAuth ngay khi khởi động (để dễ debug)
const hasGoogleClientId = (process.env.GOOGLE_CLIENT_ID || "").trim().length > 0;
console.log("[Auth] Đăng nhập Google:", hasGoogleClientId ? "đã cấu hình" : "CHƯA cấu hình (thêm GOOGLE_CLIENT_ID vào BE/.env và restart)");

var express = require("express");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var connectDB = require("./config/db");
var { notFound, errorHandler } = require("./middleware/errorMiddleware");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var userRoutes = require("./routes/userRoutes");
var authRouter = require("./routes/auth");
var uploadRouter = require("./routes/upload");
var productsRouter = require("./routes/products");
var cartRouter = require("./routes/cart");
var ordersRouter = require("./routes/orders");
var reviewsRouter = require("./routes/reviews");

connectDB();

var cors = require("cors");
var app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRouter);
app.use("/api/files", uploadRouter);
app.use("/api/products", productsRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/reviews", reviewsRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;

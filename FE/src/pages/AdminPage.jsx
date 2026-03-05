import { useState, useEffect } from "react";
import {
  Users,
  Package,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  BarChart3,
  LogOut,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  X,
  Mail,
  Lock,
  Shield,
  AlertCircle,
} from "lucide-react";
import { productAPI, orderAPI, userAPI, fileAPI, authAPI } from "../utils/api";

export function AdminPage({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    stockQuantity: "",
    category: "laptop",
    status: "ACTIVE",
    imgUrl: "",
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState(null);

  // User registration modal state
  const [showUserForm, setShowUserForm] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState("");
  const [creatingUser, setCreatingUser] = useState(false);
  const [userForm, setUserForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "STAFF",
  });

  const handleOpenUserForm = () => {
    setUserForm({ fullName: "", email: "", password: "", role: "STAFF" });
    setRegError("");
    setShowUserForm(true);
  };
  const handleCloseUserForm = () => {
    setShowUserForm(false);
    setRegError("");
  };
  const handleSubmitUser = async (e) => {
    e.preventDefault();
    if (userForm.password.length < 6) {
      setRegError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    setCreatingUser(true);
    setRegError("");
    try {
      await authAPI.register(
        userForm.email,
        userForm.password,
        userForm.fullName,
        userForm.role,
      );
      alert(`Đã tạo tài khoản ${userForm.role} thành công!`);
      setShowUserForm(false);
      await loadUsers();
    } catch (error) {
      setRegError(
        error.message || "Không thể tạo tài khoản. Vui lòng thử lại.",
      );
    } finally {
      setCreatingUser(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadProducts(), loadOrders(), loadUsers()]);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await productAPI.getAll();
      setProducts(data || []);
    } catch (error) {
      console.error("Failed to load products:", error);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await orderAPI.getAll();
      setOrders(data || []);

      // Calculate stats
      const completedOrders = data.filter((o) => o.status === "completed");
      const totalRevenue = completedOrders.reduce(
        (sum, o) => sum + (o.totalAmount || 0),
        0,
      );

      setStats((prev) => ({
        ...prev,
        totalRevenue,
        totalOrders: data.length,
      }));
    } catch (error) {
      console.error("Failed to load orders:", error);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await userAPI.getAll();
      setUsers(data || []);
      setStats((prev) => ({
        ...prev,
        totalUsers: data.length,
      }));
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  };

  // Update stats when data changes
  useEffect(() => {
    setStats((prev) => ({
      ...prev,
      totalProducts: products.length,
    }));
  }, [products]);

  const handleOpenProductForm = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        stockQuantity: product.stockQuantity || "",
        category: product.category || "laptop",
        status: product.status || "ACTIVE",
        imgUrl: product.imgUrl || "",
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: "",
        description: "",
        price: "",
        stockQuantity: "",
        category: "laptop",
        status: "ACTIVE",
        imgUrl: "",
      });
    }
    setShowProductForm(true);
  };

  const handleCloseProductForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    setProductForm({
      name: "",
      description: "",
      price: "",
      stockQuantity: "",
      category: "laptop",
      status: "ACTIVE",
      imgUrl: "",
    });
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file hình ảnh!");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Kích thước file tối đa 5MB!");
      return;
    }

    setSelectedImageFile(file);
    setUploadingImage(true);

    try {
      console.log("Uploading image:", file.name);
      const uploadResult = await fileAPI.uploadFile(file, "products");
      console.log("Upload result:", uploadResult);

      // Set the uploaded image URL to form
      if (uploadResult && uploadResult.url) {
        setProductForm({ ...productForm, imgUrl: uploadResult.url });
        alert("Upload ảnh thành công!");
      } else {
        throw new Error("Không nhận được URL từ server");
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Không thể upload ảnh: " + error.message);
      setSelectedImageFile(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();

    try {
      const productData = {
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        stockQuantity: parseInt(productForm.stockQuantity),
        category: productForm.category,
        status: productForm.status,
        imgUrl: productForm.imgUrl,
      };

      console.log("Submitting product data:", productData);

      if (editingProduct) {
        // Include id in the body for update
        const updateData = { ...productData, id: editingProduct.id };
        console.log("Updating product with data:", updateData);
        const result = await productAPI.update(updateData);
        console.log("Update result:", result);
        alert(
          'Đã cập nhật sản phẩm!\n\nLưu ý: Bộ lọc danh mục đã được đặt về "Tất cả" để bạn có thể thấy sản phẩm vừa cập nhật.',
        );
      } else {
        console.log("Creating new product with data:", productData);
        const result = await productAPI.create(productData);
        console.log("Create result:", result);
        alert("Đã thêm sản phẩm mới!");
      }

      // Reset category filter to "all" to show updated product
      setCategoryFilter("all");

      // Reload products to ensure fresh data from server
      await loadProducts();
      handleCloseProductForm();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Không thể lưu sản phẩm: " + error.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;

    try {
      const product = products.find((p) => p.id === productId);
      if (!product) throw new Error("Không tìm thấy sản phẩm");
      await productAPI.delete(product);
      await loadProducts();
      alert("Đã xóa sản phẩm!");
    } catch (error) {
      alert("Không thể xóa sản phẩm: " + error.message);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      await loadOrders();
    } catch (error) {
      alert("Không thể cập nhật trạng thái: " + error.message);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!confirm("Bạn có chắc muốn xóa đơn hàng này?")) return;

    try {
      await orderAPI.delete(orderId);
      await loadOrders();
    } catch (error) {
      alert("Không thể xóa đơn hàng: " + error.message);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchCategory =
      categoryFilter === "all" || p.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const filteredOrders = orders.filter((o) => {
    return orderStatusFilter === "all" || o.status === orderStatusFilter;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: "bg-yellow-100 text-yellow-800", text: "Chờ xử lý" },
      processing: { color: "bg-blue-100 text-blue-800", text: "Đang xử lý" },
      shipping: { color: "bg-purple-100 text-purple-800", text: "Đang giao" },
      completed: { color: "bg-green-100 text-green-800", text: "Hoàn thành" },
      cancelled: { color: "bg-red-100 text-red-800", text: "Đã hủy" },
    };
    return badges[status?.toLowerCase()] || badges.pending;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-red-600">
                TechShop Admin
              </h1>
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                Quản trị viên
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Xin chào, {user?.name}</span>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Tổng doanh thu</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalRevenue.toLocaleString("vi-VN")} ₫
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Đơn hàng</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalOrders}
                </p>
              </div>
              <ShoppingBag className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Sản phẩm</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalProducts}
                </p>
              </div>
              <Package className="w-12 h-12 text-yellow-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Người dùng</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalUsers}
                </p>
              </div>
              <Users className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b">
            <div className="flex gap-4 px-6">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`py-4 px-4 font-semibold border-b-2 transition-colors ${
                  activeTab === "dashboard"
                    ? "border-red-600 text-red-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Dashboard
                </div>
              </button>
              <button
                onClick={() => setActiveTab("products")}
                className={`py-4 px-4 font-semibold border-b-2 transition-colors ${
                  activeTab === "products"
                    ? "border-red-600 text-red-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Sản phẩm ({products.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`py-4 px-4 font-semibold border-b-2 transition-colors ${
                  activeTab === "orders"
                    ? "border-red-600 text-red-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Đơn hàng ({orders.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`py-4 px-4 font-semibold border-b-2 transition-colors ${
                  activeTab === "users"
                    ? "border-red-600 text-red-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Người dùng ({users.length})
                </div>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold">Tổng quan hệ thống</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white">
                    <TrendingUp className="w-8 h-8 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Doanh thu hôm nay
                    </h3>
                    <p className="text-3xl font-bold">
                      {stats.totalRevenue.toLocaleString("vi-VN")} ₫
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white">
                    <ShoppingBag className="w-8 h-8 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Đơn hàng mới</h3>
                    <p className="text-3xl font-bold">
                      {orders.filter((o) => o.status === "pending").length}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "products" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Quản lý sản phẩm</h2>
                  <button
                    onClick={() => handleOpenProductForm()}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm sản phẩm
                  </button>
                </div>

                {/* Filters */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:border-red-500"
                  >
                    <option value="all">Tất cả danh mục</option>
                    <option value="laptop">Laptop</option>
                    <option value="phone">Điện thoại</option>
                    <option value="tablet">Tablet</option>
                    <option value="audio">Âm thanh</option>
                    <option value="accessories">Phụ kiện</option>
                    <option value="monitor">Màn hình</option>
                  </select>
                </div>

                {/* Products Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                          Sản phẩm
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                          Danh mục
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                          Giá
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                          Kho
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                          Trạng thái
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="font-semibold">{product.name}</div>
                            <div className="text-xs text-gray-500">
                              ID: {product.id}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                              {product.category === "laptop"
                                ? "Laptop"
                                : product.category === "phone"
                                  ? "Điện thoại"
                                  : product.category === "audio"
                                    ? "Âm thanh"
                                    : product.category === "accessories"
                                      ? "Phụ kiện"
                                      : product.category || "N/A"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-red-600">
                              {product.price?.toLocaleString("vi-VN")} ₫
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`font-semibold ${
                                product.stockQuantity > 20
                                  ? "text-green-600"
                                  : product.stockQuantity > 0
                                    ? "text-yellow-600"
                                    : "text-red-600"
                              }`}
                            >
                              {product.stockQuantity}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                product.status === "ACTIVE"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {product.status === "ACTIVE"
                                ? "Đang bán"
                                : product.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleOpenProductForm(product)}
                                className="p-2 hover:bg-blue-100 text-blue-600 rounded transition-colors"
                                title="Sửa sản phẩm"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="p-2 hover:bg-red-100 text-red-600 rounded transition-colors"
                                title="Xóa sản phẩm"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Quản lý đơn hàng</h2>
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:border-red-500"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Chờ xử lý</option>
                    <option value="processing">Đang xử lý</option>
                    <option value="shipping">Đang giao</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>

                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="border rounded-xl p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-lg">
                              Đơn #{order.id}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(order.status).color}`}
                            >
                              {getStatusBadge(order.status).text}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Người mua: {order.buyerName || "N/A"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.orderDate).toLocaleString("vi-VN")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Tổng tiền</p>
                          <p className="text-2xl font-bold text-red-600">
                            {order.totalAmount?.toLocaleString("vi-VN")} ₫
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleUpdateOrderStatus(order.id, e.target.value)
                          }
                          className="px-3 py-1 border rounded-lg text-sm focus:outline-none focus:border-red-500"
                        >
                          <option value="pending">Chờ xử lý</option>
                          <option value="processing">Đang xử lý</option>
                          <option value="shipping">Đang giao</option>
                          <option value="completed">Hoàn thành</option>
                          <option value="cancelled">Hủy đơn</option>
                        </select>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-sm transition-colors"
                        >
                          Xóa đơn
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Quản lý người dùng</h2>
                  <button
                    onClick={handleOpenUserForm}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm tài khoản
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                          ID
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                          Tên
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                          Vai trò
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-semibold">{u.id}</td>
                          <td className="px-4 py-3">{u.fullName}</td>
                          <td className="px-4 py-3">{u.email}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                u.role === "ADMIN"
                                  ? "bg-red-100 text-red-700"
                                  : u.role === "STAFF"
                                    ? "bg-blue-100 text-blue-700"
                                    : u.role === "MANAGER"
                                      ? "bg-purple-100 text-purple-700"
                                      : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Registration Modal */}
      {showUserForm && (
        <div
          className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
          onClick={handleCloseUserForm}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-8 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseUserForm}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-1">
                Thêm tài khoản
              </h2>
              <p className="text-sm text-gray-500">
                Tạo tài khoản mới cho nhân viên, quản lý hoặc quản trị viên
              </p>
            </div>

            {regError && (
              <div className="mb-5 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-semibold text-red-800">{regError}</p>
              </div>
            )}

            <form onSubmit={handleSubmitUser} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Họ và tên <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={userForm.fullName}
                  onChange={(e) =>
                    setUserForm({ ...userForm, fullName: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Nhập họ và tên"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={userForm.email}
                    onChange={(e) =>
                      setUserForm({ ...userForm, email: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mật khẩu <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showRegPassword ? "text" : "password"}
                    required
                    value={userForm.password}
                    onChange={(e) =>
                      setUserForm({ ...userForm, password: e.target.value })
                    }
                    className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="••••••••"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showRegPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {userForm.password && userForm.password.length < 6 && (
                  <p className="text-xs text-red-600 mt-1">
                    Mật khẩu phải có ít nhất 6 ký tự
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Vai trò <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    required
                    value={userForm.role}
                    onChange={(e) =>
                      setUserForm({ ...userForm, role: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors appearance-none bg-white cursor-pointer"
                  >
                    <option value="BUYER">Khách hàng (BUYER)</option>
                    <option value="STAFF">Nhân viên (STAFF)</option>
                    <option value="MANAGER">Quản lý (MANAGER)</option>
                    <option value="ADMIN">Quản trị viên (ADMIN)</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseUserForm}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all duration-300 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {creatingUser ? "Đang tạo..." : "Tạo tài khoản"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
              </h3>
              <button
                onClick={handleCloseProductForm}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitProduct} className="p-6 space-y-6">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên sản phẩm <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm({ ...productForm, name: e.target.value })
                  }
                  placeholder="VD: iPhone 15 Pro Max"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mô tả sản phẩm <span className="text-red-600">*</span>
                </label>
                <textarea
                  required
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Nhập mô tả chi tiết sản phẩm..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Hình ảnh sản phẩm <span className="text-red-600">*</span>
                </label>

                {/* File Upload */}
                <div className="mb-3">
                  <label className="block text-sm text-gray-600 mb-1">
                    📤 Upload file (Khuyên dùng)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    disabled={uploadingImage}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                  />
                  {uploadingImage && (
                    <div className="mt-2 flex items-center gap-2 text-blue-600">
                      <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span className="text-sm">Đang upload...</span>
                    </div>
                  )}
                </div>

                {/* URL Input (Alternative) */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    🔗 Hoặc nhập URL hình ảnh
                  </label>
                  <input
                    type="url"
                    required
                    value={productForm.imgUrl}
                    onChange={(e) =>
                      setProductForm({ ...productForm, imgUrl: e.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                  />
                </div>

                {/* Image Preview */}
                {productForm.imgUrl && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                    <img
                      src={productForm.imgUrl}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/150?text=Invalid+URL";
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Price and Stock in Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Giá (₫) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1000"
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm({ ...productForm, price: e.target.value })
                    }
                    placeholder="VD: 29990000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số lượng kho <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={productForm.stockQuantity}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        stockQuantity: e.target.value,
                      })
                    }
                    placeholder="VD: 100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Category and Status in Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Danh mục <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        category: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                  >
                    <option value="laptop">Laptop</option>
                    <option value="phone">Điện thoại</option>
                    <option value="tablet">Tablet</option>
                    <option value="audio">Âm thanh</option>
                    <option value="accessories">Phụ kiện</option>
                    <option value="monitor">Màn hình</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Trạng thái <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={productForm.status}
                    onChange={(e) =>
                      setProductForm({ ...productForm, status: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                  >
                    <option value="ACTIVE">Đang bán</option>
                    <option value="INACTIVE">Ngừng bán</option>
                    <option value="OUT_OF_STOCK">Hết hàng</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseProductForm}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                >
                  {editingProduct ? "Cập nhật" : "Thêm sản phẩm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

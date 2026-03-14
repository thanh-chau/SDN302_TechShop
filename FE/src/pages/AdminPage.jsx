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
  Flame,
} from "lucide-react";
import toast from "react-hot-toast";
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

  // Flash Sale: form để thêm/sửa flash sale cho sản phẩm
  const [showFlashSaleForm, setShowFlashSaleForm] = useState(false);
  const [flashSaleProduct, setFlashSaleProduct] = useState(null);
  const [flashSalePrice, setFlashSalePrice] = useState("");
  const [flashSaleEnd, setFlashSaleEnd] = useState("");
  const [savingFlashSale, setSavingFlashSale] = useState(false);

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
      toast.success(`Đã tạo tài khoản ${userForm.role} thành công!`);
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
      const data = await productAPI.getAllAdmin();
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
      toast.error("Vui lòng chọn file hình ảnh!");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước file tối đa 5MB!");
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
        toast.success("Upload ảnh thành công!");
      } else {
        throw new Error("Không nhận được URL từ server");
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error("Không thể upload ảnh: " + error.message);
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
        toast.success(
          'Đã cập nhật sản phẩm! Bộ lọc danh mục đã được đặt về "Tất cả".',
        );
      } else {
        console.log("Creating new product with data:", productData);
        const result = await productAPI.create(productData);
        console.log("Create result:", result);
        toast.success("Đã thêm sản phẩm mới!");
      }

      // Reset category filter to "all" to show updated product
      setCategoryFilter("all");

      // Reload products to ensure fresh data from server
      await loadProducts();
      handleCloseProductForm();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Không thể lưu sản phẩm: " + error.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (
      !confirm(
        'Sản phẩm sẽ được chuyển sang trạng thái "Ngừng bán" và không còn hiển thị trên trang. Bạn có chắc không?',
      )
    )
      return;

    try {
      await productAPI.discontinue(productId);
      await loadProducts();
      toast.success("Đã ngừng bán sản phẩm!");
    } catch (error) {
      toast.error("Không thể ngừng bán sản phẩm: " + error.message);
    }
  };

  const handleReactivateProduct = async (productId) => {
    try {
      const product = products.find((p) => p.id === productId);
      if (!product) throw new Error("Không tìm thấy sản phẩm");
      await productAPI.update({ ...product, id: productId, status: "ACTIVE" });
      await loadProducts();
      toast.success("Đã kích hoạt lại sản phẩm!");
    } catch (error) {
      toast.error("Không thể kích hoạt: " + error.message);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      await loadOrders();
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái: " + error.message);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!confirm("Bạn có chắc muốn xóa đơn hàng này?")) return;

    try {
      await orderAPI.delete(orderId);
      await loadOrders();
    } catch (error) {
      toast.error("Không thể xóa đơn hàng: " + error.message);
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

  const productsInFlashSale = products.filter(
    (p) => p.flashSaleEnd && new Date(p.flashSaleEnd) > new Date()
  );
  /** Sản phẩm từng Flash Sale nhưng đã hết hạn (end time qua) — tự động chuyển xuống đây */
  const productsFlashSaleExpired = products.filter(
    (p) => p.flashSaleEnd && new Date(p.flashSaleEnd) <= new Date()
  );

  const handleOpenFlashSaleForm = (product) => {
    setFlashSaleProduct(product || null);
    setFlashSalePrice(product?.flashSalePrice != null ? String(product.flashSalePrice) : "");
    setFlashSaleEnd(
      product?.flashSaleEnd
        ? new Date(product.flashSaleEnd).toISOString().slice(0, 16)
        : ""
    );
    setShowFlashSaleForm(true);
  };

  const handleSaveFlashSale = async (e) => {
    e.preventDefault();
    if (!flashSaleProduct) return;
    const price = parseFloat(flashSalePrice);
    if (isNaN(price) || price < 0) {
      toast.error("Giá flash sale không hợp lệ");
      return;
    }
    if (!flashSaleEnd) {
      toast.error("Chọn thời gian kết thúc");
      return;
    }
    setSavingFlashSale(true);
    try {
      await productAPI.update({
        id: flashSaleProduct.id,
        flashSalePrice: price,
        flashSaleEnd: new Date(flashSaleEnd).toISOString(),
      });
      toast.success("Đã cập nhật Flash Sale!");
      await loadProducts();
      setShowFlashSaleForm(false);
    } catch (err) {
      toast.error(err.message || "Không thể lưu Flash Sale");
    } finally {
      setSavingFlashSale(false);
    }
  };

  const handleRemoveFlashSale = async (product) => {
    if (!confirm("Gỡ sản phẩm khỏi Flash Sale?")) return;
    try {
      await productAPI.update({
        id: product.id,
        flashSalePrice: null,
        flashSaleEnd: null,
      });
      toast.success("Đã gỡ Flash Sale!");
      await loadProducts();
    } catch (err) {
      toast.error(err.message || "Không thể gỡ");
    }
  };

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
              <button
                onClick={() => setActiveTab("flashsale")}
                className={`py-4 px-4 font-semibold border-b-2 transition-colors ${
                  activeTab === "flashsale"
                    ? "border-red-600 text-red-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5" />
                  Flash Sale ({productsInFlashSale.length})
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
                            {product.productStatus === "active" && (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                Còn hàng
                              </span>
                            )}
                            {product.productStatus === "outofstock" && (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                                Hết hàng
                              </span>
                            )}
                            {product.productStatus === "discontinued" && (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-600">
                                Ngừng bán
                              </span>
                            )}
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
                              {product.productStatus === "discontinued" ? (
                                <button
                                  onClick={() =>
                                    handleReactivateProduct(product.id)
                                  }
                                  className="p-2 hover:bg-green-100 text-green-600 rounded transition-colors"
                                  title="Kích hoạt lại"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    handleDeleteProduct(product.id)
                                  }
                                  className="p-2 hover:bg-red-100 text-red-600 rounded transition-colors"
                                  title="Ngừng bán"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
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

            {activeTab === "flashsale" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Quản lý Flash Sale</h2>
                  <p className="text-sm text-gray-500">
                    Đặt giá khuyến mãi và thời gian kết thúc. Buyer bấm nút Flash Sale để xem và mua.
                  </p>
                </div>
                {products.length === 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
                    <p className="text-amber-800 font-medium mb-2">
                      Chưa có sản phẩm nào trong hệ thống.
                    </p>
                    <p className="text-amber-700 text-sm mb-4">
                      Vào tab <strong>Sản phẩm</strong> → bấm <strong>Thêm sản phẩm</strong> để tạo sản phẩm trước. Sau đó quay lại tab Flash Sale để đưa sản phẩm vào khuyến mãi.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("products")}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium"
                    >
                      Chuyển đến tab Sản phẩm
                    </button>
                  </div>
                )}
                <div className="overflow-x-auto">
                  <h3 className="font-semibold mb-2 text-gray-800">Đang chạy</h3>
                  <p className="text-xs text-gray-500 mb-3">Hết giờ kết thúc sẽ tự chuyển xuống mục &quot;Flash Sale đã kết thúc&quot;.</p>
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Sản phẩm</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Giá gốc</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Giá Flash Sale</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Kết thúc</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {productsInFlashSale.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                            Chưa có sản phẩm nào đang Flash Sale. Thêm ở bảng dưới.
                          </td>
                        </tr>
                      ) : (
                        productsInFlashSale.map((p) => (
                          <tr key={p.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium">{p.name}</td>
                            <td className="px-4 py-3">{p.originalPrice?.toLocaleString("vi-VN") ?? p.price?.toLocaleString("vi-VN")} ₫</td>
                            <td className="px-4 py-3 text-red-600 font-semibold">{p.flashSalePrice?.toLocaleString("vi-VN")} ₫</td>
                            <td className="px-4 py-3 text-sm">{p.flashSaleEnd ? new Date(p.flashSaleEnd).toLocaleString("vi-VN") : "—"}</td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleOpenFlashSaleForm(p)}
                                className="text-blue-600 hover:underline mr-2"
                              >
                                Sửa
                              </button>
                              <button
                                onClick={() => handleRemoveFlashSale(p)}
                                className="text-red-600 hover:underline"
                              >
                                Gỡ Flash Sale
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {productsFlashSaleExpired.length > 0 && (
                  <div className="overflow-x-auto">
                    <h3 className="font-semibold mb-2 text-gray-600">Flash Sale đã kết thúc</h3>
                    <p className="text-xs text-gray-500 mb-3">Sản phẩm hết thời gian end tự động hiển thị ở đây. Có thể gỡ hoặc thêm lại với thời gian mới.</p>
                    <table className="w-full border border-gray-200 rounded-lg">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Sản phẩm</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Giá gốc</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Giá đã sale</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Đã kết thúc lúc</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y bg-white">
                        {productsFlashSaleExpired.map((p) => (
                          <tr key={p.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium">{p.name}</td>
                            <td className="px-4 py-3">{p.originalPrice?.toLocaleString("vi-VN") ?? p.price?.toLocaleString("vi-VN")} ₫</td>
                            <td className="px-4 py-3 text-gray-600">{p.flashSalePrice?.toLocaleString("vi-VN")} ₫</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{p.flashSaleEnd ? new Date(p.flashSaleEnd).toLocaleString("vi-VN") : "—"}</td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleOpenFlashSaleForm(p)}
                                className="text-blue-600 hover:underline mr-2"
                              >
                                Thêm lại
                              </button>
                              <button
                                onClick={() => handleRemoveFlashSale(p)}
                                className="text-red-600 hover:underline"
                              >
                                Gỡ
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-3">Thêm sản phẩm vào Flash Sale</h3>
                  <p className="text-sm text-gray-500 mb-3">
                    Chỉ sản phẩm <strong>đang bán</strong> và <strong>còn hàng</strong> mới được thêm. Sản phẩm ngừng bán hoặc hết hàng không hiển thị ở đây.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Sản phẩm</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Giá</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {products.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                              Chưa có sản phẩm. Vào tab <strong>Sản phẩm</strong> → <strong>Thêm sản phẩm</strong> trước.
                            </td>
                          </tr>
                        ) : (
                          filteredProducts
                            .filter((p) => p.productStatus === "active")
                            .filter((p) => !p.flashSaleEnd || new Date(p.flashSaleEnd) <= new Date())
                            .map((p) => (
                              <tr key={p.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium">{p.name}</td>
                                <td className="px-4 py-3">{p.price?.toLocaleString("vi-VN")} ₫</td>
                                <td className="px-4 py-3">
                                  <button
                                    onClick={() => handleOpenFlashSaleForm(p)}
                                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                                  >
                                    Thêm Flash Sale
                                  </button>
                                </td>
                              </tr>
                            ))
                        )}
                        {products.length > 0 &&
                          filteredProducts
                            .filter((p) => p.productStatus === "active")
                            .filter((p) => !p.flashSaleEnd || new Date(p.flashSaleEnd) <= new Date()).length === 0 && (
                          <tr>
                            <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                              Không có sản phẩm đang bán & còn hàng để thêm (hoặc tất cả đã trong Flash Sale). Sản phẩm ngừng bán / hết hàng không được đưa vào Flash Sale.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                {/* Modal thêm/sửa Flash Sale */}
                {showFlashSaleForm && flashSaleProduct && (
                  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                      <h3 className="text-lg font-bold mb-4">
                        {flashSaleProduct.flashSalePrice != null ? "Sửa" : "Thêm"} Flash Sale
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">{flashSaleProduct.name}</p>
                      <form onSubmit={handleSaveFlashSale} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Giá Flash Sale (₫)</label>
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            value={flashSalePrice}
                            onChange={(e) => setFlashSalePrice(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg"
                            placeholder="VD: 5000000"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Kết thúc lúc</label>
                          <input
                            type="datetime-local"
                            value={flashSaleEnd}
                            onChange={(e) => setFlashSaleEnd(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg"
                          />
                        </div>
                        <div className="flex gap-2 justify-end pt-2">
                          <button
                            type="button"
                            onClick={() => setShowFlashSaleForm(false)}
                            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                          >
                            Hủy
                          </button>
                          <button
                            type="submit"
                            disabled={savingFlashSale}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
                          >
                            {savingFlashSale ? "Đang lưu..." : "Lưu"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
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
                          <td className="px-4 py-3 font-semibold text-xs text-gray-500">
                            {String(u.id).slice(-8)}
                          </td>
                          <td className="px-4 py-3">{u.name}</td>
                          <td className="px-4 py-3">{u.email}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                u.role === "admin"
                                  ? "bg-red-100 text-red-700"
                                  : u.role === "staff"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {u.role === "admin"
                                ? "Admin"
                                : u.role === "staff"
                                  ? "Staff"
                                  : "Buyer"}
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
                    <option value="BUYER">Khách hàng </option>
                    <option value="STAFF">Nhân viên </option>
                    <option value="MANAGER">Quản lý </option>
                    <option value="ADMIN">Quản trị viên </option>
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

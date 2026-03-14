import {
  X,
  Edit,
  Trash2,
  Plus,
  Package,
  ShoppingBag,
  Users,
  BarChart3,
  TrendingUp,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  Eye,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect } from "react";

export function AdminDashboard({
  isOpen,
  onClose,
  user,
  products,
  onUpdateProducts,
  orders = [],
  onUpdateOrders,
}) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    todayRevenue: 0,
  });

  // Calculate statistics
  useEffect(() => {
    if (!isOpen) return;

    const today = new Date().toDateString();
    const completedOrders = orders.filter(
      (order) => order.status === "completed",
    );
    const pendingOrders = orders.filter((order) => order.status === "pending");
    const todayOrders = orders.filter(
      (order) =>
        new Date(order.createdAt).toDateString() === today &&
        order.status === "completed",
    );

    setStats({
      totalRevenue: completedOrders.reduce(
        (sum, order) => sum + order.total,
        0,
      ),
      totalOrders: orders.length,
      pendingOrders: pendingOrders.length,
      totalProducts: products.length,
      totalUsers: users.length,
      todayRevenue: todayOrders.reduce((sum, order) => sum + order.total, 0),
    });
  }, [orders, products, users, isOpen]);

  if (!isOpen) return null;

  const handleDeleteProduct = (productId) => {
    if (confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      onUpdateProducts(products.filter((p) => p.id !== productId));
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setNewProduct(null);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    const updatedProducts = products.map((p) =>
      p.id === editingProduct.id ? editingProduct : p,
    );
    onUpdateProducts(updatedProducts);
    setEditingProduct(null);
  };

  const handleAddNewProduct = () => {
    setNewProduct({
      id: Date.now(),
      name: "",
      price: 0,
      originalPrice: 0,
      category: "laptop",
      stock: 0,
      image: "https://via.placeholder.com/150",
      description: "",
      rating: 5,
      reviews: 0,
    });
    setEditingProduct(null);
  };

  const handleSaveNewProduct = (e) => {
    e.preventDefault();
    onUpdateProducts([...products, newProduct]);
    setNewProduct(null);
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    if (onUpdateOrders) {
      const updatedOrders = orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order,
      );
      onUpdateOrders(updatedOrders);
    }
  };

  const handleDeleteOrder = (orderId) => {
    if (confirm("Bạn có chắc muốn xóa đơn hàng này?")) {
      if (onUpdateOrders) {
        onUpdateOrders(orders.filter((o) => o.id !== orderId));
      }
    }
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    return orderStatusFilter === "all" || order.status === orderStatusFilter;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: "bg-yellow-100 text-yellow-800", text: "Chờ xử lý" },
      processing: { color: "bg-blue-100 text-blue-800", text: "Đang xử lý" },
      shipping: { color: "bg-purple-100 text-purple-800", text: "Đang giao" },
      completed: { color: "bg-green-100 text-green-800", text: "Hoàn thành" },
      cancelled: { color: "bg-red-100 text-red-800", text: "Đã hủy" },
    };
    return badges[status] || badges.pending;
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between z-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Quản trị hệ thống
              </h2>
              <p className="text-gray-600">Xin chào, {user.name}!</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b px-6">
            <div className="flex gap-4 overflow-x-auto">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`px-4 py-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "dashboard"
                    ? "border-red-600 text-red-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Tổng quan
                </div>
              </button>
              <button
                onClick={() => setActiveTab("products")}
                className={`px-4 py-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "products"
                    ? "border-red-600 text-red-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Quản lý sản phẩm
                </div>
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`px-4 py-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "orders"
                    ? "border-red-600 text-red-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  Quản lý đơn hàng
                  {stats.pendingOrders > 0 && (
                    <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                      {stats.pendingOrders}
                    </span>
                  )}
                </div>
              </button>
              {user.role === "admin" && (
                <button
                  onClick={() => setActiveTab("users")}
                  className={`px-4 py-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === "users"
                      ? "border-red-600 text-red-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Quản lý người dùng
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Dashboard Overview */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold">Bảng điều khiển</h3>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">Tổng doanh thu</p>
                        <p className="text-2xl font-bold mt-2">
                          {stats.totalRevenue.toLocaleString("vi-VN")} ₫
                        </p>
                      </div>
                      <DollarSign className="w-12 h-12 text-blue-200" />
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      <span>
                        Hôm nay: {stats.todayRevenue.toLocaleString("vi-VN")} ₫
                      </span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm">Tổng đơn hàng</p>
                        <p className="text-2xl font-bold mt-2">
                          {stats.totalOrders}
                        </p>
                      </div>
                      <ShoppingBag className="w-12 h-12 text-green-200" />
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>Chờ xử lý: {stats.pendingOrders}</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm">Sản phẩm</p>
                        <p className="text-2xl font-bold mt-2">
                          {stats.totalProducts}
                        </p>
                      </div>
                      <Package className="w-12 h-12 text-purple-200" />
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>Đang hoạt động</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm">Người dùng</p>
                        <p className="text-2xl font-bold mt-2">
                          {stats.totalUsers}
                        </p>
                      </div>
                      <Users className="w-12 h-12 text-orange-200" />
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      <span>Đã đăng ký</span>
                    </div>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-xl border p-6">
                  <h4 className="text-lg font-bold mb-4">Đơn hàng gần đây</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                            Mã đơn
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                            Khách hàng
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                            Tổng tiền
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                            Trạng thái
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                            Ngày đặt
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {orders.slice(0, 5).map((order) => {
                          const badge = getStatusBadge(order.status);
                          return (
                            <tr key={order.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-semibold">
                                #{order.id.toString().slice(-6)}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {order.name}
                              </td>
                              <td className="px-4 py-3 text-sm font-bold text-red-600">
                                {order.total.toLocaleString("vi-VN")} ₫
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.color}`}
                                >
                                  {badge.text}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {new Date(order.createdAt).toLocaleDateString(
                                  "vi-VN",
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Products Management */}
            {activeTab === "products" && !editingProduct && !newProduct && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold">
                      Danh sách sản phẩm ({filteredProducts.length})
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Quản lý tất cả sản phẩm trong cửa hàng
                    </p>
                  </div>
                  <button
                    onClick={handleAddNewProduct}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Thêm sản phẩm</span>
                  </button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex-1 min-w-[300px]">
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
                    <option value="phone">Phone</option>
                    <option value="tablet">Tablet</option>
                    <option value="audio">Audio</option>
                    <option value="accessories">Accessories</option>
                    <option value="monitor">Monitor</option>
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                          Sản phẩm
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                          Giá
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                          Danh mục
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                          Kho
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
                            <div className="flex items-center gap-3">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                              <div>
                                <div className="font-semibold text-sm line-clamp-1">
                                  {product.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  ID: {product.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-red-600">
                              {product.price.toLocaleString("vi-VN")} ₫
                            </div>
                            {product.originalPrice && (
                              <div className="text-xs text-gray-400 line-through">
                                {product.originalPrice.toLocaleString("vi-VN")}{" "}
                                ₫
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                              {product.category}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`font-semibold ${
                                product.stock > 20
                                  ? "text-green-600"
                                  : product.stock > 0
                                    ? "text-yellow-600"
                                    : "text-red-600"
                              }`}
                            >
                              {product.stock}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="p-2 hover:bg-blue-100 text-blue-600 rounded transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="p-2 hover:bg-red-100 text-red-600 rounded transition-colors"
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

            {/* Edit Product Form */}
            {editingProduct && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Chỉnh sửa sản phẩm</h3>
                  <button
                    onClick={() => setEditingProduct(null)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Hủy
                  </button>
                </div>

                <form
                  onSubmit={handleSaveProduct}
                  className="max-w-2xl space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tên sản phẩm
                      </label>
                      <input
                        type="text"
                        value={editingProduct.name}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            name: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Danh mục
                      </label>
                      <select
                        value={editingProduct.category}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            category: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-red-500"
                      >
                        <option value="laptop">Laptop</option>
                        <option value="phone">Phone</option>
                        <option value="tablet">Tablet</option>
                        <option value="audio">Audio</option>
                        <option value="accessories">Accessories</option>
                        <option value="monitor">Monitor</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Giá
                      </label>
                      <input
                        type="number"
                        value={editingProduct.price}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            price: Number(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Giá gốc
                      </label>
                      <input
                        type="number"
                        value={editingProduct.originalPrice || ""}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            originalPrice: Number(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tồn kho
                      </label>
                      <input
                        type="number"
                        value={editingProduct.stock}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            stock: Number(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Lưu thay đổi
                  </button>
                </form>
              </div>
            )}

            {/* Add New Product Form */}
            {newProduct && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Thêm sản phẩm mới</h3>
                  <button
                    onClick={() => setNewProduct(null)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Hủy
                  </button>
                </div>

                <form
                  onSubmit={handleSaveNewProduct}
                  className="max-w-2xl space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tên sản phẩm
                      </label>
                      <input
                        type="text"
                        value={newProduct.name}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, name: e.target.value })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-red-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Danh mục
                      </label>
                      <select
                        value={newProduct.category}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            category: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-red-500"
                      >
                        <option value="laptop">Laptop</option>
                        <option value="phone">Phone</option>
                        <option value="tablet">Tablet</option>
                        <option value="audio">Audio</option>
                        <option value="accessories">Accessories</option>
                        <option value="monitor">Monitor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        URL Hình ảnh
                      </label>
                      <input
                        type="text"
                        value={newProduct.image}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            image: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Giá bán
                      </label>
                      <input
                        type="number"
                        value={newProduct.price}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            price: Number(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-red-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Giá gốc
                      </label>
                      <input
                        type="number"
                        value={newProduct.originalPrice || ""}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            originalPrice: Number(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tồn kho
                      </label>
                      <input
                        type="number"
                        value={newProduct.stock}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            stock: Number(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-red-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mô tả sản phẩm
                    </label>
                    <textarea
                      value={newProduct.description}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          description: e.target.value,
                        })
                      }
                      rows={4}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Thêm sản phẩm
                  </button>
                </form>
              </div>
            )}

            {/* Orders Management */}
            {/* Orders Management */}
            {activeTab === "orders" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold">
                      Quản lý đơn hàng ({filteredOrders.length})
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Xác nhận và xử lý đơn hàng của khách hàng
                    </p>
                  </div>
                  <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg font-semibold transition-colors">
                    <Download className="w-5 h-5" />
                    <span>Xuất báo cáo</span>
                  </button>
                </div>

                {/* Order Filters */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setOrderStatusFilter("all")}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      orderStatusFilter === "all"
                        ? "bg-red-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Tất cả ({orders.length})
                  </button>
                  <button
                    onClick={() => setOrderStatusFilter("pending")}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      orderStatusFilter === "pending"
                        ? "bg-red-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Chờ xử lý (
                    {orders.filter((o) => o.status === "pending").length})
                  </button>
                  <button
                    onClick={() => setOrderStatusFilter("processing")}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      orderStatusFilter === "processing"
                        ? "bg-red-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Đang xử lý (
                    {orders.filter((o) => o.status === "processing").length})
                  </button>
                  <button
                    onClick={() => setOrderStatusFilter("completed")}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      orderStatusFilter === "completed"
                        ? "bg-red-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Hoàn thành (
                    {orders.filter((o) => o.status === "completed").length})
                  </button>
                </div>

                {/* Orders Table */}
                <div className="space-y-4">
                  {filteredOrders.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>Không có đơn hàng nào</p>
                    </div>
                  ) : (
                    filteredOrders.map((order) => {
                      const badge = getStatusBadge(order.status);
                      return (
                        <div
                          key={order.id}
                          className="bg-white border rounded-xl p-6 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-3">
                                <h4 className="font-bold text-lg">
                                  Đơn hàng #{order.id.toString().slice(-6)}
                                </h4>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}
                                >
                                  {badge.text}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                Ngày đặt:{" "}
                                {new Date(order.createdAt).toLocaleString(
                                  "vi-VN",
                                )}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Tổng tiền</p>
                              <p className="text-xl font-bold text-red-600">
                                {order.total.toLocaleString("vi-VN")} ₫
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="text-sm text-gray-600">
                                Khách hàng
                              </p>
                              <p className="font-semibold">{order.name}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                Số điện thoại
                              </p>
                              <p className="font-semibold">{order.phone}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-sm text-gray-600">
                                Địa chỉ giao hàng
                              </p>
                              <p className="font-semibold">{order.address}</p>
                            </div>
                          </div>

                          <div className="mb-4">
                            <p className="text-sm font-semibold text-gray-700 mb-2">
                              Sản phẩm ({order.items.length})
                            </p>
                            <div className="space-y-2">
                              {order.items.map((item, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-3 p-2 bg-gray-50 rounded"
                                >
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-12 h-12 object-cover rounded"
                                  />
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold line-clamp-1">
                                      {item.name}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      {item.price.toLocaleString("vi-VN")} ₫ ×{" "}
                                      {item.quantity}
                                    </p>
                                  </div>
                                  <p className="font-bold text-red-600">
                                    {(
                                      item.price * item.quantity
                                    ).toLocaleString("vi-VN")}{" "}
                                    ₫
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-4 border-t">
                            {order.status === "pending" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleUpdateOrderStatus(
                                      order.id,
                                      "processing",
                                    )
                                  }
                                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Xác nhận
                                </button>
                                <button
                                  onClick={() =>
                                    handleUpdateOrderStatus(
                                      order.id,
                                      "cancelled",
                                    )
                                  }
                                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Hủy đơn
                                </button>
                              </>
                            )}
                            {order.status === "processing" && (
                              <button
                                onClick={() =>
                                  handleUpdateOrderStatus(order.id, "shipping")
                                }
                                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                              >
                                <Package className="w-4 h-4" />
                                Đang giao hàng
                              </button>
                            )}
                            {order.status === "shipping" && (
                              <button
                                onClick={() =>
                                  handleUpdateOrderStatus(order.id, "completed")
                                }
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Hoàn thành
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className="ml-auto flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Xóa
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Users Management (Admin only) */}
            {activeTab === "users" && user.role === "admin" && (
              <div>
                <h3 className="text-xl font-bold mb-6">Quản lý người dùng</h3>
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Chức năng đang phát triển</p>
                  <p className="text-sm mt-2">
                    Tính năng quản lý người dùng sẽ có trong phiên bản tiếp theo
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

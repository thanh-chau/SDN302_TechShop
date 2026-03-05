import { useState, useEffect } from "react";
import {
  Package,
  ShoppingBag,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  LogOut,
  Home,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";
import { productAPI, orderAPI } from "../utils/api";

export function StaffPage({ user, onLogout, onBackToShop }) {
  const [activeTab, setActiveTab] = useState("orders");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadOrders(), loadProducts()]);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await orderAPI.getAll();
      setOrders(data || []);
    } catch (error) {
      console.error("Failed to load orders:", error);
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

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      await loadOrders();
      alert("Đã cập nhật trạng thái đơn hàng!");
    } catch (error) {
      alert("Không thể cập nhật trạng thái: " + error.message);
    }
  };

  const handleUpdateStock = async (productId, newStock) => {
    try {
      const product = products.find((p) => p.id === productId);
      await productAPI.update({
        ...product,
        id: productId,
        stockQuantity: newStock,
      });
      await loadProducts();
      alert("Đã cập nhật số lượng kho!");
    } catch (error) {
      alert("Không thể cập nhật kho: " + error.message);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o.buyerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.id?.toString().includes(searchTerm);
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        color: "bg-yellow-100 text-yellow-800",
        text: "Chờ xử lý",
        icon: Clock,
      },
      processing: {
        color: "bg-blue-100 text-blue-800",
        text: "Đang xử lý",
        icon: RefreshCw,
      },
      shipping: {
        color: "bg-purple-100 text-purple-800",
        text: "Đang giao",
        icon: Truck,
      },
      completed: {
        color: "bg-green-100 text-green-800",
        text: "Hoàn thành",
        icon: CheckCircle,
      },
      cancelled: {
        color: "bg-red-100 text-red-800",
        text: "Đã hủy",
        icon: XCircle,
      },
    };
    return badges[status?.toLowerCase()] || badges.pending;
  };

  const getStockStatus = (stock) => {
    if (stock <= 0)
      return { color: "bg-red-100 text-red-800", text: "Hết hàng" };
    if (stock < 10)
      return { color: "bg-yellow-100 text-yellow-800", text: "Sắp hết" };
    return { color: "bg-green-100 text-green-800", text: "Còn hàng" };
  };

  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const processingOrders = orders.filter(
    (o) => o.status === "processing",
  ).length;
  const shippingOrders = orders.filter((o) => o.status === "shipping").length;
  const lowStockProducts = products.filter((p) => p.stockQuantity < 10).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-blue-600">
                TechShop Staff
              </h1>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                Nhân viên
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Xin chào, {user?.name}</span>
              <button
                onClick={onBackToShop}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Về cửa hàng</span>
              </button>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Chờ xử lý</p>
                <p className="text-3xl font-bold text-gray-900">
                  {pendingOrders}
                </p>
              </div>
              <Clock className="w-12 h-12 text-yellow-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Đang xử lý</p>
                <p className="text-3xl font-bold text-gray-900">
                  {processingOrders}
                </p>
              </div>
              <RefreshCw className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Đang giao</p>
                <p className="text-3xl font-bold text-gray-900">
                  {shippingOrders}
                </p>
              </div>
              <Truck className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Sắp hết hàng</p>
                <p className="text-3xl font-bold text-gray-900">
                  {lowStockProducts}
                </p>
              </div>
              <Package className="w-12 h-12 text-red-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b">
            <div className="flex gap-4 px-6">
              <button
                onClick={() => setActiveTab("orders")}
                className={`py-4 px-4 font-semibold border-b-2 transition-colors ${
                  activeTab === "orders"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Đơn hàng ({orders.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab("inventory")}
                className={`py-4 px-4 font-semibold border-b-2 transition-colors ${
                  activeTab === "inventory"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Kho hàng ({products.length})
                </div>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "orders" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Quản lý đơn hàng</h2>
                  <button
                    onClick={loadOrders}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Làm mới
                  </button>
                </div>

                {/* Filters */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Tìm kiếm đơn hàng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Chờ xử lý</option>
                    <option value="processing">Đang xử lý</option>
                    <option value="shipping">Đang giao</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                  {filteredOrders.map((order) => {
                    const badge = getStatusBadge(order.status);
                    const StatusIcon = badge.icon;

                    return (
                      <div
                        key={order.id}
                        className="border rounded-xl p-6 hover:shadow-md transition-all cursor-pointer"
                        onClick={() =>
                          setSelectedOrder(
                            selectedOrder?.id === order.id ? null : order,
                          )
                        }
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="font-bold text-lg">
                                Đơn hàng #{order.id}
                              </h3>
                              <span
                                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}
                              >
                                <StatusIcon className="w-3 h-3" />
                                {badge.text}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500">Khách hàng</p>
                                <p className="font-semibold">
                                  {order.buyerName || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Ngày đặt</p>
                                <p className="font-semibold">
                                  {new Date(order.orderDate).toLocaleDateString(
                                    "vi-VN",
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-sm text-gray-500">Tổng tiền</p>
                            <p className="text-2xl font-bold text-blue-600">
                              {order.totalAmount?.toLocaleString("vi-VN")} ₫
                            </p>
                          </div>
                        </div>

                        {selectedOrder?.id === order.id && (
                          <div className="mt-4 pt-4 border-t">
                            <h4 className="font-semibold mb-3">
                              Cập nhật trạng thái
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateOrderStatus(order.id, "pending");
                                }}
                                className="px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg text-sm font-semibold transition-colors"
                              >
                                Chờ xử lý
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateOrderStatus(
                                    order.id,
                                    "processing",
                                  );
                                }}
                                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-sm font-semibold transition-colors"
                              >
                                Đang xử lý
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateOrderStatus(order.id, "shipping");
                                }}
                                className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg text-sm font-semibold transition-colors"
                              >
                                Đang giao
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateOrderStatus(
                                    order.id,
                                    "completed",
                                  );
                                }}
                                className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg text-sm font-semibold transition-colors"
                              >
                                Hoàn thành
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateOrderStatus(
                                    order.id,
                                    "cancelled",
                                  );
                                }}
                                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-sm font-semibold transition-colors"
                              >
                                Hủy đơn
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {filteredOrders.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-20" />
                      <p>Không có đơn hàng nào</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "inventory" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Quản lý kho hàng</h2>
                  <button
                    onClick={loadProducts}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Làm mới
                  </button>
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
                          Tồn kho
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
                      {products.map((product) => {
                        const stockStatus = getStockStatus(
                          product.stockQuantity,
                        );
                        return (
                          <tr key={product.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div>
                                <div className="font-semibold">
                                  {product.name}
                                </div>
                                <div className="text-xs text-gray-500 truncate max-w-xs">
                                  {product.description}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-bold text-blue-600">
                                {product.price?.toLocaleString("vi-VN")} ₫
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={product.stockQuantity}
                                  onChange={(e) => {
                                    const newProducts = products.map((p) =>
                                      p.id === product.id
                                        ? {
                                            ...p,
                                            stockQuantity:
                                              parseInt(e.target.value) || 0,
                                          }
                                        : p,
                                    );
                                    setProducts(newProducts);
                                  }}
                                  className="w-20 px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                                />
                                <button
                                  onClick={() =>
                                    handleUpdateStock(
                                      product.id,
                                      product.stockQuantity,
                                    )
                                  }
                                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                                >
                                  Lưu
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${stockStatus.color}`}
                              >
                                {stockStatus.text}
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
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

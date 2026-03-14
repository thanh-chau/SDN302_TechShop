import {
  X,
  Edit,
  Package,
  ShoppingBag,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Eye,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect } from "react";

export function StaffDashboard({
  isOpen,
  onClose,
  user,
  products,
  orders = [],
  onUpdateOrders,
}) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    completedToday: 0,
  });

  // Calculate statistics
  useEffect(() => {
    if (!isOpen) return;

    const today = new Date().toDateString();
    const pendingOrders = orders.filter((order) => order.status === "pending");
    const processingOrders = orders.filter(
      (order) => order.status === "processing",
    );
    const completedToday = orders.filter(
      (order) =>
        new Date(order.createdAt).toDateString() === today &&
        order.status === "completed",
    );

    setStats({
      totalOrders: orders.length,
      pendingOrders: pendingOrders.length,
      processingOrders: processingOrders.length,
      completedToday: completedToday.length,
    });
  }, [orders, isOpen]);

  if (!isOpen) return null;

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    if (onUpdateOrders) {
      const updatedOrders = orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order,
      );
      onUpdateOrders(updatedOrders);
    }
  };

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
                Bảng điều khiển nhân viên
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
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
                  activeTab === "dashboard"
                    ? "border-red-600 text-red-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  Tổng quan
                </div>
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
                  activeTab === "orders"
                    ? "border-red-600 text-red-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Đơn hàng
                  {stats.pendingOrders > 0 && (
                    <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                      {stats.pendingOrders}
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab("products")}
                className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
                  activeTab === "products"
                    ? "border-red-600 text-red-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Sản phẩm
                </div>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Dashboard Overview */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold">Thống kê công việc</h3>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-100 text-sm">Chờ xử lý</p>
                        <p className="text-3xl font-bold mt-2">
                          {stats.pendingOrders}
                        </p>
                      </div>
                      <Clock className="w-12 h-12 text-yellow-200" />
                    </div>
                    <div className="mt-4 text-sm">Cần xác nhận ngay</div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">Đang xử lý</p>
                        <p className="text-3xl font-bold mt-2">
                          {stats.processingOrders}
                        </p>
                      </div>
                      <RefreshCw className="w-12 h-12 text-blue-200" />
                    </div>
                    <div className="mt-4 text-sm">Đang được xử lý</div>
                  </div>

                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm">
                          Hoàn thành hôm nay
                        </p>
                        <p className="text-3xl font-bold mt-2">
                          {stats.completedToday}
                        </p>
                      </div>
                      <CheckCircle className="w-12 h-12 text-green-200" />
                    </div>
                    <div className="mt-4 text-sm">Đơn đã giao thành công</div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm">Tổng đơn hàng</p>
                        <p className="text-3xl font-bold mt-2">
                          {stats.totalOrders}
                        </p>
                      </div>
                      <ShoppingBag className="w-12 h-12 text-purple-200" />
                    </div>
                    <div className="mt-4 text-sm">Tất cả đơn hàng</div>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-xl border p-6">
                  <h4 className="text-lg font-bold mb-4">Đơn hàng cần xử lý</h4>
                  <div className="space-y-3">
                    {orders
                      .filter((o) => o.status === "pending")
                      .slice(0, 5)
                      .map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                        >
                          <div>
                            <p className="font-semibold">
                              #{order.id.toString().slice(-6)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {order.name}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-red-600">
                              {order.total.toLocaleString("vi-VN")} ₫
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(order.createdAt).toLocaleTimeString(
                                "vi-VN",
                              )}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setActiveTab("orders");
                              setOrderStatusFilter("pending");
                            }}
                            className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                          >
                            Xử lý
                          </button>
                        </div>
                      ))}
                    {orders.filter((o) => o.status === "pending").length ===
                      0 && (
                      <div className="text-center py-8 text-gray-500">
                        <CheckCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>Không có đơn hàng nào cần xử lý</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Orders Management */}
            {activeTab === "orders" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold">
                      Quản lý đơn hàng ({filteredOrders.length})
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Xử lý đơn hàng của khách hàng
                    </p>
                  </div>
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

                {/* Orders List */}
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
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Products View (Read-only for Staff) */}
            {activeTab === "products" && (
              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold">
                    Danh sách sản phẩm ({products.length})
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Xem thông tin sản phẩm trong kho
                  </p>
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
                          Tồn kho
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {products.map((product) => (
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
    </>
  );
}

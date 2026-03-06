import { X, Package, MapPin, CreditCard, Calendar, Phone, User, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { orderAPI } from "../utils/api";

export function OrderHistory({ isOpen, onClose, orders, onOrderCancelled }) {
  if (!isOpen) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "shipping":
        return "bg-purple-100 text-purple-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "processing":
        return "Đang xử lý";
      case "shipping":
        return "Đang giao hàng";
      case "completed":
        return "Hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case "cod":
        return "Thanh toán khi nhận hàng (COD)";
      case "momo":
        return "Ví MoMo";
      default:
        return method;
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;
    try {
      await orderAPI.cancel(orderId);
      toast.success("Đã hủy đơn hàng");
      if (onOrderCancelled) onOrderCancelled(orderId);
    } catch (error) {
      toast.error("Không thể hủy đơn hàng: " + error.message);
    }
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
          className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-red-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                Đơn hàng của tôi
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Orders List */}
          <div className="p-6">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-500">
                  Bạn chưa có đơn hàng nào
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border-2 border-gray-200 rounded-xl p-6 hover:border-red-500 transition-colors"
                  >
                    {/* Order Header */}
                    <div className="flex items-start justify-between mb-4 pb-4 border-b">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg">
                            Đơn hàng #{String(order.id).slice(-8).toUpperCase()}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}
                          >
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(
                                order.orderDate || order.createdAt,
                              ).toLocaleString("vi-VN")}
                            </span>
                          </div>
                          {(order.shippingName || order.buyerName) && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <User className="w-4 h-4" />
                              <span>{order.shippingName || order.buyerName}</span>
                            </div>
                          )}
                          {order.shippingPhone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-4 h-4" />
                              <span>{order.shippingPhone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Tổng tiền</p>
                          <p className="text-2xl font-bold text-red-600">
                            {(
                              order.totalAmount ||
                              order.total ||
                              0
                            ).toLocaleString("vi-VN")}{" "}
                            ₫
                          </p>
                        </div>
                        {order.status === "pending" && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 border border-red-300 hover:border-red-500 px-3 py-1 rounded-lg transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                            Hủy đơn
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-3 mb-4">
                      {(order.orderItems || order.items || []).map(
                        (item, index) => (
                          <div key={item.id || index} className="flex gap-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Package className="w-8 h-8 text-gray-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm line-clamp-1">
                                {item.productName || item.name || "Sản phẩm"}
                              </h4>
                              <p className="text-gray-500 text-sm">
                                Số lượng: {item.quantity || 0}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold text-red-600">
                                {((item.price || 0) * (item.quantity || 1)).toLocaleString("vi-VN")} ₫
                              </p>
                              <p className="text-xs text-gray-500">
                                {(item.price || 0).toLocaleString("vi-VN")} ₫ x{item.quantity || 0}
                              </p>
                            </div>
                          </div>
                        ),
                      )}
                    </div>

                    {/* Order Info */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      {(order.shippingAddress || order.address) && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-gray-600 mt-1 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-sm">
                              Địa chỉ giao hàng
                            </p>
                            <p className="text-sm text-gray-600">
                              {order.shippingAddress || order.address}
                            </p>
                          </div>
                        </div>
                      )}
                      {order.paymentMethod && (
                        <div className="flex items-start gap-2">
                          <CreditCard className="w-4 h-4 text-gray-600 mt-1 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-sm">
                              Phương thức thanh toán
                            </p>
                            <p className="text-sm text-gray-600">
                              {getPaymentMethodText(order.paymentMethod)}
                            </p>
                          </div>
                        </div>
                      )}
                      {order.note && (
                        <div className="flex items-start gap-2">
                          <span className="text-gray-600 mt-0.5 text-sm">📝</span>
                          <div>
                            <p className="font-semibold text-sm">Ghi chú</p>
                            <p className="text-sm text-gray-600">{order.note}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

  if (!isOpen) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "processing":
        return "Đang xử lý";
      case "completed":
        return "Hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
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
          className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-red-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                Đơn hàng của tôi
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Orders List */}
          <div className="p-6">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-500">
                  Bạn chưa có đơn hàng nào
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border-2 border-gray-200 rounded-xl p-6 hover:border-red-500 transition-colors"
                  >
                    {/* Order Header */}
                    <div className="flex items-start justify-between mb-4 pb-4 border-b">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg">
                            Đơn hàng #{order.id}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}
                          >
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(
                                order.orderDate || order.createdAt,
                              ).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                          {order.buyerName && (
                            <p className="text-sm text-gray-600">
                              Người mua: {order.buyerName}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 mb-1">Tổng tiền</p>
                        <p className="text-2xl font-bold text-red-600">
                          {(
                            order.totalAmount ||
                            order.total ||
                            0
                          ).toLocaleString("vi-VN")}{" "}
                          ₫
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-3 mb-4">
                      {(order.orderItems || order.items || []).map(
                        (item, index) => (
                          <div key={item.id || index} className="flex gap-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Package className="w-8 h-8 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm line-clamp-1">
                                {item.productName || item.name || "Sản phẩm"}
                              </h4>
                              <p className="text-gray-500 text-sm">
                                Số lượng: {item.quantity || 0}
                              </p>
                              <p className="text-xs text-gray-400">
                                ID: {item.productId || item.id}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-red-600">
                                {(item.price || 0).toLocaleString("vi-VN")} ₫
                              </p>
                              <p className="text-xs text-gray-500">
                                x{item.quantity || 0}
                              </p>
                            </div>
                          </div>
                        ),
                      )}
                    </div>

                    {/* Order Info */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      {order.address && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-gray-600 mt-1" />
                          <div>
                            <p className="font-semibold text-sm">
                              Địa chỉ giao hàng
                            </p>
                            <p className="text-sm text-gray-600">
                              {order.address}
                            </p>
                          </div>
                        </div>
                      )}
                      {order.paymentMethod && (
                        <div className="flex items-start gap-2">
                          <CreditCard className="w-4 h-4 text-gray-600 mt-1" />
                          <div>
                            <p className="font-semibold text-sm">
                              Phương thức thanh toán
                            </p>
                            <p className="text-sm text-gray-600">
                              {order.paymentMethod}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

import {
  X,
  Package,
  MapPin,
  CreditCard,
  Calendar,
  Phone,
  User,
  XCircle,
  Star,
} from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { orderAPI, reviewAPI } from "../utils/api";
import { ReviewModal } from "./ReviewModal";

export function OrderHistory({ isOpen, onClose, orders, onOrderCancelled }) {
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewedItems, setReviewedItems] = useState(new Set());

  // Khi mở modal hoặc orders thay đổi: fetch trạng thái đã review từ BE
  useEffect(() => {
    if (!isOpen) return;
    const completedOrders = orders.filter((o) => o.status === "completed");
    if (completedOrders.length === 0) return;

    const checks = [];
    completedOrders.forEach((order) => {
      (order.orderItems || order.items || []).forEach((item) => {
        if (item.productId) {
          checks.push(
            reviewAPI
              .checkReviewed(item.productId, order.id)
              .then((res) => {
                if (res.reviewed) return `${order.id}_${item.productId}`;
                return null;
              })
              .catch(() => null),
          );
        }
      });
    });

    Promise.all(checks).then((results) => {
      const keys = results.filter(Boolean);
      if (keys.length > 0) {
        setReviewedItems(new Set(keys));
      }
    });
  }, [isOpen, orders]);

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
        return "Cho xac nhan";
      case "processing":
        return "Dang xu ly";
      case "shipping":
        return "Dang giao hang";
      case "completed":
        return "Hoan thanh";
      case "cancelled":
        return "Da huy";
      default:
        return status;
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case "cod":
        return "Thanh toan khi nhan hang (COD)";
      case "momo":
        return "Vi MoMo";
      default:
        return method;
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Ban co chac muon huy don hang nay?")) return;
    try {
      await orderAPI.cancel(orderId);
      toast.success("Da huy don hang");
      if (onOrderCancelled) onOrderCancelled(orderId);
    } catch (error) {
      toast.error("Khong the huy don hang: " + error.message);
    }
  };

  const isReviewed = (orderId, productId) =>
    reviewedItems.has(`${orderId}_${productId}`);

  const handleReviewDone = () => {
    if (reviewTarget) {
      const key = `${reviewTarget.order.id}_${reviewTarget.item.productId}`;
      setReviewedItems((prev) => new Set([...prev, key]));
    }
    setReviewTarget(null);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
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
                              <span>
                                {order.shippingName || order.buyerName}
                              </span>
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
                          <p className="text-sm text-gray-500 mb-1">
                            Tổng tiền
                          </p>
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
                              {/* Nút đánh giá - chỉ hiện khi đơn hoàn thành */}
                              {order.status === "completed" &&
                                (isReviewed(order.id, item.productId) ? (
                                  <span className="inline-flex items-center gap-1 text-xs text-amber-600 mt-1">
                                    <Star
                                      className="w-3 h-3"
                                      fill="#d97706"
                                      stroke="#d97706"
                                    />
                                    Đã đánh giá
                                  </span>
                                ) : (
                                  <button
                                    onClick={() =>
                                      setReviewTarget({ order, item })
                                    }
                                    className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 border border-red-300 hover:border-red-500 px-2 py-0.5 rounded-lg mt-1 transition-colors"
                                  >
                                    <Star className="w-3 h-3" />
                                    Đánh giá
                                  </button>
                                ))}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold text-red-600">
                                {(
                                  (item.price || 0) * (item.quantity || 1)
                                ).toLocaleString("vi-VN")}{" "}
                                ₫
                              </p>
                              <p className="text-xs text-gray-500">
                                {(item.price || 0).toLocaleString("vi-VN")} ₫ x
                                {item.quantity || 0}
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
                          <span className="text-gray-600 mt-0.5 text-sm">
                            📝
                          </span>
                          <div>
                            <p className="font-semibold text-sm">Ghi chú</p>
                            <p className="text-sm text-gray-600">
                              {order.note}
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

      <ReviewModal
        isOpen={!!reviewTarget}
        onClose={handleReviewDone}
        order={reviewTarget?.order}
        item={reviewTarget?.item}
      />
    </>
  );
}

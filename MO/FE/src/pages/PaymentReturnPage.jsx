import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Loader2, Home, Package } from "lucide-react";

export function PaymentReturnPage() {
  const [status, setStatus] = useState("loading"); // loading, success, failed
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);

    const resultCode = urlParams.get("resultCode");
    const orderIdParam = urlParams.get("orderId");
    const messageParam = urlParams.get("message");

    console.log("MoMo return params:", {
      resultCode,
      orderId: orderIdParam,
      message: messageParam,
    });

    setOrderId(orderIdParam || "");

    // Check result code
    // 0 = success, others = failed
    if (resultCode === "0") {
      setStatus("success");
      setMessage(messageParam || "Thanh toán thành công!");
    } else {
      setStatus("failed");
      setMessage(messageParam || "Thanh toán thất bại. Vui lòng thử lại.");
    }
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Đang xử lý thanh toán...
          </h1>
          <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Icon */}
        <div className="text-center mb-6">
          {status === "success" ? (
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
          )}
        </div>

        {/* Title */}
        <h1
          className={`text-2xl font-bold text-center mb-4 ${
            status === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {status === "success"
            ? "✅ Thanh toán thành công!"
            : "❌ Thanh toán thất bại"}
        </h1>

        {/* Message */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-gray-700 text-center mb-3">{message}</p>

          {orderId && (
            <div className="text-center">
              <span className="text-sm text-gray-500">Mã đơn hàng: </span>
              <span className="text-sm font-bold text-gray-900">
                #{orderId}
              </span>
            </div>
          )}
        </div>

        {/* Success Message */}
        {status === "success" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800 text-center">
              <strong>🎉 Cảm ơn bạn đã đặt hàng!</strong>
              <br />
              Đơn hàng của bạn đã được thanh toán và đang được xử lý.
              <br />
              Bạn có thể theo dõi đơn hàng trong mục "Đơn hàng của tôi".
            </p>
          </div>
        )}

        {/* Failed Message */}
        {status === "failed" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800 text-center">
              Đơn hàng của bạn đã được tạo nhưng thanh toán chưa thành công.
              <br />
              Bạn có thể thử lại hoặc chọn phương thức thanh toán khác.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => {
              // Dispatch custom event to open order history
              window.dispatchEvent(new CustomEvent("openOrderHistory"));
              // Navigate to home
              window.location.href = "/";
            }}
            className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-red-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
          >
            <Package className="w-5 h-5" />
            Xem đơn hàng của tôi
          </button>

          <button
            onClick={() => (window.location.href = "/")}
            className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}

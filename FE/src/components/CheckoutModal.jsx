import { X, CreditCard, MapPin, User, Phone, Loader2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export function CheckoutModal({
  isOpen,
  onClose,
  cart,
  user,
  onOrderComplete,
}) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: "",
    address: "",
    paymentMethod: "cod",
    note: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !user.id) {
      toast.error("Vui lòng đăng nhập để đặt hàng");
      return;
    }

    if (cart.length === 0) {
      toast.error("Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi đặt hàng.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Pass payment method to the order handler
      await onOrderComplete(formData.paymentMethod);

      // Only close modal and reset if payment is COD
      // For MoMo, the page will redirect, so no need to close
      if (formData.paymentMethod === "cod") {
        onClose();
        setFormData({
          name: user?.name || "",
          phone: "",
          address: "",
          paymentMethod: "cod",
          note: "",
        });
      }
    } catch (error) {
      // Error is already handled in onOrderComplete with alert
      console.error("Checkout error:", error);
    } finally {
      setIsSubmitting(false);
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
            <h2 className="text-2xl font-bold text-gray-900">Thanh toán</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Info Alert */}
          <div className="mx-6 mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Lưu ý:</strong> Đơn hàng sẽ được tạo từ các sản phẩm trong
              giỏ hàng của bạn. Sau khi đặt hàng, đơn hàng sẽ ở trạng thái{" "}
              <strong>"Chờ xác nhận"</strong> và cần được xác nhận bởi nhân
              viên.
            </p>
          </div>

          <div className="mx-6 mt-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>📝 Thông tin thanh toán:</strong> Thông tin bên dưới chỉ
              để tham khảo. Đơn hàng sẽ được xác nhận và xử lý thanh toán sau
              khi nhân viên liên hệ với bạn.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left: Customer Info */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-red-600" />
                    Thông tin người nhận
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Số điện thoại *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Địa chỉ giao hàng *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <textarea
                          value={formData.address}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: e.target.value,
                            })
                          }
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                          rows={3}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ghi chú
                      </label>
                      <textarea
                        value={formData.note}
                        onChange={(e) =>
                          setFormData({ ...formData, note: e.target.value })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                        rows={2}
                        placeholder="Ghi chú cho đơn hàng (không bắt buộc)"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-red-600" />
                    Phương thức thanh toán
                  </h3>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-red-500 transition-colors has-[:checked]:border-red-500 has-[:checked]:bg-red-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={formData.paymentMethod === "cod"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            paymentMethod: e.target.value,
                          })
                        }
                        className="w-4 h-4 text-red-600"
                      />
                      <div className="flex-1">
                        <div className="font-semibold">
                          💵 COD - Thanh toán khi nhận hàng
                        </div>
                        <div className="text-sm text-gray-600">
                          Thanh toán bằng tiền mặt khi nhận hàng
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-red-500 transition-colors has-[:checked]:border-red-500 has-[:checked]:bg-red-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="momo"
                        checked={formData.paymentMethod === "momo"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            paymentMethod: e.target.value,
                          })
                        }
                        className="w-4 h-4 text-red-600"
                      />
                      <div className="flex-1">
                        <div className="font-semibold flex items-center gap-2">
                          <span className="text-pink-600">📱 MoMo</span>
                          <span className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">
                            Khuyên dùng
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Thanh toán qua ví điện tử MoMo (Quét QR hoặc ứng dụng)
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right: Order Summary */}
              <div>
                <h3 className="text-lg font-bold mb-4">Đơn hàng của bạn</h3>

                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  {/* Cart Items */}
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm line-clamp-1">
                            {item.name}
                          </h4>
                          <p className="text-gray-500 text-sm">
                            SL: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-600">
                            {(item.price * item.quantity).toLocaleString(
                              "vi-VN",
                            )}{" "}
                            ₫
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tạm tính</span>
                      <span className="font-semibold">
                        {total.toLocaleString("vi-VN")} ₫
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Phí vận chuyển</span>
                      <span className="font-semibold text-green-600">
                        Miễn phí
                      </span>
                    </div>
                    <div className="border-t pt-2 flex justify-between">
                      <span className="font-bold text-lg">Tổng cộng</span>
                      <span className="font-bold text-2xl text-red-600">
                        {total.toLocaleString("vi-VN")} ₫
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || cart.length === 0}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-lg font-bold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      "Đặt hàng"
                    )}
                  </button>

                  {cart.length === 0 && (
                    <p className="text-sm text-center text-red-600 mt-2">
                      Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi đặt hàng.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

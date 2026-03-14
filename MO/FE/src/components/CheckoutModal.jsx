import {
  X,
  CreditCard,
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

function getStorageKey(userId) {
  return `saved_addresses_${userId}`;
}

function loadAddresses(userId) {
  try {
    return JSON.parse(localStorage.getItem(getStorageKey(userId)) || "[]");
  } catch {
    return [];
  }
}

function saveAddressesToStorage(userId, list) {
  localStorage.setItem(getStorageKey(userId), JSON.stringify(list));
}

const EMPTY_FORM = { name: "", phone: "", address: "" };

export function CheckoutModal({
  isOpen,
  onClose,
  cart,
  user,
  onOrderComplete,
}) {
  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddr, setNewAddr] = useState(EMPTY_FORM);
  const [addFormError, setAddFormError] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Load addresses when modal opens
  useEffect(() => {
    if (!isOpen || !user?.id) return;
    const list = loadAddresses(user.id);
    setAddresses(list);
    setSelectedId(list[0]?.id || null);
    setShowAddForm(list.length === 0);
    setNewAddr({
      name: user?.name || "",
      phone: user?.phone || "",
      address: user?.address || "",
    });
    setNote("");
    setPaymentMethod("cod");
  }, [isOpen, user?.id]);

  if (!isOpen) return null;

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const selectedAddress = addresses.find((a) => a.id === selectedId);

  // --- Address helpers ---
  const validateNewAddr = () => {
    const errors = {};
    if (!newAddr.name.trim()) errors.name = "Vui lòng nhập họ và tên";
    if (!newAddr.phone.trim()) errors.phone = "Vui lòng nhập số điện thoại";
    else if (!/^(0|\+84)\d{8,10}$/.test(newAddr.phone.replace(/\s/g, "")))
      errors.phone = "Số điện thoại không hợp lệ";
    if (!newAddr.address.trim()) errors.address = "Vui lòng nhập địa chỉ";
    return errors;
  };

  const handleSaveNewAddr = () => {
    const errors = validateNewAddr();
    if (Object.keys(errors).length > 0) {
      setAddFormError(errors);
      return;
    }
    const entry = { id: Date.now().toString(), ...newAddr };
    const updated = [...addresses, entry];
    setAddresses(updated);
    saveAddressesToStorage(user.id, updated);
    setSelectedId(entry.id);
    setShowAddForm(false);
    setNewAddr(EMPTY_FORM);
    setAddFormError({});
    toast.success("Đã lưu địa chỉ mới");
  };

  const handleDeleteAddress = (id) => {
    const updated = addresses.filter((a) => a.id !== id);
    setAddresses(updated);
    saveAddressesToStorage(user.id, updated);
    if (selectedId === id) setSelectedId(updated[0]?.id || null);
    if (updated.length === 0) setShowAddForm(true);
    setDeleteConfirmId(null);
    toast.success("Đã xóa địa chỉ");
  };

  // --- Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) {
      toast.error("Vui lòng đăng nhập để đặt hàng");
      return;
    }
    if (cart.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }

    let shipping = selectedAddress;

    // If add-form is open and filled, save & use it
    if (showAddForm || !shipping) {
      const errors = validateNewAddr();
      if (Object.keys(errors).length > 0) {
        setAddFormError(errors);
        return;
      }
      const entry = { id: Date.now().toString(), ...newAddr };
      const updated = [...addresses, entry];
      setAddresses(updated);
      saveAddressesToStorage(user.id, updated);
      setSelectedId(entry.id);
      setShowAddForm(false);
      setNewAddr(EMPTY_FORM);
      setAddFormError({});
      shipping = entry;
    }

    setIsSubmitting(true);
    try {
      await onOrderComplete({
        name: shipping.name,
        phone: shipping.phone,
        address: shipping.address,
        paymentMethod,
        note,
      });
      if (paymentMethod === "cod") onClose();
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">Thanh toán</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* ── LEFT ── */}
            <div className="space-y-6">
              {/* ── ADDRESS SECTION ── */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-red-600" />
                    Địa chỉ nhận hàng
                  </h3>
                  {!showAddForm && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(true);
                        setNewAddr(EMPTY_FORM);
                        setAddFormError({});
                      }}
                      className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-semibold"
                    >
                      <Plus className="w-4 h-4" />
                      Thêm địa chỉ
                    </button>
                  )}
                </div>

                {/* Saved address list */}
                {addresses.length > 0 && (
                  <div className="space-y-2 mb-3 max-h-56 overflow-y-auto pr-1">
                    {addresses.map((addr) => {
                      const isSelected = addr.id === selectedId;
                      return (
                        <div
                          key={addr.id}
                          className={`relative flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            isSelected
                              ? "border-red-500 bg-red-50"
                              : "border-gray-200 hover:border-gray-300 bg-white"
                          }`}
                          onClick={() => {
                            setSelectedId(addr.id);
                            setShowAddForm(false);
                          }}
                        >
                          {/* Radio indicator */}
                          <div
                            className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? "border-red-500" : "border-gray-400"}`}
                          >
                            {isSelected && (
                              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-gray-900 text-sm">
                                {addr.name}
                              </span>
                              <span className="text-gray-400 text-xs">|</span>
                              <span className="text-gray-600 text-sm">
                                {addr.phone}
                              </span>
                              {addr.id === addresses[0]?.id && (
                                <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">
                                  Mặc định
                                </span>
                              )}
                            </div>
                            <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">
                              {addr.address}
                            </p>
                          </div>

                          {/* Delete */}
                          {deleteConfirmId === addr.id ? (
                            <div
                              className="flex gap-1 flex-shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => handleDeleteAddress(addr.id)}
                                className="text-xs bg-red-600 text-white px-2 py-1 rounded font-semibold"
                              >
                                Xóa
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded font-semibold"
                              >
                                Hủy
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmId(addr.id);
                              }}
                              className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Xóa địa chỉ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Add new address form */}
                {showAddForm && (
                  <div className="border-2 border-dashed border-red-300 rounded-xl p-4 bg-red-50/30 space-y-3">
                    <p className="text-sm font-semibold text-gray-700">
                      Thêm địa chỉ mới
                    </p>

                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        value={newAddr.name}
                        onChange={(e) =>
                          setNewAddr({ ...newAddr, name: e.target.value })
                        }
                        placeholder="Nguyễn Văn A"
                        className={`w-full px-3 py-2.5 border-2 rounded-lg text-sm focus:outline-none focus:border-red-500 ${addFormError.name ? "border-red-400" : "border-gray-300"}`}
                      />
                      {addFormError.name && (
                        <p className="text-xs text-red-500 mt-0.5">
                          {addFormError.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">
                        Số điện thoại *
                      </label>
                      <input
                        type="tel"
                        value={newAddr.phone}
                        onChange={(e) =>
                          setNewAddr({ ...newAddr, phone: e.target.value })
                        }
                        placeholder="0912 345 678"
                        className={`w-full px-3 py-2.5 border-2 rounded-lg text-sm focus:outline-none focus:border-red-500 ${addFormError.phone ? "border-red-400" : "border-gray-300"}`}
                      />
                      {addFormError.phone && (
                        <p className="text-xs text-red-500 mt-0.5">
                          {addFormError.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">
                        Địa chỉ *
                      </label>
                      <textarea
                        value={newAddr.address}
                        onChange={(e) =>
                          setNewAddr({ ...newAddr, address: e.target.value })
                        }
                        placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                        rows={2}
                        className={`w-full px-3 py-2.5 border-2 rounded-lg text-sm focus:outline-none focus:border-red-500 resize-none ${addFormError.address ? "border-red-400" : "border-gray-300"}`}
                      />
                      {addFormError.address && (
                        <p className="text-xs text-red-500 mt-0.5">
                          {addFormError.address}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSaveNewAddr}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Lưu địa chỉ
                      </button>
                      {addresses.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddForm(false);
                            setAddFormError({});
                          }}
                          className="px-4 py-2 border-2 border-gray-300 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
                        >
                          Hủy
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* No address warning */}
                {addresses.length === 0 && !showAddForm && (
                  <p className="text-sm text-gray-400 text-center py-3">
                    Chưa có địa chỉ nào. Thêm địa chỉ mới để tiếp tục.
                  </p>
                )}
              </section>

              {/* ── NOTE ── */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ghi chú
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-sm resize-none"
                  rows={2}
                  placeholder="Ghi chú cho đơn hàng (không bắt buộc)"
                />
              </div>

              {/* ── PAYMENT ── */}
              <section>
                <h3 className="font-bold text-base mb-3 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-red-600" />
                  Phương thức thanh toán
                </h3>
                <div className="space-y-2">
                  {[
                    {
                      value: "cod",
                      label: "💵 COD - Thanh toán khi nhận hàng",
                      sub: "Thanh toán bằng tiền mặt khi nhận hàng",
                    },
                    {
                      value: "momo",
                      label: "📱 MoMo",
                      sub: "Thanh toán qua ví điện tử MoMo (Quét QR hoặc ứng dụng)",
                      badge: "Khuyên dùng",
                    },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-3 p-3.5 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === opt.value ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={opt.value}
                        checked={paymentMethod === opt.value}
                        onChange={() => setPaymentMethod(opt.value)}
                        className="w-4 h-4 text-red-600 accent-red-600"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-sm flex items-center gap-2">
                          {opt.label}
                          {opt.badge && (
                            <span className="text-xs bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded-full">
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {opt.sub}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </section>
            </div>

            {/* ── RIGHT: Order Summary ── */}
            <div>
              <h3 className="font-bold text-base mb-3">Đơn hàng của bạn</h3>
              <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm line-clamp-2">
                          {item.name}
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          SL: {item.quantity}
                        </p>
                      </div>
                      <p className="font-bold text-red-600 text-sm flex-shrink-0">
                        {(item.price * item.quantity).toLocaleString("vi-VN")} ₫
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tạm tính</span>
                    <span className="font-semibold">
                      {total.toLocaleString("vi-VN")} ₫
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phí vận chuyển</span>
                    <span className="font-semibold text-green-600">
                      Miễn phí
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between items-center">
                    <span className="font-bold text-base">Tổng cộng</span>
                    <span className="font-bold text-2xl text-red-600">
                      {total.toLocaleString("vi-VN")} ₫
                    </span>
                  </div>
                </div>

                {/* Selected address preview */}
                {selectedAddress && (
                  <div className="bg-white rounded-lg border border-gray-200 p-3 text-xs text-gray-600">
                    <p className="font-semibold text-gray-800 text-sm mb-0.5">
                      Giao đến:
                    </p>
                    <p>
                      {selectedAddress.name} · {selectedAddress.phone}
                    </p>
                    <p className="text-gray-400 mt-0.5 line-clamp-2">
                      {selectedAddress.address}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || cart.length === 0}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-bold text-sm transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    "Đặt hàng"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

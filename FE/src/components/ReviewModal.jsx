import { useState } from "react";
import { X, Star, Package } from "lucide-react";
import toast from "react-hot-toast";
import { reviewAPI } from "../utils/api";

function StarRating({ rating, onChange, readonly = false }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`transition-transform ${!readonly ? "hover:scale-110 cursor-pointer" : "cursor-default"}`}
        >
          <Star
            className="w-8 h-8"
            fill={(hovered || rating) >= star ? "#f59e0b" : "none"}
            stroke={(hovered || rating) >= star ? "#f59e0b" : "#d1d5db"}
          />
        </button>
      ))}
    </div>
  );
}

const ratingLabels = {
  1: "Rất tệ",
  2: "Tệ",
  3: "Bình thường",
  4: "Tốt",
  5: "Xuất sắc",
};

export function ReviewModal({ isOpen, onClose, order, item }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !order || !item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      toast.error("Vui lòng chọn số sao đánh giá");
      return;
    }
    setLoading(true);
    try {
      await reviewAPI.create(item.productId, order.id, rating, comment);
      toast.success("Đánh giá thành công! Cảm ơn bạn.");
      setSubmitted(true);
    } catch (err) {
      toast.error(err.message || "Đánh giá thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRating(5);
    setComment("");
    setSubmitted(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Đánh giá sản phẩm</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Product info */}
          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="w-14 h-14 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
              <Package className="w-7 h-7 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 line-clamp-2 text-sm">
                {item.productName || item.name}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Đơn hàng #{String(order.id).slice(-8).toUpperCase()}
              </p>
            </div>
          </div>

          {submitted ? (
            /* Success state */
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-green-600" fill="#16a34a" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Cảm ơn bạn!
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Đánh giá của bạn đã được ghi nhận và sẽ giúp ích cho người mua
                khác.
              </p>
              <div className="flex justify-center mb-2">
                <StarRating rating={rating} readonly />
              </div>
              {comment && (
                <p className="text-gray-500 text-sm italic mt-3">"{comment}"</p>
              )}
              <button
                onClick={handleClose}
                className="mt-6 w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors"
              >
                Đóng
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Star rating */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Chất lượng sản phẩm *
                </p>
                <div className="flex flex-col items-center gap-2">
                  <StarRating rating={rating} onChange={setRating} />
                  <p className="text-sm font-medium text-amber-600">
                    {ratingLabels[rating] || ""}
                  </p>
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nhận xét của bạn
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                  rows={4}
                  maxLength={1000}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-sm"
                />
                <p className="text-xs text-gray-400 text-right mt-1">
                  {comment.length}/1000
                </p>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2.5 border-2 border-gray-200 hover:border-gray-300 text-gray-600 font-semibold rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading || !rating}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold rounded-xl transition-colors"
                >
                  {loading ? "Đang gửi..." : "Gửi đánh giá"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import {
  X,
  ShoppingCart,
  Star,
  Package,
  Shield,
  Zap,
  User,
} from "lucide-react";
import { reviewAPI } from "../utils/api";

export function ProductDetail({ product, onClose, onAddToCart }) {
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    if (!product?.id) return;
    setLoadingReviews(true);
    reviewAPI
      .getByProduct(product.id)
      .then((data) => {
        setReviews(data.reviews || []);
        setAvgRating(data.avgRating || 0);
        setReviewCount(data.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoadingReviews(false));
  }, [product?.id]);
  if (!product) return null;

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
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white hover:bg-gray-100 rounded-full shadow-lg transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="relative">
              {product.discount && (
                <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-full text-lg font-bold z-10 shadow-lg">
                  -{product.discount}%
                </div>
              )}
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-96 object-cover rounded-2xl"
              />
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5"
                          fill={i < Math.floor(avgRating) ? "#facc15" : "none"}
                          stroke={
                            i < Math.floor(avgRating) ? "#facc15" : "#d1d5db"
                          }
                        />
                      ))}
                    </div>
                    <span className="text-lg font-semibold">
                      {avgRating > 0 ? avgRating.toFixed(1) : "Chưa có"}
                    </span>
                  </div>
                  <span className="text-gray-500">
                    ({reviewCount} đánh giá)
                  </span>
                </div>

                {/* Price */}
                <div className="bg-gray-50 p-6 rounded-xl mb-6">
                  <div className="flex items-baseline gap-4">
                    <span className="text-4xl font-bold text-red-600">
                      {product.price.toLocaleString("vi-VN")} ₫
                    </span>
                    {product.originalPrice && (
                      <span className="text-xl text-gray-400 line-through">
                        {product.originalPrice.toLocaleString("vi-VN")} ₫
                      </span>
                    )}
                  </div>
                  {product.discount && (
                    <p className="text-green-600 font-semibold mt-2">
                      Tiết kiệm{" "}
                      {(product.originalPrice - product.price).toLocaleString(
                        "vi-VN",
                      )}{" "}
                      ₫
                    </p>
                  )}
                </div>

                {/* Description */}
                {product.description && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-2">
                      Mô tả sản phẩm
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* Features */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
                    <Shield className="w-8 h-8 text-blue-600 mb-2" />
                    <span className="text-sm text-center font-semibold">
                      Bảo hành chính hãng
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
                    <Package className="w-8 h-8 text-green-600 mb-2" />
                    <span className="text-sm text-center font-semibold">
                      Miễn phí vận chuyển
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-orange-50 rounded-lg">
                    <Zap className="w-8 h-8 text-orange-600 mb-2" />
                    <span className="text-sm text-center font-semibold">
                      Giao hàng nhanh
                    </span>
                  </div>
                </div>

                {/* Stock Status */}
                <div className="mb-6">
                  <span
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${
                      product.stock > 20
                        ? "bg-green-100 text-green-700"
                        : product.stock > 0
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {product.stock > 20
                      ? "Còn hàng"
                      : product.stock > 0
                        ? `Chỉ còn ${product.stock} sản phẩm`
                        : "Hết hàng"}
                  </span>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => {
                    onAddToCart(product);
                    onClose();
                  }}
                  disabled={product.stock === 0}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-3"
                >
                  <ShoppingCart className="w-6 h-6" />
                  <span>
                    {product.stock > 0 ? "Thêm vào giỏ hàng" : "Hết hàng"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="px-8 pb-8">
            <div className="border-t pt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Đánh giá sản phẩm
                {reviewCount > 0 && (
                  <span className="ml-2 text-base font-normal text-gray-500">
                    ({reviewCount} đánh giá · trung bình{" "}
                    <span className="text-amber-500 font-semibold">
                      {avgRating.toFixed(1)} ⭐
                    </span>
                    )
                  </span>
                )}
              </h3>

              {loadingReviews ? (
                <p className="text-gray-400 text-sm">Đang tải đánh giá...</p>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <Star className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">
                    Chưa có đánh giá nào. Hãy là người đầu tiên!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-semibold text-sm text-gray-900">
                              {review.userName || "Khách hàng"}
                            </span>
                            <span className="text-xs text-gray-400 flex-shrink-0">
                              {new Date(review.createdAt).toLocaleDateString(
                                "vi-VN",
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-4 h-4"
                                fill={i < review.rating ? "#f59e0b" : "none"}
                                stroke={
                                  i < review.rating ? "#f59e0b" : "#d1d5db"
                                }
                              />
                            ))}
                          </div>
                          {review.comment && (
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {review.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

import { X, ShoppingCart, Star, Package, Shield, Zap } from "lucide-react";

export function ProductDetail({ product, onClose, onAddToCart }) {
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
                          className={`w-5 h-5 ${
                            i < Math.floor(product.rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-semibold">
                      {product.rating}
                    </span>
                  </div>
                  <span className="text-gray-500">
                    ({product.reviews} đánh giá)
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
        </div>
      </div>
    </>
  );
}

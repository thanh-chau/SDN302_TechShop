import { useState, useEffect } from "react";
import { Flame, ChevronRight, ShoppingCart, Star, Heart } from "lucide-react";

export function FlashSale({
  onAddToCart,
  onProductClick,
  products,
  onToggleWishlist,
  wishlistIds = new Set(),
}) {
  // Sản phẩm đang flash sale: có flashSaleEnd (còn hạn) và (discount > 0 hoặc flashSalePrice)
  const flashSaleProducts = (products || []).filter(
    (p) =>
      p.flashSaleEnd &&
      new Date(p.flashSaleEnd) > new Date() &&
      (p.discount > 0 || p.flashSalePrice)
  ).slice(0, 10);

  // Countdown: lấy thời điểm kết thúc sớm nhất trong danh sách
  const endTime = flashSaleProducts.length > 0
    ? flashSaleProducts.reduce((min, p) => {
        const t = new Date(p.flashSaleEnd).getTime();
        return t < min ? t : min;
      }, Number.MAX_SAFE_INTEGER)
    : null;

  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!endTime) return;
    const update = () => {
      const now = Date.now();
      const diff = Math.max(0, endTime - now);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  const formatTime = (value) => String(value).padStart(2, "0");

  // Don't render the Flash Sale section if there are no products on sale
  if (flashSaleProducts.length === 0) {
    return null;
  }

  return (
    <section
      id="flash-sale"
      className="bg-gradient-to-br from-red-50 to-orange-50 py-8"
    >
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Flame className="w-8 h-8 text-red-600 animate-pulse" />
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                FLASH SALE
              </h2>
            </div>

            {/* Countdown Timer */}
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md">
              <span className="text-sm font-semibold text-gray-600">
                Kết thúc trong:
              </span>
              <div className="flex items-center gap-1">
                <div className="bg-red-600 text-white px-2 py-1 rounded font-bold text-lg min-w-[2.5rem] text-center">
                  {formatTime(timeLeft.hours)}
                </div>
                <span className="text-red-600 font-bold">:</span>
                <div className="bg-red-600 text-white px-2 py-1 rounded font-bold text-lg min-w-[2.5rem] text-center">
                  {formatTime(timeLeft.minutes)}
                </div>
                <span className="text-red-600 font-bold">:</span>
                <div className="bg-red-600 text-white px-2 py-1 rounded font-bold text-lg min-w-[2.5rem] text-center">
                  {formatTime(timeLeft.seconds)}
                </div>
              </div>
            </div>
          </div>

          <button className="flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold transition-colors">
            <span>Xem tất cả</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {flashSaleProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer border-2 border-transparent hover:border-red-500"
            >
              {/* Product Image */}
              <div
                className="relative h-48 overflow-hidden bg-gray-100"
                onClick={() => onProductClick(product)}
              >
                {/* Discount Badge */}
                {product.discount && (
                  <div className="absolute top-2 left-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold z-10 shadow-lg">
                    -{product.discount}%
                  </div>
                )}
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {onToggleWishlist && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWishlist(product);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <Heart
                      className={`w-4 h-4 transition-colors ${
                        wishlistIds.has(product.id)
                          ? "fill-red-500 text-red-500"
                          : "text-gray-400 hover:text-red-500"
                      }`}
                    />
                  </button>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-3">
                <h3
                  className="font-semibold text-gray-900 line-clamp-2 min-h-[3rem] hover:text-red-600 transition-colors cursor-pointer"
                  onClick={() => onProductClick(product)}
                >
                  {product.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    ({product.reviews})
                  </span>
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-red-600">
                      {product.price.toLocaleString("vi-VN")} ₫
                    </span>
                  </div>
                  {product.originalPrice && (
                    <div className="text-sm text-gray-400 line-through">
                      {product.originalPrice.toLocaleString("vi-VN")} ₫
                    </div>
                  )}
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(product);
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 group-hover:scale-105 transform duration-200"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Thêm vào giỏ</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

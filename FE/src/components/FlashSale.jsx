import { memo, useMemo } from "react";
import { Flame, ChevronRight, ShoppingCart, Star, Heart } from "lucide-react";

function FlashSaleInner({
  onAddToCart,
  onProductClick,
  products,
  onToggleWishlist,
  wishlistIds = new Set(),
}) {
  const flashSaleProducts = useMemo(
    () =>
      (products || [])
        .filter(
          (p) =>
            p.flashSaleEnd &&
            new Date(p.flashSaleEnd) > new Date() &&
            (p.discount > 0 || p.flashSalePrice)
        )
        .slice(0, 10),
    [products]
  );

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
          <div className="flex items-center gap-2">
            <Flame className="w-8 h-8 text-red-600 animate-pulse" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              FLASH SALE
            </h2>
          </div>

          {/* Chỉ hiện "Xem tất cả" khi màn hình rộng (full) */}
          <button
            onClick={() => document.getElementById("flash-sale")?.scrollIntoView({ behavior: "smooth" })}
            className="hidden lg:flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold transition-colors shrink-0"
          >
            <span>Xem tất cả</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Products Grid - card cùng chiều cao, ảnh scale đều */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-stretch">
          {flashSaleProducts.map((product) => (
            <div
              key={product.id}
              className="h-full flex flex-col bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer border-2 border-transparent hover:border-red-500"
            >
              {/* Product Image - chiều cao cố định, ảnh object-cover */}
              <div
                className="relative w-full h-48 flex-shrink-0 overflow-hidden bg-gray-100"
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
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
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

              {/* Product Info - flex-1 để card đều chiều cao, nút dính đáy */}
              <div className="flex-1 flex flex-col min-h-0 p-4">
                <h3
                  className="font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem] hover:text-red-600 transition-colors cursor-pointer flex-shrink-0"
                  onClick={() => onProductClick(product)}
                >
                  {product.name}
                </h3>

                <div className="flex-1 min-h-[1rem]" />

                {/* Rating - chiều cao cố định */}
                <div className="flex items-center gap-2 flex-shrink-0 min-h-[1.25rem]">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 flex-shrink-0 ${
                          i < Math.floor(product.rating ?? 0)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 tabular-nums">
                    ({product.reviews ?? 0})
                  </span>
                </div>

                {/* Price - luôn 2 dòng để nút không lệch */}
                <div className="flex-shrink-0 min-h-[3.5rem] flex flex-col justify-center space-y-0.5">
                  <div className="flex items-center gap-2 min-h-[1.75rem]">
                    <span className="text-xl font-bold text-red-600 tabular-nums">
                      {product.price.toLocaleString("vi-VN")} ₫
                    </span>
                  </div>
                  <div className="min-h-[1.25rem] text-sm text-gray-400">
                    {product.originalPrice ? (
                      <span className="line-through tabular-nums">
                        {product.originalPrice.toLocaleString("vi-VN")} ₫
                      </span>
                    ) : (
                      <span className="invisible">0</span>
                    )}
                  </div>
                </div>

                {/* Add to Cart Button - mt-auto dính đáy card */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(product);
                  }}
                  className="mt-auto pt-3 w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 group-hover:scale-105 transform duration-200 flex-shrink-0"
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

export const FlashSale = memo(FlashSaleInner);

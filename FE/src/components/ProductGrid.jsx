import { memo, useState, useMemo } from "react";
import { ChevronRight, ShoppingCart, Star, Heart } from "lucide-react";

function ProductGridInner({
  title,
  category,
  categoryKeywords = [],
  onAddToCart,
  onProductClick,
  products,
  onToggleWishlist,
  wishlistIds = new Set(),
}) {
  const [showAll, setShowAll] = useState(false);

  const allCategoryProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      if (!p.category) return false;
      const productCategory = (typeof p.category === "string" ? p.category : "").toLowerCase().trim();
      const target = (category || "").toLowerCase();
      if (categoryKeywords?.length > 0) {
        return categoryKeywords.some(
          (kw) => productCategory === kw || productCategory.includes(kw)
        );
      }
      return productCategory === target || productCategory.includes(target);
    });
  }, [products, category, categoryKeywords]);

  const categoryProducts = showAll
    ? allCategoryProducts
    : allCategoryProducts.slice(0, 6);

  return (
    <section className="py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {allCategoryProducts.length > 6 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold transition-colors"
          >
            <span>{showAll ? "Thu gọn" : "Xem tất cả"}</span>
            <ChevronRight
              className={`w-5 h-5 transition-transform ${showAll ? "rotate-90" : ""}`}
            />
          </button>
        )}
      </div>

      {/* Products Grid - items-stretch để mọi card cùng chiều cao */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-stretch">
        {categoryProducts.map((product) => (
          <div
            key={product.id}
            className="h-full flex flex-col bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer border-2 border-transparent hover:border-red-500"
          >
            {/* Discount Badge */}
            {product.discount && (
              <div className="absolute top-2 left-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold z-10 shadow-lg">
                -{product.discount}%
              </div>
            )}

            {/* Product Image - chiều cao cố định, ảnh scale đều */}
            <div
              className="relative w-full h-48 flex-shrink-0 overflow-hidden bg-gray-100"
              onClick={() => onProductClick(product)}
            >
              <img
                src={product.image}
                alt={product.name}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
              />
              {/* Wishlist Heart Button */}
              {onToggleWishlist && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleWishlist(product);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:scale-110 transition-transform z-10"
                  title={
                    wishlistIds.has(product.id)
                      ? "Xóa khỏi yêu thích"
                      : "Thêm vào yêu thích"
                  }
                >
                  <Heart
                    className="w-4 h-4"
                    fill={wishlistIds.has(product.id) ? "#dc2626" : "none"}
                    stroke={wishlistIds.has(product.id) ? "#dc2626" : "#9ca3af"}
                  />
                </button>
              )}
            </div>

            {/* Product Info - flex-1 + flex col để nội dung đều, nút đẩy xuống dưới */}
            <div className="flex-1 flex flex-col min-h-0 p-4">
              <h3
                className="font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem] text-sm hover:text-red-600 transition-colors cursor-pointer flex-shrink-0"
                onClick={() => onProductClick(product)}
              >
                {product.name}
              </h3>

              <div className="flex-1 min-h-[1rem]" />

              {/* Rating - chiều cao cố định để card đều nhau */}
              <div className="flex items-center gap-2 flex-shrink-0 min-h-[1.25rem]">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-3 h-3 flex-shrink-0"
                      fill={
                        i < Math.floor(product.avgRating || 0)
                          ? "#facc15"
                          : "none"
                      }
                      stroke={
                        i < Math.floor(product.avgRating || 0)
                          ? "#facc15"
                          : "#d1d5db"
                      }
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500 tabular-nums">
                  ({product.reviewCount ?? 0})
                </span>
              </div>

              {/* Price - luôn reserve 2 dòng (giá + giá gốc) để nút không bị lệch */}
              <div className="flex-shrink-0 min-h-[3.25rem] flex flex-col justify-center space-y-0.5">
                <div className="flex items-center gap-2 min-h-[1.75rem]">
                  <span className="text-lg font-bold text-red-600 tabular-nums">
                    {product.price.toLocaleString("vi-VN")} ₫
                  </span>
                </div>
                <div className="min-h-[1rem] text-xs text-gray-400">
                  {product.originalPrice ? (
                    <span className="line-through tabular-nums">
                      {product.originalPrice.toLocaleString("vi-VN")} ₫
                    </span>
                  ) : (
                    <span className="invisible">0</span>
                  )}
                </div>
              </div>

              {/* Add to Cart Button - mt-auto để luôn dính đáy card */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product);
                }}
                className="mt-auto pt-3 w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-sm flex-shrink-0"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Thêm vào giỏ</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export const ProductGrid = memo(ProductGridInner);

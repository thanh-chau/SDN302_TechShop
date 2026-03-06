import { ChevronRight, ShoppingCart, Star } from "lucide-react";
import { useState } from "react";

export function ProductGrid({
  title,
  category,
  onAddToCart,
  onProductClick,
  products,
}) {
  const [showAll, setShowAll] = useState(false);

  // Filter products by category (case-insensitive)
  const allCategoryProducts = products
    ? products.filter((p) => {
        if (!p.category) return false;
        const productCategory = p.category.toLowerCase();
        const targetCategory = category.toLowerCase();

        // Exact match or contains
        return (
          productCategory === targetCategory ||
          productCategory.includes(targetCategory)
        );
      })
    : [];

  // Show 6 products initially, or all if showAll is true
  const categoryProducts = showAll
    ? allCategoryProducts
    : allCategoryProducts.slice(0, 6);

  // Debug log
  console.log(`ProductGrid "${title}" (${category}):`, {
    totalProducts: products?.length || 0,
    filteredProducts: categoryProducts.length,
    totalInCategory: allCategoryProducts.length,
    showAll,
    categories: products
      ?.map((p) => p.category)
      .filter((v, i, a) => a.indexOf(v) === i),
  });

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

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categoryProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer border-2 border-transparent hover:border-red-500"
          >
            {/* Discount Badge */}
            {product.discount && (
              <div className="absolute top-2 left-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold z-10 shadow-lg">
                -{product.discount}%
              </div>
            )}

            {/* Product Image */}
            <div
              className="relative h-48 overflow-hidden bg-gray-100"
              onClick={() => onProductClick(product)}
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>

            {/* Product Info */}
            <div className="p-4 space-y-3">
              <h3
                className="font-semibold text-gray-900 line-clamp-2 min-h-[3rem] text-sm hover:text-red-600 transition-colors cursor-pointer"
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
                      className="w-3 h-3"
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
                <span className="text-xs text-gray-500">
                  ({product.reviewCount || 0})
                </span>
              </div>

              {/* Price */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-red-600">
                    {product.price.toLocaleString("vi-VN")} ₫
                  </span>
                </div>
                {product.originalPrice && (
                  <div className="text-xs text-gray-400 line-through">
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
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-sm"
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

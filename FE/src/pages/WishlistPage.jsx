import { Heart, Trash2, ShoppingCart } from "lucide-react";

export function WishlistPage({ wishlist, onRemoveFromWishlist, onAddToCart }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Sản phẩm yêu thích
      </h1>

      {wishlist.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-lg text-gray-500">
            Chưa có sản phẩm yêu thích nào
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlist.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              {product.discount && (
                <div className="absolute top-2 left-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold z-10 shadow-lg">
                  -{product.discount}%
                </div>
              )}

              <div className="relative h-48 overflow-hidden bg-gray-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => onRemoveFromWishlist(product.id)}
                  className="absolute top-2 right-2 p-2 bg-white hover:bg-red-50 text-red-600 rounded-full shadow-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-3">
                <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[3rem] text-sm">
                  {product.name}
                </h3>

                <div className="space-y-1">
                  <div className="text-lg font-bold text-red-600">
                    {product.price.toLocaleString("vi-VN")} ₫
                  </div>
                  {product.originalPrice && (
                    <div className="text-xs text-gray-400 line-through">
                      {product.originalPrice.toLocaleString("vi-VN")} ₫
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onAddToCart(product)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Thêm vào giỏ</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

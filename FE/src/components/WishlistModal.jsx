import { X, Heart, ShoppingCart, Trash2, Star, Package } from "lucide-react";

export function WishlistModal({
  isOpen,
  onClose,
  wishlist,
  onRemoveFromWishlist,
  onAddToCart,
  onProductClick,
}) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-red-600" fill="#dc2626" />
              <h2 className="text-2xl font-bold text-gray-900">
                Sản phẩm yêu thích
              </h2>
              {wishlist.length > 0 && (
                <span className="bg-red-100 text-red-600 text-sm font-semibold px-2.5 py-0.5 rounded-full">
                  {wishlist.length}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {wishlist.length === 0 ? (
              <div className="text-center py-16">
                <Heart className="w-20 h-20 text-gray-200 mx-auto mb-4" />
                <p className="text-xl font-semibold text-gray-500 mb-2">
                  Chưa có sản phẩm yêu thích
                </p>
                <p className="text-gray-400 text-sm">
                  Bấm vào biểu tượng ♡ trên sản phẩm để thêm vào danh sách
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {wishlist.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white border-2 border-gray-100 rounded-xl overflow-hidden hover:border-red-400 hover:shadow-lg transition-all duration-300 group"
                  >
                    {/* Image */}
                    <div
                      className="relative h-44 bg-gray-100 overflow-hidden cursor-pointer"
                      onClick={() => {
                        onProductClick && onProductClick(product);
                        onClose();
                      }}
                    >
                      <img
                        src={
                          product.image ||
                          product.imgUrl ||
                          "https://placehold.co/400x400?text=No+Image"
                        }
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Remove button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveFromWishlist(product.id);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-white hover:bg-red-50 text-red-500 rounded-full shadow-md transition-colors"
                        title="Xóa khỏi yêu thích"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Info */}
                    <div className="p-3 space-y-2">
                      <h3
                        className="font-semibold text-gray-900 text-sm line-clamp-2 min-h-[2.5rem] cursor-pointer hover:text-red-600 transition-colors"
                        onClick={() => {
                          onProductClick && onProductClick(product);
                          onClose();
                        }}
                      >
                        {product.name}
                      </h3>

                      {/* Stars */}
                      {product.avgRating > 0 && (
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-3 h-3"
                              fill={
                                i < Math.floor(product.avgRating)
                                  ? "#facc15"
                                  : "none"
                              }
                              stroke={
                                i < Math.floor(product.avgRating)
                                  ? "#facc15"
                                  : "#d1d5db"
                              }
                            />
                          ))}
                          <span className="text-xs text-gray-400">
                            ({product.reviewCount || 0})
                          </span>
                        </div>
                      )}

                      <p className="text-lg font-bold text-red-600">
                        {product.price.toLocaleString("vi-VN")} ₫
                      </p>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart(product);
                        }}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Thêm vào giỏ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

import { useState, useEffect } from "react";
import { ShoppingBag, Flame, ChevronLeft, ChevronRight } from "lucide-react";

const AUTO_SWITCH_MS = 3000;
const DEFAULT_HERO_IMAGE =
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=500&fit=crop";

export function HeroBanner({
  flashSaleProducts = [],
  onProductClick,
  onAddToCart,
}) {
  const [index, setIndex] = useState(0);
  const items =
    flashSaleProducts.length > 0
      ? flashSaleProducts
      : [{ id: "empty", name: "Chưa có Flash Sale", empty: true }];
  const total = items.length;

  useEffect(() => {
    if (total <= 1) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, AUTO_SWITCH_MS);
    return () => clearInterval(t);
  }, [total]);

  const go = (dir) => {
    setIndex((i) => {
      if (dir === 1) return (i + 1) % total;
      return i === 0 ? total - 1 : i - 1;
    });
  };

  const current = items[index];
  const isEmpty = current?.empty;
  const imageUrl =
    isEmpty
      ? DEFAULT_HERO_IMAGE
      : current.image ||
        current.imgUrl ||
        DEFAULT_HERO_IMAGE;

  return (
    <div className="relative bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-10 md:py-14">
        <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-center min-h-[300px] md:min-h-[360px]">
          {/* Left Content - cân bằng với phần ảnh */}
          <div className="space-y-4 md:space-y-5 z-10 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-2.5 py-1.5 rounded-full text-sm font-bold w-fit">
              <Flame className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">FLASH SALE</span>
            </div>

            {isEmpty ? (
              <>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                  Săn sale sắp diễn ra
                </h1>
                <p className="text-base md:text-lg opacity-95 max-w-md">
                  Chưa có flash sale. Quay lại sau nhé!
                </p>
                <div className="pt-1">
                  <span className="inline-block bg-white/20 px-4 py-2 rounded-lg text-sm font-medium">
                    TechShop — Ưu đãi sắp lên sóng
                  </span>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-2xl md:text-4xl font-bold leading-tight line-clamp-2 pr-2">
                  {current.name}
                </h1>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-2xl md:text-3xl font-bold">
                    {current.price?.toLocaleString("vi-VN")} ₫
                  </span>
                  {current.originalPrice != null && (
                    <span className="text-lg line-through opacity-80">
                      {current.originalPrice?.toLocaleString("vi-VN")} ₫
                    </span>
                  )}
                  {current.discount > 0 && (
                    <span className="bg-white/30 px-2.5 py-1 rounded-md text-sm font-bold">
                      -{current.discount}%
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!isEmpty && onProductClick) onProductClick(current);
                    else if (!isEmpty && onAddToCart) onAddToCart(current);
                  }}
                  className="group inline-flex items-center gap-2 bg-white text-red-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg w-fit"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Mua ngay</span>
                </button>
              </>
            )}
          </div>

          {/* Right: Ảnh luôn đầy, tỉ lệ đều, viền đẹp */}
          <div className="relative w-full aspect-[4/3] md:aspect-[16/10] max-h-[280px] md:max-h-[340px] mx-auto">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-2xl transform rotate-2 shadow-2xl" />
            <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-white/30 shadow-xl">
              <img
                src={imageUrl}
                alt={isEmpty ? "TechShop" : current.name}
                className="w-full h-full object-cover object-center"
              />
              {isEmpty && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                    <Flame className="w-12 h-12 text-white/90" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Carousel controls */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/25 hover:bg-white/35 flex items-center justify-center transition-colors shadow-lg"
            aria-label="Trước"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/25 hover:bg-white/35 flex items-center justify-center transition-colors shadow-lg"
            aria-label="Sau"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === index ? "bg-white scale-125 shadow-md" : "bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Decorative - tăng mật độ cho đỡ thưa */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}

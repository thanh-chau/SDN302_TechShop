import { ShoppingBag } from "lucide-react";

export function HeroBanner() {
  return (
    <div className="relative bg-gradient-to-r from-red-600 to-red-500 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-20">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div className="space-y-6 z-10">
            <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold">
              🔥 FLASH SALE
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              MEGA SALE
            </h1>

            <p className="text-2xl md:text-3xl font-semibold">Giảm đến 50%</p>

            <p className="text-lg md:text-xl opacity-90">
              Laptop - Gaming - Phụ kiện
            </p>

            <button className="group bg-white text-red-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              <span>Mua ngay</span>
            </button>
          </div>

          {/* Right Image/Decoration */}
          <div className="relative hidden md:block">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-3xl transform rotate-3"></div>
            <div className="relative bg-white/5 backdrop-blur-sm rounded-3xl p-8 border-2 border-white/20">
              <img
                src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop"
                alt="Laptop"
                className="w-full h-80 object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
    </div>
  );
}

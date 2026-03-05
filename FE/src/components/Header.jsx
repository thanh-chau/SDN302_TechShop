import {
  ShoppingCart,
  Search,
  Phone,
  Gift,
  HeadphonesIcon,
  Laptop,
  Smartphone,
  Tablet,
  Speaker,
  Cable,
  Monitor,
  MapPin,
  User,
} from "lucide-react";
import { UserMenu } from "./UserMenu";
import { useState } from "react";

export function Header({
  cartCount,
  onCartClick,
  user,
  onLoginClick,
  onLogout,
  onCategoryClick,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { name: "Laptop", icon: Laptop, id: "category-laptop" },
    { name: "Điện thoại", icon: Smartphone, id: "category-phone" },
    { name: "Tablet", icon: Tablet, id: "category-tablet" },
    { name: "Âm thanh", icon: Speaker, id: "category-audio" },
    { name: "Phụ kiện", icon: Cable, id: "category-accessories" },
    { name: "Màn hình", icon: Monitor, id: "category-monitor" },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Top Bar - Red Background */}
      <div className="bg-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Giao hàng toàn quốc</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>Hotline: 1900-xxxx</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Gift className="w-4 h-4" />
              <span>Ưu đãi</span>
            </button>
            <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <HeadphonesIcon className="w-4 h-4" />
              <span>Hỗ trợ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header - White Background */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-8">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 className="text-3xl font-bold text-red-600 cursor-pointer">
                TechShop
              </h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm, danh mục..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500 transition-colors"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Login/User Button */}
              {!user ? (
                <button
                  onClick={onLoginClick}
                  className="flex items-center gap-2 bg-white border-2 border-red-600 text-red-600 px-5 py-2.5 rounded-lg font-semibold hover:bg-red-50 transition-all duration-300"
                >
                  <User className="w-5 h-5" />
                  <span>Đăng nhập</span>
                </button>
              ) : (
                <UserMenu
                  user={user}
                  onLoginClick={onLoginClick}
                  onLogout={onLogout}
                />
              )}

              {/* Cart Button */}
              <button
                onClick={onCartClick}
                className="relative flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-red-700 transition-all duration-300 shadow-md"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Giỏ hàng</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-red-900 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Categories - White Background with Red Active Button */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center gap-1">
            <button className="flex items-center gap-2 px-5 py-3 bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <span>Danh mục</span>
            </button>
            {categories.map(({ name, icon: Icon, id }) => (
              <button
                key={name}
                onClick={() => onCategoryClick && onCategoryClick(id)}
                className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 transition-colors text-gray-700 font-medium"
              >
                <Icon className="w-4 h-4" />
                <span>{name}</span>
              </button>
            ))}
            <button
              onClick={() => onCategoryClick && onCategoryClick("flash-sale")}
              className="ml-auto flex items-center gap-2 px-4 py-3 text-red-600 font-bold hover:bg-red-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Flash Sale</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}

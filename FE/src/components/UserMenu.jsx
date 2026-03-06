import {
  User,
  Package,
  Heart,
  Settings,
  LogOut,
  ChevronDown,
  Shield,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function UserMenu({ user, onLoginClick, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) {
    return (
      <button
        onClick={onLoginClick}
        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <User className="w-5 h-5" />
        <span className="hidden md:inline">Đăng nhập</span>
      </button>
    );
  }

  // Function to open admin dashboard
  const openAdminDashboard = () => {
    const event = new CustomEvent("openAdminDashboard");
    window.dispatchEvent(event);
    setIsOpen(false);
  };

  // Function to open order history
  const openOrderHistory = () => {
    const event = new CustomEvent("openOrderHistory");
    window.dispatchEvent(event);
    setIsOpen(false);
  };

  // Function to open profile page
  const openProfile = () => {
    const event = new CustomEvent("openProfile");
    window.dispatchEvent(event);
    setIsOpen(false);
  };

  // Function to open settings modal
  const openSettings = () => {
    const event = new CustomEvent("openSettings");
    window.dispatchEvent(event);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <img
          src={user.avatar}
          alt={user.name}
          className="w-8 h-8 rounded-full"
        />
        <div className="hidden md:block text-left">
          <div className="text-sm font-semibold">{user.name}</div>
          <div className="text-xs text-gray-500">Tài khoản</div>
        </div>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b">
            <div className="flex items-center gap-3">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{user.name}</div>
                <div className="text-sm text-gray-500 truncate">
                  {user.email}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {(user.role === "admin" || user.role === "staff") && (
              <button
                onClick={openAdminDashboard}
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 text-red-600 transition-colors font-semibold"
              >
                <Shield className="w-5 h-5" />
                <span>Quản trị hệ thống</span>
              </button>
            )}

            <button
              onClick={openProfile}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
            >
              <User className="w-5 h-5 text-gray-600" />
              <span>Thông tin tài khoản</span>
            </button>

            <button
              onClick={openOrderHistory}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
            >
              <Package className="w-5 h-5 text-gray-600" />
              <span>Đơn hàng của tôi</span>
            </button>

            <a
              href="#"
              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
            >
              <Heart className="w-5 h-5 text-gray-600" />
              <span>Sản phẩm yêu thích</span>
            </a>

            <button
              onClick={openSettings}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
            >
              <Settings className="w-5 h-5 text-gray-600" />
              <span>Cài đặt</span>
            </button>
          </div>

          {/* Logout */}
          <div className="border-t pt-2">
            <button
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback, useMemo } from "react";
import { categoriesAPI } from "../utils/api";
import { Header } from "../components/Header";
import { HeroBanner } from "../components/HeroBanner";
import { FlashSale } from "../components/FlashSale";
import { ProductGrid } from "../components/ProductGrid";
import { Footer } from "../components/Footer";
import { CartSidebar } from "../components/CartSidebar";
import { ProductDetail } from "../components/ProductDetail";
import { AuthModal } from "../components/AuthModal";
import { AdminDashboard } from "../components/AdminDashboard";
import { StaffDashboard } from "../components/StaffDashboard";
import { CheckoutModal } from "../components/CheckoutModal";
import { OrderHistory } from "../components/OrderHistory";
import { SettingsModal } from "../components/SettingsModal";
import { WishlistModal } from "../components/WishlistModal";
import { ProfileModal } from "../components/ProfileModal";

// Danh mục mặc định khi backend chưa trả về hoặc trả rỗng (keywords để match với tên category từ API)
const DEFAULT_CATEGORIES = [
  { id: "category-laptop", name: "Laptop - Máy Tính", category: "laptop", keywords: ["laptop", "máy tính", "máy tính xách tay", "notebook"] },
  { id: "category-phone", name: "Điện Thoại - Smartphone", category: "phone", keywords: ["phone", "điện thoại", "smartphone", "mobile"] },
  { id: "category-tablet", name: "Tablet - Máy Tính Bảng", category: "tablet", keywords: ["tablet", "máy tính bảng", "tab"] },
  { id: "category-audio", name: "Âm Thanh - Tai Nghe", category: "audio", keywords: ["audio", "âm thanh", "tai nghe", "loa", "headphone"] },
  { id: "category-accessories", name: "Phụ Kiện - Accessories", category: "accessories", keywords: ["accessories", "phụ kiện", "khác", "other"] },
  { id: "category-monitor", name: "Màn Hình - Monitor", category: "monitor", keywords: ["monitor", "màn hình", "display"] },
];

export function HomePage({
  user,
  products,
  productsLoading = false,
  cart,
  orders,
  wishlist,
  wishlistIds,
  cartCount,
  onAddToCart,
  onRemoveFromCart,
  onUpdateQuantity,
  onToggleWishlist,
  onOrderComplete,
  onLogin,
  onLogout,
  onUpdateProducts,
  onUpdateOrders,
  onOrderCancelled,
  onUserUpdated,
}) {
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [adminDashboardOpen, setAdminDashboardOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderHistoryOpen, setOrderHistoryOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    categoriesAPI
      .getList()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  // Listen for custom events dispatched by UserMenu / Header
  useEffect(() => {
    const handleOpenAdminDashboard = () => {
      if (user && (user.role === "admin" || user.role === "staff")) {
        setAdminDashboardOpen(true);
      }
    };
    const handleOpenOrderHistory = () => {
      if (user) setOrderHistoryOpen(true);
    };
    const handleOpenProfile = () => {
      if (user) setProfileOpen(true);
    };
    const handleOpenSettings = () => {
      if (user) setSettingsOpen(true);
    };
    const handleOpenWishlist = () => {
      if (user) setWishlistOpen(true);
    };

    window.addEventListener("openAdminDashboard", handleOpenAdminDashboard);
    window.addEventListener("openOrderHistory", handleOpenOrderHistory);
    window.addEventListener("openProfile", handleOpenProfile);
    window.addEventListener("openSettings", handleOpenSettings);
    window.addEventListener("openWishlist", handleOpenWishlist);

    return () => {
      window.removeEventListener(
        "openAdminDashboard",
        handleOpenAdminDashboard,
      );
      window.removeEventListener("openOrderHistory", handleOpenOrderHistory);
      window.removeEventListener("openProfile", handleOpenProfile);
      window.removeEventListener("openSettings", handleOpenSettings);
      window.removeEventListener("openWishlist", handleOpenWishlist);
    };
  }, [user]);

  const handleAddToCart = useCallback(
    async (product) => {
      if (!user) {
        setAuthModalOpen(true);
        return;
      }
      await onAddToCart(product);
    },
    [user, onAddToCart]
  );

  const handleCheckout = useCallback(() => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    setCartOpen(false);
    setCheckoutOpen(true);
  }, [user]);

  const scrollToCategory = useCallback((categoryId) => {
    const element = document.getElementById(categoryId);
    if (element) {
      const headerOffset = 200;
      const offsetPosition =
        element.getBoundingClientRect().top + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  }, []);

  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const openAuth = useCallback(() => setAuthModalOpen(true), []);
  const closeProductDetail = useCallback(() => setSelectedProduct(null), []);

  // Memo: tránh tạo mảng mới mỗi lần render → giảm re-render con
  const displayCategories = useMemo(
    () =>
      categories?.length > 0
        ? categories.map((c) => ({ id: c.id, name: c.name, category: c.name, keywords: null }))
        : DEFAULT_CATEGORIES,
    [categories]
  );

  const flashSaleProducts = useMemo(
    () =>
      (products || []).filter(
        (p) =>
          p.flashSaleEnd &&
          new Date(p.flashSaleEnd) > new Date() &&
          (p.discount > 0 || p.flashSalePrice)
      ),
    [products]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        cartCount={cartCount}
        onCartClick={openCart}
        user={user}
        onLoginClick={openAuth}
        onLogout={onLogout}
        onCategoryClick={scrollToCategory}
        hasFlashSale={flashSaleProducts.length > 0}
        categories={displayCategories}
      />

      <main>
        <HeroBanner
          flashSaleProducts={flashSaleProducts}
          onProductClick={setSelectedProduct}
          onAddToCart={handleAddToCart}
        />
        <FlashSale
          onAddToCart={handleAddToCart}
          onProductClick={setSelectedProduct}
          products={products}
          onToggleWishlist={onToggleWishlist}
          wishlistIds={wishlistIds}
        />
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
          {productsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 py-8">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow animate-pulse overflow-hidden">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-6 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            displayCategories.map((cat) => (
              <div key={cat.id} id={cat.id.startsWith("category-") ? cat.id : `category-${cat.id}`}>
                <ProductGrid
                  title={cat.name}
                  category={cat.category}
                  categoryKeywords={cat.keywords}
                  onAddToCart={handleAddToCart}
                  onProductClick={setSelectedProduct}
                  products={products}
                  onToggleWishlist={onToggleWishlist}
                  wishlistIds={wishlistIds}
                />
              </div>
            ))
          )}
        </div>
      </main>

      <Footer />

      {/* Sidebars & Modals */}
      <CartSidebar
        isOpen={cartOpen}
        onClose={closeCart}
        cart={cart}
        onUpdateQuantity={onUpdateQuantity}
        onRemove={onRemoveFromCart}
        onCheckout={handleCheckout}
      />

      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={closeProductDetail}
          onAddToCart={handleAddToCart}
        />
      )}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLogin={onLogin}
      />

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cart={cart}
        user={user}
        onOrderComplete={onOrderComplete}
      />

      <OrderHistory
        isOpen={orderHistoryOpen}
        onClose={() => setOrderHistoryOpen(false)}
        orders={orders}
        onOrderCancelled={onOrderCancelled}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        user={user}
        onProfileUpdated={onUserUpdated}
      />

      <WishlistModal
        isOpen={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
        wishlist={wishlist}
        onRemoveFromWishlist={(id) => onToggleWishlist({ id })}
        onAddToCart={handleAddToCart}
        onProductClick={(product) => {
          setSelectedProduct(product);
          setWishlistOpen(false);
        }}
      />

      <ProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={user}
      />

      {user &&
        (user.role === "admin" || user.role === "staff") &&
        (user.role === "admin" ? (
          <AdminDashboard
            isOpen={adminDashboardOpen}
            onClose={() => setAdminDashboardOpen(false)}
            user={user}
            products={products}
            onUpdateProducts={onUpdateProducts}
            orders={orders}
            onUpdateOrders={onUpdateOrders}
          />
        ) : (
          <StaffDashboard
            isOpen={adminDashboardOpen}
            onClose={() => setAdminDashboardOpen(false)}
            user={user}
            products={products}
            orders={orders}
            onUpdateOrders={onUpdateOrders}
          />
        ))}

      </div>
  );
}

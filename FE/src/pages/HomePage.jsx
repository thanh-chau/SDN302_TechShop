import { useState, useEffect } from "react";
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
import { ChatBox, ChatButton } from "../components/ChatBox";

const CATEGORIES = [
  { id: "category-laptop", title: "Laptop - Máy Tính", category: "laptop" },
  { id: "category-phone", title: "Điện Thoại - Smartphone", category: "phone" },
  {
    id: "category-tablet",
    title: "Tablet - Máy Tính Bảng",
    category: "tablet",
  },
  { id: "category-audio", title: "Âm Thanh - Tai Nghe", category: "audio" },
  {
    id: "category-accessories",
    title: "Phụ Kiện - Accessories",
    category: "accessories",
  },
  { id: "category-monitor", title: "Màn Hình - Monitor", category: "monitor" },
];

export function HomePage({
  user,
  products,
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
  const [chatOpen, setChatOpen] = useState(false);

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

  const handleAddToCart = async (product) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    await onAddToCart(product);
  };

  const handleCheckout = () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  const scrollToCategory = (categoryId) => {
    const element = document.getElementById(categoryId);
    if (element) {
      const headerOffset = 200;
      const offsetPosition =
        element.getBoundingClientRect().top + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        cartCount={cartCount}
        onCartClick={() => setCartOpen(true)}
        user={user}
        onLoginClick={() => setAuthModalOpen(true)}
        onLogout={onLogout}
        onCategoryClick={scrollToCategory}
      />

      <main>
        <HeroBanner />
        <FlashSale
          onAddToCart={handleAddToCart}
          onProductClick={setSelectedProduct}
          products={products}
          onToggleWishlist={onToggleWishlist}
          wishlistIds={wishlistIds}
        />
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
          {CATEGORIES.map(({ id, title, category }) => (
            <div key={id} id={id}>
              <ProductGrid
                title={title}
                category={category}
                onAddToCart={handleAddToCart}
                onProductClick={setSelectedProduct}
                products={products}
                onToggleWishlist={onToggleWishlist}
                wishlistIds={wishlistIds}
              />
            </div>
          ))}
        </div>
      </main>

      <Footer />

      {/* Sidebars & Modals */}
      <CartSidebar
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onUpdateQuantity={onUpdateQuantity}
        onRemove={onRemoveFromCart}
        onCheckout={handleCheckout}
      />

      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
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

      {!chatOpen && <ChatButton onClick={() => setChatOpen(true)} />}
      <ChatBox isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}

import { useState, useEffect, useMemo } from "react";
import { Header } from "./components/Header";
import { HeroBanner } from "./components/HeroBanner";
import { FlashSale } from "./components/FlashSale";
import { ProductGrid } from "./components/ProductGrid";
import { Footer } from "./components/Footer";
import { CartSidebar } from "./components/CartSidebar";
import { ProductDetail } from "./components/ProductDetail";
import { AuthModal } from "./components/AuthModal";
import { AdminDashboard } from "./components/AdminDashboard";
import { StaffDashboard } from "./components/StaffDashboard";
import { CheckoutModal } from "./components/CheckoutModal";
import { OrderHistory } from "./components/OrderHistory";
import { SettingsModal } from "./components/SettingsModal";
import { WishlistModal } from "./components/WishlistModal";
import { ChatBox, ChatButton } from "./components/ChatBox";
import { AdminPage } from "./pages/AdminPage";
import { StaffPage } from "./pages/StaffPage";
import { ProfilePage } from "./pages/ProfilePage";
import { PaymentReturnPage } from "./pages/PaymentReturnPage";
import toast from "react-hot-toast";
import { productAPI, cartAPI, orderAPI, fileAPI } from "./utils/api";

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [adminDashboardOpen, setAdminDashboardOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderHistoryOpen, setOrderHistoryOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [viewMode, setViewMode] = useState("shop"); // "shop", "admin", or "staff"
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount only
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        // Load wishlist for this user
        const saved = localStorage.getItem(`wishlist_${userData.id}`);
        if (saved) setWishlist(JSON.parse(saved));
        // Set viewMode based on role
        if (userData.role === "admin") {
          setViewMode("admin");
        } else if (userData.role === "staff") {
          setViewMode("staff");
        } else {
          setViewMode("shop");
        }
      } catch (e) {
        console.error("Failed to parse user data");
      }
    }
  }, []);

  // Load products from API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await productAPI.getAll();

        // Transform API products to UI format
        const transformedProducts = (data || []).map((product) => ({
          ...product,
          image:
            product.imgUrl ||
            product.image ||
            "https://placehold.co/400x400?text=No+Image",
          price: product.price || 0,
          rating: 4.5, // Default rating since API doesn't provide it
          reviews: 0, // Default reviews
        }));

        setProducts(transformedProducts);
      } catch (error) {
        console.error("Failed to load products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Load cart function
  const loadCart = async () => {
    if (user && user.id) {
      try {
        const cartData = await cartAPI.getByUserId(user.id);
        if (cartData && cartData.cartItems) {
          // Transform API cart items to local cart format
          const transformedCart = cartData.cartItems.map((item) => ({
            id: item.productId,
            name: item.productName,
            price: item.priceAtTime,
            quantity: item.quantity,
            cartItemId: item.id, // Store the cart item ID for updates/deletes
            // Find the product to get image and other details
            image:
              products.find((p) => p.id === item.productId)?.imgUrl ||
              products.find((p) => p.id === item.productId)?.image ||
              "https://placehold.co/400x400?text=No+Image",
          }));
          setCart(transformedCart);
        }
      } catch (error) {
        console.error("Failed to load cart:", error);
      }
    }
  };

  // Load cart from API when user logs in
  useEffect(() => {
    if (user && products.length > 0) {
      loadCart();
    }
  }, [user, products]);

  // Setup admin dashboard event listener
  useEffect(() => {
    const handleOpenAdminDashboard = () => {
      if (user && (user.role === "admin" || user.role === "staff")) {
        setAdminDashboardOpen(true);
      }
    };

    const handleOpenOrderHistory = () => {
      if (user) {
        setOrderHistoryOpen(true);
      }
    };

    const handleOpenProfile = () => {
      if (user) {
        setProfileOpen(true);
      }
    };

    const handleOpenSettings = () => {
      if (user) {
        setSettingsOpen(true);
      }
    };

    const handleOpenWishlist = () => {
      if (user) {
        setWishlistOpen(true);
      }
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

  const toggleWishlist = (product) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    setWishlist((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      const updated = exists
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product];
      localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(updated));
      toast.success(exists ? "Đã xóa khỏi yêu thích" : "Đã thêm vào yêu thích");
      return updated;
    });
  };

  const wishlistIds = useMemo(
    () => new Set(wishlist.map((p) => p.id)),
    [wishlist],
  );

  const addToCart = async (product) => {
    if (!user || !user.id) {
      // If not logged in, show login modal
      setAuthModalOpen(true);
      return;
    }

    try {
      // Add to cart via API
      const updatedCart = await cartAPI.addProduct(user.id, product.id, 1);

      // Transform and update cart
      if (updatedCart && updatedCart.cartItems) {
        const transformedCart = updatedCart.cartItems.map((item) => ({
          id: item.productId,
          name: item.productName,
          price: item.priceAtTime,
          quantity: item.quantity,
          cartItemId: item.id,
          image:
            products.find((p) => p.id === item.productId)?.imgUrl ||
            products.find((p) => p.id === item.productId)?.image ||
            "https://placehold.co/400x400?text=No+Image",
        }));
        setCart(transformedCart);
      }
      toast.success("Đã thêm vào giỏ hàng");
      setCartOpen(true);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast.error("Không thể thêm vào giỏ hàng: " + error.message);
    }
  };

  const removeFromCart = async (productId) => {
    const cartItem = cart.find((item) => item.id === productId);
    if (!cartItem || !cartItem.cartItemId) {
      // Fallback to local cart removal
      setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
      return;
    }

    try {
      await cartAPI.removeItem(cartItem.cartItemId);
      setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    } catch (error) {
      console.error("Failed to remove from cart:", error);
      toast.error("Không thể xóa khỏi giỏ hàng: " + error.message);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const cartItem = cart.find((item) => item.id === productId);
    if (!cartItem || !cartItem.cartItemId) {
      // Fallback to local cart update
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === productId ? { ...item, quantity } : item,
        ),
      );
      return;
    }

    try {
      const updatedCart = await cartAPI.updateQuantity(
        cartItem.cartItemId,
        quantity,
      );

      // Transform and update cart
      if (updatedCart && updatedCart.cartItems) {
        const transformedCart = updatedCart.cartItems.map((item) => ({
          id: item.productId,
          name: item.productName,
          price: item.priceAtTime,
          quantity: item.quantity,
          cartItemId: item.id,
          image:
            products.find((p) => p.id === item.productId)?.imgUrl ||
            products.find((p) => p.id === item.productId)?.image ||
            "https://placehold.co/400x400?text=No+Image",
        }));
        setCart(transformedCart);
      }
    } catch (error) {
      console.error("Failed to update quantity:", error);
      toast.error("Không thể cập nhật số lượng: " + error.message);
    }
  };

  const handleLogin = (userInfo) => {
    setUser(userInfo);
    setAuthModalOpen(false);
    // Set viewMode based on role
    if (userInfo.role === "admin") {
      setViewMode("admin");
    } else if (userInfo.role === "staff") {
      setViewMode("staff");
    } else {
      setViewMode("shop");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setViewMode("shop");
    localStorage.removeItem("user");
  };

  const handleBackToShop = () => {
    setViewMode("shop");
  };

  const handleUpdateProducts = (updatedProducts) => {
    setProducts(updatedProducts);
  };

  const handleUpdateOrders = (updatedOrders) => {
    setOrders(updatedOrders);
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
      const headerOffset = 200; // Offset cho sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const handleOrderComplete = async (orderData = {}) => {
    // Support both old (string) and new (object) call signatures
    const paymentMethod =
      typeof orderData === "string"
        ? orderData
        : orderData.paymentMethod || "cod";
    const shippingName =
      typeof orderData === "object" ? orderData.name || "" : "";
    const shippingPhone =
      typeof orderData === "object" ? orderData.phone || "" : "";
    const shippingAddress =
      typeof orderData === "object" ? orderData.address || "" : "";
    const note = typeof orderData === "object" ? orderData.note || "" : "";

    if (!user || !user.id) {
      toast.error("Vui lòng đăng nhập để đặt hàng");
      return;
    }

    if (cart.length === 0) {
      toast.error(
        "Giỏ hàng trống. Vui lòng thêm sản phẩm vào giỏ hàng trước khi đặt hàng.",
      );
      return;
    }

    try {
      console.log("Creating order for user:", user.id);
      console.log("Frontend cart items:", cart);

      // Check backend cart before creating order
      console.log("Checking backend cart...");
      const backendCart = await cartAPI.getByUserId(user.id);
      console.log("Backend cart:", backendCart);

      if (
        !backendCart ||
        !backendCart.cartItems ||
        backendCart.cartItems.length === 0
      ) {
        toast.error("Giỏ hàng trống. Vui lòng thêm sản phẩm vào giỏ hàng lại.");
        // Try to sync cart
        console.log("Attempting to reload cart...");
        await loadCart();
        return;
      }

      // Create order via API with full shipping info
      const createdOrder = await orderAPI.create(
        user.id,
        shippingName,
        shippingPhone,
        shippingAddress,
        paymentMethod,
        note,
      );
      console.log("Order created successfully:", createdOrder);

      // ========== MOMO PAYMENT INTEGRATION ==========
      if (paymentMethod === "momo") {
        console.log("Initiating MoMo payment for order:", createdOrder.id);

        try {
          // Call checkout API to get MoMo payment URL
          const checkoutResponse = await orderAPI.checkout(
            createdOrder.id,
            user.id,
            `${window.location.origin}/payment/return`,
            `${window.location.origin}/payment/notify`,
          );

          console.log("MoMo checkout response:", checkoutResponse);

          if (checkoutResponse.resultCode === 0 && checkoutResponse.payUrl) {
            // Success - redirect to MoMo payment page
            toast.success(
              `Đơn #${createdOrder.id} đã tạo. Chuyển đến thanh toán MoMo...`,
              { duration: 5000 },
            );

            // Redirect to MoMo
            window.location.href = checkoutResponse.payUrl;
            return; // Stop here, don't clear cart yet
          } else {
            throw new Error(
              checkoutResponse.message || "Không thể tạo thanh toán MoMo",
            );
          }
        } catch (momoError) {
          console.error("MoMo payment failed:", momoError);
          toast.error(
            `Không thể tạo thanh toán MoMo: ${momoError.message}. Đơn #${createdOrder.id} vẫn được tạo.`,
            { duration: 5000 },
          );
        }
      }
      // ========== COD or Payment Failed - Continue Normal Flow ==========

      // Clear cart after successful order
      // Note: Backend might auto-clear cart after order creation
      if (user.id) {
        try {
          await cartAPI.clearCart(user.id);
          console.log("Cart cleared successfully");
        } catch (clearError) {
          // If 404, cart was already cleared by backend
          if (clearError.message.includes("404")) {
            console.log("Cart already cleared by backend (expected behavior)");
          } else {
            console.error("Failed to clear cart:", clearError);
          }
        }
      }
      setCart([]);

      // Reload orders
      const userOrders = await orderAPI.getByUserId(user.id);
      setOrders(userOrders || []);

      // Show success message with order details
      const orderStatusText = {
        pending: "Chờ xác nhận",
        processing: "Đang xử lý",
        shipping: "Đang giao hàng",
        completed: "Hoàn thành",
        cancelled: "Đã hủy",
      };

      const statusText = orderStatusText[createdOrder.status] || "Chờ xác nhận";
      const totalAmount =
        createdOrder.totalAmount?.toLocaleString("vi-VN") || "0";

      toast.success(
        `Đơn hàng #${createdOrder.id} đã tạo. Tổng: ${totalAmount}₫ - ${statusText}`,
        { duration: 5000 },
      );
    } catch (error) {
      console.error("Failed to create order:", error);
      toast.error("Không thể đặt hàng: " + error.message);
      throw error; // Re-throw to let CheckoutModal handle it
    }
  };

  // Load user orders when user logs in
  useEffect(() => {
    const loadUserOrders = async () => {
      if (user && user.id) {
        try {
          const userOrders = await orderAPI.getByUserId(user.id);
          setOrders(userOrders || []);
        } catch (error) {
          console.error("Failed to load orders:", error);
        }
      }
    };

    loadUserOrders();
  }, [user]);

  const userOrders = orders;

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Role-based routing
  if (user && viewMode === "admin" && user.role === "admin") {
    return <AdminPage user={user} onLogout={handleLogout} />;
  }

  if (user && viewMode === "staff" && user.role === "staff") {
    return (
      <StaffPage
        user={user}
        onLogout={handleLogout}
        onBackToShop={handleBackToShop}
      />
    );
  }

  // Default: show shop interface
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Payment Return Page */}
      {window.location.pathname === "/payment/return" && <PaymentReturnPage />}

      {/* Normal App Content - hide when on payment return page */}
      {window.location.pathname !== "/payment/return" && (
        <>
          <Header
            cartCount={cartCount}
            onCartClick={() => setCartOpen(true)}
            user={user}
            onLoginClick={() => setAuthModalOpen(true)}
            onLogout={handleLogout}
            onCategoryClick={scrollToCategory}
          />

          <main>
            <HeroBanner />
            <FlashSale
              onAddToCart={addToCart}
              onProductClick={setSelectedProduct}
              products={products}
              onToggleWishlist={toggleWishlist}
              wishlistIds={wishlistIds}
            />

            <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
              <div id="category-laptop">
                <ProductGrid
                  title="Laptop - Máy Tính"
                  category="laptop"
                  onAddToCart={addToCart}
                  onProductClick={setSelectedProduct}
                  products={products}
                  onToggleWishlist={toggleWishlist}
                  wishlistIds={wishlistIds}
                />
              </div>
              <div id="category-phone">
                <ProductGrid
                  title="Điện Thoại - Smartphone"
                  category="phone"
                  onAddToCart={addToCart}
                  onProductClick={setSelectedProduct}
                  products={products}
                  onToggleWishlist={toggleWishlist}
                  wishlistIds={wishlistIds}
                />
              </div>
              <div id="category-tablet">
                <ProductGrid
                  title="Tablet - Máy Tính Bảng"
                  category="tablet"
                  onAddToCart={addToCart}
                  onProductClick={setSelectedProduct}
                  products={products}
                  onToggleWishlist={toggleWishlist}
                  wishlistIds={wishlistIds}
                />
              </div>
              <div id="category-audio">
                <ProductGrid
                  title="Âm Thanh - Tai Nghe"
                  category="audio"
                  onAddToCart={addToCart}
                  onProductClick={setSelectedProduct}
                  products={products}
                  onToggleWishlist={toggleWishlist}
                  wishlistIds={wishlistIds}
                />
              </div>
              <div id="category-accessories">
                <ProductGrid
                  title="Phụ Kiện - Accessories"
                  category="accessories"
                  onAddToCart={addToCart}
                  onProductClick={setSelectedProduct}
                  products={products}
                  onToggleWishlist={toggleWishlist}
                  wishlistIds={wishlistIds}
                />
              </div>
              <div id="category-monitor">
                <ProductGrid
                  title="Màn Hình - Monitor"
                  category="monitor"
                  onAddToCart={addToCart}
                  onProductClick={setSelectedProduct}
                  products={products}
                  onToggleWishlist={toggleWishlist}
                  wishlistIds={wishlistIds}
                />
              </div>
            </div>
          </main>

          <Footer />

          <CartSidebar
            isOpen={cartOpen}
            onClose={() => setCartOpen(false)}
            cart={cart}
            onUpdateQuantity={updateQuantity}
            onRemove={removeFromCart}
            onCheckout={handleCheckout}
          />

          {selectedProduct && (
            <ProductDetail
              product={selectedProduct}
              onClose={() => setSelectedProduct(null)}
              onAddToCart={addToCart}
            />
          )}

          <AuthModal
            isOpen={authModalOpen}
            onClose={() => setAuthModalOpen(false)}
            onLogin={handleLogin}
          />

          <CheckoutModal
            isOpen={checkoutOpen}
            onClose={() => setCheckoutOpen(false)}
            cart={cart}
            user={user}
            onOrderComplete={handleOrderComplete}
          />

          <OrderHistory
            isOpen={orderHistoryOpen}
            onClose={() => setOrderHistoryOpen(false)}
            orders={userOrders}
            onOrderCancelled={(cancelledId) => {
              setOrders((prev) =>
                prev.map((o) =>
                  o.id === cancelledId ? { ...o, status: "cancelled" } : o,
                ),
              );
            }}
          />

          <SettingsModal
            isOpen={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            user={user}
            onProfileUpdated={(updatedUser) => {
              setUser((prev) => ({ ...prev, ...updatedUser }));
            }}
          />

          <WishlistModal
            isOpen={wishlistOpen}
            onClose={() => setWishlistOpen(false)}
            wishlist={wishlist}
            onRemoveFromWishlist={(id) => toggleWishlist({ id })}
            onAddToCart={addToCart}
            onProductClick={(product) => {
              setSelectedProduct(product);
              setWishlistOpen(false);
            }}
          />

          {/* Profile Modal */}
          {profileOpen && (
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setProfileOpen(false)}
            >
              <div
                className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Gradient Header */}
                <div className="bg-gradient-to-r from-red-600 to-orange-500 p-6 text-white relative">
                  <button
                    onClick={() => setProfileOpen(false)}
                    className="absolute top-4 right-4 p-2 hover:bg-white/20 text-white rounded-full transition-colors"
                  >
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-full border-4 border-white/60 bg-white/20 flex items-center justify-center shadow-lg flex-shrink-0">
                      <svg
                        className="w-10 h-10 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">
                        {user?.name || user?.fullName || "Người dùng"}
                      </h2>
                      <p className="text-white/80 text-sm mt-0.5">
                        {user?.email}
                      </p>
                      <span className="inline-flex items-center gap-1.5 mt-2 bg-white/25 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                        {user?.role === "admin" || user?.role === "ADMIN"
                          ? "Quản trị viên"
                          : user?.role === "staff" || user?.role === "STAFF"
                            ? "Nhân viên"
                            : "Khách hàng"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info Body */}
                <div className="p-6 space-y-4">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                    Thông tin cá nhân
                  </h3>

                  <div className="grid grid-cols-1 gap-3">
                    {/* ID */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="bg-gray-200 p-2 rounded-lg">
                        <svg
                          className="w-4 h-4 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                          />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400 font-medium">
                          ID tài khoản
                        </p>
                        <p className="text-sm font-semibold text-gray-700 truncate">
                          {user?.id}
                        </p>
                      </div>
                    </div>

                    {/* Name */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <svg
                          className="w-4 h-4 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium">
                          Họ và tên
                        </p>
                        <p className="text-sm font-semibold text-gray-700">
                          {user?.name || user?.fullName || "—"}
                        </p>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="bg-orange-100 p-2 rounded-lg">
                        <svg
                          className="w-4 h-4 text-orange-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400 font-medium">
                          Email
                        </p>
                        <p className="text-sm font-semibold text-gray-700 truncate">
                          {user?.email}
                        </p>
                      </div>
                    </div>

                    {/* Phone */}
                    {user?.phone && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <svg
                            className="w-4 h-4 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-medium">
                            Số điện thoại
                          </p>
                          <p className="text-sm font-semibold text-gray-700">
                            {user.phone}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Address */}
                    {user?.address && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="bg-purple-100 p-2 rounded-lg">
                          <svg
                            className="w-4 h-4 text-purple-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-400 font-medium">
                            Địa chỉ
                          </p>
                          <p className="text-sm font-semibold text-gray-700 truncate">
                            {user.address}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 text-center pt-2">
                    Để chỉnh sửa thông tin, vui lòng vào{" "}
                    <span className="text-red-500 font-medium">Cài đặt</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {user && (user.role === "admin" || user.role === "staff") && (
            <>
              {user.role === "admin" ? (
                <AdminDashboard
                  isOpen={adminDashboardOpen}
                  onClose={() => setAdminDashboardOpen(false)}
                  user={user}
                  products={products}
                  onUpdateProducts={handleUpdateProducts}
                  orders={orders}
                  onUpdateOrders={handleUpdateOrders}
                />
              ) : (
                <StaffDashboard
                  isOpen={adminDashboardOpen}
                  onClose={() => setAdminDashboardOpen(false)}
                  user={user}
                  products={products}
                  orders={orders}
                  onUpdateOrders={handleUpdateOrders}
                />
              )}
            </>
          )}
        </>
      )}

      {/* Chat AI */}
      {!chatOpen && <ChatButton onClick={() => setChatOpen(true)} />}
      <ChatBox isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}

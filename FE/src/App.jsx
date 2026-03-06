import { useState, useEffect } from "react";
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
        console.log("📦 Loaded products from API:", data);

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

        console.log("✅ Transformed products:", transformedProducts);
        console.log("📊 Categories found:", [
          ...new Set(transformedProducts.map((p) => p.category)),
        ]);

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

    window.addEventListener("openAdminDashboard", handleOpenAdminDashboard);
    window.addEventListener("openOrderHistory", handleOpenOrderHistory);
    window.addEventListener("openProfile", handleOpenProfile);
    window.addEventListener("openSettings", handleOpenSettings);

    return () => {
      window.removeEventListener(
        "openAdminDashboard",
        handleOpenAdminDashboard,
      );
      window.removeEventListener("openOrderHistory", handleOpenOrderHistory);
      window.removeEventListener("openProfile", handleOpenProfile);
      window.removeEventListener("openSettings", handleOpenSettings);
    };
  }, [user]);

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
            />

            <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
              <div id="category-laptop">
                <ProductGrid
                  title="Laptop - Máy Tính"
                  category="laptop"
                  onAddToCart={addToCart}
                  onProductClick={setSelectedProduct}
                  products={products}
                />
              </div>
              <div id="category-phone">
                <ProductGrid
                  title="Điện Thoại - Smartphone"
                  category="phone"
                  onAddToCart={addToCart}
                  onProductClick={setSelectedProduct}
                  products={products}
                />
              </div>
              <div id="category-tablet">
                <ProductGrid
                  title="Tablet - Máy Tính Bảng"
                  category="tablet"
                  onAddToCart={addToCart}
                  onProductClick={setSelectedProduct}
                  products={products}
                />
              </div>
              <div id="category-audio">
                <ProductGrid
                  title="Âm Thanh - Tai Nghe"
                  category="audio"
                  onAddToCart={addToCart}
                  onProductClick={setSelectedProduct}
                  products={products}
                />
              </div>
              <div id="category-accessories">
                <ProductGrid
                  title="Phụ Kiện - Accessories"
                  category="accessories"
                  onAddToCart={addToCart}
                  onProductClick={setSelectedProduct}
                  products={products}
                />
              </div>
              <div id="category-monitor">
                <ProductGrid
                  title="Màn Hình - Monitor"
                  category="monitor"
                  onAddToCart={addToCart}
                  onProductClick={setSelectedProduct}
                  products={products}
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

          {/* Profile Modal */}
          {profileOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto">
              <div className="min-h-screen w-full py-8">
                <div className="relative bg-gray-50 min-h-screen">
                  <button
                    onClick={() => setProfileOpen(false)}
                    className="fixed top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors z-10"
                  >
                    <svg
                      className="w-6 h-6"
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
                  <ProfilePage user={user} />
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

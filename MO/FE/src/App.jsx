import { AdminPage } from "./pages/AdminPage";
import { StaffPage } from "./pages/StaffPage";
import { PaymentReturnPage } from "./pages/PaymentReturnPage";
import { HomePage } from "./pages/HomePage";
import { useUserSession } from "./hooks/useUserSession";
import { useProductLoader } from "./hooks/useProductLoader";
import { useCartManager } from "./hooks/useCartManager";
import { useOrderManager } from "./hooks/useOrderManager";
import { useWishlist } from "./hooks/useWishlist";

export default function App() {
  const { user, viewMode, setViewMode, handleLogin, handleLogout, updateUser } =
    useUserSession();
  const { products, setProducts } = useProductLoader();
  const {
    cart,
    loadCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCartManager(user, products);
  const { orders, setOrders, cancelOrder, handleOrderComplete } =
    useOrderManager(user, cart, loadCart, clearCart);
  const { wishlist, wishlistIds, toggleWishlist } = useWishlist(user);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (window.location.pathname === "/payment/return")
    return <PaymentReturnPage />;
  if (user?.role === "admin" && viewMode === "admin")
    return <AdminPage user={user} onLogout={handleLogout} />;
  if (user?.role === "staff" && viewMode === "staff")
    return (
      <StaffPage
        user={user}
        onLogout={handleLogout}
        onBackToShop={() => setViewMode("shop")}
      />
    );

  return (
    <HomePage
      user={user}
      products={products}
      cart={cart}
      orders={orders}
      wishlist={wishlist}
      wishlistIds={wishlistIds}
      cartCount={cartCount}
      onAddToCart={addToCart}
      onRemoveFromCart={removeFromCart}
      onUpdateQuantity={updateQuantity}
      onToggleWishlist={toggleWishlist}
      onOrderComplete={handleOrderComplete}
      onLogin={handleLogin}
      onLogout={handleLogout}
      onUpdateProducts={setProducts}
      onUpdateOrders={setOrders}
      onOrderCancelled={cancelOrder}
      onUserUpdated={updateUser}
    />
  );
}

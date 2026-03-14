import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { cartAPI } from "../utils/api";

const PLACEHOLDER = "https://placehold.co/400x400?text=No+Image";

function toCartItem(item, products) {
  return {
    id: item.productId,
    name: item.productName,
    price: item.priceAtTime,
    quantity: item.quantity,
    cartItemId: item.id,
    image:
      products.find((p) => p.id === item.productId)?.imgUrl ||
      products.find((p) => p.id === item.productId)?.image ||
      PLACEHOLDER,
  };
}

export function useCartManager(user, products) {
  const [cart, setCart] = useState([]);

  const loadCart = async () => {
    if (!user?.id) return;
    try {
      const cartData = await cartAPI.getByUserId(user.id);
      if (cartData?.cartItems) {
        setCart(cartData.cartItems.map((item) => toCartItem(item, products)));
      }
    } catch (err) {
      console.error("Failed to load cart:", err);
    }
  };

  useEffect(() => {
    if (user && products.length > 0) loadCart();
  }, [user, products]);

  const addToCart = async (product) => {
    try {
      const updated = await cartAPI.addProduct(user.id, product.id, 1);
      if (updated?.cartItems)
        setCart(updated.cartItems.map((item) => toCartItem(item, products)));
      toast.success("Đã thêm vào giỏ hàng");
    } catch (err) {
      toast.error("Không thể thêm vào giỏ hàng: " + err.message);
    }
  };

  const removeFromCart = async (productId) => {
    const cartItem = cart.find((i) => i.id === productId);
    if (!cartItem?.cartItemId) {
      setCart((prev) => prev.filter((i) => i.id !== productId));
      return;
    }
    try {
      await cartAPI.removeItem(cartItem.cartItemId);
      setCart((prev) => prev.filter((i) => i.id !== productId));
    } catch (err) {
      toast.error("Không thể xóa khỏi giỏ hàng: " + err.message);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const cartItem = cart.find((i) => i.id === productId);
    if (!cartItem?.cartItemId) {
      setCart((prev) =>
        prev.map((i) => (i.id === productId ? { ...i, quantity } : i)),
      );
      return;
    }
    try {
      const updated = await cartAPI.updateQuantity(
        cartItem.cartItemId,
        quantity,
      );
      if (updated?.cartItems)
        setCart(updated.cartItems.map((item) => toCartItem(item, products)));
    } catch (err) {
      toast.error("Không thể cập nhật số lượng: " + err.message);
    }
  };

  const clearCart = () => setCart([]);

  return {
    cart,
    loadCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };
}

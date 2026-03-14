import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { orderAPI, cartAPI } from "../utils/api";

export function useOrderManager(user, cart, loadCart, clearCart) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    orderAPI
      .getByUserId(user.id)
      .then((data) => setOrders(data || []))
      .catch(() => {});
  }, [user]);

  const cancelOrder = (cancelledId) =>
    setOrders((prev) =>
      prev.map((o) =>
        o.id === cancelledId ? { ...o, status: "cancelled" } : o,
      ),
    );

  const handleOrderComplete = async (orderData = {}) => {
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

    if (!user?.id) {
      toast.error("Vui lòng đăng nhập để đặt hàng");
      return;
    }
    if (cart.length === 0) {
      toast.error(
        "Giỏ hàng trống. Vui lòng thêm sản phẩm vào giỏ hàng trước khi đặt hàng.",
      );
      return;
    }

    const backendCart = await cartAPI.getByUserId(user.id);
    if (!backendCart?.cartItems?.length) {
      toast.error("Giỏ hàng trống. Vui lòng thêm sản phẩm vào giỏ hàng lại.");
      await loadCart();
      return;
    }

    const createdOrder = await orderAPI.create(
      user.id,
      shippingName,
      shippingPhone,
      shippingAddress,
      paymentMethod,
      note,
    );

    if (paymentMethod === "momo") {
      try {
        const res = await orderAPI.checkout(
          createdOrder.id,
          user.id,
          `${window.location.origin}/payment/return`,
          `${window.location.origin}/payment/notify`,
        );
        if (res.resultCode === 0 && res.payUrl) {
          toast.success(
            `Đơn #${createdOrder.id} đã tạo. Chuyển đến thanh toán MoMo...`,
            { duration: 5000 },
          );
          window.location.href = res.payUrl;
          return;
        }
        throw new Error(res.message || "Không thể tạo thanh toán MoMo");
      } catch (err) {
        toast.error(
          `Không thể tạo thanh toán MoMo: ${err.message}. Đơn #${createdOrder.id} vẫn được tạo.`,
          { duration: 5000 },
        );
      }
    }

    try {
      await cartAPI.clearCart(user.id);
    } catch (err) {
      if (!err.message.includes("404"))
        console.error("Failed to clear cart:", err);
    }
    clearCart();

    const userOrders = await orderAPI.getByUserId(user.id);
    setOrders(userOrders || []);

    const total = createdOrder.totalAmount?.toLocaleString("vi-VN") || "0";
    toast.success(`Đơn hàng #${createdOrder.id} đã tạo. Tổng: ${total}₫`, {
      duration: 5000,
    });
  };

  return { orders, setOrders, cancelOrder, handleOrderComplete };
}

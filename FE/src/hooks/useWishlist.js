import { useState, useMemo, useEffect } from "react";
import toast from "react-hot-toast";

export function useWishlist(user) {
  const [wishlist, setWishlist] = useState([]);

  // Load wishlist from localStorage when user changes
  useEffect(() => {
    if (!user?.id) {
      setWishlist([]);
      return;
    }
    try {
      const saved = localStorage.getItem(`wishlist_${user.id}`);
      if (saved) setWishlist(JSON.parse(saved));
    } catch {}
  }, [user?.id]);

  const toggleWishlist = (product) => {
    if (!product?.id) return;
    setWishlist((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      const updated = exists
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product];
      if (user)
        localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(updated));
      toast.success(exists ? "Đã xóa khỏi yêu thích" : "Đã thêm vào yêu thích");
      return updated;
    });
  };

  const wishlistIds = useMemo(
    () => new Set(wishlist.map((p) => p.id)),
    [wishlist],
  );

  return { wishlist, wishlistIds, toggleWishlist };
}

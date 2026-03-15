import { useState, useEffect } from "react";

/** Chuẩn hóa role từ BE/localStorage (có thể là "Admin", "ADMIN"...) về lowercase. */
function normalizeRole(role) {
  if (role == null || typeof role !== "string") return "buyer";
  return role.trim().toLowerCase();
}

function getRoleView(role) {
  const r = normalizeRole(role);
  if (r === "admin") return "admin";
  if (r === "staff") return "staff";
  return "shop";
}

export function useUserSession() {
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState("shop");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) return;
    try {
      const userData = JSON.parse(savedUser);
      const role = normalizeRole(userData.role);
      const normalizedUser = { ...userData, role };
      setUser(normalizedUser);
      setViewMode(getRoleView(role));
    } catch {
      console.error("Failed to parse user data");
    }
  }, []);

  const handleLogin = (userInfo) => {
    const role = normalizeRole(userInfo?.role);
    const normalizedUser = { ...userInfo, role };
    setUser(normalizedUser);
    setViewMode(getRoleView(role));
  };

  const handleLogout = () => {
    setUser(null);
    setViewMode("shop");
    localStorage.removeItem("user");
  };

  const updateUser = (partial) => setUser((prev) => ({ ...prev, ...partial }));

  return { user, viewMode, setViewMode, handleLogin, handleLogout, updateUser };
}

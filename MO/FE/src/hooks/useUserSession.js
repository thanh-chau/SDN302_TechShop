import { useState, useEffect } from "react";

function getRoleView(role) {
  if (role === "admin") return "admin";
  if (role === "staff") return "staff";
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
      setUser(userData);
      setViewMode(getRoleView(userData.role));
    } catch {
      console.error("Failed to parse user data");
    }
  }, []);

  const handleLogin = (userInfo) => {
    setUser(userInfo);
    setViewMode(getRoleView(userInfo.role));
  };

  const handleLogout = () => {
    setUser(null);
    setViewMode("shop");
    localStorage.removeItem("user");
  };

  const updateUser = (partial) => setUser((prev) => ({ ...prev, ...partial }));

  return { user, viewMode, setViewMode, handleLogin, handleLogout, updateUser };
}

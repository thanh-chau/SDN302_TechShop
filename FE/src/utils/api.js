// API Configuration and Service Layer
// Dùng relative URL để request qua Vite proxy (/api -> backend local), không gọi API ngoài
const API_BASE_URL = "";

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  const user = localStorage.getItem("user");
  if (user) {
    try {
      const userData = JSON.parse(user);
      return userData.token; // token trong user object
    } catch (e) {
      console.error("Failed to parse user data");
      return null;
    }
  }
  return null;
};

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = {
          message: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      console.error("API Error Response:", {
        status: response.status,
        statusText: response.statusText,
        endpoint,
        errorData,
      });

      // Build detailed error message
      let errorMessage =
        errorData.message || errorData.error || response.statusText;

      // Handle specific error cases
      if (response.status === 500) {
        // Backend internal error - check for specific messages
        if (
          errorMessage.toLowerCase().includes("duplicate") ||
          errorMessage.toLowerCase().includes("already exists") ||
          errorMessage.toLowerCase().includes("unique constraint")
        ) {
          errorMessage = "Email đã được sử dụng. Vui lòng sử dụng email khác.";
        } else if (!errorMessage || errorMessage === "Internal Server Error") {
          errorMessage =
            "Lỗi hệ thống. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.";
        }
      } else if (response.status === 400) {
        if (!errorMessage || errorMessage === "Bad Request") {
          errorMessage =
            "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.";
        }
      } else if (response.status === 409) {
        errorMessage = "Email đã tồn tại. Vui lòng sử dụng email khác.";
      }

      throw new Error(errorMessage);
    }

    // Handle empty responses (like DELETE operations)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }

    return null;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
};

// ==================== AUTH API ====================
export const authAPI = {
  register: async (email, password, fullName, role) => {
    const requestBody = { email, password, name: fullName };
    if (role) requestBody.role = role.toLowerCase();
    return apiRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });
  },

  login: async (email, password) => {
    return apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  getMe: async () => {
    return apiRequest("/api/auth/me", { method: "GET" });
  },

  forgotPassword: async (email) => {
    return apiRequest("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token, newPassword) => {
    return apiRequest("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    });
  },
};

// ==================== PRODUCT API ====================
export const productAPI = {
  // Get all products for home (only còn hàng)
  getAll: async () => {
    return apiRequest("/api/products", {
      method: "GET",
    });
  },

  // Get all products for admin/staff (includes hết hàng + ngừng bán)
  getAllAdmin: async () => {
    return apiRequest("/api/products/admin", {
      method: "GET",
    });
  },

  // Get product by ID
  getById: async (id) => {
    return apiRequest(`/api/products/${id}`, {
      method: "GET",
    });
  },

  // Create new product (admin/staff only)
  create: async (productData) => {
    return apiRequest("/api/products", {
      method: "POST",
      body: JSON.stringify(productData),
    });
  },

  // Update product (admin/staff only)
  update: async (productData) => {
    return apiRequest("/api/products", {
      method: "PUT",
      body: JSON.stringify(productData),
    });
  },

  // Ngừng bán sản phẩm (sets isActive=false, does NOT hard delete)
  discontinue: async (productId) => {
    return apiRequest(`/api/products/${productId}`, {
      method: "DELETE",
    });
  },

  // Delete product (admin/staff only) - changes status to INACTIVE instead of deleting
  delete: async (productData) => {
    return apiRequest("/api/products", {
      method: "PUT",
      body: JSON.stringify({ ...productData, status: "INACTIVE" }),
    });
  },
};

// ==================== CART API ====================
export const cartAPI = {
  // Get cart by user ID
  getByUserId: async (userId) => {
    return apiRequest(`/api/cart/${userId}`, {
      method: "GET",
    });
  },

  // Add product to cart
  addProduct: async (userId, productId, quantity) => {
    return apiRequest("/api/cart/add", {
      method: "POST",
      body: JSON.stringify({ userId, productId, quantity }),
    });
  },

  // Update cart item quantity
  updateQuantity: async (cartItemId, quantity) => {
    return apiRequest(`/api/cart/item/${cartItemId}?quantity=${quantity}`, {
      method: "PUT",
    });
  },

  // Remove item from cart
  removeItem: async (cartItemId) => {
    return apiRequest(`/api/cart/item/${cartItemId}`, {
      method: "DELETE",
    });
  },

  // Clear cart
  clearCart: async (userId) => {
    return apiRequest(`/api/cart/${userId}/clear`, {
      method: "DELETE",
    });
  },
};

// ==================== ORDER API ====================
export const orderAPI = {
  // Get all orders (admin/staff only)
  getAll: async () => {
    return apiRequest("/api/orders", {
      method: "GET",
    });
  },

  // Get order by ID
  getById: async (orderId) => {
    return apiRequest(`/api/orders/${orderId}`, {
      method: "GET",
    });
  },

  // Get orders by user ID
  getByUserId: async (userId) => {
    return apiRequest(`/api/orders/user/${userId}`, {
      method: "GET",
    });
  },

  // Get order items
  getOrderItems: async (orderId) => {
    return apiRequest(`/api/orders/${orderId}/items`, {
      method: "GET",
    });
  },

  // Create new order (from cart)
  create: async (
    userId,
    shippingName,
    shippingPhone,
    shippingAddress,
    paymentMethod,
    note,
  ) => {
    return apiRequest("/api/orders", {
      method: "POST",
      body: JSON.stringify({
        userId,
        shippingName,
        shippingPhone,
        shippingAddress,
        paymentMethod: paymentMethod || "cod",
        note,
      }),
    });
  },

  // Cancel order (buyer)
  cancel: async (orderId) => {
    return apiRequest(`/api/orders/${orderId}/cancel`, {
      method: "PUT",
    });
  },

  // Update order status (admin/staff only)
  updateStatus: async (orderId, status) => {
    return apiRequest(`/api/orders/${orderId}/status?status=${status}`, {
      method: "PUT",
    });
  },

  // Delete order (admin/staff only)
  delete: async (orderId) => {
    return apiRequest(`/api/orders/${orderId}`, {
      method: "DELETE",
    });
  },

  // Checkout with MoMo payment
  checkout: async (orderId, userId, returnUrl, notifyUrl) => {
    return apiRequest(`/api/orders/${orderId}/checkout`, {
      method: "POST",
      body: JSON.stringify({
        userId,
        returnUrl: returnUrl || `${window.location.origin}/payment/return`,
        notifyUrl: notifyUrl || `${window.location.origin}/payment/notify`,
      }),
    });
  },

  // MoMo callback (internal use)
  momoCallback: async (callbackData) => {
    return apiRequest("/api/orders/momo/callback", {
      method: "POST",
      body: JSON.stringify(callbackData),
    });
  },
};

// ==================== FILE UPLOAD API ====================
export const fileAPI = {
  // Upload file
  uploadFile: async (file, folder = "products") => {
    const formData = new FormData();
    formData.append("file", file);

    const token = getAuthToken();
    const response = await fetch(
      `${API_BASE_URL}/api/files/upload?folder=${folder}`,
      {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return await response.json();
  },

  // Get file URL
  getFileUrl: async (fileName, folder = "") => {
    const params = new URLSearchParams({ fileName });
    if (folder) params.append("folder", folder);

    return apiRequest(`/api/files/url?${params.toString()}`, {
      method: "GET",
    });
  },

  // Delete file
  deleteFile: async (fileName, folder = "") => {
    const params = new URLSearchParams({ fileName });
    if (folder) params.append("folder", folder);

    return apiRequest(`/api/files/delete?${params.toString()}`, {
      method: "DELETE",
    });
  },

  // Upload product image
  uploadProductImage: async (productId, file) => {
    const formData = new FormData();
    formData.append("file", file);

    const token = getAuthToken();
    const response = await fetch(
      `${API_BASE_URL}/api/products/${productId}/upload-image`,
      {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return await response.json();
  },
};

// ==================== USER API ====================
export const userAPI = {
  // Get all users (admin only)
  getAll: async () => {
    return apiRequest("/api/user", {
      method: "GET",
    });
  },

  // Get user by ID
  getById: async (id) => {
    return apiRequest(`/api/user/${id}`, {
      method: "GET",
    });
  },
};

export default {
  auth: authAPI,
  product: productAPI,
  cart: cartAPI,
  order: orderAPI,
  user: userAPI,
};

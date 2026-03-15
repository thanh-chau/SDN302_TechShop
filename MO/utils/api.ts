import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import type { Review } from '@/types/product';

const USER_KEY = 'user';

const extra = Constants.expoConfig?.extra as { apiUrl?: string; apiUrlAndroid?: string; apiUrlIos?: string } | undefined;
const API_BASE_URL =
  extra?.apiUrl ||
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) ||
  '';
const API_BASE_URL_ANDROID = extra?.apiUrlAndroid || (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL_ANDROID) || '';
const API_BASE_URL_IOS = extra?.apiUrlIos || (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL_IOS) || '';

const LOG_TAG = '[MO API]';

/** Trả về base URL cho API. Hỗ trợ: tunnel (https), LAN IP (192.168.x.x), điện thoại thật iOS/Android qua env. */
function getResolvedBaseUrl(): string {
  if (!API_BASE_URL || !API_BASE_URL.trim()) return API_BASE_URL;
  const base = API_BASE_URL.trim();
  if (base.startsWith('https://')) return base;
  if (/^https?:\/\/192\.168\.\d+\.\d+/.test(base)) return base;
  if (Platform.OS === 'ios' && API_BASE_URL_IOS && API_BASE_URL_IOS.trim()) return API_BASE_URL_IOS.trim();
  if (Platform.OS === 'android' && API_BASE_URL_ANDROID && API_BASE_URL_ANDROID.trim()) return API_BASE_URL_ANDROID.trim();
  if (Platform.OS === 'android' && (/^https?:\/\/localhost/i.test(base) || /^https?:\/\/127\.0\.0\.1/.test(base))) {
    try {
      return base.replace(/^(https?:\/\/)localhost/i, '$110.0.2.2').replace(/^(https?:\/\/)127\.0\.0\.1/i, '$110.0.2.2');
    } catch {
      return base;
    }
  }
  return base;
}

export const getApiBaseUrl = (): string => getResolvedBaseUrl();

function logApi(message: string, detail?: unknown): void {
  if (detail !== undefined) {
    console.warn(LOG_TAG, message, detail);
  } else {
    console.warn(LOG_TAG, message);
  }
}

export const getStoredUser = async (): Promise<{ token: string; name?: string; email?: string; role?: string; id?: string } | null> => {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { token?: string; id?: string; _id?: string; name?: string; email?: string; role?: string };
    // Cần có token để coi là đã đăng nhập (gọi API cart/orders cần Bearer)
    const tokenRaw = parsed?.token;
    const token = tokenRaw != null && tokenRaw !== '' ? String(tokenRaw) : undefined;
    if (!token) return null;
    // Đảm bảo luôn có id (BE có thể trả _id)
    const id = parsed.id ?? parsed._id;
    const idStr = id != null ? String(id) : undefined;
    const role = parsed.role != null ? String(parsed.role).trim().toLowerCase() : undefined;
    return { ...parsed, token, id: idStr, role: role || 'buyer' } as { token: string; name?: string; email?: string; role?: string; id?: string };
  } catch {
    return null;
  }
};

export const setStoredUser = async (user: object | null): Promise<void> => {
  try {
    if (user == null) await AsyncStorage.removeItem(USER_KEY);
    else await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // ignore
  }
};

/** Lấy token từ AsyncStorage. Retry 1 lần sau 150ms nếu null (tránh race khi vừa đăng nhập). */
const getAuthToken = async (): Promise<string | null> => {
  let user = await getStoredUser();
  if (user?.token) return user.token;
  await new Promise((r) => setTimeout(r, 150));
  user = await getStoredUser();
  return user?.token ?? null;
};

/** Timeout gọi BE. Tăng lên 25s vì ngrok/network đôi khi chậm. */
const REQUEST_TIMEOUT_MS = 25000;

/** Options cho apiRequest; authToken truyền vào sẽ ưu tiên dùng (tránh race sau khi đăng nhập). */
type ApiOptions = RequestInit & { authToken?: string | null };

const apiRequest = async <T = unknown>(endpoint: string, options: ApiOptions = {}): Promise<T> => {
  const base = getResolvedBaseUrl();
  const url = `${base}${endpoint}`;
  if (!API_BASE_URL || !API_BASE_URL.trim()) {
    logApi('API base URL chưa cấu hình (EXPO_PUBLIC_API_URL trong .env). Không gọi BE.', { endpoint, url });
    throw new Error('Chưa cấu hình API. Đặt EXPO_PUBLIC_API_URL trong file .env và chạy lại Expo.');
  }

  const { authToken: tokenOverride, ...restOptions } = options;
  const tokenFromCaller = tokenOverride != null && tokenOverride !== '' ? String(tokenOverride).trim() : null;
  const token = tokenFromCaller ?? (await getAuthToken());
  const tokenStr = token != null ? String(token).trim() : '';
  // Dùng object thuần để đảm bảo header được gửi đúng (React Native fetch)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(restOptions.headers as Record<string, string>),
  };
  if (tokenStr) headers['Authorization'] = `Bearer ${tokenStr}`;
  // Ngrok free tier: gửi header này để request không bị chặn / strip header
  if (base.includes('ngrok')) headers['ngrok-skip-browser-warning'] = '1';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);
  const signal = restOptions.signal ?? controller.signal;

  let res: Response;
  try {
    res = await fetch(url, { ...restOptions, headers, signal });
  } catch (err) {
    clearTimeout(timeoutId);
    const isTimeout = (err as Error)?.name === 'AbortError';
    if (isTimeout) logApi('Gọi BE timeout (BE không phản hồi trong ' + REQUEST_TIMEOUT_MS / 1000 + 's). Kiểm tra BE đã chạy và đúng port chưa.', { url, method: options.method ?? 'GET' });
    else logApi('Gọi BE thất bại (mạng / CORS / URL sai).', { url, method: options.method ?? 'GET', error: err });
    throw err;
  }
  clearTimeout(timeoutId);

  if (!res.ok) {
    let msg = res.statusText;
    try {
      const data = await res.json();
      msg = (data as { message?: string }).message ?? (data as { error?: string }).error ?? msg;
    } catch {
      // ignore
    }
    if (res.status === 500) {
      if (msg.toLowerCase().includes('duplicate') || msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('unique constraint'))
        msg = 'Email đã được sử dụng. Vui lòng dùng email khác.';
      else if (!msg || msg === 'Internal Server Error')
        msg = 'Lỗi hệ thống. Vui lòng thử lại sau.';
    } else if (res.status === 400 && (!msg || msg === 'Bad Request')) {
      msg = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
    } else if (res.status === 409) {
      msg = 'Email đã tồn tại. Vui lòng dùng email khác.';
    } else if (res.status === 401) {
      // Không xóa session từ đây — lỗi 401 có thể do ngrok chưa gửi được header, không liên quan đến session lưu trên máy
    }
    logApi('BE trả lỗi HTTP.', { url, status: res.status, message: msg });
    throw new Error(msg);
  }

  const contentType = res.headers.get('content-type');
  if (contentType?.includes('application/json')) return res.json() as Promise<T>;
  return null as unknown as T;
};

// ==================== AUTH API (giống FE) ====================
export const authAPI = {
  register: (email: string, password: string, fullName: string, role?: string) => {
    const body: { email: string; password: string; name: string; role?: string } = {
      email,
      password,
      name: fullName,
    };
    if (role) body.role = role.toLowerCase();
    return apiRequest<{ user: unknown; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  login: (email: string, password: string) =>
    apiRequest<{ user: unknown; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  forgotPassword: (email: string) =>
    apiRequest<{ resetToken?: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, newPassword: string) =>
    apiRequest('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    }),

  getMe: () => apiRequest<{ user: unknown }>('/api/auth/me', { method: 'GET' }),
};

// ==================== CATEGORIES (giống FE: GET /api/categories, BE đọc từ MongoDB Atlas) ====================
export const categoriesAPI = {
  getList: () => apiRequest<{ id: string; name: string }[]>('/api/categories', { method: 'GET' }),
};

// ==================== PRODUCTS ====================
export const productAPI = {
  getAll: () => apiRequest<unknown[]>('/api/products', { method: 'GET' }),
  /** Admin: tất cả sản phẩm (cả ngừng bán, hết hàng). Truyền authToken để tránh 401 khi vừa đăng nhập. */
  getAllAdmin: (authToken?: string | null) =>
    apiRequest<unknown[]>('/api/products/admin', { method: 'GET', authToken }),
  create: (data: Record<string, unknown>, authToken?: string | null) =>
    apiRequest('/api/products', { method: 'POST', body: JSON.stringify(data), authToken }),
  update: (data: Record<string, unknown>, authToken?: string | null) =>
    apiRequest('/api/products', { method: 'PUT', body: JSON.stringify(data), authToken }),
  discontinue: (productId: string, authToken?: string | null) =>
    apiRequest(`/api/products/${encodeURIComponent(productId)}`, { method: 'DELETE', authToken }),
};

// ==================== ORDERS (admin: getAll, updateStatus, delete) ====================
export const orderAPI = {
  getAll: (authToken?: string | null) =>
    apiRequest<unknown[]>('/api/orders', { method: 'GET', authToken }),
  updateStatus: (orderId: string, status: string, authToken?: string | null) =>
    apiRequest(`/api/orders/${encodeURIComponent(orderId)}/status?status=${encodeURIComponent(status)}`, { method: 'PUT', authToken }),
  delete: (orderId: string, authToken?: string | null) =>
    apiRequest(`/api/orders/${encodeURIComponent(orderId)}`, { method: 'DELETE', authToken }),
};

// ==================== USERS (admin: getAll) ====================
export const userAPI = {
  getAll: (authToken?: string | null) =>
    apiRequest<unknown[]>('/api/auth/users', { method: 'GET', authToken }),
};

// ==================== CART (giống FE: BE /api/cart, cần đăng nhập) ====================
export type CartItemResponse = {
  id: string;
  productId: string;
  productName: string;
  priceAtTime: number;
  quantity: number;
  imageUrl?: string | null;
};

export const cartAPI = {
  /** Lấy giỏ hàng. Có thể truyền authToken khi vừa đăng nhập để tránh race với AsyncStorage. */
  getByUserId: (userId: string, authToken?: string | null) =>
    apiRequest<{ cartItems: CartItemResponse[] }>(`/api/cart/${userId}`, { method: 'GET', authToken }),

  addProduct: (userId: string, productId: string, quantity: number, authToken?: string | null) =>
    apiRequest<{ cartItems: CartItemResponse[] }>('/api/cart/add', {
      method: 'POST',
      body: JSON.stringify({ userId, productId, quantity }),
      authToken,
    }),

  updateQuantity: (cartItemId: string, quantity: number, authToken?: string | null) =>
    apiRequest<{ cartItems: CartItemResponse[] }>(
      `/api/cart/item/${encodeURIComponent(cartItemId)}?quantity=${quantity}`,
      { method: 'PUT', authToken }
    ),

  removeItem: (cartItemId: string, authToken?: string | null) =>
    apiRequest<{ cartItems: CartItemResponse[] }>(
      `/api/cart/item/${encodeURIComponent(cartItemId)}`,
      { method: 'DELETE', authToken }
    ),

  clearCart: (userId: string) =>
    apiRequest<null>(`/api/cart/${userId}/clear`, { method: 'DELETE' }),
};

// ==================== WISHLIST (MongoDB Atlas qua BE) ====================
export type WishlistProduct = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  category?: string;
  description?: string;
  stock?: number;
  avgRating?: number;
  reviewCount?: number;
  flashSaleEnd?: string;
  flashSalePrice?: number;
};

export const wishlistAPI = {
  getByUserId: (userId: string, authToken?: string | null) =>
    apiRequest<{ products: WishlistProduct[] }>(`/api/wishlist/${userId}`, { method: 'GET', authToken }),

  addProduct: (userId: string, productId: string, authToken?: string | null) =>
    apiRequest<{ products: WishlistProduct[] }>('/api/wishlist/add', {
      method: 'POST',
      body: JSON.stringify({ userId, productId }),
      authToken,
    }),

  removeProduct: (userId: string, productId: string, authToken?: string | null) =>
    apiRequest<{ products: WishlistProduct[] }>('/api/wishlist/remove', {
      method: 'DELETE',
      body: JSON.stringify({ userId, productId }),
      authToken,
    }),
};

// ==================== REVIEWS ====================
export const reviewAPI = {
  getByProduct: (productId: string) =>
    apiRequest<{ reviews: Review[]; avgRating: number; total: number }>(
      `/api/reviews/product/${productId}`,
      { method: 'GET' }
    ),
};

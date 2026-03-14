/**
 * API service layer for React Native (Expo).
 * Uses EXPO_PUBLIC_API_URL (or tunnel URL like https://your-ngrok-url) from .env.
 * Works with ngrok, Cloudflare Tunnel, and localhost.
 */

import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { getStoredUser } from '@/utils/api';

const extra = Constants.expoConfig?.extra as { apiUrl?: string; apiUrlAndroid?: string; apiUrlIos?: string } | undefined;
const API_BASE_URL =
  extra?.apiUrl ||
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) ||
  '';
const API_BASE_URL_ANDROID =
  extra?.apiUrlAndroid ||
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL_ANDROID) ||
  '';
const API_BASE_URL_IOS =
  extra?.apiUrlIos ||
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL_IOS) ||
  '';

const REQUEST_TIMEOUT_MS = 15000;

/** Base URL cho API. Tunnel (https), LAN IP (192.168.x.x), hoặc URL theo iOS/Android. */
export function getBaseUrl(): string {
  if (!API_BASE_URL || !API_BASE_URL.trim()) return API_BASE_URL;
  const base = API_BASE_URL.trim();
  if (base.startsWith('https://')) return base;
  if (/^https?:\/\/192\.168\.\d+\.\d+/.test(base)) return base;
  if (Platform.OS === 'ios' && API_BASE_URL_IOS?.trim()) return API_BASE_URL_IOS.trim();
  if (Platform.OS === 'android' && API_BASE_URL_ANDROID?.trim()) return API_BASE_URL_ANDROID.trim();
  if (Platform.OS === 'android' && (/^https?:\/\/localhost/i.test(base) || /^https?:\/\/127\.0\.0\.1/.test(base))) {
    try {
      return base.replace(/^(https?:\/\/)localhost/i, '$110.0.2.2').replace(/^(https?:\/\/)127\.0\.0\.1/i, '$110.0.2.2');
    } catch {
      return base;
    }
  }
  return base;
}

export const BASE_URL = getBaseUrl();

/**
 * Low-level request. Adds auth token and timeout. Use fetchCategories, fetchProducts, etc. in screens.
 */
export async function request<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const base = getBaseUrl();
  const url = path.startsWith('http') ? path : `${base.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
  if (!base?.trim()) {
    throw new Error('EXPO_PUBLIC_API_URL is not set. Use tunnel URL (e.g. https://xxx.ngrok.io) or http://localhost:5000 in .env');
  }

  const user = await getStoredUser();
  const token = user?.token ?? null;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const signal = options.signal ?? controller.signal;

  const res = await fetch(url, { ...options, headers, signal });
  clearTimeout(timeoutId);

  if (!res.ok) {
    let msg = res.statusText;
    try {
      const data = await res.json();
      msg = (data as { message?: string }).message ?? (data as { error?: string }).error ?? msg;
    } catch {
      // ignore
    }
    throw new Error(msg || `HTTP ${res.status}`);
  }

  const contentType = res.headers.get('content-type');
  if (contentType?.includes('application/json')) return res.json() as Promise<T>;
  return null as unknown as T;
}

// --- Typed API functions (use these in screens) ---

export interface CategoryItem {
  id: string;
  name: string;
}

export interface ProductItem {
  id: string;
  name: string;
  price: number;
  image?: string | null;
  imgUrl?: string | null;
  category?: string;
  description?: string;
  [key: string]: unknown;
}

export interface PlayerItem {
  id: string;
  name?: string;
  [key: string]: unknown;
}

export interface UserItem {
  id: string;
  name?: string;
  email?: string;
  [key: string]: unknown;
}

export async function fetchCategories(): Promise<CategoryItem[]> {
  const data = await request<CategoryItem[] | { id?: string; _id?: unknown; name: string }[]>('/api/categories', { method: 'GET' });
  if (!Array.isArray(data)) return [];
  return data.map((c) => ({
    id: c.id ?? (c._id != null ? String(c._id) : ''),
    name: (c as { name: string }).name,
  }));
}

export async function fetchProducts(): Promise<ProductItem[]> {
  const data = await request<ProductItem[]>('/api/products', { method: 'GET' });
  if (!Array.isArray(data)) return [];
  return data.map((p) => ({
    ...p,
    id: p.id != null ? String(p.id) : '',
    image: p.image ?? p.imgUrl ?? null,
  }));
}

export async function fetchPlayers(): Promise<PlayerItem[]> {
  const data = await request<PlayerItem[]>('/api/players', { method: 'GET' });
  return Array.isArray(data) ? data : [];
}

/**
 * GET /api/auth/users - requires admin/staff token. Returns [] if 401/403.
 */
export async function fetchUsers(): Promise<UserItem[]> {
  try {
    const data = await request<UserItem[]>('/api/auth/users', { method: 'GET' });
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

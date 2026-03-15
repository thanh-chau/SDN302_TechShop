import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Product } from '@/types/product';

const KEY_PREFIX = 'wishlist_';

export async function getWishlist(userId: string | undefined): Promise<Product[]> {
  if (!userId?.trim()) return [];
  try {
    const raw = await AsyncStorage.getItem(KEY_PREFIX + userId);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function setWishlist(userId: string | undefined, products: Product[]): Promise<void> {
  if (!userId?.trim()) return;
  try {
    await AsyncStorage.setItem(KEY_PREFIX + userId, JSON.stringify(products));
  } catch {
    // ignore
  }
}

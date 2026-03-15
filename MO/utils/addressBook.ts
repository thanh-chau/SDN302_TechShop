import AsyncStorage from '@react-native-async-storage/async-storage';

export type SavedAddress = {
  id: string;
  name: string;
  phone: string;
  address: string;
};

function getStorageKey(userId: string) {
  return `saved_addresses_${userId}`;
}

export async function loadSavedAddresses(userId: string): Promise<SavedAddress[]> {
  try {
    const raw = await AsyncStorage.getItem(getStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedAddress[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveSavedAddresses(userId: string, list: SavedAddress[]): Promise<void> {
  try {
    await AsyncStorage.setItem(getStorageKey(userId), JSON.stringify(list));
  } catch {
    // ignore storage failures in UI flow
  }
}
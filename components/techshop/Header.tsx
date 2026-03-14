import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getCategoryDisplayName } from '@/utils/categoryDisplay';

const DEFAULT_NAV_CATEGORIES = [
  { name: 'Laptop', icon: 'laptop-outline' as const, id: 'category-laptop' },
  { name: 'Điện thoại', icon: 'phone-portrait-outline' as const, id: 'category-phone' },
  { name: 'Tablet', icon: 'tablet-portrait-outline' as const, id: 'category-tablet' },
  { name: 'Âm thanh', icon: 'musical-notes-outline' as const, id: 'category-audio' },
  { name: 'Phụ kiện', icon: 'hardware-chip-outline' as const, id: 'category-accessories' },
  { name: 'Màn hình', icon: 'desktop-outline' as const, id: 'category-monitor' },
];

type NavIcon = 'laptop-outline' | 'phone-portrait-outline' | 'tablet-portrait-outline' | 'musical-notes-outline' | 'hardware-chip-outline' | 'desktop-outline' | 'pricetag-outline';
const ICON_BY_ID: Record<string, NavIcon> = {
  'category-laptop': 'laptop-outline',
  'category-phone': 'phone-portrait-outline',
  'category-tablet': 'tablet-portrait-outline',
  'category-audio': 'musical-notes-outline',
  'category-accessories': 'hardware-chip-outline',
  'category-monitor': 'desktop-outline',
  laptop: 'laptop-outline',
  phone: 'phone-portrait-outline',
  tablet: 'tablet-portrait-outline',
  audio: 'musical-notes-outline',
  accessories: 'hardware-chip-outline',
  monitor: 'desktop-outline',
};

export interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
  user: { name?: string } | null;
  onLoginClick: () => void;
  onLogout?: () => void;
  onCategoryClick?: (id: string) => void;
  hasFlashSale?: boolean;
  /** Danh mục từ API (GET /api/categories). Khi có thì nav hiển thị danh mục từ BE thay vì mặc định. */
  categoriesFromApi?: { id: string; name: string }[];
}

export function Header({
  cartCount,
  onCartClick,
  user,
  onLoginClick,
  onLogout,
  onCategoryClick,
  hasFlashSale = false,
  categoriesFromApi,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { width } = useWindowDimensions();
  const iconOnly = width < 360;
  const insets = useSafeAreaInsets();
  const navCategories =
    categoriesFromApi && categoriesFromApi.length > 0
      ? categoriesFromApi.map((c) => ({
          id: c.id,
          name: getCategoryDisplayName(c.name) || c.name,
          icon: ICON_BY_ID[c.id] ?? ICON_BY_ID[c.name?.toLowerCase()] ?? 'pricetag-outline',
        }))
      : DEFAULT_NAV_CATEGORIES;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top bar - thông tin giao hàng */}
      <View style={styles.topBar}>
        <View style={styles.topRow}>
          <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.95)" />
          <Text style={styles.topBarText}>Giao hàng toàn quốc</Text>
        </View>
        <View style={styles.topRow}>
          <Ionicons name="call-outline" size={14} color="rgba(255,255,255,0.95)" />
          <Text style={styles.topBarText}>1900-xxxx</Text>
        </View>
      </View>

      {/* Khu vực chính: Logo + Tìm kiếm + Nút hành động */}
      <View style={styles.mainSection}>
        {/* Hàng 1: Logo + Nút Đăng nhập & Giỏ hàng */}
        <View style={styles.mainRow}>
          <Text style={styles.logo} numberOfLines={1}>
            TechShop
          </Text>
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.iconBtn,
                pressed && styles.iconBtnPressed,
              ]}
              onPress={onLoginClick}
            >
              <Ionicons
                name={user ? 'person' : 'person-outline'}
                size={22}
                color="#dc2626"
              />
              {!iconOnly && (
                <Text style={styles.loginBtnText} numberOfLines={1}>
                  {user ? (user.name ?? 'Tài khoản') : 'Đăng nhập'}
                </Text>
              )}
            </Pressable>
            {user && onLogout && (
              <Pressable
                style={({ pressed }) => [
                  styles.iconBtn,
                  styles.logoutBtn,
                  pressed && styles.iconBtnPressed,
                ]}
                onPress={onLogout}
              >
                <Ionicons name="log-out-outline" size={20} color="#dc2626" />
                {!iconOnly && (
                  <Text style={styles.loginBtnText} numberOfLines={1}>Đăng xuất</Text>
                )}
              </Pressable>
            )}
            <Pressable
              style={({ pressed }) => [
                styles.iconBtn,
                styles.cartBtnWrap,
                pressed && styles.iconBtnPressed,
              ]}
              onPress={onCartClick}
            >
              <Ionicons name="cart-outline" size={22} color="#fff" />
              {cartCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {cartCount > 99 ? '99+' : cartCount}
                  </Text>
                </View>
              )}
              {!iconOnly && (
                <Text style={styles.cartBtnText} numberOfLines={1}>
                  Giỏ hàng
                </Text>
              )}
            </Pressable>
          </View>
        </View>

        {/* Hàng 2: Ô tìm kiếm full width - luôn tách riêng để không đè */}
        <View style={styles.searchRow}>
          <View style={styles.searchWrap}>
            <Ionicons
              name="search"
              size={20}
              color="#9ca3af"
              style={styles.searchIconLeft}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm sản phẩm..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      </View>

      {/* Danh mục: scroll ngang, thiết kế đồng bộ */}
      <View style={styles.navSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.navScroll}
        >
          <Pressable
            style={({ pressed }) => [styles.navCategory, pressed && styles.navChipPressed]}
            onPress={() => onCategoryClick?.('all')}
          >
            <Ionicons name="grid-outline" size={18} color="#dc2626" />
            <Text style={styles.navCategoryText}>Danh mục</Text>
          </Pressable>
          {navCategories.map(({ name, icon, id }) => (
            <Pressable
              key={id}
              style={({ pressed }) => [styles.navChip, pressed && styles.navChipPressed]}
              onPress={() => onCategoryClick?.(id)}
            >
              <Ionicons name={icon} size={18} color="#4b5563" />
              <Text style={styles.navChipText} numberOfLines={1}>{name}</Text>
            </Pressable>
          ))}
          {hasFlashSale && (
            <Pressable
              style={({ pressed }) => [styles.navChip, styles.navChipFlash, pressed && styles.navChipPressed]}
              onPress={() => onCategoryClick?.('flash-sale')}
            >
              <Ionicons name="flame" size={17} color="#dc2626" />
              <Text style={styles.navChipTextFlash}>Flash Sale</Text>
            </Pressable>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
    }),
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topBarText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 12,
  },
  mainSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    fontSize: 22,
    fontWeight: '800',
    color: '#dc2626',
    flexShrink: 0,
    letterSpacing: -0.5,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
  },
  iconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#dc2626',
  },
  cartBtnWrap: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  logoutBtn: {
    // outline style like login
  },
  iconBtnPressed: {
    opacity: 0.88,
  },
  loginBtnText: {
    color: '#dc2626',
    fontWeight: '600',
    fontSize: 13,
  },
  cartBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#facc15',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#991b1b',
    fontSize: 10,
    fontWeight: '800',
  },
  searchRow: {
    width: '100%',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 14,
    minHeight: 48,
  },
  searchIconLeft: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111',
    paddingVertical: 12,
    minWidth: 0,
  },
  navSection: {
    backgroundColor: '#fafafa',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  navScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 12,
    paddingRight: 28,
  },
  navCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#dc2626',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 },
      android: { elevation: 2 },
    }),
  },
  navCategoryText: {
    color: '#dc2626',
    fontWeight: '700',
    fontSize: 14,
  },
  navChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 44,
    backgroundColor: '#fff',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
      android: { elevation: 1 },
    }),
  },
  navChipPressed: {
    opacity: 0.85,
  },
  navChipText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 14,
    minWidth: 0,
  },
  navChipFlash: {
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  navChipTextFlash: {
    color: '#dc2626',
    fontWeight: '700',
    fontSize: 14,
  },
});

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
  Modal,
  TouchableWithoutFeedback,
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
  user: { name?: string; email?: string; role?: string } | null;
  onLoginClick: () => void;
  onLogout?: () => void;
  onCategoryClick?: (id: string) => void;
  /** Dropdown menu (khi đã đăng nhập) */
  onProfileClick?: () => void;
  onOrdersClick?: () => void;
  onWishlistClick?: () => void;
  onSettingsClick?: () => void;
  /** Khi user.role === 'admin': mở trang quản trị */
  onAdminClick?: () => void;
  /** Id danh mục đang chọn (để highlight pill). 'all' = Danh mục, 'category-phone', 'flash-sale', ... */
  activeCategoryId?: string | null;
  hasFlashSale?: boolean;
  /** Danh mục từ API (GET /api/categories). Khi có thì nav hiển thị danh mục từ BE thay vì mặc định. */
  categoriesFromApi?: { id: string; name: string }[];
}

function getInitials(name: string | undefined): string {
  if (!name?.trim()) return 'TK';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 2);
  return name.slice(0, 2).toUpperCase();
}

export function Header({
  cartCount,
  onCartClick,
  user,
  onLoginClick,
  onLogout,
  onCategoryClick,
  onProfileClick,
  onOrdersClick,
  onWishlistClick,
  onSettingsClick,
  onAdminClick,
  activeCategoryId = 'all',
  hasFlashSale = false,
  categoriesFromApi,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const { width } = useWindowDimensions();
  const iconOnly = width < 360;
  const insets = useSafeAreaInsets();

  const closeAccountMenu = () => setAccountMenuOpen(false);
  const navCategories =
    categoriesFromApi && categoriesFromApi.length > 0
      ? categoriesFromApi.map((c) => ({
          id: c.id,
          name: getCategoryDisplayName(c.name) || c.name,
          icon: ICON_BY_ID[c.id] ?? ICON_BY_ID[c.name?.toLowerCase()] ?? 'pricetag-outline',
        }))
      : DEFAULT_NAV_CATEGORIES;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>
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
            {user ? (
              <Pressable
                style={({ pressed }) => [
                  styles.accountTrigger,
                  pressed && styles.iconBtnPressed,
                ]}
                onPress={() => setAccountMenuOpen((v) => !v)}
              >
                <View style={styles.avatarWrap}>
                  <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
                </View>
                {!iconOnly && (
                  <View style={styles.accountTriggerText}>
                    <Text style={styles.accountName} numberOfLines={1} ellipsizeMode="tail">{user.name ?? 'Tài khoản'}</Text>
                    <Text style={styles.accountLabel}>Tài khoản</Text>
                  </View>
                )}
                <Ionicons
                  name={accountMenuOpen ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#dc2626"
                />
              </Pressable>
            ) : (
              <Pressable
                style={({ pressed }) => [
                  styles.iconBtn,
                  pressed && styles.iconBtnPressed,
                ]}
                onPress={onLoginClick}
              >
                <Ionicons name="person-outline" size={22} color="#dc2626" />
                {!iconOnly && (
                  <Text style={styles.loginBtnText} numberOfLines={1}>Đăng nhập</Text>
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

      {/* Danh mục: icon + chữ không bị cắt, padding phải đủ khi cuộn */}
      <View style={styles.navSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={[styles.navScroll, { paddingRight: 16 + (insets.right || 0) }]}
        >
          <Pressable
            style={({ pressed }) => [
              styles.navCategoryWeb,
              pressed && styles.navChipPressed,
            ]}
            onPress={() => onCategoryClick?.('all')}
          >
            <Ionicons name="menu" size={20} color="#fff" />
            <Text style={styles.navCategoryTextWeb}>Danh mục</Text>
          </Pressable>
          {navCategories.map(({ name, icon, id }) => {
            const isActive = activeCategoryId === id;
            return (
              <Pressable
                key={id}
                style={({ pressed }) => [
                  styles.navChipWeb,
                  isActive && styles.navChipWebActive,
                  pressed && styles.navChipPressed,
                ]}
                onPress={() => onCategoryClick?.(id)}
              >
                <Ionicons name={icon} size={18} color={isActive ? '#dc2626' : '#374151'} />
                <Text style={[styles.navChipTextWeb, isActive && styles.navChipTextWebActive]} numberOfLines={1}>{name}</Text>
              </Pressable>
            );
          })}
          {hasFlashSale && (
            <Pressable
              style={({ pressed }) => [
                styles.navChipWeb,
                activeCategoryId === 'flash-sale' && styles.navChipWebActive,
                pressed && styles.navChipPressed,
              ]}
              onPress={() => onCategoryClick?.('flash-sale')}
            >
              <Ionicons name="flame" size={17} color={activeCategoryId === 'flash-sale' ? '#dc2626' : '#374151'} />
              <Text style={[styles.navChipTextWeb, activeCategoryId === 'flash-sale' && styles.navChipTextWebActive]} numberOfLines={1}>Flash Sale</Text>
            </Pressable>
          )}
        </ScrollView>
      </View>

      {/* Dropdown tài khoản (giống web: avatar, tên, email, menu, đăng xuất) */}
      <Modal
        visible={accountMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={closeAccountMenu}
      >
        <View style={styles.dropdownOverlay}>
          <TouchableWithoutFeedback onPress={closeAccountMenu}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
          <View style={[styles.dropdownPanel, { top: 8 + insets.top }]}>
                <View style={styles.dropdownHeader}>
                  <View style={styles.dropdownAvatar}>
                    <Text style={styles.dropdownAvatarText}>{user ? getInitials(user.name) : 'TK'}</Text>
                  </View>
                  <View style={styles.dropdownUserInfo}>
                    <Text style={styles.dropdownUserName} numberOfLines={1}>{user?.name ?? 'Tài khoản'}</Text>
                    {user?.email ? (
                      <Text style={styles.dropdownUserEmail} numberOfLines={1}>{user.email}</Text>
                    ) : null}
                  </View>
                </View>
                {user?.role === 'admin' ? (
                  <Pressable
                    style={({ pressed }) => [styles.dropdownItem, styles.dropdownItemAdmin, pressed && styles.dropdownItemPressed]}
                    onPress={() => { onAdminClick?.(); closeAccountMenu(); }}
                  >
                    <Ionicons name="shield-checkmark-outline" size={20} color="#dc2626" />
                    <Text style={[styles.dropdownItemText, styles.dropdownItemTextAdmin]}>Trang quản trị</Text>
                  </Pressable>
                ) : null}
                <Pressable
                  style={({ pressed }) => [styles.dropdownItem, pressed && styles.dropdownItemPressed]}
                  onPress={() => { onProfileClick?.(); closeAccountMenu(); }}
                >
                  <Ionicons name="person-outline" size={20} color="#374151" />
                  <Text style={styles.dropdownItemText}>Thông tin tài khoản</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.dropdownItem, pressed && styles.dropdownItemPressed]}
                  onPress={() => { onOrdersClick?.(); closeAccountMenu(); }}
                >
                  <Ionicons name="cube-outline" size={20} color="#374151" />
                  <Text style={styles.dropdownItemText}>Đơn hàng của tôi</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.dropdownItem, pressed && styles.dropdownItemPressed]}
                  onPress={() => { onWishlistClick?.(); closeAccountMenu(); }}
                >
                  <Ionicons name="heart-outline" size={20} color="#374151" />
                  <Text style={styles.dropdownItemText}>Sản phẩm yêu thích</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.dropdownItem, pressed && styles.dropdownItemPressed]}
                  onPress={() => { onSettingsClick?.(); closeAccountMenu(); }}
                >
                  <Ionicons name="settings-outline" size={20} color="#374151" />
                  <Text style={styles.dropdownItemText}>Cài đặt</Text>
                </Pressable>
                <View style={styles.dropdownDivider} />
                <Pressable
                  style={({ pressed }) => [styles.dropdownItem, pressed && styles.dropdownItemPressed]}
                  onPress={() => { onLogout?.(); closeAccountMenu(); }}
                >
                  <Ionicons name="log-out-outline" size={20} color="#374151" />
                  <Text style={styles.dropdownItemText}>Đăng xuất</Text>
                </Pressable>
              </View>
          </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: '100%',
    backgroundColor: '#fff',
    overflow: 'hidden',
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
    minWidth: 0,
  },
  logo: {
    fontSize: 22,
    fontWeight: '800',
    color: '#dc2626',
    flexShrink: 1,
    minWidth: 0,
    marginRight: 8,
    letterSpacing: -0.5,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
    minWidth: 0,
  },
  iconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#dc2626',
    flexShrink: 0,
  },
  cartBtnWrap: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  /** Nút tài khoản khi đã đăng nhập (avatar + tên + caret) */
  accountTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#dc2626',
    flexShrink: 1,
    minWidth: 0,
    maxWidth: '65%',
  },
  avatarWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  accountTriggerText: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    minWidth: 0,
  },
  accountName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111',
  },
  accountLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 0,
  },
  /** Dropdown panel giống web */
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  dropdownPanel: {
    position: 'absolute',
    right: 12,
    width: 280,
    alignSelf: 'flex-end',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 14,
    gap: 12,
  },
  dropdownAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  dropdownUserInfo: {
    flex: 1,
    minWidth: 0,
  },
  dropdownUserName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  dropdownUserEmail: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dropdownItemPressed: {
    backgroundColor: '#f3f4f6',
  },
  dropdownItemAdmin: {
    backgroundColor: '#fef2f2',
  },
  dropdownItemTextAdmin: {
    color: '#dc2626',
    fontWeight: '600',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 6,
    marginHorizontal: 16,
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
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingBottom: 14,
    borderBottomWidth: 3,
    borderBottomColor: '#dc2626',
  },
  navScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 14,
    gap: 8,
  },
  /** Nút "Danh mục" giống web: nền đỏ, chữ trắng, icon hamburger */
  navCategoryWeb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#dc2626',
    borderRadius: 6,
    flexShrink: 0,
  },
  navCategoryTextWeb: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  /** Pill danh mục giống web: nền trắng, chữ xám đậm, không viền nổi */
  navChipWeb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minHeight: 44,
    backgroundColor: '#fff',
    borderRadius: 6,
    flexShrink: 0,
  },
  navChipPressed: {
    opacity: 0.85,
  },
  navChipWebActive: {
    backgroundColor: '#fef2f2',
  },
  navChipTextWeb: {
    color: '#374151',
    fontWeight: '500',
    fontSize: 14,
    minWidth: 0,
  },
  navChipTextWebActive: {
    color: '#dc2626',
    fontWeight: '600',
  },
});

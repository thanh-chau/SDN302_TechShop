import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@/contexts/UserContext';
import { productAPI, orderAPI, userAPI, authAPI } from '@/utils/api';
import Toast from 'react-native-toast-message';

type TabId = 'dashboard' | 'products' | 'orders' | 'users' | 'flashsale';

const TABS: { id: TabId; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'bar-chart-outline' },
  { id: 'products', label: 'Sản phẩm', icon: 'cube-outline' },
  { id: 'orders', label: 'Đơn hàng', icon: 'bag-outline' },
  { id: 'users', label: 'Người dùng', icon: 'people-outline' },
  { id: 'flashsale', label: 'Flash Sale', icon: 'flame-outline' },
];

/** Chiều rộng mỗi tab (đủ cho "Đơn hàng (9)" / "Người dùng (7)" không bị cắt chữ) */
const TAB_WIDTH = 162;

const CATEGORY_LABELS: Record<string, string> = {
  laptop: 'Laptop',
  phone: 'Điện thoại',
  tablet: 'Tablet',
  audio: 'Âm thanh',
  accessories: 'Phụ kiện',
  monitor: 'Màn hình',
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xử lý',
  processing: 'Đang xử lý',
  shipping: 'Đang giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

function getStatusBadge(status: string) {
  const map: Record<string, string> = {
    pending: 'Chờ xử lý',
    processing: 'Đang xử lý',
    shipping: 'Đang giao',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
  };
  return map[status?.toLowerCase()] || status || '—';
}

export default function AdminScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { user, setUser: setCtxUser } = useUser();

  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [products, setProducts] = useState<unknown[]>([]);
  const [orders, setOrders] = useState<unknown[]>([]);
  const [users, setUsers] = useState<unknown[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    todayRevenue: 0,
    pendingOrdersCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  const [showFlashSaleForm, setShowFlashSaleForm] = useState(false);
  const [flashSaleProduct, setFlashSaleProduct] = useState<Record<string, unknown> | null>(null);
  const [flashSalePrice, setFlashSalePrice] = useState('');
  const [flashSaleEnd, setFlashSaleEnd] = useState('');
  const [savingFlashSale, setSavingFlashSale] = useState(false);

  const [showUserForm, setShowUserForm] = useState(false);
  const [userForm, setUserForm] = useState({ fullName: '', email: '', password: '', role: 'staff' });
  const [creatingUser, setCreatingUser] = useState(false);
  const [regError, setRegError] = useState('');

  const token = user?.token;

  const loadProducts = useCallback(async () => {
    try {
      const data = await productAPI.getAllAdmin(token);
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn(e);
      Toast.show({ type: 'error', text1: 'Không tải được sản phẩm' });
    }
  }, [token]);

  const loadOrders = useCallback(async () => {
    try {
      const data = await orderAPI.getAll(token);
      const list = Array.isArray(data) ? data : [];
      setOrders(list);
      const today = new Date().toDateString();
      const completedOrders = list.filter((o: Record<string, unknown>) => (o.status as string) === 'completed');
      const totalRevenue = completedOrders.reduce(
        (sum: number, o: Record<string, unknown>) => sum + (Number(o.totalAmount ?? o.total) || 0),
        0
      );
      const todayCompleted = list.filter(
        (o: Record<string, unknown>) =>
          (o.status as string) === 'completed' &&
          new Date((o.createdAt as string) || (o.orderDate as string) || 0).toDateString() === today
      );
      const todayRevenue = todayCompleted.reduce(
        (sum: number, o: Record<string, unknown>) => sum + (Number(o.totalAmount ?? o.total) || 0),
        0
      );
      const pendingOrdersCount = list.filter((o: Record<string, unknown>) => (o.status as string) === 'pending').length;
      setStats((prev) => ({
        ...prev,
        totalRevenue,
        totalOrders: list.length,
        todayRevenue,
        pendingOrdersCount,
      }));
    } catch (e) {
      console.warn(e);
      Toast.show({ type: 'error', text1: 'Không tải được đơn hàng' });
    }
  }, [token]);

  const loadUsers = useCallback(async () => {
    try {
      const data = await userAPI.getAll(token);
      const list = Array.isArray(data) ? data : [];
      setUsers(list);
      setStats((prev) => ({ ...prev, totalUsers: list.length }));
    } catch (e) {
      console.warn(e);
      Toast.show({ type: 'error', text1: 'Không tải được người dùng' });
    }
  }, [token]);

  const loadAllData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      await Promise.all([loadProducts(), loadOrders(), loadUsers()]);
    } finally {
      setLoading(false);
    }
  }, [token, loadProducts, loadOrders, loadUsers]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  }, [loadAllData]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  useEffect(() => {
    setStats((prev) => ({ ...prev, totalProducts: products.length }));
  }, [products.length]);

  const handleLogout = async () => {
    await setCtxUser(null);
    router.replace('/(tabs)');
  };

  const filteredProducts = products.filter((p: Record<string, unknown>) => {
    const name = String(p.name ?? '').toLowerCase();
    const matchSearch = !searchTerm.trim() || name.includes(searchTerm.trim().toLowerCase());
    const matchCategory = categoryFilter === 'all' || (p.category as string) === categoryFilter;
    return matchSearch && matchCategory;
  });

  const filteredOrders = orders.filter(
    (o: Record<string, unknown>) => orderStatusFilter === 'all' || (o.status as string) === orderStatusFilter
  );

  const productsInFlashSale = products.filter(
    (p: Record<string, unknown>) => p.flashSaleEnd && new Date(p.flashSaleEnd as string) > new Date()
  );

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus, token);
      Toast.show({ type: 'success', text1: 'Đã cập nhật trạng thái' });
      await loadOrders();
    } catch (e) {
      Toast.show({ type: 'error', text1: (e as Error).message });
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa đơn hàng này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await orderAPI.delete(orderId, token);
            Toast.show({ type: 'success', text1: 'Đã xóa đơn' });
            await loadOrders();
          } catch (e) {
            Toast.show({ type: 'error', text1: (e as Error).message });
          }
        },
      },
    ]);
  };

  const handleOpenFlashSaleForm = (product: Record<string, unknown> | null) => {
    setFlashSaleProduct(product);
    setFlashSalePrice(product?.flashSalePrice != null ? String(product.flashSalePrice) : '');
    setFlashSaleEnd(
      product?.flashSaleEnd
        ? new Date(product.flashSaleEnd as string).toISOString().slice(0, 16)
        : ''
    );
    setShowFlashSaleForm(true);
  };

  const handleSaveFlashSale = async () => {
    if (!flashSaleProduct) return;
    const price = parseFloat(flashSalePrice);
    if (isNaN(price) || price < 0) {
      Toast.show({ type: 'error', text1: 'Giá flash sale không hợp lệ' });
      return;
    }
    if (!flashSaleEnd.trim()) {
      Toast.show({ type: 'error', text1: 'Chọn thời gian kết thúc' });
      return;
    }
    setSavingFlashSale(true);
    try {
      await productAPI.update({
        id: flashSaleProduct.id,
        flashSalePrice: price,
        flashSaleEnd: new Date(flashSaleEnd).toISOString(),
      }, token);
      Toast.show({ type: 'success', text1: 'Đã cập nhật Flash Sale!' });
      await loadProducts();
      setShowFlashSaleForm(false);
    } catch (e) {
      Toast.show({ type: 'error', text1: (e as Error).message });
    } finally {
      setSavingFlashSale(false);
    }
  };

  const handleRemoveFlashSale = (product: Record<string, unknown>) => {
    Alert.alert('Xác nhận', 'Gỡ sản phẩm khỏi Flash Sale?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Gỡ',
        onPress: async () => {
          try {
            await productAPI.update({
              id: product.id,
              flashSalePrice: null,
              flashSaleEnd: null,
            }, token);
            Toast.show({ type: 'success', text1: 'Đã gỡ Flash Sale!' });
            await loadProducts();
          } catch (e) {
            Toast.show({ type: 'error', text1: (e as Error).message });
          }
        },
      },
    ]);
  };

  const handleSubmitUser = async () => {
    if ((userForm.password || '').length < 6) {
      setRegError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    setRegError('');
    setCreatingUser(true);
    try {
      await authAPI.register(
        userForm.email,
        userForm.password,
        userForm.fullName,
        userForm.role
      );
      Toast.show({ type: 'success', text1: `Đã tạo tài khoản ${userForm.role}!` });
      setShowUserForm(false);
      setUserForm({ fullName: '', email: '', password: '', role: 'staff' });
      await loadUsers();
    } catch (e) {
      setRegError((e as Error).message || 'Không thể tạo tài khoản');
    } finally {
      setCreatingUser(false);
    }
  };

  const handleDiscontinueProduct = (productId: string) => {
    Alert.alert('Xác nhận', 'Sản phẩm sẽ chuyển sang "Ngừng bán". Bạn chắc chứ?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Ngừng bán',
        onPress: async () => {
          try {
            await productAPI.discontinue(productId, token);
            Toast.show({ type: 'success', text1: 'Đã ngừng bán sản phẩm!' });
            await loadProducts();
          } catch (e) {
            Toast.show({ type: 'error', text1: (e as Error).message });
          }
        },
      },
    ]);
  };

  const handleReactivateProduct = async (product: Record<string, unknown>) => {
    try {
      await productAPI.update({ ...product, id: product.id, status: 'ACTIVE' }, token);
      Toast.show({ type: 'success', text1: 'Đã kích hoạt lại sản phẩm!' });
      await loadProducts();
    } catch (e) {
      Toast.show({ type: 'error', text1: (e as Error).message });
    }
  };

  if (!user) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#dc2626" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  const displayName = (user?.name ?? user?.email ?? 'Admin').toString().trim() || 'Admin';

  return (
    <View style={[styles.container, styles.containerNoClip, { paddingTop: insets.top }]}>
      {/* Header: 2 hàng rõ ràng, không chồng lấn */}
      <View style={[styles.header, { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 14 }]}>
        <View style={styles.headerRow1}>
          <Text style={styles.title} numberOfLines={1}>TechShop Admin</Text>
          <View style={styles.badge}>
            <Ionicons name="shield-checkmark" size={14} color="#dc2626" />
            <Text style={styles.badgeText}>Quản trị viên</Text>
          </View>
        </View>
        <View style={styles.headerRow2}>
          <Text style={styles.userName} numberOfLines={1}>Xin chào, {displayName}</Text>
          <Pressable style={({ pressed }) => [styles.headerBtn, styles.headerBtnDanger, pressed && styles.headerBtnPressed]} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.headerBtnTextWhite}>Đăng xuất</Text>
          </Pressable>
        </View>
      </View>

      {/* Tabs: padding phải vừa đủ, không cho kéo thừa khoảng trống sau tab cuối */}
      <View style={styles.tabScrollWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          style={styles.tabScroll}
          contentContainerStyle={[styles.tabScrollContent, { paddingLeft: 16, paddingRight: 40, width: 16 + 5 * TAB_WIDTH + 4 * 12 + 40 }]}
          bounces={true}
        >
        {TABS.map((tab) => (
          <Pressable
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons name={tab.icon as any} size={20} color={activeTab === tab.id ? '#fff' : '#6b7280'} style={styles.tabIcon} />
            <View style={styles.tabLabelWrap}>
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>{tab.label}</Text>
              {tab.id === 'products' && <Text style={[styles.tabCount, activeTab === tab.id && styles.tabCountActive]}> ({products.length})</Text>}
              {tab.id === 'orders' && <Text style={[styles.tabCount, activeTab === tab.id && styles.tabCountActive]}> ({orders.length})</Text>}
              {tab.id === 'users' && <Text style={[styles.tabCount, activeTab === tab.id && styles.tabCountActive]}> ({users.length})</Text>}
              {tab.id === 'flashsale' && <Text style={[styles.tabCount, activeTab === tab.id && styles.tabCountActive]}> ({productsInFlashSale.length})</Text>}
            </View>
          </Pressable>
        ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentInner, { paddingBottom: Math.max(insets.bottom, 24) + 48 }]}
        showsVerticalScrollIndicator={true}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#dc2626']} />}
      >
        {loading && (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color="#dc2626" />
          </View>
        )}

        {activeTab === 'dashboard' && (
          <View style={styles.dashboard}>
            <Text style={styles.sectionTitle}>Tổng quan hệ thống</Text>
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { borderLeftColor: '#3b82f6' }]}>
                <Text style={styles.statLabel}>Tổng doanh thu</Text>
                <Text style={styles.statValue}>{(stats.totalRevenue ?? 0).toLocaleString('vi-VN')} ₫</Text>
              </View>
              <View style={[styles.statCard, { borderLeftColor: '#22c55e' }]}>
                <Text style={styles.statLabel}>Đơn hàng</Text>
                <Text style={styles.statValue}>{stats.totalOrders}</Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { borderLeftColor: '#eab308' }]}>
                <Text style={styles.statLabel}>Sản phẩm</Text>
                <Text style={styles.statValue}>{stats.totalProducts}</Text>
              </View>
              <View style={[styles.statCard, { borderLeftColor: '#a855f7' }]}>
                <Text style={styles.statLabel}>Người dùng</Text>
                <Text style={styles.statValue}>{stats.totalUsers}</Text>
              </View>
            </View>
            <View style={[styles.statCardWide, { backgroundColor: '#3b82f6' }]}>
              <Text style={styles.statCardWideLabel}>Doanh thu hôm nay</Text>
              <Text style={styles.statCardWideValue}>{(stats.todayRevenue ?? 0).toLocaleString('vi-VN')} ₫</Text>
            </View>
            <View style={[styles.statCardWide, { backgroundColor: '#22c55e' }]}>
              <Text style={styles.statCardWideLabel}>Đơn hàng chờ xử lý</Text>
              <Text style={styles.statCardWideValue}>{stats.pendingOrdersCount ?? 0}</Text>
            </View>
          </View>
        )}

        {activeTab === 'products' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quản lý sản phẩm</Text>
            <TextInput
              style={styles.input}
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholderTextColor="#9ca3af"
            />
            <ScrollView horizontal style={styles.filterRow}>
              {['all', 'laptop', 'phone', 'tablet', 'audio', 'accessories', 'monitor'].map((cat) => (
                <Pressable
                  key={cat}
                  style={[styles.filterChip, categoryFilter === cat && styles.filterChipActive]}
                  onPress={() => setCategoryFilter(cat)}
                >
                  <Text style={[styles.filterChipText, categoryFilter === cat && styles.filterChipTextActive]}>
                    {cat === 'all' ? 'Tất cả' : CATEGORY_LABELS[cat] ?? cat}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            {filteredProducts.map((p: Record<string, unknown>) => (
              <View key={String(p.id)} style={styles.card}>
                <View style={styles.cardRow}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{String(p.name)}</Text>
                  <View style={styles.cardBadge}>
                    <Text style={styles.cardBadgeText}>{CATEGORY_LABELS[p.category as string] ?? (p.category as string)}</Text>
                  </View>
                </View>
                <Text style={styles.cardPrice}>{Number(p.price || 0).toLocaleString('vi-VN')} ₫ · Kho: {Number(p.stockQuantity ?? 0)}</Text>
                <Text style={styles.cardStatus}>
                  {(p.productStatus as string) === 'discontinued' ? 'Ngừng bán' : (p.productStatus as string) === 'active' ? 'Còn hàng' : 'Hết hàng'}
                </Text>
                <View style={styles.cardActions}>
                  {(p.productStatus as string) === 'discontinued' ? (
                    <Pressable style={styles.cardBtn} onPress={() => handleReactivateProduct(p)}>
                      <Ionicons name="eye-outline" size={20} color="#16a34a" />
                      <Text style={styles.cardBtnTextGreen}>Kích hoạt lại</Text>
                    </Pressable>
                  ) : (
                    <Pressable style={styles.cardBtn} onPress={() => handleDiscontinueProduct(p.id as string)}>
                      <Ionicons name="trash-outline" size={20} color="#dc2626" />
                      <Text style={styles.cardBtnTextRed}>Ngừng bán</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'orders' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quản lý đơn hàng</Text>
            <ScrollView horizontal style={styles.filterRow}>
              {['all', 'pending', 'processing', 'shipping', 'completed', 'cancelled'].map((st) => (
                <Pressable
                  key={st}
                  style={[styles.filterChip, orderStatusFilter === st && styles.filterChipActive]}
                  onPress={() => setOrderStatusFilter(st)}
                >
                  <Text style={[styles.filterChipText, orderStatusFilter === st && styles.filterChipTextActive]}>
                    {st === 'all' ? 'Tất cả' : ORDER_STATUS_LABELS[st] ?? st}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            {filteredOrders.map((o: Record<string, unknown>) => (
              <View key={String(o.id)} style={styles.card}>
                <View style={styles.cardRow}>
                  <Text style={styles.cardTitle}>Đơn #{String(o.id).slice(-8)}</Text>
                  <View style={[styles.cardBadge, styles.cardBadgeStatus]}>
                    <Text style={styles.cardBadgeText}>{getStatusBadge(o.status as string)}</Text>
                  </View>
                </View>
                <Text style={styles.cardMeta}>Người mua: {String(o.buyerName ?? 'N/A')}</Text>
                <Text style={styles.cardMeta}>
                  {new Date((o.orderDate as string) || (o.createdAt as string) || 0).toLocaleString('vi-VN')}
                </Text>
                <Text style={styles.cardPrice}>{Number(o.totalAmount ?? o.total ?? 0).toLocaleString('vi-VN')} ₫</Text>
                <View style={styles.cardActions}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {['pending', 'processing', 'shipping', 'completed', 'cancelled'].map((st) => (
                      <Pressable
                        key={st}
                        style={[styles.orderStatusBtn, (o.status as string) === st && styles.orderStatusBtnActive]}
                        onPress={() => handleUpdateOrderStatus(o.id as string, st)}
                      >
                        <Text style={[(o.status as string) === st ? styles.orderStatusBtnTextActive : styles.orderStatusBtnText]}>{ORDER_STATUS_LABELS[st] ?? st}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                  <Pressable style={styles.cardBtn} onPress={() => handleDeleteOrder(o.id as string)}>
                    <Ionicons name="trash-outline" size={18} color="#dc2626" />
                    <Text style={styles.cardBtnTextRed}>Xóa đơn</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'users' && (
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Người dùng</Text>
              <Pressable style={styles.addBtn} onPress={() => { setRegError(''); setUserForm({ fullName: '', email: '', password: '', role: 'staff' }); setShowUserForm(true); }}>
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addBtnText}>Thêm user</Text>
              </Pressable>
            </View>
            {users.map((u: Record<string, unknown>) => (
              <View key={String(u.id)} style={styles.card}>
                <Text style={styles.cardTitle}>{String(u.name ?? u.fullName ?? u.email ?? '—')}</Text>
                <Text style={styles.cardMeta}>{String(u.email ?? '')}</Text>
                <View style={styles.cardBadge}><Text style={styles.cardBadgeText}>{String(u.role ?? 'buyer')}</Text></View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'flashsale' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Flash Sale đang chạy</Text>
            {productsInFlashSale.length === 0 ? (
              <Text style={styles.emptyText}>Chưa có sản phẩm nào đang Flash Sale.</Text>
            ) : (
              productsInFlashSale.map((p: Record<string, unknown>) => (
                <View key={String(p.id)} style={styles.card}>
                  <Text style={styles.cardTitle}>{String(p.name)}</Text>
                  <Text style={styles.cardMeta}>
                    Giá gốc: {Number(p.price ?? 0).toLocaleString('vi-VN')} ₫ → Flash: {Number(p.flashSalePrice ?? 0).toLocaleString('vi-VN')} ₫
                  </Text>
                  <Text style={styles.cardMeta}>Kết thúc: {p.flashSaleEnd ? new Date(p.flashSaleEnd as string).toLocaleString('vi-VN') : '—'}</Text>
                  <View style={styles.cardActions}>
                    <Pressable style={styles.cardBtn} onPress={() => handleOpenFlashSaleForm(p)}>
                      <Text style={styles.cardBtnTextBlue}>Sửa</Text>
                    </Pressable>
                    <Pressable style={styles.cardBtn} onPress={() => handleRemoveFlashSale(p)}>
                      <Text style={styles.cardBtnTextRed}>Gỡ Flash Sale</Text>
                    </Pressable>
                  </View>
                </View>
              ))
            )}
            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Thêm sản phẩm vào Flash Sale</Text>
            {filteredProducts
              .filter((p: Record<string, unknown>) => (p.productStatus as string) === 'active')
              .filter((p: Record<string, unknown>) => !p.flashSaleEnd || new Date(p.flashSaleEnd as string) <= new Date())
              .map((p: Record<string, unknown>) => (
                <View key={String(p.id)} style={styles.card}>
                  <Text style={styles.cardTitle}>{String(p.name)}</Text>
                  <Text style={styles.cardPrice}>{Number(p.price ?? 0).toLocaleString('vi-VN')} ₫</Text>
                  <Pressable style={styles.addBtn} onPress={() => handleOpenFlashSaleForm(p)}>
                    <Text style={styles.addBtnText}>Thêm Flash Sale</Text>
                  </Pressable>
                </View>
              ))}
          </View>
        )}
      </ScrollView>

      {/* Modal Flash Sale */}
      <Modal visible={showFlashSaleForm} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowFlashSaleForm(false)}>
          <Pressable style={styles.modalBox} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>{flashSaleProduct?.flashSalePrice != null ? 'Sửa' : 'Thêm'} Flash Sale</Text>
            {flashSaleProduct && <Text style={styles.modalSubtitle}>{String(flashSaleProduct.name)}</Text>}
            <TextInput
              style={styles.input}
              placeholder="Giá Flash Sale (₫)"
              value={flashSalePrice}
              onChangeText={setFlashSalePrice}
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
            />
            <TextInput
              style={styles.input}
              placeholder="Kết thúc (YYYY-MM-DDTHH:mm)"
              value={flashSaleEnd}
              onChangeText={setFlashSaleEnd}
              placeholderTextColor="#9ca3af"
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.modalBtn} onPress={() => setShowFlashSaleForm(false)}>
                <Text style={styles.modalBtnText}>Hủy</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, styles.modalBtnPrimary]} onPress={handleSaveFlashSale} disabled={savingFlashSale}>
                {savingFlashSale ? <ActivityIndicator size="small" color="#fff" /> : <Text style={[styles.modalBtnText, { color: '#fff' }]}>Lưu</Text>}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal Thêm user */}
      <Modal visible={showUserForm} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowUserForm(false)}>
          <Pressable style={styles.modalBox} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Thêm tài khoản</Text>
            {regError ? <Text style={styles.errorText}>{regError}</Text> : null}
            <TextInput style={styles.input} placeholder="Họ tên" value={userForm.fullName} onChangeText={(t) => setUserForm((f) => ({ ...f, fullName: t }))} placeholderTextColor="#9ca3af" />
            <TextInput style={styles.input} placeholder="Email" value={userForm.email} onChangeText={(t) => setUserForm((f) => ({ ...f, email: t }))} keyboardType="email-address" placeholderTextColor="#9ca3af" />
            <TextInput style={styles.input} placeholder="Mật khẩu (≥6 ký tự)" value={userForm.password} onChangeText={(t) => setUserForm((f) => ({ ...f, password: t }))} secureTextEntry placeholderTextColor="#9ca3af" />
            <ScrollView horizontal style={styles.filterRow}>
              {['staff', 'admin', 'buyer'].map((r) => (
                <Pressable key={r} style={[styles.filterChip, userForm.role === r && styles.filterChipActive]} onPress={() => setUserForm((f) => ({ ...f, role: r }))}>
                  <Text style={[styles.filterChipText, userForm.role === r && styles.filterChipTextActive]}>{r}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <View style={styles.modalActions}>
              <Pressable style={styles.modalBtn} onPress={() => setShowUserForm(false)}><Text style={styles.modalBtnText}>Hủy</Text></Pressable>
              <Pressable style={[styles.modalBtn, styles.modalBtnPrimary]} onPress={handleSubmitUser} disabled={creatingUser}>
                {creatingUser ? <ActivityIndicator size="small" color="#fff" /> : <Text style={[styles.modalBtnText, { color: '#fff' }]}>Tạo</Text>}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  containerNoClip: { overflow: 'visible' as const },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#6b7280' },
  header: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerRow1: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  headerRow2: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: 44 },
  title: { fontSize: 22, fontWeight: '800', color: '#dc2626', flexShrink: 0, letterSpacing: -0.5 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fef2f2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#dc2626' },
  userName: { fontSize: 15, color: '#374151', fontWeight: '500', flex: 1, minWidth: 0 },
  headerBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, flexShrink: 0 },
  headerBtnDanger: { backgroundColor: '#dc2626', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3 },
  headerBtnPressed: { opacity: 0.9 },
  headerBtnText: { fontSize: 14, color: '#374151', fontWeight: '600' },
  headerBtnTextWhite: { fontSize: 14, color: '#fff', fontWeight: '600' },
  tabScrollWrap: { width: '100%', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  tabScroll: { width: '100%', flexGrow: 0, maxHeight: 56 },
  tabScrollContent: { paddingVertical: 10, flexDirection: 'row', alignItems: 'stretch' },
  tab: { width: TAB_WIDTH, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', paddingVertical: 10, paddingHorizontal: 14, marginRight: 12, borderRadius: 12, flexShrink: 0, overflow: 'visible' as const },
  tabActive: { backgroundColor: '#dc2626' },
  tabIcon: { marginRight: 8 },
  tabLabelWrap: { flexDirection: 'row', alignItems: 'center', flexShrink: 0 },
  tabText: { fontSize: 14, color: '#6b7280' },
  tabTextActive: { color: '#fff', fontWeight: '700' },
  tabCount: { fontSize: 12, color: '#9ca3af', marginLeft: 2 },
  tabCountActive: { color: 'rgba(255,255,255,0.9)' },
  content: { flex: 1 },
  contentInner: { padding: 16, paddingHorizontal: 16 },
  loadingWrap: { padding: 24, alignItems: 'center' },
  dashboard: { gap: 14 },
  sectionTitle: { fontSize: 19, fontWeight: '800', color: '#111', marginBottom: 12, letterSpacing: -0.3 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  statCard: { flex: 1, minWidth: 0, backgroundColor: '#fff', padding: 18, borderRadius: 16, borderLeftWidth: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  statLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4, fontWeight: '500' },
  statValue: { fontSize: 20, fontWeight: '800', color: '#111' },
  statCardWide: { padding: 22, borderRadius: 16, marginTop: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  statCardWideLabel: { fontSize: 15, color: 'rgba(255,255,255,0.95)', fontWeight: '600', marginBottom: 4 },
  statCardWideValue: { fontSize: 26, fontWeight: '800', color: '#fff' },
  section: { marginBottom: 24 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, marginBottom: 10 },
  filterRow: { flexDirection: 'row', marginBottom: 12, gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff', borderRadius: 999, borderWidth: 1, borderColor: '#e5e7eb' },
  filterChipActive: { backgroundColor: '#dc2626', borderColor: '#dc2626' },
  filterChipText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  filterChipTextActive: { color: '#fff', fontWeight: '600' },
  card: { backgroundColor: '#fff', padding: 18, borderRadius: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111', flex: 1 },
  cardBadge: { backgroundColor: '#e0e7ff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  cardBadgeStatus: { backgroundColor: '#fef3c7' },
  cardBadgeText: { fontSize: 12, fontWeight: '600', color: '#3730a3' },
  cardMeta: { fontSize: 13, color: '#6b7280', marginBottom: 3 },
  cardPrice: { fontSize: 16, fontWeight: '800', color: '#dc2626', marginBottom: 8 },
  cardStatus: { fontSize: 12, color: '#6b7280', marginBottom: 8 },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  cardBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardBtnTextRed: { fontSize: 13, color: '#dc2626', fontWeight: '600' },
  cardBtnTextGreen: { fontSize: 13, color: '#16a34a', fontWeight: '600' },
  cardBtnTextBlue: { fontSize: 13, color: '#2563eb', fontWeight: '600' },
  orderStatusBtn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#f3f4f6', borderRadius: 10, marginRight: 6 },
  orderStatusBtnActive: { backgroundColor: '#dc2626' },
  orderStatusBtnText: { fontSize: 12, color: '#374151', fontWeight: '500' },
  orderStatusBtnTextActive: { fontSize: 12, color: '#fff', fontWeight: '600' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#dc2626', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12, shadowColor: '#dc2626', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
  addBtnText: { fontSize: 14, color: '#fff', fontWeight: '700' },
  emptyText: { fontSize: 14, color: '#6b7280', marginBottom: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalBox: { backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '100%', maxWidth: 400, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#111', marginBottom: 8 },
  modalSubtitle: { fontSize: 14, color: '#6b7280', marginBottom: 12 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 20 },
  modalBtn: { paddingVertical: 12, paddingHorizontal: 22, borderRadius: 12, backgroundColor: '#f3f4f6' },
  modalBtnPrimary: { backgroundColor: '#dc2626' },
  modalBtnText: { fontSize: 15, color: '#374151', fontWeight: '600' },
  errorText: { fontSize: 13, color: '#dc2626', marginBottom: 8 },
});

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { cartAPI, type CartItemResponse } from '@/utils/api';
import { useUser } from '@/contexts/UserContext';
import Toast from 'react-native-toast-message';

const PLACEHOLDER_IMAGE = 'https://placehold.co/400x400?text=No+Image';

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user: ctxUser } = useUser();
  const [items, setItems] = useState<CartItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const uid = ctxUser?.id;
  const token = ctxUser?.token;

  const loadCart = useCallback(async () => {
    if (!uid) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await cartAPI.getByUserId(uid, token);
      setItems(data?.cartItems ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được giỏ hàng');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [uid, token]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  useFocusEffect(
    useCallback(() => {
      if (uid) loadCart();
    }, [uid, loadCart])
  );

  const total = items.reduce((sum, i) => sum + i.priceAtTime * i.quantity, 0);

  const handleUpdateQuantity = useCallback(
    async (item: CartItemResponse, delta: number) => {
      const newQty = item.quantity + delta;
      if (newQty < 1) {
        handleRemove(item);
        return;
      }
      setUpdatingId(item.id);
      try {
        const data = await cartAPI.updateQuantity(item.id, newQty, token);
        setItems(data?.cartItems ?? []);
      } catch (err) {
        Toast.show({
          type: 'error',
          text1: 'Không thể cập nhật số lượng',
          text2: err instanceof Error ? err.message : undefined,
          visibilityTime: 2500,
        });
      } finally {
        setUpdatingId(null);
      }
    },
    [token]
  );

  const handleRemove = useCallback(async (item: CartItemResponse) => {
    setUpdatingId(item.id);
    try {
      const data = await cartAPI.removeItem(item.id, token);
      setItems(data?.cartItems ?? []);
      Toast.show({ type: 'success', text1: 'Đã xóa khỏi giỏ hàng', visibilityTime: 2000 });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Không thể xóa',
        text2: err instanceof Error ? err.message : undefined,
        visibilityTime: 2500,
      });
    } finally {
      setUpdatingId(null);
    }
  }, [token]);

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111" />
          </Pressable>
          <Text style={styles.headerTitle}>Giỏ hàng</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#dc2626" />
        </View>
      </View>
    );
  }

  if (!uid) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111" />
          </Pressable>
          <Text style={styles.headerTitle}>Giỏ hàng</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.emptyWrap}>
          <Ionicons name="cart-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>Vui lòng đăng nhập</Text>
          <Text style={styles.emptySub}>Đăng nhập để xem giỏ hàng và đặt hàng.</Text>
          <Pressable style={styles.primaryBtn} onPress={() => router.back()}>
            <Text style={styles.primaryBtnText}>Quay lại</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Ionicons name="cart" size={22} color="#dc2626" />
          <Text style={styles.headerTitle}>Giỏ hàng</Text>
          {items.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{items.length}</Text>
            </View>
          )}
        </View>
        <View style={styles.backBtn} />
      </View>

      {error ? (
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.primaryBtn} onPress={loadCart}>
            <Text style={styles.primaryBtnText}>Thử lại</Text>
          </Pressable>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="cart-outline" size={56} color="#dc2626" />
            </View>
            <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
            <Text style={styles.emptySub}>
              Chưa có sản phẩm nào trong giỏ.{'\n'}Khám phá và thêm hàng yêu thích nhé!
            </Text>
            <Pressable
              style={({ pressed }) => [styles.emptyCtaBtn, pressed && styles.emptyCtaBtnPressed]}
              onPress={() => router.back()}
            >
              <Ionicons name="bag-add-outline" size={22} color="#fff" />
              <Text style={styles.emptyCtaText}>Tiếp tục mua sắm</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: 24 + 100 + insets.bottom }]}
            showsVerticalScrollIndicator={false}
          >
            {items.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <Image
                  source={{ uri: item.imageUrl || PLACEHOLDER_IMAGE }}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
                <View style={styles.itemBody}>
                  <Text style={styles.itemName} numberOfLines={2}>{item.productName}</Text>
                  <Text style={styles.itemPrice}>
                    {item.priceAtTime.toLocaleString('vi-VN')} ₫
                  </Text>
                  <View style={styles.quantityRow}>
                    <Pressable
                      style={styles.qtyBtn}
                      onPress={() => handleUpdateQuantity(item, -1)}
                      disabled={updatingId === item.id}
                      hitSlop={12}
                    >
                      <Ionicons name="remove" size={20} color="#374151" />
                    </Pressable>
                    <Text style={styles.qtyValue}>{item.quantity}</Text>
                    <Pressable
                      style={styles.qtyBtn}
                      onPress={() => handleUpdateQuantity(item, 1)}
                      disabled={updatingId === item.id}
                      hitSlop={12}
                    >
                      <Ionicons name="add" size={20} color="#374151" />
                    </Pressable>
                    <Pressable
                      style={styles.removeBtn}
                      onPress={() => handleRemove(item)}
                      disabled={updatingId === item.id}
                      hitSlop={12}
                    >
                      <Ionicons name="trash-outline" size={22} color="#dc2626" />
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
          <View style={[styles.footer, { paddingBottom: Math.max(20 + insets.bottom, 32) }]}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng cộng:</Text>
              <Text style={styles.totalValue}>{total.toLocaleString('vi-VN')} ₫</Text>
            </View>
            <Pressable
              style={styles.primaryBtn}
              onPress={() => {
                Toast.show({ type: 'info', text1: 'Tính năng thanh toán đang cập nhật', visibilityTime: 2500 });
              }}
            >
              <Text style={styles.primaryBtnText}>Thanh toán</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  badge: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    backgroundColor: '#f8fafc',
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 40,
    paddingHorizontal: 32,
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 8,
  },
  emptyIconCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  emptySub: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  emptyCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#dc2626',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 16,
    minWidth: 220,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyCtaBtnPressed: {
    opacity: 0.9,
  },
  emptyCtaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  errorWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  itemBody: {
    flex: 1,
    minWidth: 0,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 15,
    color: '#dc2626',
    fontWeight: '700',
    marginBottom: 8,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  qtyValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    minWidth: 24,
    textAlign: 'center',
  },
  removeBtn: {
    marginLeft: 'auto',
    padding: 6,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  totalLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#dc2626',
  },
  primaryBtn: {
    backgroundColor: '#dc2626',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

import React, { useState, useCallback } from 'react';
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
import { cartAPI, wishlistAPI } from '@/utils/api';
import type { Product } from '@/types/product';
import Toast from 'react-native-toast-message';
import { useUser } from '@/contexts/UserContext';

const PLACEHOLDER_IMAGE = 'https://placehold.co/400x400?text=No+Image';

export default function WishlistScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user: ctxUser } = useUser();
  const [wishlist, setWishlistState] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectingMode, setSelectingMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const uid = ctxUser?.id;
  const token = ctxUser?.token ?? undefined;

  const load = useCallback(async () => {
    if (!uid) {
      setWishlistState([]);
      setLoading(false);
      return;
    }
    try {
      const res = await wishlistAPI.getByUserId(uid, token);
      setWishlistState(res?.products ?? []);
    } catch {
      setWishlistState([]);
    } finally {
      setLoading(false);
    }
  }, [uid, token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const removeFromWishlist = useCallback(
    async (product: Product) => {
      if (!uid) return;
      try {
        const res = await wishlistAPI.removeProduct(uid, product.id, token);
        setWishlistState(res?.products ?? []);
        Toast.show({ type: 'success', text1: 'Đã xóa khỏi yêu thích', visibilityTime: 2000 });
      } catch (err) {
        Toast.show({
          type: 'error',
          text1: 'Không thể xóa khỏi yêu thích',
          text2: err instanceof Error ? err.message : undefined,
          visibilityTime: 2500,
        });
      }
    },
    [uid, token]
  );

  const addToCart = useCallback(
    async (product: Product) => {
      if (!uid) {
        Toast.show({ type: 'info', text1: 'Vui lòng đăng nhập để thêm vào giỏ', visibilityTime: 2500 });
        return;
      }
      try {
        await cartAPI.addProduct(uid, product.id, 1, token);
        Toast.show({ type: 'success', text1: 'Đã thêm vào giỏ hàng', visibilityTime: 2500 });
      } catch (err) {
        Toast.show({
          type: 'error',
          text1: 'Không thể thêm vào giỏ',
          text2: err instanceof Error ? err.message : undefined,
          visibilityTime: 3000,
        });
      }
    },
    [uid, token]
  );

  const toggleSelect = useCallback((productId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(wishlist.map((p) => p.id)));
  }, [wishlist]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setSelectingMode(false);
  }, []);

  const deleteSelected = useCallback(async () => {
    if (!uid || selectedIds.size === 0) return;
    setDeleting(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) => wishlistAPI.removeProduct(uid, id, token))
      );
      const res = await wishlistAPI.getByUserId(uid, token);
      setWishlistState(res?.products ?? []);
      setSelectedIds(new Set());
      setSelectingMode(false);
      Toast.show({ type: 'success', text1: `Đã xóa ${selectedIds.size} sản phẩm khỏi yêu thích`, visibilityTime: 2500 });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Không thể xóa',
        text2: err instanceof Error ? err.message : undefined,
        visibilityTime: 2500,
      });
    } finally {
      setDeleting(false);
    }
  }, [uid, token, selectedIds]);

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111" />
          </Pressable>
          <Text style={styles.headerTitle}>Sản phẩm yêu thích</Text>
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
          <Text style={styles.headerTitle}>Sản phẩm yêu thích</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.emptyWrap}>
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="heart-outline" size={56} color="#dc2626" />
            </View>
            <Text style={styles.emptyTitle}>Vui lòng đăng nhập</Text>
            <Text style={styles.emptySub}>Đăng nhập để lưu sản phẩm yêu thích.</Text>
            <Pressable style={styles.emptyCtaBtn} onPress={() => router.back()}>
              <Text style={styles.emptyCtaText}>Quay lại</Text>
            </Pressable>
          </View>
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
        <Text style={styles.headerTitle}>Sản phẩm yêu thích</Text>
        <View style={styles.headerRight}>
          {wishlist.length > 0 && !selectingMode && (
            <>
              <Pressable style={styles.headerActionBtn} onPress={() => setSelectingMode(true)}>
                <Text style={styles.headerActionText}>Chọn</Text>
              </Pressable>
              <View style={styles.headerBadgeWrap}>
                <Text style={styles.headerBadge}>{wishlist.length}</Text>
              </View>
            </>
          )}
          {selectingMode && (
            <>
              <Pressable style={styles.headerActionBtn} onPress={clearSelection}>
                <Text style={styles.headerActionText}>Hủy</Text>
              </Pressable>
              <Pressable
                style={styles.headerActionBtn}
                onPress={() => (selectedIds.size === wishlist.length ? clearSelection() : selectAll())}
              >
                <Text style={styles.headerActionText}>
                  {selectedIds.size === wishlist.length ? 'Bỏ chọn' : 'Tất cả'}
                </Text>
              </Pressable>
              <Pressable
                style={[styles.headerDeleteBtn, (selectedIds.size === 0 || deleting) && styles.headerActionBtnDisabled]}
                onPress={deleteSelected}
                disabled={selectedIds.size === 0 || deleting}
              >
                <Ionicons name="trash-outline" size={18} color="#fff" />
                <Text style={styles.headerDeleteBtnText}>Xóa ({selectedIds.size})</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>

      {wishlist.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="heart-outline" size={56} color="#dc2626" />
            </View>
            <Text style={styles.emptyTitle}>Chưa có sản phẩm yêu thích</Text>
            <Text style={styles.emptySub}>
              Thêm sản phẩm từ trang chủ bằng nút trái tim{'\n'}để xem lại nhanh nhé!
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
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 24 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
        >
          {wishlist.map((product) => {
            const isSelected = selectedIds.has(product.id);
            return (
            <View key={product.id} style={[styles.card, selectingMode && isSelected && styles.cardSelected]}>
              {selectingMode && (
                <Pressable
                  style={styles.cardCheckbox}
                  onPress={() => toggleSelect(product.id)}
                >
                  <Ionicons
                    name={isSelected ? 'checkbox' : 'square-outline'}
                    size={24}
                    color={isSelected ? '#dc2626' : '#9ca3af'}
                  />
                </Pressable>
              )}
              <View style={styles.cardImageWrap}>
                <Image
                  source={{ uri: product.image || PLACEHOLDER_IMAGE }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
                {!selectingMode && (
                  <Pressable
                    style={styles.removeBtn}
                    onPress={() => removeFromWishlist(product)}
                  >
                    <Ionicons name="heart" size={20} color="#dc2626" />
                  </Pressable>
                )}
                {product.discount != null && product.discount > 0 && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>-{product.discount}%</Text>
                  </View>
                )}
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardName} numberOfLines={2}>{product.name}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>{product.price?.toLocaleString('vi-VN')} ₫</Text>
                  {product.originalPrice != null && product.originalPrice > 0 && (
                    <Text style={styles.originalPrice}>
                      {product.originalPrice.toLocaleString('vi-VN')} ₫
                    </Text>
                  )}
                </View>
                {!selectingMode && (
                  <Pressable
                    style={({ pressed }) => [styles.addCartBtn, pressed && styles.addCartBtnPressed]}
                    onPress={() => addToCart(product)}
                  >
                    <Ionicons name="cart-outline" size={18} color="#fff" />
                    <Text style={styles.addCartBtnText}>Thêm vào giỏ</Text>
                  </Pressable>
                )}
              </View>
            </View>
            );
          })}
        </ScrollView>
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
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 44,
  },
  headerActionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  headerActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
  },
  headerActionBtnDisabled: {
    opacity: 0.5,
  },
  headerDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dc2626',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  headerDeleteBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  headerBadgeWrap: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  headerBadge: {
    fontSize: 13,
    fontWeight: '700',
    color: '#dc2626',
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
    minWidth: 200,
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'stretch',
  },
  cardSelected: {
    borderColor: '#dc2626',
    borderWidth: 2,
    backgroundColor: '#fef2f2',
  },
  cardCheckbox: {
    justifyContent: 'center',
    paddingLeft: 12,
    paddingRight: 8,
  },
  cardImageWrap: {
    width: 110,
    height: 110,
    position: 'relative',
    backgroundColor: '#f3f4f6',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  removeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: '#dc2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  cardBody: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  cardName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: '#dc2626',
  },
  originalPrice: {
    fontSize: 12,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  addCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#dc2626',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  addCartBtnPressed: {
    opacity: 0.9,
  },
  addCartBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});

import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { useUser } from '@/contexts/UserContext';
import { orderAPI, reviewAPI, type OrderItemResponse, type OrderLineItem } from '@/utils/api';
import { fetchProducts } from '@/services/api';

const PLACEHOLDER_IMAGE = 'https://placehold.co/240x240?text=No+Image';

type ProductLookupItem = {
  id: string;
  image?: string | null;
  category?: string;
  description?: string;
};

const STATUS_LABEL: Record<OrderItemResponse['status'], string> = {
  pending: 'Chờ xử lý',
  processing: 'Đang xử lý',
  shipping: 'Đang giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

function getStatusColor(status: OrderItemResponse['status']) {
  if (status === 'completed') return '#15803d';
  if (status === 'cancelled') return '#b91c1c';
  if (status === 'shipping') return '#1d4ed8';
  if (status === 'processing') return '#7c3aed';
  return '#b45309';
}

export default function OrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderItemResponse[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderItemResponse | null>(null);
  const [reviewTarget, setReviewTarget] = useState<{ orderId: string; item: OrderLineItem } | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedKeys, setReviewedKeys] = useState<Set<string>>(new Set());
  const [productLookup, setProductLookup] = useState<Record<string, ProductLookupItem>>({});

  const uid = user?.id;
  const token = user?.token;

  const loadOrders = useCallback(async () => {
    if (!uid) {
      setOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await orderAPI.getByUserId(uid, token);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setOrders([]);
      Toast.show({
        type: 'error',
        text1: 'Không tải được đơn hàng',
        text2: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setLoading(false);
    }
  }, [uid, token]);

  const loadProductLookup = useCallback(async () => {
    try {
      const products = await fetchProducts();
      const lookup = products.reduce<Record<string, ProductLookupItem>>((acc, product) => {
        acc[product.id] = {
          id: product.id,
          image: product.image ?? product.imgUrl ?? null,
          category: typeof product.category === 'string' ? product.category : undefined,
          description: typeof product.description === 'string' ? product.description : undefined,
        };
        return acc;
      }, {});
      setProductLookup(lookup);
    } catch {
      setProductLookup({});
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProductLookup();
      loadOrders();
    }, [loadOrders, loadProductLookup])
  );

  const totalSpent = useMemo(
    () => orders.filter((o) => o.status === 'completed').reduce((sum, o) => sum + o.totalAmount, 0),
    [orders]
  );

  const getProductImage = useCallback(
    (item: OrderLineItem) => productLookup[item.productId]?.image || PLACEHOLDER_IMAGE,
    [productLookup]
  );

  const getProductCategory = useCallback(
    (item: OrderLineItem) => productLookup[item.productId]?.category || 'Sản phẩm công nghệ',
    [productLookup]
  );

  const getProductDescription = useCallback(
    (item: OrderLineItem) => productLookup[item.productId]?.description || 'Sản phẩm đã được lưu trong đơn hàng của bạn.',
    [productLookup]
  );

  const handleCancel = useCallback(
    async (orderId: string) => {
      try {
        await orderAPI.cancel(orderId, token);
        Toast.show({ type: 'success', text1: 'Đã hủy đơn hàng' });
        await loadOrders();
      } catch (err) {
        Toast.show({
          type: 'error',
          text1: 'Không thể hủy đơn hàng',
          text2: err instanceof Error ? err.message : undefined,
        });
      }
    },
    [loadOrders, token]
  );

  const openReview = useCallback((orderId: string, item: OrderLineItem) => {
    setReviewTarget({ orderId, item });
    setRating(5);
    setComment('');
  }, []);

  const submitReview = useCallback(async () => {
    if (!reviewTarget) return;
    const key = `${reviewTarget.orderId}:${reviewTarget.item.productId}`;
    setSubmittingReview(true);
    try {
      await reviewAPI.create(
        reviewTarget.item.productId,
        reviewTarget.orderId,
        rating,
        comment.trim(),
        token
      );
      setReviewedKeys((prev) => {
        const next = new Set(prev);
        next.add(key);
        return next;
      });
      setReviewTarget(null);
      Toast.show({ type: 'success', text1: 'Đánh giá thành công' });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Không thể gửi đánh giá',
        text2: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSubmittingReview(false);
    }
  }, [comment, rating, reviewTarget, token]);

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}> 
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111" />
          </Pressable>
          <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
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
          <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.emptyWrap}>
          <Ionicons name="receipt-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>Vui lòng đăng nhập</Text>
          <Text style={styles.emptySub}>Đăng nhập để theo dõi đơn hàng của bạn.</Text>
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
        <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Tổng đơn: {orders.length}</Text>
        <Text style={styles.summaryValue}>Đã chi: {totalSpent.toLocaleString('vi-VN')} ₫</Text>
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="bag-handle-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>Bạn chưa có đơn hàng nào</Text>
          <Text style={styles.emptySub}>Hãy thêm sản phẩm vào giỏ và đặt đơn đầu tiên.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 20 + insets.bottom }]}> 
          {orders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderTopRow}>
                <Text style={styles.orderCode}>Mã đơn: {order.id.slice(-8).toUpperCase()}</Text>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(order.status)}20` }]}> 
                  <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                    {STATUS_LABEL[order.status]}
                  </Text>
                </View>
              </View>

              <Text style={styles.orderMeta}>Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}</Text>
              <Text style={styles.orderMeta}>Sản phẩm: {order.items.length}</Text>
              <View style={styles.orderPreviewRow}>
                <Image source={{ uri: getProductImage(order.items[0]) }} style={styles.orderPreviewImage} resizeMode="cover" />
                <View style={styles.orderPreviewInfo}>
                  <Text style={styles.orderPreviewName} numberOfLines={1}>
                    {order.items[0]?.productName}
                  </Text>
                  <Text style={styles.orderPreviewSub} numberOfLines={1}>
                    {order.items.length > 1
                      ? `và ${order.items.length - 1} sản phẩm khác`
                      : `${order.items[0]?.quantity ?? 1} sản phẩm`}
                  </Text>
                </View>
              </View>
              <Text style={styles.orderTotal}>{order.totalAmount.toLocaleString('vi-VN')} ₫</Text>

              <View style={styles.actionRow}>
                <Pressable style={styles.secondaryBtn} onPress={() => setSelectedOrder(order)}>
                  <Text style={styles.secondaryBtnText}>Xem chi tiết</Text>
                </Pressable>
                {order.status === 'pending' && (
                  <Pressable style={styles.dangerBtn} onPress={() => handleCancel(order.id)}>
                    <Text style={styles.dangerBtnText}>Hủy đơn</Text>
                  </Pressable>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <Modal visible={selectedOrder != null} transparent animationType="slide" onRequestClose={() => setSelectedOrder(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedOrder(null)}>
          <Pressable style={styles.modalPanel} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết đơn hàng</Text>
              <Pressable onPress={() => setSelectedOrder(null)}>
                <Ionicons name="close" size={24} color="#111" />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.modalContent}>
              <View style={styles.detailSummaryCard}>
                <View style={styles.detailSummaryTop}>
                  <Text style={styles.detailOrderCode}>Đơn #{selectedOrder?.id.slice(-8).toUpperCase()}</Text>
                  {selectedOrder ? (
                    <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(selectedOrder.status)}20` }]}> 
                      <Text style={[styles.statusText, { color: getStatusColor(selectedOrder.status) }]}>
                        {STATUS_LABEL[selectedOrder.status]}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.detailSummaryText}>Ngày đặt: {selectedOrder ? new Date(selectedOrder.createdAt).toLocaleString('vi-VN') : ''}</Text>
                <Text style={styles.detailSummaryText}>Phương thức thanh toán: {selectedOrder?.paymentMethod === 'momo' ? 'MoMo' : 'Thanh toán khi nhận hàng'}</Text>
                <Text style={styles.detailSummaryText}>Trạng thái thanh toán: {selectedOrder?.paymentStatus === 'paid' ? 'Đã thanh toán' : selectedOrder?.paymentStatus === 'failed' ? 'Thất bại' : 'Chưa thanh toán'}</Text>
                <Text style={styles.detailSummaryTotal}>Tổng tiền: {selectedOrder?.totalAmount.toLocaleString('vi-VN')} ₫</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Thông tin nhận hàng</Text>
                <Text style={styles.detailText}>Người nhận: {selectedOrder?.shippingName || 'Chưa cập nhật'}</Text>
                <Text style={styles.detailText}>Số điện thoại: {selectedOrder?.shippingPhone || 'Chưa cập nhật'}</Text>
                <Text style={styles.detailText}>Địa chỉ: {selectedOrder?.shippingAddress || 'Chưa cập nhật'}</Text>
                {selectedOrder?.note ? <Text style={styles.detailText}>Ghi chú: {selectedOrder.note}</Text> : null}
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Sản phẩm trong đơn</Text>
              {selectedOrder?.items.map((item) => {
                const reviewKey = `${selectedOrder.id}:${item.productId}`;
                const canReview = selectedOrder.status === 'completed';
                const reviewed = reviewedKeys.has(reviewKey);
                return (
                  <View key={`${selectedOrder.id}-${item.productId}`} style={styles.itemRow}>
                    <Image source={{ uri: getProductImage(item) }} style={styles.itemImage} resizeMode="cover" />
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.productName}</Text>
                      <Text style={styles.itemCategory}>{getProductCategory(item)}</Text>
                      <Text style={styles.itemMeta}>SL: {item.quantity} · Giá: {item.price.toLocaleString('vi-VN')} ₫</Text>
                      <Text style={styles.itemSubTotal}>Tạm tính: {(item.price * item.quantity).toLocaleString('vi-VN')} ₫</Text>
                      <Text style={styles.itemDescription} numberOfLines={2}>{getProductDescription(item)}</Text>
                    </View>
                    {canReview && (
                      <Pressable
                        style={[styles.reviewBtn, reviewed && styles.reviewBtnDisabled]}
                        disabled={reviewed}
                        onPress={() => openReview(selectedOrder.id, item)}
                      >
                        <Text style={styles.reviewBtnText}>{reviewed ? 'Đã đánh giá' : 'Đánh giá'}</Text>
                      </Pressable>
                    )}
                  </View>
                );
              })}
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={reviewTarget != null} transparent animationType="fade" onRequestClose={() => setReviewTarget(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setReviewTarget(null)}>
          <Pressable style={styles.reviewPanel} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.reviewTitle}>Đánh giá sản phẩm</Text>
            <Text style={styles.reviewName}>{reviewTarget?.item.productName}</Text>

            <View style={styles.starInputRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Pressable key={s} onPress={() => setRating(s)}>
                  <Ionicons
                    name={s <= rating ? 'star' : 'star-outline'}
                    size={28}
                    color={s <= rating ? '#f59e0b' : '#d1d5db'}
                  />
                </Pressable>
              ))}
            </View>

            <TextInput
              style={styles.reviewInput}
              value={comment}
              onChangeText={setComment}
              placeholder="Viết cảm nhận của bạn..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.reviewActionRow}>
              <Pressable style={styles.secondaryBtn} onPress={() => setReviewTarget(null)}>
                <Text style={styles.secondaryBtnText}>Đóng</Text>
              </Pressable>
              <Pressable style={styles.primaryBtn} onPress={submitReview} disabled={submittingReview}>
                {submittingReview ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Gửi</Text>}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
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
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  summaryCard: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  summaryLabel: { color: '#6b7280', fontSize: 14 },
  summaryValue: { color: '#111827', fontSize: 18, fontWeight: '700', marginTop: 6 },
  scrollContent: { paddingHorizontal: 16, gap: 12 },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 6,
  },
  orderTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  orderCode: { fontSize: 14, color: '#374151', fontWeight: '600' },
  statusBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },
  orderMeta: { fontSize: 13, color: '#6b7280' },
  orderPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
    marginBottom: 2,
  },
  orderPreviewImage: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
  },
  orderPreviewInfo: {
    flex: 1,
    minWidth: 0,
  },
  orderPreviewName: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 14,
  },
  orderPreviewSub: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 2,
  },
  orderTotal: { fontSize: 18, color: '#dc2626', fontWeight: '800', marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#dc2626',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    minHeight: 42,
  },
  secondaryBtnText: { color: '#111827', fontWeight: '700' },
  dangerBtn: {
    flex: 1,
    backgroundColor: '#fee2e2',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  dangerBtnText: { color: '#b91c1c', fontWeight: '700' },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 8,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827', textAlign: 'center' },
  emptySub: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalPanel: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  modalContent: { padding: 16, gap: 12 },
  detailSummaryCard: {
    backgroundColor: '#fff5f5',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    gap: 4,
  },
  detailSummaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
    gap: 8,
  },
  detailOrderCode: {
    color: '#991b1b',
    fontSize: 15,
    fontWeight: '700',
  },
  detailSummaryText: {
    color: '#4b5563',
    fontSize: 13,
  },
  detailSummaryTotal: {
    color: '#dc2626',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  detailSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    gap: 10,
  },
  detailSectionTitle: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '700',
  },
  detailText: {
    color: '#4b5563',
    fontSize: 13,
    lineHeight: 20,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 10,
  },
  itemImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
  },
  itemInfo: { flex: 1 },
  itemName: { color: '#111827', fontWeight: '600' },
  itemCategory: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  itemMeta: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  itemSubTotal: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  itemDescription: {
    color: '#6b7280',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  reviewBtn: {
    backgroundColor: '#dc2626',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  reviewBtnDisabled: { backgroundColor: '#9ca3af' },
  reviewBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  reviewPanel: {
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginTop: 80,
  },
  reviewTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  reviewName: { marginTop: 4, color: '#6b7280' },
  starInputRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  reviewInput: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 90,
    color: '#111827',
  },
  reviewActionRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
});

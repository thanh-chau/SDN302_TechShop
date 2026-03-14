import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Product } from '@/types/product';
import type { Review } from '@/types/product';
import { reviewAPI } from '@/utils/api';

export interface ProductDetailProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

const STAR_COLOR = '#facc15';
const STAR_EMPTY = '#d1d5db';

function StarDisplay({ rating }: { rating: number }) {
  const r = Math.floor(rating);
  return (
    <View style={styles.starRow}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Ionicons
          key={i}
          name={i < r ? 'star' : 'star-outline'}
          size={18}
          color={i < r ? STAR_COLOR : STAR_EMPTY}
        />
      ))}
    </View>
  );
}

export function ProductDetail({ product, onClose, onAddToCart }: ProductDetailProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    if (!product?.id) return;
    setLoadingReviews(true);
    reviewAPI
      .getByProduct(product.id)
      .then((data) => {
        setReviews(data.reviews || []);
        setAvgRating(data.avgRating ?? 0);
        setReviewCount(data.total ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoadingReviews(false));
  }, [product?.id]);

  if (!product) return null;

  const rating = product.avgRating ?? product.rating ?? avgRating;
  const count = product.reviewCount ?? product.reviews ?? reviewCount;

  return (
    <Modal visible={!!product} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={24} color="#374151" />
          </Pressable>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.twoCol}>
              <View style={styles.imageBlock}>
                {product.discount ? (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>-{product.discount}%</Text>
                  </View>
                ) : null}
                <Image
                  source={{ uri: product.image }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
              </View>

              <View style={styles.info}>
                <Text style={styles.productName}>{product.name}</Text>
                <View style={styles.ratingRow}>
                  <StarDisplay rating={rating} />
                  <Text style={styles.ratingNum}>
                    {rating > 0 ? rating.toFixed(1) : 'Chưa có'}
                  </Text>
                </View>
                <Text style={styles.reviewLabel}>({count} đánh giá)</Text>

                <View style={styles.priceBlock}>
                  <Text style={styles.price}>
                    {product.price.toLocaleString('vi-VN')} ₫
                  </Text>
                  {product.originalPrice ? (
                    <Text style={styles.originalPrice}>
                      {product.originalPrice.toLocaleString('vi-VN')} ₫
                    </Text>
                  ) : null}
                  {product.discount && product.originalPrice && (
                    <Text style={styles.savings}>
                      Tiết kiệm{' '}
                      {(product.originalPrice - product.price).toLocaleString('vi-VN')} ₫
                    </Text>
                  )}
                </View>

                {product.description ? (
                  <View style={styles.descBlock}>
                    <Text style={styles.descTitle}>Mô tả sản phẩm</Text>
                    <Text style={styles.descText}>{product.description}</Text>
                  </View>
                ) : null}

                <View style={styles.features}>
                  <View style={styles.feature}>
                    <Ionicons name="shield-checkmark-outline" size={28} color="#2563eb" />
                    <Text style={styles.featureText}>Bảo hành chính hãng</Text>
                  </View>
                  <View style={styles.feature}>
                    <Ionicons name="cube-outline" size={28} color="#16a34a" />
                    <Text style={styles.featureText}>Miễn phí vận chuyển</Text>
                  </View>
                  <View style={styles.feature}>
                    <Ionicons name="flash-outline" size={28} color="#ea580c" />
                    <Text style={styles.featureText}>Giao hàng nhanh</Text>
                  </View>
                </View>

                <View style={styles.stockRow}>
                  <View
                    style={[
                      styles.stockBadge,
                      (product.stock ?? 0) > 20 && styles.stockOk,
                      (product.stock ?? 0) > 0 && (product.stock ?? 0) <= 20 && styles.stockWarn,
                      (product.stock ?? 0) === 0 && styles.stockOut,
                    ]}
                  >
                    <Text
                      style={[
                        styles.stockText,
                        (product.stock ?? 0) > 20 && styles.stockTextOk,
                        (product.stock ?? 0) > 0 && (product.stock ?? 0) <= 20 && styles.stockTextWarn,
                        (product.stock ?? 0) === 0 && styles.stockTextOut,
                      ]}
                    >
                      {(product.stock ?? 0) > 20
                        ? 'Còn hàng'
                        : (product.stock ?? 0) > 0
                          ? `Chỉ còn ${product.stock} sản phẩm`
                          : 'Hết hàng'}
                    </Text>
                  </View>
                </View>

                <Pressable
                  style={[
                    styles.addCartBtn,
                    (product.stock ?? 0) === 0 && styles.addCartBtnDisabled,
                  ]}
                  onPress={() => {
                    if ((product.stock ?? 0) > 0) {
                      onAddToCart(product);
                      onClose();
                    }
                  }}
                  disabled={(product.stock ?? 0) === 0}
                >
                  <Ionicons name="cart-outline" size={22} color="#fff" />
                  <Text style={styles.addCartBtnText}>
                    {(product.stock ?? 0) > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.reviewsSection}>
              <Text style={styles.reviewsTitle}>
                Đánh giá sản phẩm
                {reviewCount > 0 && (
                  <Text style={styles.reviewsSub}>
                    {' '}({reviewCount} đánh giá · TB {avgRating.toFixed(1)} ⭐)
                  </Text>
                )}
              </Text>
              {loadingReviews ? (
                <ActivityIndicator size="small" color="#dc2626" style={styles.loader} />
              ) : reviews.length === 0 ? (
                <View style={styles.emptyReviews}>
                  <Ionicons name="star-outline" size={40} color="#d1d5db" />
                  <Text style={styles.emptyReviewsText}>Chưa có đánh giá nào.</Text>
                </View>
              ) : (
                <View style={styles.reviewList}>
                  {reviews.map((review) => (
                    <View key={review.id} style={styles.reviewCard}>
                      <View style={styles.reviewHeader}>
                        <View style={styles.reviewAvatar}>
                          <Ionicons name="person" size={20} color="#dc2626" />
                        </View>
                        <View style={styles.reviewMeta}>
                          <Text style={styles.reviewUser}>
                            {review.userName || 'Khách hàng'}
                          </Text>
                          <Text style={styles.reviewDate}>
                            {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                          </Text>
                        </View>
                      </View>
                      <StarDisplay rating={review.rating} />
                      {review.comment ? (
                        <Text style={styles.reviewComment}>{review.comment}</Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    maxWidth: 500,
    width: '100%',
    maxHeight: '90%',
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 999,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scroll: {
    maxHeight: '90%',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 48,
  },
  twoCol: {
    flexDirection: 'column',
    gap: 20,
  },
  imageBlock: {
    position: 'relative',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#dc2626',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    zIndex: 10,
  },
  discountText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  productImage: {
    width: '100%',
    height: 280,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
  },
  info: {
    gap: 12,
  },
  productName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starRow: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingNum: {
    fontSize: 16,
    fontWeight: '600',
  },
  reviewLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  priceBlock: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#dc2626',
  },
  originalPrice: {
    fontSize: 16,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
    marginTop: 4,
  },
  savings: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
    marginTop: 6,
  },
  descBlock: {
    marginTop: 8,
  },
  descTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  descText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 22,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  feature: {
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  stockRow: {
    marginVertical: 8,
  },
  stockBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  stockOk: { backgroundColor: '#dcfce7' },
  stockWarn: { backgroundColor: '#fef9c3' },
  stockOut: { backgroundColor: '#fee2e2' },
  stockText: { fontSize: 14, fontWeight: '600' },
  stockTextOk: { color: '#16a34a' },
  stockTextWarn: { color: '#ca8a04' },
  stockTextOut: { color: '#dc2626' },
  addCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#dc2626',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  addCartBtnDisabled: {
    backgroundColor: '#9ca3af',
  },
  addCartBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  reviewsSection: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 20,
    marginTop: 20,
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  reviewsSub: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6b7280',
  },
  loader: {
    marginVertical: 16,
  },
  emptyReviews: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  emptyReviewsText: {
    color: '#6b7280',
    marginTop: 8,
  },
  reviewList: {
    gap: 12,
  },
  reviewCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewMeta: {
    flex: 1,
  },
  reviewUser: {
    fontWeight: '600',
    fontSize: 14,
    color: '#111827',
  },
  reviewDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  reviewComment: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginTop: 6,
  },
});

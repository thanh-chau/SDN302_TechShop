import React from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  type ListRenderItemInfo,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Product } from '@/types/product';

const STAR_COLOR = '#facc15';
const STAR_EMPTY = '#d1d5db';

interface ProductCardProps {
  product: Product;
  isInWishlist?: boolean;
  onPress: () => void;
  onAddToCart: () => void;
  onToggleWishlist?: () => void;
  /** Khi dùng trong danh sách scroll ngang (vd Flash Sale), truyền width cố định. */
  fixedWidth?: number;
}

function StarRow({ rating = 0, count = 0 }: { rating: number; count: number }) {
  const r = Math.floor(rating);
  return (
    <View style={styles.starRow}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Ionicons
          key={i}
          name={i < r ? 'star' : 'star-outline'}
          size={12}
          color={i < r ? STAR_COLOR : STAR_EMPTY}
        />
      ))}
      <Text style={styles.reviewCount}>({count})</Text>
    </View>
  );
}

export function ProductCard({
  product,
  isInWishlist = false,
  onPress,
  onAddToCart,
  onToggleWishlist,
  fixedWidth,
}: ProductCardProps) {
  const rating = product.avgRating ?? product.rating ?? 0;
  const count = product.reviewCount ?? product.reviews ?? 0;
  const cardStyle = fixedWidth != null ? [styles.card, { width: fixedWidth, maxWidth: fixedWidth }] : styles.card;

  return (
    <View style={cardStyle}>
      <Pressable style={styles.imageWrap} onPress={onPress}>
        {product.discount ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>-{product.discount}%</Text>
          </View>
        ) : null}
        {product.image ? (
          <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={40} color="#d1d5db" />
          </View>
        )}
        {onToggleWishlist ? (
          <Pressable
            style={styles.heartBtn}
            onPress={(e) => {
              e?.stopPropagation?.();
              onToggleWishlist();
            }}
          >
            <Ionicons
              name={isInWishlist ? 'heart' : 'heart-outline'}
              size={18}
              color={isInWishlist ? '#dc2626' : '#9ca3af'}
            />
          </Pressable>
        ) : null}
      </Pressable>
      <View style={styles.content}>
        <Pressable onPress={onPress}>
          <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        </Pressable>
        <View style={styles.spacer} />
        <StarRow rating={rating} count={count} />
        <View style={styles.priceBlock}>
          <Text style={styles.price}>
            {product.price.toLocaleString('vi-VN')} đ
          </Text>
          {product.originalPrice != null && product.originalPrice > 0 ? (
            <Text style={styles.originalPrice}>
              {product.originalPrice.toLocaleString('vi-VN')} đ
            </Text>
          ) : null}
        </View>
        <Pressable
          style={({ pressed }) => [styles.cartBtn, pressed && styles.cartBtnPressed]}
          onPress={(e) => {
            e?.stopPropagation?.();
            onAddToCart();
          }}
        >
          <Ionicons name="cart-outline" size={18} color="#fff" />
          <Text style={styles.cartBtnText} numberOfLines={1}>Thêm vào giỏ</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    width: '100%',
    minWidth: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  imageWrap: {
    position: 'relative',
    width: '100%',
    height: 160,
    backgroundColor: '#f3f4f6',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#dc2626',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    zIndex: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 6,
    backgroundColor: '#fff',
    borderRadius: 999,
    zIndex: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flex: 1,
    padding: 12,
    minHeight: 0,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  spacer: {
    flex: 1,
    minHeight: 8,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  reviewCount: {
    fontSize: 11,
    color: '#6b7280',
  },
  priceBlock: {
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#dc2626',
  },
  originalPrice: {
    fontSize: 11,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  cartBtn: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#dc2626',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    minHeight: 42,
  },
  cartBtnPressed: {
    opacity: 0.9,
  },
  cartBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 0,
  },
});

const listItemStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    padding: 8,
    maxWidth: '50%',
  },
});

export function renderProductCard(
  info: ListRenderItemInfo<Product>,
  opts: {
    wishlistIds: Set<string>;
    onProductPress: (p: Product) => void;
    onAddToCart: (p: Product) => void;
    onToggleWishlist?: (p: Product) => void;
  }
) {
  const { item } = info;
  return (
    <View style={listItemStyles.wrapper}>
      <ProductCard
        product={item}
        isInWishlist={opts.wishlistIds.has(item.id)}
        onPress={() => opts.onProductPress(item)}
        onAddToCart={() => opts.onAddToCart(item)}
        onToggleWishlist={opts.onToggleWishlist ? () => opts.onToggleWishlist?.(item) : undefined}
      />
    </View>
  );
}

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Product } from '@/types/product';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_PADDING = 20;
const AUTO_SWITCH_MS = 4000;
const DEFAULT_HERO_IMAGE =
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=500&fit=crop';

export interface HeroBannerProps {
  flashSaleProducts?: Product[];
  onProductClick?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

export function HeroBanner({
  flashSaleProducts = [],
  onProductClick,
  onAddToCart,
}: HeroBannerProps) {
  const [index, setIndex] = useState(0);
  const items =
    flashSaleProducts.length > 0
      ? flashSaleProducts
      : ([{ id: 'empty', name: 'Chưa có Flash Sale', empty: true }] as (Product & { empty?: boolean })[]);
  const total = items.length;

  useEffect(() => {
    if (total <= 1) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, AUTO_SWITCH_MS);
    return () => clearInterval(t);
  }, [total]);

  const go = (dir: number) => {
    setIndex((i) => {
      if (dir === 1) return (i + 1) % total;
      return i === 0 ? total - 1 : i - 1;
    });
  };

  const current = items[index];
  const isEmpty = !!(current as Product & { empty?: boolean })?.empty;
  const imageUrl = isEmpty
    ? DEFAULT_HERO_IMAGE
    : (current as Product).image || DEFAULT_HERO_IMAGE;

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {/* Decorative circles */}
        <View style={[styles.deco, styles.deco1]} pointerEvents="none" />
        <View style={[styles.deco, styles.deco2]} pointerEvents="none" />
        <View style={[styles.deco, styles.deco3]} pointerEvents="none" />

        <View style={styles.inner}>
          <View style={styles.content}>
            <View style={styles.flameBadge}>
              <Ionicons name="flame" size={16} color="#b45309" />
              <Text style={styles.flameText}>FLASH SALE</Text>
            </View>
            {isEmpty ? (
              <>
                <Text style={styles.title}>Săn sale sắp diễn ra</Text>
                <Text style={styles.subtitle}>
                  Ưu đãi đặc biệt sắp lên sóng. Theo dõi để không bỏ lỡ!
                </Text>
                <View style={styles.cta}>
                  <Text style={styles.ctaText}>TechShop — Giá tốt mỗi ngày</Text>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.titleProduct} numberOfLines={2}>
                  {(current as Product).name}
                </Text>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>
                    {(current as Product).price?.toLocaleString('vi-VN')} ₫
                  </Text>
                  {(current as Product).originalPrice != null && (
                    <Text style={styles.originalPrice}>
                      {(current as Product).originalPrice?.toLocaleString('vi-VN')} ₫
                    </Text>
                  )}
                  {(current as Product).discount != null && (current as Product).discount! > 0 && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>
                        -{(current as Product).discount}%
                      </Text>
                    </View>
                  )}
                </View>
                <Pressable
                  style={({ pressed }) => [styles.buyBtn, pressed && styles.buyBtnPressed]}
                  onPress={() => {
                    if (!isEmpty && onProductClick) onProductClick(current as Product);
                    else if (!isEmpty && onAddToCart) onAddToCart(current as Product);
                  }}
                >
                  <Ionicons name="bag" size={18} color="#b91c1c" />
                  <Text style={styles.buyBtnText}>Mua ngay</Text>
                </Pressable>
              </>
            )}
          </View>
          <View style={styles.imageWrap}>
            <View style={styles.imageCard}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.image}
                resizeMode="cover"
              />
              {isEmpty && (
                <View style={styles.overlay}>
                  <View style={styles.overlayIcon}>
                    <Ionicons name="flame-outline" size={40} color="rgba(255,255,255,0.95)" />
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>

        {total > 1 && (
          <>
            <Pressable
              style={({ pressed }) => [styles.arrow, styles.arrowLeft, pressed && styles.arrowPressed]}
              onPress={() => go(-1)}
              accessibilityLabel="Trước"
            >
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.arrow, styles.arrowRight, pressed && styles.arrowPressed]}
              onPress={() => go(1)}
              accessibilityLabel="Sau"
            >
              <Ionicons name="chevron-forward" size={22} color="#fff" />
            </Pressable>
            <View style={styles.dots}>
              {items.map((_, i) => (
                <Pressable
                  key={i}
                  style={[styles.dot, i === index && styles.dotActive]}
                  onPress={() => setIndex(i)}
                  accessibilityLabel={`Slide ${i + 1}`}
                />
              ))}
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  container: {
    position: 'relative',
    backgroundColor: '#b91c1c',
    overflow: 'hidden',
    borderRadius: 20,
    minHeight: 300,
  },
  deco: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  deco1: {
    width: 180,
    height: 180,
    top: -60,
    right: -50,
  },
  deco2: {
    width: 120,
    height: 120,
    bottom: -30,
    left: -40,
  },
  deco3: {
    width: 80,
    height: 80,
    top: '40%',
    right: 20,
  },
  inner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: BANNER_PADDING,
    paddingTop: 22,
    paddingBottom: 52,
    zIndex: 5,
  },
  content: {
    width: '52%',
    maxWidth: SCREEN_WIDTH * 0.5,
    zIndex: 10,
  },
  flameBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(251,191,36,0.95)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  flameText: {
    color: '#1f2937',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
    ...Platform.select({
      ios: { textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
      android: {},
    }),
  },
  titleProduct: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 10,
    lineHeight: 22,
    ...Platform.select({
      ios: { textShadowColor: 'rgba(0,0,0,0.25)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
      android: {},
    }),
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
    marginBottom: 10,
  },
  cta: {
    marginTop: 2,
  },
  ctaText: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  priceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    ...Platform.select({
      ios: { textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1 },
      android: {},
    }),
  },
  originalPrice: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    color: '#1f2937',
    fontSize: 11,
    fontWeight: '800',
  },
  buyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignSelf: 'flex-start',
    borderWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: { elevation: 4 },
    }),
  },
  buyBtnPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  buyBtnText: {
    color: '#b91c1c',
    fontWeight: '800',
    fontSize: 14,
  },
  imageWrap: {
    width: '44%',
    maxWidth: SCREEN_WIDTH * 0.42,
    aspectRatio: 1,
    minHeight: 140,
    maxHeight: 180,
    alignSelf: 'center',
    marginTop: 4,
  },
  imageCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayIcon: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 14,
    borderRadius: 999,
  },
  arrow: {
    position: 'absolute',
    top: '42%',
    marginTop: -24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  arrowPressed: {
    opacity: 0.8,
  },
  arrowLeft: { left: 8 },
  arrowRight: { right: 8 },
  dots: {
    position: 'absolute',
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    zIndex: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  dotActive: {
    width: 18,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
});

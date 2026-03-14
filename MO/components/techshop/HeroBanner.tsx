import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Product } from '@/types/product';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AUTO_SWITCH_MS = 3000;
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
    <View style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.content}>
          <View style={styles.flameBadge}>
            <Ionicons name="flame" size={18} color="#fff" />
            <Text style={styles.flameText}>FLASH SALE</Text>
          </View>
          {isEmpty ? (
            <>
              <Text style={styles.title}>Săn sale sắp diễn ra</Text>
              <Text style={styles.subtitle}>
                Chưa có flash sale. Quay lại sau nhé!
              </Text>
              <View style={styles.cta}>
                <Text style={styles.ctaText}>TechShop — Ưu đãi sắp lên sóng</Text>
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
                <Ionicons name="bag-outline" size={20} color="#dc2626" />
                <Text style={styles.buyBtnText}>Mua ngay</Text>
              </Pressable>
            </>
          )}
        </View>
        <View style={styles.imageWrap}>
          <View style={styles.imageBg} />
          <View style={styles.imageInner}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
            {isEmpty && (
              <View style={styles.overlay}>
                <View style={styles.overlayIcon}>
                  <Ionicons name="flame" size={48} color="rgba(255,255,255,0.9)" />
                </View>
              </View>
            )}
          </View>
        </View>
      </View>

      {total > 1 && (
        <>
          <Pressable
            style={[styles.arrow, styles.arrowLeft]}
            onPress={() => go(-1)}
            accessibilityLabel="Trước"
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>
          <Pressable
            style={[styles.arrow, styles.arrowRight]}
            onPress={() => go(1)}
            accessibilityLabel="Sau"
          >
            <Ionicons name="chevron-forward" size={24} color="#fff" />
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

      <View style={[styles.blur, styles.blurTop]} pointerEvents="none" />
      <View style={[styles.blur, styles.blurBottom]} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: '#dc2626',
    overflow: 'hidden',
  },
  inner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
    minHeight: 280,
  },
  content: {
    width: '100%',
    maxWidth: SCREEN_WIDTH * 0.55,
    zIndex: 10,
  },
  flameBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 12,
  },
  flameText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  titleProduct: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.95)',
    marginBottom: 12,
  },
  cta: {
    marginTop: 4,
  },
  ctaText: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    color: '#fff',
    fontSize: 13,
    alignSelf: 'flex-start',
  },
  priceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    gap: 12,
    marginBottom: 12,
  },
  price: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  originalPrice: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  buyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  buyBtnPressed: {
    opacity: 0.95,
  },
  buyBtnText: {
    color: '#dc2626',
    fontWeight: '700',
    fontSize: 15,
  },
  imageWrap: {
    position: 'relative',
    width: '100%',
    maxWidth: SCREEN_WIDTH * 0.45,
    aspectRatio: 4 / 3,
    maxHeight: 220,
    alignSelf: 'center',
    marginTop: 12,
  },
  imageBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    transform: [{ rotate: '2deg' }],
  },
  imageInner: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 16,
    borderRadius: 999,
  },
  arrow: {
    position: 'absolute',
    top: '50%',
    marginTop: -22,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  arrowLeft: { left: 12 },
  arrowRight: { right: 12 },
  dots: {
    position: 'absolute',
    bottom: 16,
    left: '50%',
    marginLeft: -40,
    flexDirection: 'row',
    gap: 8,
    zIndex: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: '#fff',
    transform: [{ scale: 1.25 }],
  },
  blur: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  blurTop: {
    top: -100,
    right: -80,
  },
  blurBottom: {
    bottom: -100,
    left: -80,
  },
});

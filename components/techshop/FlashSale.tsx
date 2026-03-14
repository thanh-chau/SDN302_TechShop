import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Product } from '@/types/product';
import { ProductCard } from './ProductCard';

const CARD_WIDTH = 168;

export interface FlashSaleProps {
  products: Product[] | null | undefined;
  wishlistIds?: Set<string>;
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
}

export function FlashSale({
  products,
  wishlistIds = new Set(),
  onAddToCart,
  onProductClick,
  onToggleWishlist,
}: FlashSaleProps) {
  const flashSaleProducts = useMemo(
    () =>
      (products || [])
        .filter(
          (p) =>
            p.flashSaleEnd &&
            new Date(p.flashSaleEnd) > new Date() &&
            (p.discount > 0 || p.flashSalePrice)
        )
        .slice(0, 10),
    [products]
  );

  if (flashSaleProducts.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.flameWrap}>
            <Ionicons name="flame" size={24} color="#fff" />
          </View>
          <View>
            <Text style={styles.title}>FLASH SALE</Text>
            <Text style={styles.subtitle}>Giảm sốc — Số lượng có hạn</Text>
          </View>
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {flashSaleProducts.map((item) => (
          <View key={item.id} style={styles.cardWrap}>
            <ProductCard
              product={item}
              isInWishlist={wishlistIds.has(item.id)}
              onPress={() => onProductClick(item)}
              onAddToCart={() => onAddToCart(item)}
              onToggleWishlist={onToggleWishlist ? () => onToggleWishlist(item) : undefined}
              fixedWidth={CARD_WIDTH}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#fecaca',
    marginHorizontal: 4,
    marginVertical: 8,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flameWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  scrollContent: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 20,
  },
  cardWrap: {
    width: CARD_WIDTH,
  },
});

import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Product } from '@/types/product';
import { renderProductCard } from './ProductCard';

export interface ProductGridProps {
  title: string;
  category: string;
  categoryKeywords?: string[] | null;
  products: Product[] | null | undefined;
  wishlistIds?: Set<string>;
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
}

function filterByCategory(
  products: Product[],
  category: string,
  categoryKeywords: string[] | null | undefined
): Product[] {
  if (!products?.length) return [];
  return products.filter((p) => {
    if (!p.category) return false;
    const productCategory = (typeof p.category === 'string' ? p.category : '').toLowerCase().trim();
    const target = (category || '').toLowerCase();
    if (categoryKeywords?.length) {
      return categoryKeywords.some(
        (kw) => productCategory === kw || productCategory.includes(kw)
      );
    }
    return productCategory === target || productCategory.includes(target);
  });
}

export function ProductGrid({
  title,
  category,
  categoryKeywords = [],
  products,
  wishlistIds = new Set(),
  onAddToCart,
  onProductClick,
  onToggleWishlist,
}: ProductGridProps) {
  const [showAll, setShowAll] = useState(false);

  const allCategoryProducts = useMemo(
    () => filterByCategory(products || [], category, categoryKeywords),
    [products, category, categoryKeywords]
  );

  const displayProducts = showAll ? allCategoryProducts : allCategoryProducts.slice(0, 6);
  const hasMore = allCategoryProducts.length > 6;

  const renderItem = ({ item }: { item: Product }) =>
    renderProductCard(
      { item, index: 0, separators: {} as never },
      {
        wishlistIds,
        onProductPress: onProductClick,
        onAddToCart,
        onToggleWishlist,
      }
    );

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {hasMore && (
          <Pressable
            onPress={() => setShowAll(!showAll)}
            style={({ pressed }) => [pressed && styles.showAllPressed]}
          >
            <View style={styles.showAll}>
              <Text style={styles.showAllText}>
                {showAll ? 'Thu gọn' : 'Xem tất cả'}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#dc2626"
                style={showAll ? { transform: [{ rotate: '90deg' }] } : undefined}
              />
            </View>
          </Pressable>
        )}
      </View>
      <FlatList
        data={displayProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        scrollEnabled={false}
        listKey={`product-grid-${category}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  showAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  showAllPressed: {
    opacity: 0.8,
  },
  showAllText: {
    color: '#dc2626',
    fontWeight: '600',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 4,
    gap: 0,
  },
});

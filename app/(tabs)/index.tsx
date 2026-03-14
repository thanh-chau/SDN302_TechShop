import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ScrollView, View, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getStoredUser, setStoredUser } from '@/utils/api';
import { fetchCategories, fetchProducts, getBaseUrl } from '@/services/api';
import { Header } from '@/components/techshop/Header';
import { HeroBanner } from '@/components/techshop/HeroBanner';
import { FlashSale } from '@/components/techshop/FlashSale';
import { ProductGrid } from '@/components/techshop/ProductGrid';
import { Footer } from '@/components/techshop/Footer';
import { ProductDetail } from '@/components/techshop/ProductDetail';
import { AuthModal } from '@/components/techshop/AuthModal';
import type { Product } from '@/types/product';
import type { Category } from '@/types/product';
import type { UserInfo } from '@/components/techshop/AuthModal';
import { getCategoryDisplayName } from '@/utils/categoryDisplay';

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'category-laptop', name: 'Laptop - Máy Tính', category: 'laptop', keywords: ['laptop', 'máy tính', 'máy tính xách tay', 'notebook'] },
  { id: 'category-phone', name: 'Điện Thoại - Smartphone', category: 'phone', keywords: ['phone', 'điện thoại', 'smartphone', 'mobile'] },
  { id: 'category-tablet', name: 'Tablet - Máy Tính Bảng', category: 'tablet', keywords: ['tablet', 'máy tính bảng', 'tab'] },
  { id: 'category-audio', name: 'Âm Thanh - Tai Nghe', category: 'audio', keywords: ['audio', 'âm thanh', 'tai nghe', 'loa', 'headphone'] },
  { id: 'category-accessories', name: 'Phụ Kiện - Accessories', category: 'accessories', keywords: ['accessories', 'phụ kiện', 'khác', 'other'] },
  { id: 'category-monitor', name: 'Màn Hình - Monitor', category: 'monitor', keywords: ['monitor', 'màn hình', 'display'] },
];

// Placeholder data when API is not configured
const MOCK_PRODUCTS: Product[] = [];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [productsLoading, setProductsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    getStoredUser().then((u) => setUser(u ?? null));
  }, []);

  const handleLogin = useCallback((userInfo: UserInfo) => {
    setUser(userInfo);
  }, []);

  const handleLogout = useCallback(async () => {
    await setStoredUser(null);
    setUser(null);
  }, []);

  // Example: API service layer (services/api.ts). Works with tunnel URL in EXPO_PUBLIC_API_URL.
  useEffect(() => {
    const baseUrl = getBaseUrl();
    if (!baseUrl?.trim()) {
      setCategories([]);
      return;
    }
    fetchCategories()
      .then((list) => setCategories(list.map((c) => ({ ...c, category: c.name, keywords: null as string[] | null }))))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const baseUrl = getBaseUrl();
    if (!baseUrl?.trim()) {
      setProducts(MOCK_PRODUCTS);
      setProductsLoading(false);
      return;
    }
    fetchProducts()
      .then((list) => {
        if (!cancelled) setProducts(list as Product[]);
      })
      .catch(() => {
        if (!cancelled) setProducts(MOCK_PRODUCTS);
      })
      .finally(() => {
        if (!cancelled) setProductsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const displayCategories = useMemo(
    () =>
      categories?.length > 0
        ? categories.map((c) => ({
            id: c.id,
            name: getCategoryDisplayName(c.name) || c.name,
            category: c.name,
            keywords: null as string[] | null,
          }))
        : DEFAULT_CATEGORIES,
    [categories]
  );

  const flashSaleProducts = useMemo(
    () =>
      (products || []).filter(
        (p) =>
          p.flashSaleEnd &&
          new Date(p.flashSaleEnd) > new Date() &&
          (p.discount > 0 || p.flashSalePrice)
      ),
    [products]
  );

  const handleAddToCart = useCallback((product: Product) => {
    setCartCount((c) => c + 1);
  }, []);

  const handleCategoryClick = useCallback((_categoryId: string) => {
    // Scroll to section could be implemented with refs + ScrollView.scrollTo
  }, []);

  const handleToggleWishlist = useCallback((product: Product) => {
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (next.has(product.id)) next.delete(product.id);
      else next.add(product.id);
      return next;
    });
  }, []);

  return (
    <View style={styles.container}>
      <Header
        cartCount={cartCount}
        onCartClick={() => {}}
        user={user}
        onLoginClick={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        onCategoryClick={handleCategoryClick}
        hasFlashSale={flashSaleProducts.length > 0}
        categoriesFromApi={categories.length > 0 ? categories.map((c) => ({ id: c.id, name: c.name })) : undefined}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 24 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <HeroBanner
          flashSaleProducts={flashSaleProducts}
          onProductClick={setSelectedProduct}
          onAddToCart={handleAddToCart}
        />
        <FlashSale
          products={products}
          wishlistIds={wishlistIds}
          onAddToCart={handleAddToCart}
          onProductClick={setSelectedProduct}
          onToggleWishlist={handleToggleWishlist}
        />

        <View style={styles.content}>
          {productsLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color="#dc2626" />
            </View>
          ) : (
            displayCategories.map((cat) => (
              <ProductGrid
                key={cat.id}
                title={cat.name}
                category={cat.category ?? cat.name}
                categoryKeywords={cat.keywords ?? undefined}
                products={products}
                wishlistIds={wishlistIds}
                onAddToCart={handleAddToCart}
                onProductClick={setSelectedProduct}
                onToggleWishlist={handleToggleWishlist}
              />
            ))
          )}
        </View>

        <Footer />
      </ScrollView>

      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLogin={handleLogin}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  content: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  loading: {
    paddingVertical: 48,
    alignItems: 'center',
  },
});

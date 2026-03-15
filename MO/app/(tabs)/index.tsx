import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ScrollView, View, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cartAPI, wishlistAPI } from '@/utils/api';
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
import { useFocusEffect, useRouter } from 'expo-router';
import { getCategoryDisplayName } from '@/utils/categoryDisplay';
import Toast from 'react-native-toast-message';
import { useUser } from '@/contexts/UserContext';

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
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user: ctxUser, setUser: setCtxUser } = useUser();
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [productsLoading, setProductsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  /** Sản phẩm yêu thích (lưu MongoDB Atlas qua BE /api/wishlist) */
  const [wishlist, setWishlistState] = useState<Product[]>([]);
  /** Id danh mục đang chọn: 'all' = tất cả, 'category-phone', 'category-laptop', 'flash-sale', ... */
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

  // Alias để không phải sửa toàn bộ code dùng 'user'
  const user = ctxUser as UserInfo | null;

  const wishlistIds = useMemo(() => new Set(wishlist.map((p) => p.id)), [wishlist]);

  const scrollViewRef = useRef<ScrollView>(null);
  /** Vị trí Y của khối nội dung (danh mục) trong ScrollView để scroll xuống khi chọn danh mục */
  const contentSectionY = useRef(0);

  /** Load số lượng giỏ hàng từ BE khi đã đăng nhập. Truyền token từ user để tránh "No token provided" ngay sau khi đăng nhập (race với AsyncStorage). */
  const loadCartCount = useCallback(async () => {
    const u = user;
    if (!u?.id) {
      setCartCount(0);
      return;
    }
    const token = u.token ?? undefined;
    try {
      const data = await cartAPI.getByUserId(u.id, token);
      const total = (data?.cartItems ?? []).reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(total);
    } catch {
      setCartCount(0);
    }
  }, [user?.id, user?.token]);

  useEffect(() => {
    if (user?.id) loadCartCount();
    else setCartCount(0);
  }, [user?.id, loadCartCount]);

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        loadCartCount();
      } else {
        setCartCount(0);
      }
    }, [user?.id, loadCartCount])
  );

  /** Load wishlist từ MongoDB Atlas (BE) khi đổi user */
  useEffect(() => {
    if (!user?.id) {
      setWishlistState([]);
      return;
    }
    const token = user.token ?? undefined;
    wishlistAPI.getByUserId(user.id, token).then((res) => setWishlistState(res?.products ?? [])).catch(() => setWishlistState([]));
  }, [user?.id, user?.token]);

  const handleLogin = useCallback((userInfo: UserInfo) => {
    const role = (userInfo.role ?? 'buyer').toString().trim().toLowerCase();
    setCtxUser({ ...userInfo, role } as { id: string; name?: string; email?: string; role?: string; token: string });
    if (role === 'admin') router.replace('/admin');
  }, [setCtxUser, router]);

  const handleLogout = useCallback(async () => {
    await setCtxUser(null);
  }, [setCtxUser]);

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
          ((p.discount ?? 0) > 0 || p.flashSalePrice)
      ),
    [products]
  );

  const handleAddToCart = useCallback(
    async (product: Product) => {
      if (!user?.id) {
        Toast.show({
          type: 'info',
          text1: 'Vui lòng đăng nhập để thêm vào giỏ hàng',
          visibilityTime: 3000,
        });
        setAuthModalOpen(true);
        return;
      }
      try {
        const token = user.token ?? undefined;
        await cartAPI.addProduct(user.id, product.id, 1, token);
        await loadCartCount();
        Toast.show({
          type: 'success',
          text1: 'Đã thêm vào giỏ hàng',
          visibilityTime: 2500,
        });
      } catch (err) {
        Toast.show({
          type: 'error',
          text1: 'Không thể thêm vào giỏ hàng',
          text2: err instanceof Error ? err.message : undefined,
          visibilityTime: 3500,
        });
      }
    },
    [user?.id, loadCartCount]
  );

  const handleCategoryClick = useCallback((categoryId: string) => {
    setSelectedCategoryId(categoryId);
  }, []);

  /** Khi chọn một danh mục cụ thể, scroll xuống khối nội dung đó */
  useEffect(() => {
    if (selectedCategoryId === 'all') return;
    const t = setTimeout(() => {
      const y = Math.max(0, contentSectionY.current - 16);
      scrollViewRef.current?.scrollTo({ y, animated: true });
    }, 80);
    return () => clearTimeout(t);
  }, [selectedCategoryId]);

  const handleToggleWishlist = useCallback(
    async (product: Product) => {
      if (!product?.id) return;
      const uid = user?.id;
      const token = user?.token ?? undefined;
      if (!uid) {
        Toast.show({ type: 'info', text1: 'Vui lòng đăng nhập để lưu yêu thích', visibilityTime: 2000 });
        setAuthModalOpen(true);
        return;
      }
      const isInWishlist = wishlistIds.has(product.id);
      try {
        const res = isInWishlist
          ? await wishlistAPI.removeProduct(uid, product.id, token)
          : await wishlistAPI.addProduct(uid, product.id, token);
        setWishlistState(res?.products ?? []);
        Toast.show({
          type: 'success',
          text1: isInWishlist ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích',
          visibilityTime: 2000,
        });
      } catch (err) {
        Toast.show({
          type: 'error',
          text1: 'Không thể cập nhật yêu thích',
          text2: err instanceof Error ? err.message : undefined,
          visibilityTime: 2500,
        });
      }
    },
    [user?.id, user?.token, wishlistIds]
  );

  return (
    <View style={styles.container}>
      <Header
        cartCount={cartCount}
        onCartClick={() => router.push('/cart')}
        user={user}
        onLoginClick={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        onProfileClick={() => router.push('/profile')}
        onOrdersClick={() => router.push('/orders')}
        onWishlistClick={() => router.push('/wishlist')}
        onSettingsClick={() => router.push('/profile')}
        onAdminClick={() => router.push('/admin')}
        onCategoryClick={handleCategoryClick}
        activeCategoryId={selectedCategoryId}
        hasFlashSale={flashSaleProducts.length > 0}
        categoriesFromApi={categories.length > 0 ? categories.map((c) => ({ id: c.id, name: c.name })) : undefined}
      />

      <ScrollView
        ref={scrollViewRef}
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 24 + Math.max(insets.bottom, 16) },
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

        <View
          style={styles.content}
          onLayout={(e) => {
            contentSectionY.current = e.nativeEvent.layout.y;
          }}
        >
          {productsLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color="#dc2626" />
            </View>
          ) : selectedCategoryId === 'flash-sale' ? (
            <ProductGrid
              title="Flash Sale"
              category=""
              categoryKeywords={[]}
              products={flashSaleProducts}
              wishlistIds={wishlistIds}
              onAddToCart={handleAddToCart}
              onProductClick={setSelectedProduct}
              onToggleWishlist={handleToggleWishlist}
            />
          ) : selectedCategoryId !== 'all' ? (
            (() => {
              const cat = displayCategories.find((c) => c.id === selectedCategoryId);
              const slug = selectedCategoryId.replace(/^category-/, '');
              return (
                <ProductGrid
                  key={cat?.id ?? selectedCategoryId}
                  title={cat?.name ?? getCategoryDisplayName(slug) ?? slug}
                  category={cat?.category ?? cat?.name ?? slug}
                  categoryKeywords={cat?.keywords ?? undefined}
                  products={products}
                  wishlistIds={wishlistIds}
                  onAddToCart={handleAddToCart}
                  onProductClick={setSelectedProduct}
                  onToggleWishlist={handleToggleWishlist}
                />
              );
            })()
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
    width: '100%',
    maxWidth: '100%',
    backgroundColor: '#f9fafb',
    overflow: 'hidden',
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

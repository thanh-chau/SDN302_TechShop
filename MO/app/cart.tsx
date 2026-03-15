import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { cartAPI, orderAPI, type CartItemResponse } from '@/utils/api';
import { useUser } from '@/contexts/UserContext';
import { loadSavedAddresses, saveSavedAddresses, type SavedAddress } from '@/utils/addressBook';
import Toast from 'react-native-toast-message';

const PLACEHOLDER_IMAGE = 'https://placehold.co/400x400?text=No+Image';
const EMPTY_ADDRESS_FORM = { name: '', phone: '', address: '' };

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user: ctxUser } = useUser();
  const [items, setItems] = useState<CartItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState(EMPTY_ADDRESS_FORM);
  const [addFormError, setAddFormError] = useState<Record<string, string>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const uid = ctxUser?.id;
  const token = ctxUser?.token;

  const loadCart = useCallback(async () => {
    if (!uid) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await cartAPI.getByUserId(uid, token);
      setItems(data?.cartItems ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được giỏ hàng');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [uid, token]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  useFocusEffect(
    useCallback(() => {
      if (uid) loadCart();
    }, [uid, loadCart])
  );

  const total = items.reduce((sum, i) => sum + i.priceAtTime * i.quantity, 0);
  const selectedAddress = addresses.find((entry) => entry.id === selectedAddressId) ?? null;

  useEffect(() => {
    if (!checkoutOpen || !uid) return;
    let active = true;
    loadSavedAddresses(uid).then((list) => {
      if (!active) return;
      setAddresses(list);
      setSelectedAddressId(list[0]?.id ?? null);
      setShowAddForm(list.length === 0);
      setDeleteConfirmId(null);
      setAddFormError({});
      setNewAddress({
        name: ctxUser?.name ?? '',
        phone: ctxUser?.phone ?? '',
        address: ctxUser?.address ?? '',
      });
      setNote('');
    });
    return () => {
      active = false;
    };
  }, [checkoutOpen, ctxUser?.address, ctxUser?.name, ctxUser?.phone, uid]);

  const handleUpdateQuantity = useCallback(
    async (item: CartItemResponse, delta: number) => {
      const newQty = item.quantity + delta;
      if (newQty < 1) {
        handleRemove(item);
        return;
      }
      setUpdatingId(item.id);
      try {
        const data = await cartAPI.updateQuantity(item.id, newQty, token);
        setItems(data?.cartItems ?? []);
      } catch (err) {
        Toast.show({
          type: 'error',
          text1: 'Không thể cập nhật số lượng',
          text2: err instanceof Error ? err.message : undefined,
          visibilityTime: 2500,
        });
      } finally {
        setUpdatingId(null);
      }
    },
    [token]
  );

  const handleRemove = useCallback(async (item: CartItemResponse) => {
    setUpdatingId(item.id);
    try {
      const data = await cartAPI.removeItem(item.id, token);
      setItems(data?.cartItems ?? []);
      Toast.show({ type: 'success', text1: 'Đã xóa khỏi giỏ hàng', visibilityTime: 2000 });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Không thể xóa',
        text2: err instanceof Error ? err.message : undefined,
        visibilityTime: 2500,
      });
    } finally {
      setUpdatingId(null);
    }
  }, [token]);

  const validateNewAddress = useCallback(() => {
    const errors: Record<string, string> = {};
    if (!newAddress.name.trim()) errors.name = 'Vui lòng nhập họ và tên';
    const normalizedPhone = newAddress.phone.replace(/\s/g, '');
    if (!normalizedPhone) errors.phone = 'Vui lòng nhập số điện thoại';
    else if (!/^(0|\+84)\d{8,10}$/.test(normalizedPhone)) errors.phone = 'Số điện thoại không hợp lệ';
    if (!newAddress.address.trim()) errors.address = 'Vui lòng nhập địa chỉ';
    return errors;
  }, [newAddress.address, newAddress.name, newAddress.phone]);

  const handleSaveNewAddress = useCallback(async () => {
    if (!uid) return;
    const errors = validateNewAddress();
    if (Object.keys(errors).length > 0) {
      setAddFormError(errors);
      return;
    }

    const entry: SavedAddress = {
      id: Date.now().toString(),
      name: newAddress.name.trim(),
      phone: newAddress.phone.trim(),
      address: newAddress.address.trim(),
    };
    const updated = [...addresses, entry];
    setAddresses(updated);
    setSelectedAddressId(entry.id);
    setShowAddForm(false);
    setNewAddress(EMPTY_ADDRESS_FORM);
    setAddFormError({});
    await saveSavedAddresses(uid, updated);
    Toast.show({ type: 'success', text1: 'Đã lưu địa chỉ mới', visibilityTime: 2000 });
  }, [addresses, newAddress.address, newAddress.name, newAddress.phone, uid, validateNewAddress]);

  const handleDeleteAddress = useCallback(async (addressId: string) => {
    if (!uid) return;
    const updated = addresses.filter((entry) => entry.id !== addressId);
    setAddresses(updated);
    setDeleteConfirmId(null);
    if (selectedAddressId === addressId) {
      setSelectedAddressId(updated[0]?.id ?? null);
    }
    if (updated.length === 0) {
      setShowAddForm(true);
    }
    await saveSavedAddresses(uid, updated);
    Toast.show({ type: 'success', text1: 'Đã xóa địa chỉ', visibilityTime: 2000 });
  }, [addresses, selectedAddressId, uid]);

  const handleCheckout = useCallback(async () => {
    if (!uid || items.length === 0) return;

    let shipping = selectedAddress;
    if (showAddForm || !shipping) {
      const errors = validateNewAddress();
      if (Object.keys(errors).length > 0) {
        setAddFormError(errors);
        Toast.show({ type: 'error', text1: 'Vui lòng nhập đầy đủ địa chỉ mới' });
        return;
      }
      const entry: SavedAddress = {
        id: Date.now().toString(),
        name: newAddress.name.trim(),
        phone: newAddress.phone.trim(),
        address: newAddress.address.trim(),
      };
      const updated = [...addresses, entry];
      setAddresses(updated);
      setSelectedAddressId(entry.id);
      setShowAddForm(false);
      setNewAddress(EMPTY_ADDRESS_FORM);
      setAddFormError({});
      await saveSavedAddresses(uid, updated);
      shipping = entry;
    }

    setCreatingOrder(true);
    try {
      await orderAPI.create(
        uid,
        shipping.name,
        shipping.phone,
        shipping.address,
        'cod',
        note.trim(),
        token
      );
      setCheckoutOpen(false);
      setItems([]);
      Toast.show({ type: 'success', text1: 'Đặt hàng thành công' });
      router.replace('/orders');
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Không thể đặt hàng',
        text2: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setCreatingOrder(false);
    }
  }, [addresses, items.length, newAddress.address, newAddress.name, newAddress.phone, note, router, selectedAddress, token, uid, showAddForm, validateNewAddress]);

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111" />
          </Pressable>
          <Text style={styles.headerTitle}>Giỏ hàng</Text>
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
          <Text style={styles.headerTitle}>Giỏ hàng</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.emptyWrap}>
          <Ionicons name="cart-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>Vui lòng đăng nhập</Text>
          <Text style={styles.emptySub}>Đăng nhập để xem giỏ hàng và đặt hàng.</Text>
          <Pressable style={styles.primaryBtn} onPress={() => router.back()}>
            <Text style={styles.primaryBtnText}>Quay lại</Text>
          </Pressable>
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
        <View style={styles.headerCenter}>
          <Ionicons name="cart" size={22} color="#dc2626" />
          <Text style={styles.headerTitle}>Giỏ hàng</Text>
          {items.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{items.length}</Text>
            </View>
          )}
        </View>
        <View style={styles.backBtn} />
      </View>

      {error ? (
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.primaryBtn} onPress={loadCart}>
            <Text style={styles.primaryBtnText}>Thử lại</Text>
          </Pressable>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="cart-outline" size={56} color="#dc2626" />
            </View>
            <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
            <Text style={styles.emptySub}>
              Chưa có sản phẩm nào trong giỏ.{'\n'}Khám phá và thêm hàng yêu thích nhé!
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
        <>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: 24 + 100 + insets.bottom }]}
            showsVerticalScrollIndicator={false}
          >
            {items.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <Image
                  source={{ uri: item.imageUrl || PLACEHOLDER_IMAGE }}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
                <View style={styles.itemBody}>
                  <Text style={styles.itemName} numberOfLines={2}>{item.productName}</Text>
                  <Text style={styles.itemPrice}>
                    {item.priceAtTime.toLocaleString('vi-VN')} ₫
                  </Text>
                  <View style={styles.quantityRow}>
                    <Pressable
                      style={styles.qtyBtn}
                      onPress={() => handleUpdateQuantity(item, -1)}
                      disabled={updatingId === item.id}
                      hitSlop={12}
                    >
                      <Ionicons name="remove" size={20} color="#374151" />
                    </Pressable>
                    <Text style={styles.qtyValue}>{item.quantity}</Text>
                    <Pressable
                      style={styles.qtyBtn}
                      onPress={() => handleUpdateQuantity(item, 1)}
                      disabled={updatingId === item.id}
                      hitSlop={12}
                    >
                      <Ionicons name="add" size={20} color="#374151" />
                    </Pressable>
                    <Pressable
                      style={styles.removeBtn}
                      onPress={() => handleRemove(item)}
                      disabled={updatingId === item.id}
                      hitSlop={12}
                    >
                      <Ionicons name="trash-outline" size={22} color="#dc2626" />
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
          <View style={[styles.footer, { paddingBottom: Math.max(20 + insets.bottom, 32) }]}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng cộng:</Text>
              <Text style={styles.totalValue}>{total.toLocaleString('vi-VN')} ₫</Text>
            </View>
            <Pressable
              style={styles.primaryBtn}
              onPress={() => setCheckoutOpen(true)}
            >
              <Text style={styles.primaryBtnText}>Thanh toán</Text>
            </Pressable>
          </View>
        </>
      )}

      <Modal visible={checkoutOpen} transparent animationType="slide" onRequestClose={() => setCheckoutOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setCheckoutOpen(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalKeyboard}>
            <Pressable style={styles.modalPanel} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Thông tin nhận hàng</Text>
                <Pressable onPress={() => setCheckoutOpen(false)}>
                  <Ionicons name="close" size={24} color="#111" />
                </Pressable>
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Địa chỉ nhận hàng</Text>
                {!showAddForm && (
                  <Pressable
                    style={styles.addAddressBtn}
                    onPress={() => {
                      setShowAddForm(true);
                      setNewAddress({
                        name: ctxUser?.name ?? '',
                        phone: ctxUser?.phone ?? '',
                        address: ctxUser?.address ?? '',
                      });
                      setAddFormError({});
                    }}
                  >
                    <Ionicons name="add" size={16} color="#dc2626" />
                    <Text style={styles.addAddressText}>Thêm địa chỉ</Text>
                  </Pressable>
                )}
              </View>

              {addresses.length > 0 && (
                <ScrollView style={styles.addressList} contentContainerStyle={styles.addressListContent}>
                  {addresses.map((entry, index) => {
                    const isSelected = entry.id === selectedAddressId;
                    return (
                      <Pressable
                        key={entry.id}
                        style={[styles.addressCard, isSelected && styles.addressCardSelected]}
                        onPress={() => {
                          setSelectedAddressId(entry.id);
                          setShowAddForm(false);
                        }}
                      >
                        <View style={styles.addressRadioWrap}>
                          <View style={[styles.addressRadio, isSelected && styles.addressRadioSelected]}>
                            {isSelected ? <View style={styles.addressRadioDot} /> : null}
                          </View>
                        </View>

                        <View style={styles.addressInfo}>
                          <View style={styles.addressInfoTop}>
                            <Text style={styles.addressName}>{entry.name}</Text>
                            <Text style={styles.addressDivider}>|</Text>
                            <Text style={styles.addressPhone}>{entry.phone}</Text>
                            {index === 0 ? <Text style={styles.defaultBadge}>Mặc định</Text> : null}
                          </View>
                          <Text style={styles.addressText}>{entry.address}</Text>
                        </View>

                        {deleteConfirmId === entry.id ? (
                          <View style={styles.confirmDeleteWrap}>
                            <Pressable style={styles.confirmDeleteBtn} onPress={() => handleDeleteAddress(entry.id)}>
                              <Text style={styles.confirmDeleteBtnText}>Xóa</Text>
                            </Pressable>
                            <Pressable style={styles.cancelDeleteBtn} onPress={() => setDeleteConfirmId(null)}>
                              <Text style={styles.cancelDeleteBtnText}>Hủy</Text>
                            </Pressable>
                          </View>
                        ) : (
                          <Pressable style={styles.deleteIconBtn} onPress={() => setDeleteConfirmId(entry.id)}>
                            <Ionicons name="trash-outline" size={18} color="#9ca3af" />
                          </Pressable>
                        )}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              )}

              {showAddForm && (
                <View style={styles.addFormWrap}>
                  <Text style={styles.addFormTitle}>Thêm địa chỉ mới</Text>

                  <Text style={styles.inputLabel}>Người nhận</Text>
                  <TextInput
                    style={[styles.input, addFormError.name ? styles.inputError : null]}
                    value={newAddress.name}
                    onChangeText={(value) => setNewAddress((prev) => ({ ...prev, name: value }))}
                    placeholder="Nhập họ tên"
                  />
                  {addFormError.name ? <Text style={styles.fieldError}>{addFormError.name}</Text> : null}

                  <Text style={styles.inputLabel}>Số điện thoại</Text>
                  <TextInput
                    style={[styles.input, addFormError.phone ? styles.inputError : null]}
                    value={newAddress.phone}
                    onChangeText={(value) => setNewAddress((prev) => ({ ...prev, phone: value }))}
                    placeholder="Nhập số điện thoại"
                    keyboardType="phone-pad"
                  />
                  {addFormError.phone ? <Text style={styles.fieldError}>{addFormError.phone}</Text> : null}

                  <Text style={styles.inputLabel}>Địa chỉ</Text>
                  <TextInput
                    style={[styles.input, styles.inputMultiline, addFormError.address ? styles.inputError : null]}
                    value={newAddress.address}
                    onChangeText={(value) => setNewAddress((prev) => ({ ...prev, address: value }))}
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                  {addFormError.address ? <Text style={styles.fieldError}>{addFormError.address}</Text> : null}

                  <View style={styles.addFormActionRow}>
                    <Pressable style={styles.saveAddressBtn} onPress={handleSaveNewAddress}>
                      <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                      <Text style={styles.saveAddressBtnText}>Lưu địa chỉ</Text>
                    </Pressable>
                    {addresses.length > 0 ? (
                      <Pressable
                        style={styles.dismissAddFormBtn}
                        onPress={() => {
                          setShowAddForm(false);
                          setAddFormError({});
                        }}
                      >
                        <Text style={styles.dismissAddFormBtnText}>Hủy</Text>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              )}

              {selectedAddress && !showAddForm ? (
                <View style={styles.selectedAddressPreview}>
                  <Text style={styles.selectedAddressPreviewTitle}>Giao đến</Text>
                  <Text style={styles.selectedAddressPreviewName}>{selectedAddress.name} · {selectedAddress.phone}</Text>
                  <Text style={styles.selectedAddressPreviewText}>{selectedAddress.address}</Text>
                </View>
              ) : null}

              <Text style={styles.inputLabel}>Ghi chú (không bắt buộc)</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={note}
                onChangeText={setNote}
                placeholder="Ví dụ: gọi trước khi giao"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <View style={styles.checkoutSummary}>
                <Text style={styles.checkoutSummaryLabel}>Thanh toán khi nhận hàng (COD)</Text>
                <Text style={styles.checkoutSummaryValue}>{total.toLocaleString('vi-VN')} ₫</Text>
              </View>

              <View style={styles.modalActionRow}>
                <Pressable style={styles.secondaryBtn} onPress={() => setCheckoutOpen(false)}>
                  <Text style={styles.secondaryBtnText}>Hủy</Text>
                </Pressable>
                <Pressable style={styles.primaryBtn} onPress={handleCheckout} disabled={creatingOrder}>
                  {creatingOrder ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Đặt hàng</Text>}
                </Pressable>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
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
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  badge: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
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
    letterSpacing: 0.2,
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
    minWidth: 220,
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
  errorWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  itemBody: {
    flex: 1,
    minWidth: 0,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 15,
    color: '#dc2626',
    fontWeight: '700',
    marginBottom: 8,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  qtyValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    minWidth: 24,
    textAlign: 'center',
  },
  removeBtn: {
    marginLeft: 'auto',
    padding: 6,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  totalLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#dc2626',
  },
  primaryBtn: {
    backgroundColor: '#dc2626',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalKeyboard: {
    width: '100%',
  },
  modalPanel: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 16,
    gap: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  addAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addAddressText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '700',
  },
  addressList: {
    maxHeight: 220,
    marginTop: 8,
  },
  addressListContent: {
    gap: 8,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
  },
  addressCardSelected: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  addressRadioWrap: {
    paddingTop: 2,
  },
  addressRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#9ca3af',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressRadioSelected: {
    borderColor: '#ef4444',
  },
  addressRadioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  addressInfo: {
    flex: 1,
    minWidth: 0,
  },
  addressInfoTop: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  addressName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  addressDivider: {
    color: '#9ca3af',
    fontSize: 12,
  },
  addressPhone: {
    fontSize: 13,
    color: '#4b5563',
  },
  defaultBadge: {
    color: '#dc2626',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '700',
  },
  addressText: {
    marginTop: 4,
    color: '#6b7280',
    fontSize: 12,
    lineHeight: 18,
  },
  deleteIconBtn: {
    padding: 4,
  },
  confirmDeleteWrap: {
    gap: 6,
  },
  confirmDeleteBtn: {
    backgroundColor: '#dc2626',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  confirmDeleteBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  cancelDeleteBtn: {
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  cancelDeleteBtnText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '700',
  },
  addFormWrap: {
    marginTop: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#fca5a5',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff5f5',
  },
  addFormTitle: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#111827',
  },
  inputError: {
    borderColor: '#f87171',
  },
  fieldError: {
    color: '#dc2626',
    fontSize: 12,
    marginTop: 4,
  },
  inputMultiline: {
    minHeight: 82,
  },
  addFormActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  saveAddressBtn: {
    flex: 1,
    minHeight: 42,
    backgroundColor: '#dc2626',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  saveAddressBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  dismissAddFormBtn: {
    paddingHorizontal: 16,
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissAddFormBtnText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '700',
  },
  selectedAddressPreview: {
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
  },
  selectedAddressPreviewTitle: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  selectedAddressPreviewName: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
  },
  selectedAddressPreviewText: {
    color: '#6b7280',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  checkoutSummary: {
    marginTop: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkoutSummaryLabel: {
    color: '#4b5563',
    fontSize: 13,
    fontWeight: '600',
  },
  checkoutSummaryValue: {
    color: '#dc2626',
    fontSize: 18,
    fontWeight: '800',
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    marginBottom: 8,
  },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  secondaryBtnText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },
});

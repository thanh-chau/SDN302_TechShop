import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { useUser } from '@/contexts/UserContext';
import { authAPI, userAPI } from '@/utils/api';

type Tab = 'profile' | 'password';

type MeResponse = {
  user?: {
    _id?: string;
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    phone?: string;
    address?: string;
  };
};

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, setUser } = useUser();

  const [tab, setTab] = useState<Tab>('profile');
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const token = user?.token;

  const loadProfile = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const me = (await authAPI.getMe(token)) as MeResponse;
      const u = me?.user;
      setName(u?.name ?? user?.name ?? '');
      setEmail(u?.email ?? user?.email ?? '');
      setPhone(u?.phone ?? '');
      setAddress(u?.address ?? '');
    } catch (err) {
      setName(user?.name ?? '');
      setEmail(user?.email ?? '');
      Toast.show({
        type: 'error',
        text1: 'Không tải được thông tin tài khoản',
        text2: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setLoading(false);
    }
  }, [token, user?.email, user?.name]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSaveProfile = useCallback(async () => {
    if (!token) return;
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: 'Tên không được để trống' });
      return;
    }

    setSavingProfile(true);
    try {
      const res = await userAPI.updateProfile(
        {
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
        },
        token
      );

      await setUser({
        id: user?.id ?? res.user.id,
        token,
        name: res.user.name,
        email: res.user.email,
        role: user?.role,
        phone: res.user.phone,
        address: res.user.address,
      });

      Toast.show({ type: 'success', text1: 'Đã cập nhật thông tin' });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Không thể cập nhật thông tin',
        text2: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSavingProfile(false);
    }
  }, [address, name, phone, setUser, token, user?.id, user?.role]);

  const handleChangePassword = useCallback(async () => {
    if (!token) return;
    if (!currentPassword || !newPassword || !confirmPassword) {
      Toast.show({ type: 'error', text1: 'Vui lòng nhập đầy đủ thông tin' });
      return;
    }
    if (newPassword.length < 6) {
      Toast.show({ type: 'error', text1: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
      return;
    }
    if (newPassword !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Mật khẩu xác nhận không khớp' });
      return;
    }

    setSavingPassword(true);
    try {
      await userAPI.changePassword(currentPassword, newPassword, token);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Toast.show({ type: 'success', text1: 'Đổi mật khẩu thành công' });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Không thể đổi mật khẩu',
        text2: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSavingPassword(false);
    }
  }, [confirmPassword, currentPassword, newPassword, token]);

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}> 
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111" />
          </Pressable>
          <Text style={styles.headerTitle}>Tài khoản</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#dc2626" />
        </View>
      </View>
    );
  }

  if (!user?.id) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}> 
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111" />
          </Pressable>
          <Text style={styles.headerTitle}>Tài khoản</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.emptyWrap}>
          <Ionicons name="person-circle-outline" size={72} color="#d1d5db" />
          <Text style={styles.emptyTitle}>Vui lòng đăng nhập</Text>
          <Text style={styles.emptySub}>Đăng nhập để xem và cập nhật thông tin tài khoản.</Text>
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
        <Text style={styles.headerTitle}>Tài khoản</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.tabRow}>
        <Pressable
          style={[styles.tabBtn, tab === 'profile' && styles.tabBtnActive]}
          onPress={() => setTab('profile')}
        >
          <Text style={[styles.tabText, tab === 'profile' && styles.tabTextActive]}>Thông tin</Text>
        </Pressable>
        <Pressable
          style={[styles.tabBtn, tab === 'password' && styles.tabBtnActive]}
          onPress={() => setTab('password')}
        >
          <Text style={[styles.tabText, tab === 'password' && styles.tabTextActive]}>Đổi mật khẩu</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 20 + insets.bottom }]}> 
        {tab === 'profile' ? (
          <View style={styles.card}>
            <Text style={styles.label}>Họ và tên</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nhập họ và tên" />

            <Text style={styles.label}>Email</Text>
            <TextInput style={[styles.input, styles.inputDisabled]} value={email} editable={false} />

            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Nhập số điện thoại"
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Địa chỉ</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              value={address}
              onChangeText={setAddress}
              placeholder="Nhập địa chỉ nhận hàng"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <Pressable style={styles.primaryBtn} onPress={handleSaveProfile} disabled={savingProfile}>
              {savingProfile ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Lưu thông tin</Text>}
            </Pressable>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.label}>Mật khẩu hiện tại</Text>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Nhập mật khẩu hiện tại"
              secureTextEntry
            />

            <Text style={styles.label}>Mật khẩu mới</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Ít nhất 6 ký tự"
              secureTextEntry
            />

            <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Nhập lại mật khẩu mới"
              secureTextEntry
            />

            <Pressable style={styles.primaryBtn} onPress={handleChangePassword} disabled={savingPassword}>
              {savingPassword ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Đổi mật khẩu</Text>}
            </Pressable>
          </View>
        )}
      </ScrollView>
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
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  emptySub: { color: '#6b7280', textAlign: 'center' },
  tabRow: {
    marginTop: 14,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    padding: 4,
  },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  tabBtnActive: { backgroundColor: '#fee2e2' },
  tabText: { color: '#6b7280', fontWeight: '600' },
  tabTextActive: { color: '#b91c1c' },
  content: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
  },
  label: { fontSize: 13, color: '#374151', marginBottom: 6, marginTop: 10, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#111827',
    backgroundColor: '#fff',
  },
  inputDisabled: { backgroundColor: '#f3f4f6', color: '#6b7280' },
  multiline: { minHeight: 90 },
  primaryBtn: {
    marginTop: 18,
    backgroundColor: '#dc2626',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
});

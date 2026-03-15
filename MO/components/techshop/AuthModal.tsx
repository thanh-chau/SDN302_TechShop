import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { authAPI } from '@/utils/api';

const MODE = { LOGIN: 'login', REGISTER: 'register', FORGOT: 'forgot', RESET: 'reset' } as const;

export interface UserInfo {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  token: string;
}

function buildUserInfo(res: { user?: unknown; token: string }): UserInfo {
  const u = (res.user || res) as { id?: string; _id?: string; name?: string; fullName?: string; email?: string; role?: string };
  const name = u.name || u.fullName || u.email || '';
  const rawId = u.id ?? u._id;
  const id = rawId != null ? String(rawId) : undefined;
  const token = res.token != null && res.token !== '' ? String(res.token) : '';
  return {
    id,
    name,
    email: u.email,
    role: (u.role || 'buyer').toLowerCase(),
    token,
  };
}

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: UserInfo) => void;
}

export function AuthModal({ isOpen, onClose, onLogin }: AuthModalProps) {
  const [mode, setMode] = useState<keyof typeof MODE>('LOGIN');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'buyer',
    resetToken: '',
    newPassword: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      name: '',
      role: 'buyer',
      resetToken: '',
      newPassword: '',
    });
    setErrorMessage('');
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    // Chỉ hiển thị lỗi trong modal (khung đỏ), không dùng Toast để tránh overlay chặn bấm
  };

  const showSuccess = (msg: string) => {
    Toast.show({
      type: 'success',
      text1: msg,
      visibilityTime: 3000,
    });
  };

  const handleSubmit = async () => {
    if (mode === 'FORGOT') {
      if (!formData.email.trim()) {
        setErrorMessage('Vui lòng nhập email.');
        return;
      }
      setLoading(true);
      setErrorMessage('');
      try {
        const res = await authAPI.forgotPassword(formData.email);
        setForgotSuccess(true);
        setFormData((prev) => ({ ...prev, resetToken: res.resetToken || '' }));
        showSuccess('Đã gửi mã đặt lại mật khẩu. Kiểm tra thông tin bên dưới.');
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Không tìm thấy tài khoản với email này.';
        showError(msg);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (mode === 'RESET') {
      if (!formData.resetToken.trim() || !formData.newPassword || formData.newPassword.length < 6) {
        setErrorMessage('Vui lòng nhập mã đặt lại và mật khẩu mới (ít nhất 6 ký tự).');
        return;
      }
      setLoading(true);
      setErrorMessage('');
      try {
        await authAPI.resetPassword(formData.resetToken, formData.newPassword);
        setForgotSuccess(false);
        setMode('LOGIN');
        setFormData((prev) => ({ ...prev, resetToken: '', newPassword: '' }));
        setErrorMessage('');
        showSuccess('Đặt lại mật khẩu thành công. Bạn có thể đăng nhập.');
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Mã đặt lại không hợp lệ hoặc đã hết hạn.';
        showError(msg);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (mode === 'REGISTER' && formData.password.length < 6) {
      setErrorMessage('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      if (mode === 'LOGIN') {
        const response = await authAPI.login(formData.email, formData.password);
        const userInfo = buildUserInfo(response);
        const { setStoredUser } = await import('@/utils/api');
        await setStoredUser(userInfo);
        onLogin(userInfo);
        onClose();
        resetForm();
        setTimeout(() => showSuccess('Đăng nhập thành công!'), 300);
      } else {
        const response = await authAPI.register(
          formData.email,
          formData.password,
          formData.name,
          formData.role
        );
        const userInfo = buildUserInfo(response);
        const { setStoredUser } = await import('@/utils/api');
        await setStoredUser(userInfo);
        onLogin(userInfo);
        onClose();
        resetForm();
        setTimeout(() => showSuccess('Đăng ký thành công!'), 300);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : (mode === 'LOGIN' ? 'Email hoặc mật khẩu không đúng.' : 'Đăng ký thất bại.');
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const title =
    mode === 'LOGIN' ? 'Đăng nhập' :
    mode === 'REGISTER' ? 'Đăng ký' :
    mode === 'FORGOT' ? 'Quên mật khẩu' : 'Đặt lại mật khẩu';

  return (
    <Modal visible={isOpen} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.centered}
        >
          <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={24} color="#374151" />
            </Pressable>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.title}>{title}</Text>

              {errorMessage ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={20} color="#dc2626" />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              {mode === 'FORGOT' && (
                <>
                  <Text style={styles.label}>Email</Text>
                  <View style={styles.inputWrap}>
                    <Ionicons name="mail-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="example@email.com"
                      placeholderTextColor="#9ca3af"
                      value={formData.email}
                      onChangeText={(t) => setFormData((p) => ({ ...p, email: t }))}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  {forgotSuccess && (
                    <View style={styles.successBox}>
                      <Text style={styles.successText}>
                        Mã đặt lại đã được tạo. Bấm &quot;Đặt lại mật khẩu&quot; để nhập mã và mật khẩu mới.
                      </Text>
                      {formData.resetToken ? (
                        <Text style={styles.tokenText} selectable>{formData.resetToken}</Text>
                      ) : null}
                      <Pressable
                        style={styles.secondaryBtn}
                        onPress={() => {
                          setMode('RESET');
                          setErrorMessage('');
                        }}
                      >
                        <Text style={styles.secondaryBtnText}>Đặt lại mật khẩu</Text>
                      </Pressable>
                    </View>
                  )}
                </>
              )}

              {mode === 'RESET' && (
                <>
                  <Text style={styles.label}>Mã đặt lại</Text>
                  <TextInput
                    style={styles.inputFull}
                    placeholder="Dán mã nhận được"
                    placeholderTextColor="#9ca3af"
                    value={formData.resetToken}
                    onChangeText={(t) => setFormData((p) => ({ ...p, resetToken: t }))}
                  />
                  <Text style={styles.label}>Mật khẩu mới</Text>
                  <View style={styles.inputWrap}>
                    <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { paddingRight: 48 }]}
                      placeholder="Ít nhất 6 ký tự"
                      placeholderTextColor="#9ca3af"
                      value={formData.newPassword}
                      onChangeText={(t) => setFormData((p) => ({ ...p, newPassword: t }))}
                      secureTextEntry={!showPassword}
                    />
                    <Pressable
                      style={styles.eyeBtn}
                      onPress={() => setShowPassword((s) => !s)}
                    >
                      <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#9ca3af" />
                    </Pressable>
                  </View>
                </>
              )}

              {(mode === 'LOGIN' || mode === 'REGISTER') && (
                <>
                  {mode === 'REGISTER' && (
                    <>
                      <Text style={styles.label}>Họ và tên *</Text>
                      <TextInput
                        style={styles.inputFull}
                        placeholder="Nhập họ và tên"
                        placeholderTextColor="#9ca3af"
                        value={formData.name}
                        onChangeText={(t) => setFormData((p) => ({ ...p, name: t }))}
                      />
                    </>
                  )}
                  <Text style={styles.label}>Email *</Text>
                  <View style={styles.inputWrap}>
                    <Ionicons name="mail-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="example@email.com"
                      placeholderTextColor="#9ca3af"
                      value={formData.email}
                      onChangeText={(t) => setFormData((p) => ({ ...p, email: t }))}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  <Text style={styles.label}>Mật khẩu *</Text>
                  <View style={styles.inputWrap}>
                    <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { paddingRight: 48 }]}
                      placeholder="••••••••"
                      placeholderTextColor="#9ca3af"
                      value={formData.password}
                      onChangeText={(t) => setFormData((p) => ({ ...p, password: t }))}
                      secureTextEntry={!showPassword}
                    />
                    <Pressable style={styles.eyeBtn} onPress={() => setShowPassword((s) => !s)}>
                      <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#9ca3af" />
                    </Pressable>
                  </View>
                  {mode === 'REGISTER' && formData.password.length > 0 && formData.password.length < 6 && (
                    <Text style={styles.hintError}>Mật khẩu phải có ít nhất 6 ký tự</Text>
                  )}
                  {mode === 'LOGIN' && (
                    <Pressable
                      style={styles.forgotBtn}
                      onPress={() => {
                        setMode('FORGOT');
                        setErrorMessage('');
                      }}
                    >
                      <Text style={styles.forgotBtnText}>Quên mật khẩu?</Text>
                    </Pressable>
                  )}
                </>
              )}

              <Pressable
                style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {mode === 'LOGIN' && 'Đăng nhập'}
                    {mode === 'REGISTER' && 'Đăng ký'}
                    {mode === 'FORGOT' && 'Gửi mã đặt lại'}
                    {mode === 'RESET' && 'Đặt lại mật khẩu'}
                  </Text>
                )}
              </Pressable>

              {(mode === 'LOGIN' || mode === 'REGISTER') && (
                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>
                    {mode === 'LOGIN' ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
                  </Text>
                  <Pressable
                    onPress={() => {
                      setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN');
                      setErrorMessage('');
                    }}
                  >
                    <Text style={styles.toggleLink}>
                      {mode === 'LOGIN' ? 'Đăng ký ngay' : 'Đăng nhập'}
                    </Text>
                  </Pressable>
                </View>
              )}
              {(mode === 'FORGOT' || mode === 'RESET') && (
                <Pressable
                  style={styles.backBtn}
                  onPress={() => {
                    setMode('LOGIN');
                    setErrorMessage('');
                    setForgotSuccess(false);
                  }}
                >
                  <Text style={styles.toggleLink}>← Quay lại đăng nhập</Text>
                </Pressable>
              )}
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
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
  centered: {
    width: '100%',
    maxWidth: 400,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingTop: 44,
    paddingHorizontal: 20,
    paddingBottom: 24,
    maxHeight: '90%',
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 8,
  },
  scrollContent: { paddingBottom: 16 },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    marginBottom: 16,
  },
  inputIcon: { marginLeft: 12 },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#111',
  },
  inputFull: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#111',
    marginBottom: 16,
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#fef2f2',
    borderWidth: 2,
    borderColor: '#fecaca',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#b91c1c',
  },
  hintError: { fontSize: 12, color: '#dc2626', marginBottom: 8 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 16 },
  forgotBtnText: { fontSize: 14, fontWeight: '600', color: '#dc2626' },
  successBox: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  successText: { fontSize: 14, color: '#166534', marginBottom: 8 },
  tokenText: { fontFamily: 'monospace', fontSize: 12, marginBottom: 12 },
  secondaryBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryBtnText: { color: '#fff', fontWeight: '600' },
  submitBtn: {
    backgroundColor: '#dc2626',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  toggleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 4,
  },
  toggleLabel: { fontSize: 14, color: '#6b7280' },
  toggleLink: { fontSize: 14, fontWeight: '700', color: '#dc2626' },
  backBtn: { marginTop: 20, alignItems: 'center' },
});

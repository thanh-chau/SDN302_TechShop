import React from 'react';
import { View, Text, StyleSheet, Linking, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const categories = [
  { name: 'Laptop', icon: 'laptop-outline' as const },
  { name: 'Điện thoại', icon: 'phone-portrait-outline' as const },
  { name: 'Tablet', icon: 'tablet-portrait-outline' as const },
  { name: 'Âm thanh', icon: 'musical-notes-outline' as const },
  { name: 'Phụ kiện', icon: 'hardware-chip-outline' as const },
  { name: 'Màn hình', icon: 'desktop-outline' as const },
];

const supportLinks = [
  'Chính sách bảo hành',
  'Chính sách đổi trả',
  'Hướng dẫn mua hàng',
  'Phương thức thanh toán',
  'Câu hỏi thường gặp',
  'Kiểm tra bảo hành',
];

export function Footer() {
  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.block}>
          <Text style={styles.brand}>TechShop</Text>
          <Text style={styles.desc}>
            Hệ thống bán lẻ điện tử hàng đầu Việt Nam. Chuyên cung cấp laptop,
            điện thoại, phụ kiện công nghệ chính hãng với giá tốt nhất.
          </Text>
          <View style={styles.social}>
            <Pressable onPress={() => Linking.openURL('https://facebook.com')}>
              <Ionicons name="logo-facebook" size={22} color="#d1d5db" />
            </Pressable>
            <Pressable onPress={() => Linking.openURL('https://instagram.com')}>
              <Ionicons name="logo-instagram" size={22} color="#d1d5db" />
            </Pressable>
            <Pressable onPress={() => Linking.openURL('https://youtube.com')}>
              <Ionicons name="logo-youtube" size={22} color="#d1d5db" />
            </Pressable>
          </View>
        </View>

        <View style={styles.block}>
          <Text style={styles.heading}>Danh mục</Text>
          {categories.map(({ name, icon }) => (
            <View key={name} style={styles.linkRow}>
              <Ionicons name={icon} size={16} color="#9ca3af" />
              <Text style={styles.linkText}>{name}</Text>
            </View>
          ))}
        </View>

        <View style={styles.block}>
          <Text style={styles.heading}>Hỗ trợ khách hàng</Text>
          {supportLinks.map((link) => (
            <Text key={link} style={styles.linkTextPlain}>
              {link}
            </Text>
          ))}
        </View>

        <View style={styles.block}>
          <Text style={styles.heading}>Liên hệ</Text>
          <View style={styles.contactRow}>
            <Ionicons name="location-outline" size={20} color="#dc2626" />
            <Text style={styles.contactText}>123 Đường ABC, Quận 1, TP.HCM</Text>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="call-outline" size={20} color="#dc2626" />
            <Text style={styles.contactText}>Hotline: 1900-xxxx</Text>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="mail-outline" size={20} color="#dc2626" />
            <Text style={styles.contactText}>support@techshop.vn</Text>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="time-outline" size={20} color="#dc2626" />
            <View>
              <Text style={styles.contactLabel}>Giờ làm việc</Text>
              <Text style={styles.contactText}>Thứ 2 - Chủ nhật, 8:00 - 22:00</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.bottom}>
        <Text style={styles.copyright}>© 2026 TechShop. Tất cả quyền được bảo lưu.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111827',
    marginTop: 24,
  },
  inner: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    gap: 24,
  },
  block: {
    marginBottom: 8,
  },
  brand: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  desc: {
    fontSize: 13,
    color: '#d1d5db',
    lineHeight: 20,
    marginBottom: 12,
  },
  social: {
    flexDirection: 'row',
    gap: 16,
  },
  heading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  linkText: {
    fontSize: 13,
    color: '#d1d5db',
  },
  linkTextPlain: {
    fontSize: 13,
    color: '#d1d5db',
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
  },
  contactText: {
    fontSize: 13,
    color: '#d1d5db',
    flex: 1,
  },
  contactLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  bottom: {
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  copyright: {
    fontSize: 12,
    color: '#9ca3af',
  },
});

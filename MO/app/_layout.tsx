import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { UserProvider } from '@/contexts/UserContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <UserProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="cart" options={{ headerShown: false, title: 'Giỏ hàng' }} />
          <Stack.Screen name="orders" options={{ headerShown: false, title: 'Đơn hàng của tôi' }} />
          <Stack.Screen name="profile" options={{ headerShown: false, title: 'Thông tin tài khoản' }} />
          <Stack.Screen name="wishlist" options={{ headerShown: false, title: 'Sản phẩm yêu thích' }} />
          <Stack.Screen name="admin" options={{ headerShown: false, title: 'Trang quản trị' }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
        <Toast />
      </ThemeProvider>
      </UserProvider>
    </SafeAreaProvider>
  );
}

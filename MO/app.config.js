// Expo config: API URL từ .env. Điện thoại thật (iOS/Android) cần IP máy chạy BE hoặc tunnel.
// EXPO_PUBLIC_API_URL_ANDROID / EXPO_PUBLIC_API_URL_IOS = dùng khi test máy thật (cùng WiFi với máy BE).
export default {
  expo: {
    name: 'mo',
    slug: 'mo',
    scheme: 'mo',
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL || '',
      apiUrlAndroid: process.env.EXPO_PUBLIC_API_URL_ANDROID || '',
      apiUrlIos: process.env.EXPO_PUBLIC_API_URL_IOS || '',
    },
    plugins: [
      [
        'expo-build-properties',
        {
          android: {
            usesCleartextTraffic: true,
          },
        },
      ],
    ],
  },
};

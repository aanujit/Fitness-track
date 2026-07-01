import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Slot, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { useColorScheme, View } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { useAuthStore } from '@/store/authStore';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { restoreToken, token, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    restoreToken();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!token && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (token && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [token, isLoading, segments]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <View style={{ flex: 1 }}>
        <Slot />
      </View>
    </ThemeProvider>
  );
}

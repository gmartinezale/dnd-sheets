import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { AppProviders } from '@/providers/AppProviders';
import { Colors } from '@/shared/theme/colors';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const rawScheme = useColorScheme();
  const colorScheme: 'dark' | 'light' = rawScheme === 'light' ? 'light' : 'dark';
  const colors = Colors[colorScheme];

  const [fontsLoaded] = Font.useFonts({
    ...Ionicons.font,
  });

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AppProviders>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors['background.primary'] },
          animation: 'slide_from_right',
        }}
      />
    </AppProviders>
  );
}

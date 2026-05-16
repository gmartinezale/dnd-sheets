import React from 'react';
import { Tabs } from 'expo-router';
import { useColorScheme, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/shared/theme/colors';
import { FontSize } from '@/shared/theme/typography';

export default function TabsLayout() {
  const rawScheme = useColorScheme();
  const colorScheme: 'dark' | 'light' = rawScheme === 'light' ? 'light' : 'dark';
  const colors = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors['background.secondary'],
          borderTopColor: colors['border.default'],
          borderTopWidth: StyleSheet.hairlineWidth,
          height: 64,
          paddingBottom: 10,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors['accent.primary'],
        tabBarInactiveTintColor: colors['text.secondary'],
        tabBarLabelStyle: {
          fontSize: FontSize.xs,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="characters"
        options={{
          title: 'Characters',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="shield-half" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="compendium"
        options={{
          title: 'Compendium',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-sharp" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

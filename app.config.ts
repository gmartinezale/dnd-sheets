import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'DnD Sheets',
  slug: 'dnd-sheets',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  userInterfaceStyle: 'automatic',
  scheme: 'dnd-sheets',
  splash: {
    image: './assets/images/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#1A1510',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.dndsheets.app',
    infoPlist: {
      UIBackgroundModes: [],
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    package: 'com.dndsheets.app',
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-sqlite',
    'expo-secure-store',
    [
      'expo-font',
      {
        fonts: [],
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
});

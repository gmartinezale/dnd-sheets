import React from 'react';
import { QueryProvider } from './QueryProvider';
import { SQLiteProvider } from './SQLiteProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <SafeAreaProvider>
      <QueryProvider>
        <SQLiteProvider>{children}</SQLiteProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}

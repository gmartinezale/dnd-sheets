import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { runMigrations } from '@/data/db/database';

type SQLiteProviderProps = {
  children: React.ReactNode;
};

export function SQLiteProvider({ children }: SQLiteProviderProps) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    runMigrations()
      .then(() => setReady(true))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Database initialization failed');
      });
  }, []);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Database error: {error}</Text>
      </View>
    );
  }

  if (!ready) {
    return null;
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1510',
  },
  errorText: {
    color: '#C94040',
    textAlign: 'center',
    padding: 24,
  },
});

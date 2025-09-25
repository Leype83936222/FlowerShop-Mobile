// app/_layout.tsx
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from './AuthContext';
import { AppProvider } from './AppContext';
import { databaseService } from './database';

export default function RootLayout() {
  useEffect(() => {
    // Initialize database when app starts
    const initDatabase = async () => {
      try {
        await databaseService.initialize();
        console.log('Database initialized in root layout');
      } catch (error) {
        console.error('Database initialization failed:', error);
      }
    };
    
    initDatabase();
  }, []);

  return (
    <AuthProvider>
      <AppProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </AppProvider>
    </AuthProvider>
  );
}
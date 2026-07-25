import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { initDatabase } from '../src/db/local';
import { useExerciseStore } from '../src/stores/exerciseStore';
import { colors } from '../src/theme';

export default function RootLayout() {
  const loadLibrary = useExerciseStore((s) => s.loadLibrary);

  useEffect(() => {
    initDatabase().catch((err) =>
      console.warn('[db] init failed', err),
    );
    loadLibrary();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="create-plan"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen name="plan/[id]" />
        <Stack.Screen
          name="plan/[id]/edit"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen name="plan/[id]/day/[dayId]" />
      </Stack>
    </>
  );
}

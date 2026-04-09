import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import {
    CormorantGaramond_600SemiBold_Italic,
    useFonts as useCormorantFonts,
} from '@expo-google-fonts/cormorant-garamond';
import {
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    useFonts as useDMSansFonts,
} from '@expo-google-fonts/dm-sans';
import {
    NotoSerifDevanagari_600SemiBold,
    useFonts as useDevanagariFonts,
} from '@expo-google-fonts/noto-serif-devanagari';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [cormorantLoaded] = useCormorantFonts({
    CormorantGaramond_600SemiBold_Italic,
  });
  const [dmSansLoaded] = useDMSansFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });
  const [devanagariLoaded] = useDevanagariFonts({
    NotoSerifDevanagari_600SemiBold,
  });

  const fontsLoaded = cormorantLoaded && dmSansLoaded && devanagariLoaded;

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            <Stack.Screen name="place/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="tour/[id]" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

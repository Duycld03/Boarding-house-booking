import { SplashScreen, useRouter, useSegments } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { ThemeProvider } from '@/context/ThemeProvider';
import { NotificationProvider } from '@/context/NotificationProvider';
import * as Linking from 'expo-linking';
import '../../global.css';
import { UserProvider } from '@/context/userContext';
import { initLanguage } from '@/utils/initLanguage';


export default function Layout() {
  const [fontsLoaded, error] = useFonts({
    'Poppins-Black': require('@/assets/fonts/Poppins-Black.ttf'),
    'Poppins-Bold': require('@/assets/fonts/Poppins-Bold.ttf'),
    'Poppins-ExtraBold': require('@/assets/fonts/Poppins-ExtraBold.ttf'),
    'Poppins-ExtraLight': require('@/assets/fonts/Poppins-ExtraLight.ttf'),
    'Poppins-Light': require('@/assets/fonts/Poppins-Light.ttf'),
    'Poppins-Medium': require('@/assets/fonts/Poppins-Medium.ttf'),
    'Poppins-Regular': require('@/assets/fonts/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('@/assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Thin': require('@/assets/fonts/Poppins-Thin.ttf'),
  });

  const router = useRouter();
  const segments = useSegments();
  const [appReady, setAppReady] = useState(false); // để kiểm soát khi load xong language + font

  useEffect(() => {
    const prepareApp = async () => {
      try {
        await initLanguage(); // ✅ Load lại ngôn ngữ
      } catch (err) {
        console.error('Init error:', err);
      }
      setAppReady(true); // ✅ Khi xong thì render app
    };

    prepareApp();
  }, []);

  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  useEffect(() => {
    if (fontsLoaded && appReady) {
      if (!segments || segments.length === 0) {
        router.replace('/(tabs)/home'); // Chuyển hướng đến trang mặc định nếu không có segments
      }
    }
  }, [fontsLoaded, appReady, segments]);

  if (!fontsLoaded || !appReady) {
    return null;
  }

  return (
    <ThemeProvider>
      <UserProvider>
        <NotificationProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="(auth)"
              options={{
                headerShown: false,
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen name="(screens)" options={{ headerShown: false }} />
          </Stack>
        </NotificationProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

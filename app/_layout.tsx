import { useEffect, useState } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useFonts } from 'expo-font'
import * as NativeSplash from 'expo-splash-screen'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { SplashContent } from '../src/components/FullscreenSplash'
import { Animated } from 'react-native'
import {
  InstrumentSerif_400Regular,
  InstrumentSerif_400Regular_Italic,
} from '@expo-google-fonts/instrument-serif'
import {
  AtkinsonHyperlegible_400Regular,
  AtkinsonHyperlegible_700Bold,
} from '@expo-google-fonts/atkinson-hyperlegible'

NativeSplash.preventAutoHideAsync()

export default function RootLayout() {
  const [splashVisible, setSplashVisible] = useState(true)
  const [fadeAnim] = useState(() => new Animated.Value(1))

  const [fontsLoaded] = useFonts({
    InstrumentSerif_400Regular,
    InstrumentSerif_400Regular_Italic,
    AtkinsonHyperlegible_400Regular,
    AtkinsonHyperlegible_700Bold,
  })

  useEffect(() => {
    if (fontsLoaded) {
      NativeSplash.hideAsync()
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => setSplashVisible(false))
      }, 1800)
      return () => clearTimeout(timer)
    }
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="login" />
        <Stack.Screen name="task" />
        <Stack.Screen name="done" />
        <Stack.Screen name="tasks" />
        <Stack.Screen name="add-task" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="paywall" />
        <Stack.Screen name="avatar" />
        <Stack.Screen name="appearance" />
        <Stack.Screen name="language" />
        <Stack.Screen name="calm" />
        <Stack.Screen name="privacy" />
      </Stack>
      {splashVisible && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            opacity: fadeAnim,
            zIndex: 999,
          }}
          pointerEvents="none"
        >
          <SplashContent />
        </Animated.View>
      )}
    </SafeAreaProvider>
  )
}

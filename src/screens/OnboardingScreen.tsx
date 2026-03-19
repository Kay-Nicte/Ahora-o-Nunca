import React, { useState, useRef } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useTheme } from '../hooks/useTheme'
import { useAppStore } from '../lib/store'
import { spacing, radius, typography } from '../lib/theme'
import { LogoMark } from '../components/LogoMark'

const { width } = Dimensions.get('window')

const SLIDES = [
  {
    emoji: '🧠',
    showLogo: true,
    title: 'Ahora o Nunca',
    sub: '¿Cómo estás ahora?',
    btn: 'Empezar →',
  },
  {
    emoji: '⚡',
    showLogo: false,
    title: 'Solo una tarea.',
    sub: 'Sin listas. Sin agobio.',
    btn: 'Siguiente →',
  },
  {
    emoji: '🎙️',
    showLogo: false,
    title: 'Dilo y listo.',
    sub: 'Añade tareas con la voz.',
    btn: 'Probar sin cuenta →',
  },
]

export default function OnboardingScreen() {
  const theme = useTheme()
  const setHasSeenOnboarding = useAppStore((s) => s.setHasSeenOnboarding)
  const [currentIndex, setCurrentIndex] = useState(0)
  const flatListRef = useRef<FlatList>(null)

  const goToNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 })
    } else {
      setHasSeenOnboarding()
      router.replace('/')
    }
  }

  const s = styles(theme)

  return (
    <SafeAreaView style={s.container}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width)
          setCurrentIndex(index)
        }}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View style={s.slide}>
            <Text style={s.emoji}>{item.emoji}</Text>
            {item.showLogo && <LogoMark size={56} />}
            <View style={{ height: 12 }} />
            <Text style={s.title} numberOfLines={2} adjustsFontSizeToFit>{item.title}</Text>
            <Text style={s.sub}>{item.sub}</Text>

            <View style={s.dots}>
              {SLIDES.map((_, i) => (
                <View
                  key={i}
                  style={[
                    s.dot,
                    i === currentIndex && s.dotActive,
                  ]}
                />
              ))}
            </View>

            <TouchableOpacity style={s.btn} onPress={goToNext}>
              <Text style={s.btnText}>{item.btn}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { setHasSeenOnboarding(); router.replace('/login') }}>
              <Text style={s.skip}>
                {currentIndex === 0 ? 'Ya tengo cuenta' : 'Saltar'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  )
}

const styles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.dark ? theme.bg : theme.accent,
    },
    slide: {
      width,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
    },
    emoji: { fontSize: 48, marginBottom: 14 },
    title: {
      fontFamily: typography.serifItalic,
      fontSize: 22,
      color: theme.dark ? theme.text : '#fff',
      textAlign: 'center',
      lineHeight: 28,
      marginBottom: 10,
      width: '100%',
    },
    sub: {
      fontFamily: typography.sans,
      fontSize: 15,
      color: theme.dark ? theme.muted : 'rgba(255,255,255,0.7)',
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 28,
    },
    dots: {
      flexDirection: 'row',
      gap: 6,
      justifyContent: 'center',
      marginBottom: 28,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.dark ? theme.border : 'rgba(255,255,255,0.3)',
    },
    dotActive: {
      width: 18,
      borderRadius: 3,
      backgroundColor: theme.dark ? theme.accent : '#fff',
    },
    btn: {
      backgroundColor: theme.accent,
      borderRadius: radius.md,
      paddingVertical: 14,
      paddingHorizontal: 40,
      width: '100%',
      maxWidth: 220,
      alignItems: 'center',
    },
    btnText: {
      fontFamily: typography.sansBold,
      fontSize: 12,
      color: '#fff',
    },
    skip: {
      fontFamily: typography.sans,
      fontSize: 11,
      color: theme.dark ? theme.muted : 'rgba(255,255,255,0.5)',
      marginTop: 16,
      textDecorationLine: 'underline',
    },
  })

import React, { useState, useRef } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useTheme } from '../hooks/useTheme'
import { spacing, radius, typography } from '../lib/theme'
import { LogoMark } from '../components/LogoMark'

const { width } = Dimensions.get('window')

const SLIDES = [
  {
    emoji: '🧠',
    showLogo: true,
    title: 'Ahora o Nunca',
    sub: 'Solo te pregunta cómo estás ahora.',
    btn: 'Empezar →',
  },
  {
    emoji: '⚡',
    showLogo: false,
    title: 'Una tarea.\nLa que toca ahora.',
    sub: 'Una cosa. La que puedes hacer ahora. Sin listas.',
    btn: 'Siguiente →',
  },
  {
    emoji: '🎙️',
    showLogo: false,
    title: 'Añade tareas en 2 segundos.',
    sub: 'Dilo. La app lo recuerda.',
    btn: 'Probar sin cuenta →',
  },
]

export default function OnboardingScreen() {
  const theme = useTheme()
  const [currentIndex, setCurrentIndex] = useState(0)
  const flatListRef = useRef<FlatList>(null)

  const goToNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 })
    } else {
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
            {item.showLogo && <LogoMark size={64} />}
            <View style={{ height: 16 }} />
            <Text style={s.title}>{item.title}</Text>
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

            <TouchableOpacity onPress={() => router.replace('/login')}>
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
      paddingHorizontal: 24,
    },
    emoji: { fontSize: 56, marginBottom: 20 },
    title: {
      fontFamily: typography.serifItalic,
      fontSize: 28,
      color: theme.dark ? theme.text : '#fff',
      textAlign: 'center',
      lineHeight: 34,
      marginBottom: 10,
    },
    sub: {
      fontFamily: typography.sans,
      fontSize: 12,
      color: theme.dark ? theme.muted : 'rgba(255,255,255,0.7)',
      textAlign: 'center',
      lineHeight: 19,
      marginBottom: 32,
      maxWidth: 220,
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

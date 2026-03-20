import React, { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useTheme } from '../hooks/useTheme'
import { useAuth } from '../hooks/useAuth'
import { spacing, radius, typography } from '../lib/theme'
import { LogoMark } from '../components/LogoMark'
import { GoogleIcon, AppleIcon } from '../components/Icons'

export default function LoginScreen() {
  const theme = useTheme()
  const { signIn, signUp, signInWithGoogle, signInWithApple } = useAuth()
  const [isRegister, setIsRegister] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')
    const fn = isRegister ? signUp : signIn
    const { error: err } = await fn(email, password)
    if (err) {
      setError(err.message)
    } else {
      router.replace('/')
    }
  }

  const s = styles(theme)

  return (
    <SafeAreaView style={s.container}>
      <View style={s.top}>
        <LogoMark size={40} />
        <View style={{ height: 14 }} />
        <Text style={s.title}>
          {isRegister ? 'Crea tu cuenta' : 'Bienvenida de nuevo'}
        </Text>
        <Text style={s.sub}>
          {isRegister ? 'Gratis · Sincronizada' : 'De vuelta.'}
        </Text>
      </View>

      <View style={s.form}>
        <TextInput
          style={[s.input, {
            backgroundColor: theme.dark ? theme.surface : '#fff',
            borderColor: theme.border,
            color: theme.text,
          }]}
          placeholder="tu@email.com"
          placeholderTextColor={theme.muted}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={[s.input, {
            backgroundColor: theme.dark ? theme.surface : '#fff',
            borderColor: theme.border,
            color: theme.text,
          }]}
          placeholder="Contraseña"
          placeholderTextColor={theme.muted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={s.error}>{error}</Text> : null}

        <TouchableOpacity style={s.btn} onPress={handleSubmit}>
          <Text style={s.btnText}>
            {isRegister ? 'Crear cuenta →' : 'Entrar →'}
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={s.divider}>
          <View style={[s.dividerLine, { backgroundColor: theme.border }]} />
          <Text style={[s.dividerText, { color: theme.muted }]}>o continúa con</Text>
          <View style={[s.dividerLine, { backgroundColor: theme.border }]} />
        </View>

        <TouchableOpacity style={[s.socialBtn, {
          backgroundColor: theme.dark ? theme.surface : '#fff',
          borderColor: theme.border,
        }]} onPress={async () => {
          const { error: err } = await signInWithGoogle()
          if (err) setError(err.message)
        }}>
          <GoogleIcon size={18} />
          <Text style={[s.socialBtnText, { color: theme.text }]}>Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[s.socialBtn, {
          backgroundColor: '#000',
          borderColor: theme.dark ? '#333' : '#000',
        }]} onPress={async () => {
          const { error: err } = await signInWithApple()
          if (err) setError(err.message)
        }}>
          <AppleIcon size={18} color="#fff" />
          <Text style={[s.socialBtnText, { color: '#fff' }]}>Apple</Text>
        </TouchableOpacity>
      </View>

      <View style={s.footer}>
        <Text style={[s.footerText, { color: theme.muted }]}>
          {isRegister ? '¿Ya tienes cuenta? ' : '¿No tienes cuenta? '}
          <Text
            style={s.footerLink}
            onPress={() => setIsRegister(!isRegister)}
          >
            {isRegister ? 'Inicia sesión' : 'Regístrate gratis'}
          </Text>
        </Text>
      </View>

      {/* Skip */}
      <TouchableOpacity
        style={s.skipArea}
        onPress={() => router.replace('/')}
      >
        <Text style={[s.skipText, { color: theme.muted }]}>Entrar sin cuenta</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.bg },
    top: {
      paddingTop: 44,
      paddingHorizontal: 20,
      paddingBottom: 24,
      alignItems: 'center',
    },
    title: {
      fontFamily: typography.serifItalic,
      fontSize: 24,
      color: theme.text,
      marginBottom: 6,
    },
    sub: {
      fontFamily: typography.sans,
      fontSize: 13,
      color: theme.muted,
    },
    form: {
      paddingHorizontal: 20,
      gap: 10,
    },
    input: {
      borderWidth: 1.5,
      borderRadius: 12,
      padding: 12,
      paddingHorizontal: 14,
      fontFamily: typography.sans,
      fontSize: 14,
    },
    error: {
      fontFamily: typography.sans,
      fontSize: 13,
      color: theme.error,
      textAlign: 'center',
    },
    btn: {
      backgroundColor: theme.accent,
      borderRadius: radius.md,
      padding: 14,
      alignItems: 'center',
    },
    btnText: {
      fontFamily: typography.sansBold,
      fontSize: 14,
      color: '#fff',
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginVertical: 4,
    },
    dividerLine: { flex: 1, height: 1 },
    dividerText: { fontFamily: typography.sans, fontSize: 12 },
    socialBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderWidth: 1.5,
      borderRadius: radius.md,
      padding: 12,
    },
    socialBtnText: {
      fontFamily: typography.sansBold,
      fontSize: 14,
    },
    footer: {
      alignItems: 'center',
      paddingTop: 12,
    },
    footerText: {
      fontFamily: typography.sans,
      fontSize: 12,
    },
    footerLink: {
      color: theme.accent,
      fontFamily: typography.sansBold,
    },
    skipArea: {
      alignItems: 'center',
      paddingTop: 16,
    },
    skipText: {
      fontFamily: typography.sans,
      fontSize: 13,
      textDecorationLine: 'underline',
    },
  })

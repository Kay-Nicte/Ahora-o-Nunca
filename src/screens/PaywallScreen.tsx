import React from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useTheme } from '../hooks/useTheme'
import { useT } from '../lib/i18n'
import { usePremium } from '../hooks/usePremium'
import { spacing, radius, typography, colors } from '../lib/theme'
import { LogoMark } from '../components/LogoMark'

export default function PaywallScreen() {
  const theme = useTheme()
  const t = useT()
  const { trialUsed } = usePremium()

  const PERKS = [
    { icon: '🔔', title: t('paywall.perk1'), sub: t('paywall.perk1.sub') },
    { icon: '📋', title: t('paywall.perk2'), sub: t('paywall.perk2.sub') },
    { icon: '📱', title: t('paywall.perk3'), sub: t('paywall.perk3.sub') },
  ]
  const s = styles(theme)

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll}>
        {/* Header */}
        <View style={s.header}>
          <LogoMark size={32} />
          <View style={{ height: 12 }} />
          <Text style={s.title}>{t('paywall.title')}{'\n'}<Text style={s.titleEm}>{t('paywall.titleEm')}</Text></Text>
          <Text style={s.sub}>{t('paywall.sub')}</Text>
        </View>

        {/* Trial badge — only if never used trial */}
        {!trialUsed && <Text style={s.trialBadge}>{t('paywall.trial')}</Text>}

        {/* Perks card */}
        <View style={[s.card, {
          backgroundColor: theme.dark ? theme.surface : '#fff',
          borderColor: colors.yellow,
        }]}>
          {PERKS.map((perk, i) => (
            <View key={i} style={s.perk}>
              <Text style={s.perkIcon}>{perk.icon}</Text>
              <View>
                <Text style={[s.perkTitle, { color: theme.text }]}>{perk.title}</Text>
                <Text style={[s.perkSub, { color: theme.muted }]}>{perk.sub}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Price */}
        <View style={s.priceRow}>
          <Text style={[s.priceBig, { color: theme.text }]}>{t('paywall.price')}</Text>
          <Text style={[s.priceLabel, { color: theme.muted }]}>{t('paywall.priceLabel')}</Text>
        </View>

        {/* CTA */}
        <View style={s.ctaArea}>
          <TouchableOpacity style={s.ctaBtn}>
            <Text style={s.ctaBtnText}>{trialUsed ? t('paywall.ctaPaid') : t('paywall.cta')}</Text>
          </TouchableOpacity>
          {!trialUsed && (
            <Text style={[s.ctaSub, { color: theme.muted }]}>
              {t('paywall.ctaSub')}
            </Text>
          )}
        </View>

        {/* Close */}
        <TouchableOpacity style={s.close} onPress={() => router.back()}>
          <Text style={[s.closeText, { color: theme.muted }]}>{t('paywall.dismiss')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.bg },
    scroll: { paddingBottom: 40 },
    header: {
      paddingTop: 44,
      paddingHorizontal: 20,
      paddingBottom: 20,
      alignItems: 'center',
    },
    title: {
      fontFamily: typography.serifItalic,
      fontSize: 24,
      color: theme.text,
      textAlign: 'center',
      lineHeight: 30,
    },
    titleEm: {
      fontFamily: typography.serifItalic,
      color: theme.dark ? '#6b8ed9' : theme.accent,
    },
    sub: {
      fontFamily: typography.sans,
      fontSize: 11,
      color: theme.muted,
      marginTop: 6,
    },
    trialBadge: {
      fontFamily: typography.sansBold,
      fontSize: 10,
      color: colors.yellowDark,
      textAlign: 'center',
      letterSpacing: 0.5,
      marginBottom: 10,
    },
    card: {
      borderWidth: 1.5,
      borderRadius: 16,
      padding: 14,
      paddingHorizontal: 16,
      marginHorizontal: 14,
      marginBottom: 10,
    },
    perk: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      marginBottom: 10,
    },
    perkIcon: { fontSize: 16 },
    perkTitle: {
      fontFamily: typography.sansBold,
      fontSize: 11,
    },
    perkSub: {
      fontFamily: typography.sans,
      fontSize: 10,
      marginTop: 1,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'center',
      gap: 6,
      marginBottom: 14,
    },
    priceBig: {
      fontFamily: typography.serif,
      fontSize: 36,
    },
    priceLabel: {
      fontFamily: typography.sans,
      fontSize: 11,
    },
    ctaArea: {
      paddingHorizontal: 14,
      alignItems: 'center',
    },
    ctaBtn: {
      width: '100%',
      backgroundColor: colors.yellow,
      borderRadius: radius.md,
      padding: 14,
      alignItems: 'center',
    },
    ctaBtnText: {
      fontFamily: typography.sansBold,
      fontSize: 12,
      color: '#1a1e2e',
    },
    ctaSub: {
      fontFamily: typography.sans,
      fontSize: 10,
      marginTop: 10,
    },
    close: {
      alignItems: 'center',
      marginTop: 20,
    },
    closeText: {
      fontFamily: typography.sans,
      fontSize: 11,
      textDecorationLine: 'underline',
    },
  })

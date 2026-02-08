import React, { useState } from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { colors, spacing } from '../theme'
import { supabase, setLocalSession } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import LanguageMenu from '../translation/LanguageMenu'
import TranslatedText, { useTranslatedText } from '../translation/TranslatedText'

export default function LoginScreen({ navigation }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { refresh } = useAuth()
  const namePlaceholder = useTranslatedText('Enter your name')
  const mobilePlaceholder = useTranslatedText('10-digit mobile number')

  const mobileOnly = (v) => v.replace(/\D/g, '').slice(0, 10)

  async function handleSignUp() {
    setError('')
    if (!name.trim()) { setError('Please enter your name.'); return }
    if (mobile.length !== 10) { setError('Please enter a valid 10-digit mobile number.'); return }
    setLoading(true)
    const { data, error: err } = await supabase
      .from('farmers')
      .insert({ name: name.trim(), mobile })
      .select()
      .single()
    setLoading(false)
    if (err) {
      if (err.code === '23505') setError('This mobile number is already registered. Try signing in.')
      else setError('Something went wrong. Please try again.')
      return
    }
    await setLocalSession(data)
    await refresh()
  }

  async function handleLogin() {
    setError('')
    if (mobile.length !== 10) { setError('Please enter a valid 10-digit mobile number.'); return }
    setLoading(true)
    const { data, error: err } = await supabase
      .from('farmers')
      .select('*')
      .eq('mobile', mobile)
      .maybeSingle()
    setLoading(false)
    if (err) { setError('Something went wrong. Please try again.'); return }
    if (!data) { setError('No account found with this number. Please sign up first.'); return }
    await setLocalSession(data)
    await refresh()
  }

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#0A1A12', '#0B1F16', '#0A1A12']} style={styles.gradient}>
        <View style={styles.topRow}>
          <LanguageMenu compact />
        </View>
        <View style={styles.logoWrap}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>BR</Text>
          </View>
          <Text style={styles.title}>BeejRakshak</Text>
          <TranslatedText style={styles.subtitle} text="Seed Protection Intelligence Platform" />
        </View>

        <View style={styles.card}>
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, mode === 'login' && styles.tabActive]}
              onPress={() => setMode('login')}
            >
              <TranslatedText style={[styles.tabText, mode === 'login' && styles.tabTextActive]} text="Sign in" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, mode === 'signup' && styles.tabActive]}
              onPress={() => setMode('signup')}
            >
              <TranslatedText style={[styles.tabText, mode === 'signup' && styles.tabTextActive]} text="Create account" />
            </TouchableOpacity>
          </View>

          {mode === 'signup' && (
            <View style={styles.field}>
              <TranslatedText style={styles.label} text="Your name" />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={namePlaceholder}
                placeholderTextColor="#7FB69B"
                style={styles.input}
              />
            </View>
          )}

          <View style={styles.field}>
            <TranslatedText style={styles.label} text="Mobile number" />
              <TextInput
                value={mobile}
                onChangeText={(v) => setMobile(mobileOnly(v))}
              placeholder={mobilePlaceholder}
              keyboardType="number-pad"
              placeholderTextColor="#7FB69B"
              style={styles.input}
            />
          </View>

          {error ? <TranslatedText style={styles.error} text={error} /> : null}

          <TouchableOpacity
            style={styles.button}
            onPress={mode === 'signup' ? handleSignUp : handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <TranslatedText style={styles.buttonText} text={mode === 'signup' ? 'Create account' : 'Sign in'} />
            )}
          </TouchableOpacity>
        </View>

        <TranslatedText style={styles.footer} text="Satellite-powered AgriTech for Indian farmers" />
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  gradient: { flex: 1, padding: spacing.xl, justifyContent: 'center' },
  topRow: { alignItems: 'flex-end', marginBottom: spacing.sm },
  logoWrap: { alignItems: 'center', marginBottom: spacing.lg },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.accentDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  logoText: { color: colors.text, fontWeight: '800' },
  title: { color: colors.text, fontSize: 24, fontWeight: '800' },
  subtitle: { color: colors.textMuted, fontSize: 12, marginTop: 6 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabs: { flexDirection: 'row', marginBottom: spacing.md },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.accent },
  tabText: { color: colors.textMuted, fontWeight: '600' },
  tabTextActive: { color: colors.text },
  field: { marginBottom: spacing.md },
  label: { color: colors.textMuted, fontSize: 12, marginBottom: 6 },
  input: {
    backgroundColor: colors.cardLight,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  error: {
    color: '#FCA5A5',
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  button: {
    backgroundColor: colors.accentDark,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonText: { color: colors.text, fontWeight: '700' },
  footer: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg, fontSize: 11 },
})

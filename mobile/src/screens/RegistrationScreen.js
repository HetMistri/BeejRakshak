import React, { useState } from 'react'
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native'
import * as Location from 'expo-location'
import { colors, spacing } from '../theme'
import { saveRegistration } from '../lib/registration'
import { useAuth } from '../context/AuthContext'
import LanguageMenu from '../translation/LanguageMenu'
import TranslatedText, { useTranslatedText } from '../translation/TranslatedText'

const CROPS = [
  { value: 'onion', label: 'Onion' },
  { value: 'tomato', label: 'Tomato' },
  { value: 'potato', label: 'Potato' },
]

const STAGES = [
  { value: 'sowing', label: 'Sowing' },
  { value: 'vegetative', label: 'Vegetative' },
  { value: 'flowering', label: 'Flowering' },
  { value: 'harvest', label: 'Harvest' },
]

export default function RegistrationScreen() {
  const [form, setForm] = useState({
    name: '',
    village: '',
    district: '',
    state: '',
    crop: '',
    stage: '',
    landArea: '',
    latitude: null,
    longitude: null,
  })
  const [locating, setLocating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const { session, refresh } = useAuth()
  const namePlaceholder = useTranslatedText('Full name')
  const villagePlaceholder = useTranslatedText('Village')
  const districtPlaceholder = useTranslatedText('District')
  const statePlaceholder = useTranslatedText('State')
  const landPlaceholder = useTranslatedText('E.g. 2.5')

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleUseLocation() {
    setLocating(true)
    setError('')
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setError('Location permission denied.')
        setLocating(false)
        return
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      update('latitude', pos.coords.latitude)
      update('longitude', pos.coords.longitude)
    } catch {
      try {
        const res = await fetch('https://ipapi.co/json/')
        const d = await res.json()
        if (d.latitude && d.longitude) {
          update('latitude', d.latitude)
          update('longitude', d.longitude)
        }
      } catch {
        setError('Unable to fetch location. Try again.')
      }
    } finally {
      setLocating(false)
    }
  }

  async function handleSubmit() {
    setError('')
    if (!session?.id) { setError('Please sign in again.'); return }
    if (!form.crop || !form.stage) { setError('Select crop and stage.'); return }
    setSubmitting(true)
    const result = await saveRegistration(session.id, {
      farmerName: form.name,
      village: form.village,
      district: form.district,
      state: form.state,
      primaryCrop: form.crop,
      cropStage: form.stage,
      landArea: form.landArea,
      landUnit: 'acre',
      latitude: form.latitude,
      longitude: form.longitude,
      satelliteConsent: true,
    })
    setSubmitting(false)
    if (!result.ok) {
      setError(result.error || 'Something went wrong. Please try again.')
      return
    }
    await refresh()
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topRow}>
          <LanguageMenu compact />
        </View>
        <TranslatedText style={styles.title} text="Registration" />
        <TranslatedText style={styles.subtitle} text="Tell us about your farm to personalize insights." />

        <Field label="Farmer name">
          <TextInput style={styles.input} placeholder={namePlaceholder} placeholderTextColor={colors.inkMuted} value={form.name} onChangeText={(v) => update('name', v)} />
        </Field>

        <Field label="Village">
          <TextInput style={styles.input} placeholder={villagePlaceholder} placeholderTextColor={colors.inkMuted} value={form.village} onChangeText={(v) => update('village', v)} />
        </Field>

        <Field label="District">
          <TextInput style={styles.input} placeholder={districtPlaceholder} placeholderTextColor={colors.inkMuted} value={form.district} onChangeText={(v) => update('district', v)} />
        </Field>

        <Field label="State">
          <TextInput style={styles.input} placeholder={statePlaceholder} placeholderTextColor={colors.inkMuted} value={form.state} onChangeText={(v) => update('state', v)} />
        </Field>

        <Field label="Primary crop">
          <View style={styles.pillRow}>
            {CROPS.map((c) => (
              <TouchableOpacity
                key={c.value}
                onPress={() => update('crop', c.value)}
                style={[styles.pill, form.crop === c.value && styles.pillActive]}
              >
                <TranslatedText style={[styles.pillText, form.crop === c.value && styles.pillTextActive]} text={c.label} />
              </TouchableOpacity>
            ))}
          </View>
        </Field>

        <Field label="Crop stage">
          <View style={styles.pillRow}>
            {STAGES.map((s) => (
              <TouchableOpacity
                key={s.value}
                onPress={() => update('stage', s.value)}
                style={[styles.pill, form.stage === s.value && styles.pillActive]}
              >
                <TranslatedText style={[styles.pillText, form.stage === s.value && styles.pillTextActive]} text={s.label} />
              </TouchableOpacity>
            ))}
          </View>
        </Field>

        <Field label="Land area (acres)">
          <TextInput
            style={styles.input}
            placeholder={landPlaceholder}
            placeholderTextColor={colors.inkMuted}
            keyboardType="decimal-pad"
            value={form.landArea}
            onChangeText={(v) => update('landArea', v)}
          />
        </Field>

        <Field label="GPS location">
          <TouchableOpacity style={styles.locationBtn} onPress={handleUseLocation} disabled={locating}>
            {locating ? <ActivityIndicator color={colors.accentDark} /> : <TranslatedText style={styles.locationText} text="Use current location" />}
          </TouchableOpacity>
          {form.latitude && form.longitude ? (
            <Text style={styles.locationMeta}>Lat {form.latitude.toFixed(4)}, Lng {form.longitude.toFixed(4)}</Text>
          ) : null}
        </Field>

        {error ? <TranslatedText style={styles.error} text={error} /> : null}

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#ffffff" /> : <TranslatedText style={styles.buttonText} text="Complete registration" />}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

function Field({ label, children }) {
  return (
    <View style={styles.field}>
      <TranslatedText style={styles.label} text={label} />
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  container: { padding: spacing.xl, paddingBottom: 40 },
  topRow: { alignItems: 'flex-end', marginBottom: spacing.sm },
  title: { fontSize: 22, fontWeight: '800', color: colors.ink, marginBottom: 6 },
  subtitle: { color: colors.inkMuted, marginBottom: spacing.lg, fontSize: 12 },
  field: { marginBottom: spacing.md },
  label: { fontSize: 12, fontWeight: '700', color: colors.inkMuted, marginBottom: 6 },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: colors.ink,
  },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pillActive: { borderColor: colors.accent, backgroundColor: '#ECFDF5' },
  pillText: { color: colors.inkMuted, fontSize: 12 },
  pillTextActive: { color: colors.accentDark, fontWeight: '700' },
  locationBtn: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CFFDEB',
  },
  locationText: { color: colors.accentDark, fontWeight: '700' },
  locationMeta: { marginTop: 6, fontSize: 11, color: colors.inkMuted },
  error: { color: '#DC2626', fontSize: 12, marginTop: 6 },
  button: {
    backgroundColor: colors.accentDark,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  buttonText: { color: '#FFFFFF', fontWeight: '700' },
})

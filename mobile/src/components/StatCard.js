import React from 'react'
import { View, StyleSheet } from 'react-native'
import { colors } from '../theme'
import TranslatedText from '../translation/TranslatedText'

export default function StatCard({ label, value, accent }) {
  return (
    <View style={[styles.card, accent && { borderColor: colors.accent }]}>
      <TranslatedText style={styles.label} text={label} />
      <TranslatedText style={styles.value} text={value} />
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
  },
  value: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
})

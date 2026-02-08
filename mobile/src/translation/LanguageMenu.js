import React, { useMemo, useState } from 'react'
import { Modal, View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native'
import { colors, spacing } from '../theme'
import { useTranslator } from './TranslationProvider'

export default function LanguageMenu({ compact = false }) {
  const [visible, setVisible] = useState(false)
  const { language, setLanguage, languages, apiKeyPresent } = useTranslator()

  const current = useMemo(
    () => languages.find((l) => l.code === language) || { label: language.toUpperCase(), code: language },
    [languages, language],
  )

  return (
    <>
      <TouchableOpacity style={[styles.trigger, compact && styles.triggerCompact]} onPress={() => setVisible(true)}>
        <Text style={styles.triggerText}>{compact ? current.code.toUpperCase() : current.label}</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Language</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
            {!apiKeyPresent && (
              <Text style={styles.notice}>Add EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY to enable translations.</Text>
            )}
            <FlatList
              data={languages}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.item, item.code === language && styles.itemActive]}
                  onPress={() => {
                    setLanguage(item.code)
                    setVisible(false)
                  }}
                >
                  <Text style={[styles.itemText, item.code === language && styles.itemTextActive]}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  trigger: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.card,
  },
  triggerCompact: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  triggerText: { color: colors.text, fontWeight: '600', fontSize: 12 },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(7,12,9,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  sheet: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  sheetTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  closeText: { color: colors.textMuted, fontSize: 12 },
  notice: { color: colors.textMuted, fontSize: 12, marginBottom: spacing.sm },
  item: { paddingVertical: 10 },
  itemActive: { backgroundColor: colors.cardLight, borderRadius: 10, paddingHorizontal: 8 },
  itemText: { color: colors.textMuted, fontSize: 13 },
  itemTextActive: { color: colors.text, fontWeight: '700' },
})

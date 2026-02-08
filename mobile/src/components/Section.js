import React from 'react'
import { View, StyleSheet } from 'react-native'
import { colors } from '../theme'
import TranslatedText from '../translation/TranslatedText'

export default function Section({ title, subtitle, action = 'View all', children }) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View>
          <TranslatedText style={styles.title} text={title} />
          {subtitle ? <TranslatedText style={styles.subtitle} text={subtitle} /> : null}
        </View>
        {action ? <TranslatedText style={styles.action} text={action} /> : null}
      </View>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  section: { marginBottom: 18 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: { color: colors.text, fontSize: 16, fontWeight: '700' },
  subtitle: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  action: { color: colors.textMuted, fontSize: 11 },
})

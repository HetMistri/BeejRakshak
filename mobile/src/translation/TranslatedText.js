import React, { useEffect, useState } from 'react'
import { Text } from 'react-native'
import { useTranslator } from './TranslationProvider'

function useTranslatedValue(text) {
  const { language, apiKeyPresent, t } = useTranslator()
  const [value, setValue] = useState(text)

  useEffect(() => {
    let active = true
    if (text === null || text === undefined) {
      setValue(text)
      return () => { active = false }
    }
    if (typeof text !== 'string') {
      setValue(text)
      return () => { active = false }
    }
    if (language === 'en' || !apiKeyPresent) {
      setValue(text)
      return () => { active = false }
    }
    t(text).then((translated) => {
      if (active) setValue(translated)
    })
    return () => { active = false }
  }, [text, language, apiKeyPresent, t])

  return value
}

export function useTranslatedText(text) {
  return useTranslatedValue(text)
}

export default function TranslatedText({ text, children, ...props }) {
  const sourceText = text ?? children
  const translated = useTranslatedValue(sourceText)
  return <Text {...props}>{translated}</Text>
}

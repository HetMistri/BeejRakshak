import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { LANGUAGES } from './languages'
import { translateText } from './translator'
import { config } from '../lib/config'

const TranslationContext = createContext(null)
const STORAGE_KEY = 'br:language'

export function TranslationProvider({ children }) {
  const apiKey = config.GOOGLE_TRANSLATE_API_KEY || ''
  const [language, setLanguage] = useState('en')
  const [isTranslating, setIsTranslating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (value) setLanguage(value)
    })
  }, [])

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, language)
  }, [language])

  const t = async (text) => {
    if (!text) return text
    if (language === 'en') return text
    try {
      setIsTranslating(true)
      const translated = await translateText({ text, targetLang: language, apiKey })
      setIsTranslating(false)
      return translated
    } catch (err) {
      setIsTranslating(false)
      setError(err?.message || 'Translation failed.')
      return text
    }
  }

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      languages: LANGUAGES,
      isTranslating,
      error,
      apiKeyPresent: Boolean(apiKey),
      t,
    }),
    [language, isTranslating, error, apiKey],
  )

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>
}

export function useTranslator() {
  const ctx = useContext(TranslationContext)
  if (!ctx) {
    throw new Error('useTranslator must be used within TranslationProvider')
  }
  return ctx
}

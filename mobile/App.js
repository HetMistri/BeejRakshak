import React from 'react'
import { StatusBar } from 'react-native'
import AppNavigator from './src/navigation/AppNavigator'
import { AuthProvider } from './src/context/AuthContext'
import { TranslationProvider } from './src/translation/TranslationProvider'

export default function App() {
  return (
    <TranslationProvider>
      <AuthProvider>
        <StatusBar barStyle="light-content" />
        <AppNavigator />
      </AuthProvider>
    </TranslationProvider>
  )
}

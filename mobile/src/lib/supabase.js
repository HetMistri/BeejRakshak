import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { config } from './config'

const supabaseUrl = config.SUPABASE_URL
const supabaseAnonKey = config.SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    persistSession: false,
    autoRefreshToken: false,
  },
})

const SESSION_KEY = 'beejrakshak_session'

export async function getLocalSession() {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed?.id && parsed?.mobile) return parsed
    return null
  } catch {
    return null
  }
}

export async function setLocalSession(farmer) {
  await AsyncStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      id: farmer.id,
      name: farmer.name,
      mobile: farmer.mobile,
    }),
  )
}

export async function clearLocalSession() {
  await AsyncStorage.removeItem(SESSION_KEY)
}

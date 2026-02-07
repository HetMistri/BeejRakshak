import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Create client only when configured; otherwise use a no-op to avoid crash
let _supabase = null
if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project')) {
  _supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = _supabase || {
  from: () => ({
    select: () => ({
      eq: () => ({
        maybeSingle: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env' } }),
        single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      }),
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env' } }),
        }),
      }),
      upsert: () => Promise.resolve({ error: { message: 'Supabase not configured' } }),
    }),
  }),
}

// Simple localStorage session (no Supabase Auth needed)
const SESSION_KEY = 'beejrakshak_session'

export function getLocalSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed?.id && parsed?.mobile) return parsed
    return null
  } catch {
    return null
  }
}

export function setLocalSession(farmer) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    id: farmer.id,
    name: farmer.name,
    mobile: farmer.mobile,
  }))
}

export function clearLocalSession() {
  localStorage.removeItem(SESSION_KEY)
}

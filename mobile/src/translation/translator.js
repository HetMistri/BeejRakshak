const CACHE = new Map()
const IN_FLIGHT = new Map()

function getCache(lang) {
  if (!CACHE.has(lang)) {
    CACHE.set(lang, new Map())
  }
  return CACHE.get(lang)
}

async function translateBatch({ texts, targetLang, apiKey, sourceLang }) {
  const res = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: texts,
        target: targetLang,
        source: sourceLang,
        format: 'text',
      }),
    },
  )

  if (!res.ok) {
    const msg = await res.text()
    throw new Error(`Translate API error (${res.status}): ${msg || 'Unknown error'}`)
  }

  const data = await res.json()
  const translations = data?.data?.translations
  if (!Array.isArray(translations)) {
    throw new Error('Translate API returned unexpected response.')
  }

  return translations.map((t) => t.translatedText || '')
}

export async function translateText({ text, targetLang, apiKey, sourceLang = 'en' }) {
  if (!text || targetLang === sourceLang) return text
  if (!apiKey) throw new Error('Missing Google Translate API key.')

  const cache = getCache(targetLang)
  if (cache.has(text)) return cache.get(text)

  const key = `${targetLang}:${text}`
  if (IN_FLIGHT.has(key)) return IN_FLIGHT.get(key)

  const promise = (async () => {
    const [translated] = await translateBatch({ texts: [text], targetLang, apiKey, sourceLang })
    cache.set(text, translated)
    IN_FLIGHT.delete(key)
    return translated
  })()

  IN_FLIGHT.set(key, promise)
  return promise
}

export function clearTranslationCache() {
  CACHE.clear()
  IN_FLIGHT.clear()
}

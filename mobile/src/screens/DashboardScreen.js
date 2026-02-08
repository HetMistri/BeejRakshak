import React, { useEffect, useMemo, useState } from 'react'
import { SafeAreaView, View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import * as Location from 'expo-location'
import { colors, spacing } from '../theme'
import Section from '../components/Section'
import StatCard from '../components/StatCard'
import Badge from '../components/Badge'
import { useAuth } from '../context/AuthContext'
import { fetchRegistration } from '../lib/registration'
import { config } from '../lib/config'
import LanguageMenu from '../translation/LanguageMenu'
import TranslatedText, { useTranslatedText } from '../translation/TranslatedText'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'mandi', label: 'Mandi' },
  { id: 'advisory', label: 'Advisory' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'alerts', label: 'Alerts' },
]

export default function DashboardScreen() {
  const [tab, setTab] = useState('overview')
  const { session } = useAuth()
  const [profile, setProfile] = useState(null)
  const [coords, setCoords] = useState(null)
  const [weather, setWeather] = useState(null)
  const [forecastDays, setForecastDays] = useState([])
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [mandiBase, setMandiBase] = useState(null)
  const [mandiOnline, setMandiOnline] = useState(null)
  const [mandisList, setMandisList] = useState([])
  const [availableCrops, setAvailableCrops] = useState([])
  const [selectedCrop, setSelectedCrop] = useState('')
  const [recommendation, setRecommendation] = useState(null)
  const [mandiLoading, setMandiLoading] = useState(false)
  const [mandiError, setMandiError] = useState('')

  const quantity = useMemo(() => {
    if (profile?.land_area) {
      const unit = String(profile.land_unit || 'acre').toLowerCase()
      const area = Number(profile.land_area) || 1
      return Math.round(unit.includes('hectare') ? area * 2500 : area * 1000)
    }
    return 1000
  }, [profile?.land_area, profile?.land_unit])

  useEffect(() => {
    async function loadProfile() {
      if (!session?.id) return
      const data = await fetchRegistration(session.id)
      setProfile(data)
    }
    loadProfile()
  }, [session?.id])

  useEffect(() => {
    let cancelled = false

    async function resolveCoords() {
      if (profile?.latitude && profile?.longitude) {
        setCoords({ lat: Number(profile.latitude), lon: Number(profile.longitude) })
        return
      }

      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
          if (!cancelled) setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude })
          return
        }
      } catch {}

      try {
        const res = await fetch('https://ipapi.co/json/')
        const data = await res.json()
        if (!cancelled && data?.latitude && data?.longitude) {
          setCoords({ lat: data.latitude, lon: data.longitude })
        }
      } catch {}
    }

    resolveCoords()
    return () => { cancelled = true }
  }, [profile?.latitude, profile?.longitude])

  useEffect(() => {
    let cancelled = false
    const apiKey = config.OPENWEATHER_API_KEY
    if (!apiKey || !coords?.lat || !coords?.lon) return

    async function loadWeather() {
      setWeatherLoading(true)
      try {
        const params = `lat=${coords.lat}&lon=${coords.lon}`
        const [currentRes, forecastRes] = await Promise.all([
          fetch(`https://api.openweathermap.org/data/2.5/weather?${params}&appid=${apiKey}&units=metric`),
          fetch(`https://api.openweathermap.org/data/2.5/forecast?${params}&appid=${apiKey}&units=metric`),
        ])

        const current = currentRes.ok ? await currentRes.json() : null
        const forecast = forecastRes.ok ? await forecastRes.json() : null

        if (!cancelled) {
          setWeather(current)
          setForecastDays(buildForecastDays(forecast?.list || []))
        }
      } catch {
        if (!cancelled) setForecastDays([])
      } finally {
        if (!cancelled) setWeatherLoading(false)
      }
    }

    loadWeather()
    return () => { cancelled = true }
  }, [coords?.lat, coords?.lon])

  useEffect(() => {
    let cancelled = false
    const base = (config.MANDI_API_BASE || 'http://localhost:8000/mandi').replace(/\/$/, '')

    async function initMandi() {
      setMandiLoading(true)
      setMandiError('')
      let resolvedBase = base
      try {
        let healthRes = await fetch(`${base}/health`)
        if (!healthRes.ok && !base.endsWith('/mandi')) {
          const fallback = `${base}/mandi`
          healthRes = await fetch(`${fallback}/health`)
          if (healthRes.ok) resolvedBase = fallback
        }
        if (!healthRes.ok) throw new Error('API not reachable')
        const health = await healthRes.json()
        const modelsLoaded = typeof health.models_loaded === 'boolean' ? health.models_loaded : null
        if (modelsLoaded === false) throw new Error('ML models not loaded yet')
        if (!cancelled) {
          setMandiOnline(true)
          setMandiBase(resolvedBase)
        }

        const mandisRes = await fetch(`${resolvedBase}/mandis`)
        if (mandisRes.ok) {
          const mData = await mandisRes.json()
          const list = mData.mandis || []
          const crops = [...new Set(list.flatMap((m) => m.available_crops || []))]
          if (!cancelled) {
            setMandisList(list)
            setAvailableCrops(crops)
            const farmerCrop = profile?.primary_crop ? cap(profile.primary_crop) : ''
            if (crops.includes(farmerCrop)) setSelectedCrop(farmerCrop)
            else if (crops.length) setSelectedCrop(crops[0])
          }
        }
      } catch (e) {
        if (!cancelled) {
          setMandiOnline(false)
          setMandiError(e?.message || 'Mandi API offline')
        }
      } finally {
        if (!cancelled) setMandiLoading(false)
      }
    }

    initMandi()
    return () => { cancelled = true }
  }, [profile?.primary_crop])

  useEffect(() => {
    let cancelled = false
    if (!mandiBase || !selectedCrop || !quantity) return

    async function loadRecommendation() {
      setMandiLoading(true)
      setMandiError('')
      try {
        const body = {
          crop: selectedCrop,
          quantity,
        }
        if (profile?.latitude && profile?.longitude) {
          body.latitude = Number(profile.latitude)
          body.longitude = Number(profile.longitude)
        }
        if (profile?.village || profile?.district) {
          body.farmer_location = profile?.village || profile?.district
        }
        const res = await fetch(`${mandiBase}/response`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.detail || `Request failed (${res.status})`)
        }
        const data = await res.json()
        if (!cancelled) setRecommendation(data)
      } catch (e) {
        if (!cancelled) setMandiError(e?.message || 'Failed to get recommendation')
      } finally {
        if (!cancelled) setMandiLoading(false)
      }
    }

    loadRecommendation()
    return () => { cancelled = true }
  }, [mandiBase, selectedCrop, quantity, profile?.latitude, profile?.longitude, profile?.village, profile?.district])

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Header />
        <SearchBar />
        <View style={styles.tabsRow}>
          {TABS.map((t) => (
            <TouchableOpacity key={t.id} onPress={() => setTab(t.id)} style={[styles.tabPill, tab === t.id && styles.tabPillActive]}>
              <TranslatedText style={[styles.tabLabel, tab === t.id && styles.tabLabelActive]} text={t.label} />
            </TouchableOpacity>
          ))}
        </View>

        {tab === 'overview' && (
          <OverviewTab
            profile={profile}
            weather={weather}
            forecastDays={forecastDays}
            recommendation={recommendation}
            weatherLoading={weatherLoading}
          />
        )}
        {tab === 'mandi' && (
          <MandiTab
            profile={profile}
            mandisList={mandisList}
            availableCrops={availableCrops}
            selectedCrop={selectedCrop}
            setSelectedCrop={setSelectedCrop}
            recommendation={recommendation}
            loading={mandiLoading}
            error={mandiError}
            online={mandiOnline}
            quantity={quantity}
          />
        )}
        {tab === 'advisory' && (
          <AdvisoryTab
            profile={profile}
            weather={weather}
            forecastDays={forecastDays}
          />
        )}
        {tab === 'calendar' && (
          <CalendarTab
            profile={profile}
          />
        )}
        {tab === 'alerts' && (
          <AlertsTab
            profile={profile}
            recommendation={recommendation}
            weather={weather}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function Header() {
  return (
    <View style={styles.header}>
      <View style={styles.brand}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>BR</Text>
        </View>
        <View>
          <Text style={styles.title}>BeejRakshak</Text>
          <TranslatedText style={styles.subtitle} text="AgriTech Intelligence" />
        </View>
      </View>
      <View style={styles.headerActions}>
        <LanguageMenu compact />
        <View style={styles.profile}>
          <Text style={styles.profileText}>HM</Text>
        </View>
      </View>
    </View>
  )
}

function SearchBar() {
  const placeholder = useTranslatedText('Search mandis, alerts, advisories')
  return (
    <View style={styles.searchWrap}>
      <TextInput
        style={styles.search}
        placeholder={placeholder}
        placeholderTextColor="#7FB69B"
      />
    </View>
  )
}

function OverviewTab({ profile, weather, forecastDays, recommendation, weatherLoading }) {
  const cropLabel = profile?.primary_crop ? cap(profile.primary_crop) : 'Onion'
  const stageLabel = profile?.crop_stage ? cap(profile.crop_stage) : 'Vegetative'
  const riskLabel = weather?.main?.temp > 35 ? 'High' : weather?.main?.temp > 30 ? 'Moderate' : 'Low'
  const best = recommendation?.best_option
  const locationName = weather?.name || profile?.village || profile?.district || 'your area'

  return (
    <View>
      <View style={styles.statsRow}>
        <StatCard label="Crop" value={cropLabel} />
        <StatCard label="Stage" value={stageLabel} />
        <StatCard label="Risk" value={riskLabel} accent={riskLabel !== 'Low'} />
      </View>
      <Section title="Mandi Intelligence" subtitle="Price forecasts for Onion, Tomato, Potato">
        <MandiCard best={best} />
      </Section>
      <Section title="Weather Outlook" subtitle={`Next 3 days farmcast · ${locationName}`}>
        {weatherLoading ? (
          <View style={styles.inlineLoader}>
            <ActivityIndicator color={colors.accent} />
            <TranslatedText style={styles.inlineLoaderText} text="Loading weather..." />
          </View>
        ) : (
          <WeatherRow days={forecastDays} />
        )}
      </Section>
    </View>
  )
}

function MandiTab({ profile, mandisList, availableCrops, selectedCrop, setSelectedCrop, recommendation, loading, error, online, quantity }) {
  const best = recommendation?.best_option
  const crops = availableCrops.length ? availableCrops : ['Onion', 'Tomato', 'Potato']

  return (
    <View>
      <Section title="Best Mandi Today" subtitle="Profit-optimized recommendation" action="">
        {loading ? (
          <View style={styles.inlineLoader}>
            <ActivityIndicator color={colors.accent} />
            <TranslatedText style={styles.inlineLoaderText} text="Fetching recommendations..." />
          </View>
        ) : error ? (
          <TranslatedText style={styles.errorText} text={online === false ? 'Mandi API offline.' : error} />
        ) : (
          <MandiCard best={best} quantity={quantity} />
        )}
      </Section>
      <Section title="Available Crops" subtitle="From ML dataset" action="">
        <View style={styles.pillRow}>
          {crops.map((crop) => (
            <TouchableOpacity key={crop} onPress={() => setSelectedCrop(crop)}>
              <Badge label={crop} tone={crop === selectedCrop ? 'accent' : 'muted'} />
            </TouchableOpacity>
          ))}
        </View>
      </Section>
      <Section title="Mandis" subtitle={`${mandisList.length} mandis loaded`} action="">
        {mandisList.map((m, idx) => (
          <View key={`${m.mandi_name}-${idx}`} style={styles.mandiMini}>
            <View>
              <Text style={styles.mandiName}>{m.mandi_name}</Text>
              <Text style={styles.mandiMeta}>{m.distance_km?.toFixed?.(0) || '?'} km · {m.record_count || 0} records</Text>
            </View>
            <View style={styles.mandiTags}>
              {(m.available_crops || []).map((c) => (
                <Badge key={`${m.mandi_name}-${c}`} label={c} tone={c === selectedCrop ? 'accent' : 'muted'} />
              ))}
            </View>
          </View>
        ))}
      </Section>
    </View>
  )
}

function AdvisoryTab({ profile, weather }) {
  const locationName = weather?.name || profile?.village || profile?.district || 'your area'
  const temp = weather?.main?.temp
  const humidity = weather?.main?.humidity
  const clouds = weather?.clouds?.all
  const wind = weather?.wind?.speed ? (weather.wind.speed * 3.6) : null
  const season = getCurrentSeason()

  const advisoryText = temp
    ? `Current ${temp.toFixed(1)}°C in ${locationName}. ${temp > 32 ? 'Avoid midday spray.' : 'Good window for field tasks.'}`
    : 'Weather insights will appear once data is available.'

  const suitability = computeCropSuitabilitySummary({ temp, humidity, clouds, season })
  const recommended = suitability.filter((c) => c.score >= 60)
  const other = suitability.filter((c) => c.score < 60)
  const farmerCrop = profile?.primary_crop ? profile.primary_crop.toLowerCase() : ''
  const farmerCropData = suitability.find((c) => c.name.toLowerCase() === farmerCrop)

  return (
    <View>
      <Section title="Weekly Guidance" subtitle="Actionable advice" action="">
        <View style={styles.advisoryCard}>
          <TranslatedText style={styles.cardTitle} text="Field Tasks" />
          <TranslatedText style={styles.advisoryText} text={advisoryText} />
          <View style={styles.pillRow}>
            <Badge label="Irrigation" tone="accent" />
            <Badge label="Spray" tone={wind && wind > 15 ? 'warn' : 'muted'} />
            <Badge label="Harvest" />
          </View>
        </View>
      </Section>

      {farmerCropData && (
        <Section title="Your Crop" subtitle={`${cap(farmerCropData.season)} crop · ${farmerCropData.duration}`} action="">
          <View style={styles.mandiMini}>
            <TranslatedText style={styles.mandiName} text={farmerCropData.name} />
            <TranslatedText style={styles.mandiMeta} text={`Suitability: ${farmerCropData.score}%`} />
            <View style={styles.pillRow}>
              {farmerCropData.score >= 70 && <Badge label="Great fit" tone="accent" />}
              {farmerCropData.score < 70 && farmerCropData.score >= 40 && <Badge label="Monitor" tone="warn" />}
              {farmerCropData.score < 40 && <Badge label="Risky" tone="muted" />}
            </View>
          </View>
        </Section>
      )}

      <Section title="Recommended Crops" subtitle={`Based on ${locationName} weather`}>
        <View style={styles.pillRow}>
          {(recommended.length ? recommended : suitability).slice(0, 3).map((crop) => (
            <Badge key={crop.name} label={crop.name} tone={crop.score >= 70 ? 'accent' : 'muted'} />
          ))}
        </View>
      </Section>

      {other.length > 0 && (
        <Section title="Not Ideal Now" subtitle="Lower suitability this week" action="">
          <View style={styles.pillRow}>
            {other.map((crop) => (
              <Badge key={crop.name} label={crop.name} tone="muted" />
            ))}
          </View>
        </Section>
      )}
    </View>
  )
}

function CalendarTab({ profile }) {
  const crop = profile?.primary_crop ? cap(profile.primary_crop) : 'Onion'
  const stage = profile?.crop_stage ? cap(profile.crop_stage) : 'Vegetative'

  const today = new Date()
  const monthName = today.toLocaleString('default', { month: 'long' })
  const year = today.getFullYear()
  const daysInMonth = new Date(year, today.getMonth() + 1, 0).getDate()
  const firstDay = new Date(year, today.getMonth(), 1).getDay()

  const events = {}
  const addEvent = (offset, data) => {
    const day = today.getDate() + offset
    if (day >= 1 && day <= daysInMonth) events[day] = data
  }

  addEvent(0, { type: 'today', label: 'Today', color: '#34D399' })
  addEvent(2, { type: 'irrigation', label: 'Irrigation', color: '#3B82F6' })
  addEvent(4, { type: 'fertilizer', label: 'Fertilizer', color: '#10B981' })
  addEvent(7, { type: 'pest', label: 'Pest Spray', color: '#F59E0B' })
  addEvent(12, { type: 'harvest', label: 'Harvest Check', color: '#F97316' })
  addEvent(15, { type: 'mandi', label: 'Mandi Visit', color: '#8B5CF6' })

  const upcoming = [
    {
      date: `${monthName} ${today.getDate() + 2}`,
      title: 'Scheduled Irrigation',
      desc: 'SAR data shows soil moisture dropping to 32%. Irrigate before it reaches critical 25% threshold.',
      icon: '💧',
      color: '#3B82F6',
    },
    {
      date: `${monthName} ${today.getDate() + 4}`,
      title: 'Nitrogen Application',
      desc: `${crop} in ${stage} stage needs nitrogen boost. Weather window is clear for next 3 days.`,
      icon: '🧪',
      color: '#10B981',
    },
    {
      date: `${monthName} ${today.getDate() + 7}`,
      title: 'Preventive Pest Spray',
      desc: 'Humidity forecast 82% this week. Apply preventive spray to avoid fungal infection.',
      icon: '🛡️',
      color: '#F59E0B',
    },
    {
      date: `${monthName} ${today.getDate() + 12}`,
      title: 'Pre-Harvest Assessment',
      desc: 'NDVI plateau detected. Conduct field inspection to confirm harvest readiness.',
      icon: '🌾',
      color: '#F97316',
    },
    {
      date: `${monthName} ${today.getDate() + 15}`,
      title: 'Mandi Price Window',
      desc: `${crop} prices trending up. Optimal selling window projected for this period.`,
      icon: '📊',
      color: '#8B5CF6',
    },
  ].filter((t) => Number(t.date.split(' ')[1]) <= daysInMonth)

  const seasons = [
    {
      name: 'Kharif',
      months: 'Jun - Oct',
      crops: 'Tomato',
      active: today.getMonth() >= 5 && today.getMonth() <= 9,
    },
    {
      name: 'Rabi',
      months: 'Nov - Mar',
      crops: 'Onion, Potato',
      active: today.getMonth() >= 10 || today.getMonth() <= 2,
    },
    {
      name: 'Zaid',
      months: 'Mar - Jun',
      crops: 'Tomato',
      active: today.getMonth() >= 2 && today.getMonth() <= 5,
    },
  ]

  const legend = [
    { label: 'Irrigation', color: '#3B82F6' },
    { label: 'Fertilizer', color: '#10B981' },
    { label: 'Pest', color: '#F59E0B' },
    { label: 'Harvest', color: '#F97316' },
  ]

  return (
    <View>
      <Section title="Adaptive Calendar" subtitle={`${crop} · ${stage} stage`} action="">
        <View style={styles.calendarHero}>
          <TranslatedText style={styles.heroEyebrow} text="AI-Powered Scheduling" />
          <TranslatedText style={styles.heroTitle} text="Farm calendar that adapts to your crop, weather, and satellite data" />
          <TranslatedText
            style={styles.heroBody}
            text="Every task is auto-scheduled based on SAR moisture, weather forecasts, crop stage, and market trends. The calendar updates itself — you just follow it."
          />
        </View>
      </Section>

      <Section title={`${monthName} ${year}`} subtitle="Auto-scheduled tasks" action="">
        <View style={styles.calendarLegend}>
          {legend.map((l) => (
            <View key={l.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: l.color }]} />
              <TranslatedText style={styles.legendLabel} text={l.label} />
            </View>
          ))}
        </View>
        <View style={styles.calendarHeaderRow}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <View key={d} style={styles.calendarHeaderCell}>
              <TranslatedText style={styles.calendarHeaderText} text={d} />
            </View>
          ))}
        </View>
        <View style={styles.calendarGrid}>
          {Array.from({ length: firstDay }).map((_, i) => (
            <View key={`empty-${i}`} style={[styles.calendarCell, styles.calendarCellEmpty]} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const ev = events[day]
            const isToday = day === today.getDate()
            return (
              <View
                key={day}
                style={[
                  styles.calendarCell,
                  isToday && styles.calendarCellToday,
                  !isToday && ev && styles.calendarCellEvent,
                ]}
              >
                <TranslatedText style={[styles.calendarCellText, isToday && styles.calendarCellTextToday]} text={`${day}`} />
                {ev && !isToday ? <View style={[styles.calendarDot, { backgroundColor: ev.color }]} /> : null}
              </View>
            )
          })}
        </View>
      </Section>

      <Section title="Crop Seasons" subtitle="Seasonal windows" action="">
        <View style={styles.seasonList}>
          {seasons.map((s) => (
            <View key={s.name} style={[styles.seasonItem, s.active && styles.seasonItemActive]}>
              <View style={[styles.seasonDot, s.active && styles.seasonDotActive]} />
              <View>
                <TranslatedText style={styles.seasonTitle} text={`${s.name} (${s.months})`} />
                <TranslatedText style={styles.seasonMeta} text={s.crops} />
              </View>
            </View>
          ))}
        </View>
      </Section>

      <Section title="How it adapts" subtitle="Signals used" action="">
        <View style={styles.adaptList}>
          {[
            'Reads SAR moisture + NDVI daily',
            'Checks 7-day weather forecast',
            'Matches crop stage requirements',
            'Reschedules tasks automatically',
          ].map((item, idx) => (
            <View key={item} style={styles.adaptItem}>
              <TranslatedText style={styles.adaptIndex} text={`${idx + 1}.`} />
              <TranslatedText style={styles.adaptText} text={item} />
            </View>
          ))}
        </View>
      </Section>

      <Section title="Upcoming Farm Tasks" subtitle="Auto-generated based on your crop, weather, and satellite data" action="">
        <View style={styles.upcomingList}>
          {upcoming.map((t) => (
            <View key={`${t.title}-${t.date}`} style={styles.upcomingItem}>
              <View style={[styles.upcomingBar, { backgroundColor: t.color }]} />
              <View style={styles.upcomingContent}>
                <View style={styles.upcomingHeader}>
                  <Text style={styles.upcomingIcon}>{t.icon}</Text>
                  <View>
                    <TranslatedText style={styles.upcomingTitle} text={t.title} />
                    <TranslatedText style={styles.upcomingDate} text={t.date} />
                  </View>
                </View>
                <TranslatedText style={styles.upcomingDesc} text={t.desc} />
              </View>
            </View>
          ))}
        </View>
      </Section>
    </View>
  )
}

function AlertsTab({ profile, recommendation, weather }) {
  const temp = weather?.main?.temp
  const heatStatus = temp > 35 ? 'High' : temp > 30 ? 'Moderate' : 'Low'
  const heatDetail = temp ? `Temperature at ${temp.toFixed(1)}°C.` : 'No temperature data yet.'
  const best = recommendation?.best_option

  return (
    <View>
      <Section title="Latest Alerts" subtitle="From sensors + ML" action="">
        <AlertItem label="Heat Stress" status={heatStatus} tone={heatStatus === 'High' ? 'warn' : 'accent'} detail={heatDetail} />
        <AlertItem
          label="Mandi Price Window"
          status={best ? 'Active' : 'Standby'}
          tone={best ? 'accent' : 'muted'}
          detail={best ? `${best.mandi_name} offers ₹${Math.round(best.current_price)}/kg today.` : 'Waiting for mandi data.'}
        />
        <AlertItem label="Rain Watch" status={forecastDaysFromWeather(weather) ? 'Low' : 'Standby'} detail="Monitor upcoming rainfall in the forecast." />
      </Section>
    </View>
  )
}

function MandiCard({ best, quantity = 1000 }) {
  if (!best) {
    return (
      <View style={styles.mandiCard}>
        <View>
          <TranslatedText style={styles.cardTitle} text="Best Mandi Today" />
          <TranslatedText style={styles.cardValue} text="Loading..." />
          <TranslatedText style={styles.cardMeta} text="Fetching latest recommendation" />
        </View>
      </View>
    )
  }

  const net = best.net_profit != null ? `Net ₹${Math.round(best.net_profit).toLocaleString('en-IN')}` : 'Net —'
  const price = best.current_price != null ? `₹${Number(best.current_price).toFixed(0)}/kg` : '₹—/kg'

  return (
    <View style={styles.mandiCard}>
      <View>
        <TranslatedText style={styles.cardTitle} text={best.mandi_name} />
        <TranslatedText style={styles.cardValue} text={price} />
        <TranslatedText style={styles.cardMeta} text={`${best.distance_km?.toFixed?.(0) || '?'} km · ${net} · ${quantity} kg`} />
      </View>
      <View style={styles.mandiBadge}>
        <Text style={styles.mandiBadgeText}>ML</Text>
      </View>
    </View>
  )
}

function WeatherRow({ days = [] }) {
  if (!days.length) {
    return (
      <View style={styles.weatherRow}>
        <WeatherCard day="Today" temp="—" status="No data" />
        <WeatherCard day="Tomorrow" temp="—" status="No data" />
        <WeatherCard day="Next" temp="—" status="No data" />
      </View>
    )
  }
  return (
    <View style={styles.weatherRow}>
      {days.map((d) => (
        <WeatherCard key={d.day} day={d.day} temp={`${Math.round(d.temp)}°`} status={d.status} />
      ))}
    </View>
  )
}

function WeatherCard({ day, temp, status }) {
  return (
    <View style={styles.weatherCard}>
      <TranslatedText style={styles.weatherDay} text={day} />
      <TranslatedText style={styles.weatherTemp} text={temp} />
      <TranslatedText style={styles.weatherStatus} text={status} />
    </View>
  )
}

function AlertItem({ label, status, tone, detail }) {
  const toneStyle =
    tone === 'warn'
      ? { backgroundColor: '#2A2216', borderColor: '#6B4E1B', color: colors.warn }
      : tone === 'accent'
      ? { backgroundColor: '#143126', borderColor: '#1F5B43', color: colors.accent }
      : { backgroundColor: colors.cardLight, borderColor: colors.border, color: colors.textMuted }

  return (
    <View style={[styles.alertItem, { borderColor: toneStyle.borderColor, backgroundColor: toneStyle.backgroundColor }]}> 
      <View>
        <TranslatedText style={styles.alertLabel} text={label} />
        <TranslatedText style={styles.alertDetail} text={detail} />
      </View>
      <TranslatedText style={[styles.alertStatus, { color: toneStyle.color }]} text={status} />
    </View>
  )
}

function buildForecastDays(list) {
  if (!Array.isArray(list) || list.length === 0) return []
  const buckets = {}
  list.forEach((item) => {
    const date = item.dt_txt?.split(' ')[0]
    if (!date) return
    if (!buckets[date]) buckets[date] = []
    buckets[date].push(item)
  })

  const days = Object.keys(buckets).slice(0, 3).map((date) => {
    const entries = buckets[date]
    const avgTemp = entries.reduce((sum, e) => sum + (e.main?.temp || 0), 0) / entries.length
    const main = entries[0]?.weather?.[0]?.description || 'Clear'
    const dayLabel = new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short' })
    return { day: dayLabel, temp: avgTemp, status: cap(main) }
  })
  return days
}

function cap(text) {
  if (!text) return ''
  return String(text).replace(/\b\w/g, (m) => m.toUpperCase())
}

function forecastDaysFromWeather(current) {
  return Boolean(current)
}

function getCurrentSeason() {
  const m = new Date().getMonth()
  if (m >= 5 && m <= 9) return 'kharif'
  if (m >= 10 || m <= 2) return 'rabi'
  return 'zaid'
}

function computeCropSuitabilitySummary({ temp, humidity, clouds, season }) {
  const t = typeof temp === 'number' ? temp : 26
  const h = typeof humidity === 'number' ? humidity : 60
  const c = typeof clouds === 'number' ? clouds : 30

  return CROP_DATABASE.map((crop) => {
    const [tMin, tMax] = crop.tempRange
    const [hMin, hMax] = crop.humRange
    let score = 0

    const tempScore = t >= tMin && t <= tMax ? 30 : Math.max(0, 20 - Math.abs(t - (tMin + tMax) / 2))
    const humScore = h >= hMin && h <= hMax ? 20 : Math.max(0, 15 - Math.abs(h - (hMin + hMax) / 2) / 2)
    const seasonScore = crop.season === season ? 30 : 15
    const sunScore = crop.waterNeed === 'High' ? (c > 40 ? 6 : 10) : (c < 50 ? 10 : 6)

    score = Math.round(tempScore + humScore + seasonScore + sunScore)
    return { ...crop, score }
  }).sort((a, b) => b.score - a.score)
}

const CROP_DATABASE = [
  { name: 'Onion', season: 'rabi', tempRange: [13, 30], humRange: [40, 70], waterNeed: 'Medium', duration: '120-150 days' },
  { name: 'Tomato', season: 'zaid', tempRange: [18, 35], humRange: [40, 70], waterNeed: 'Medium', duration: '60-90 days' },
  { name: 'Potato', season: 'rabi', tempRange: [10, 25], humRange: [40, 70], waterNeed: 'Medium', duration: '80-120 days' },
]

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.accentDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: colors.text, fontWeight: '700' },
  title: { color: colors.text, fontSize: 18, fontWeight: '700' },
  subtitle: { color: colors.textMuted, fontSize: 12 },
  profile: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.cardLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileText: { color: colors.text, fontWeight: '600' },
  searchWrap: { marginBottom: 16 },
  search: {
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  tabPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: colors.border },
  tabPillActive: { backgroundColor: '#103126', borderColor: colors.accent },
  tabLabel: { color: colors.textMuted, fontSize: 12 },
  tabLabelActive: { color: colors.accent, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  mandiCard: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.card, padding: 16, borderRadius: 18, borderWidth: 1, borderColor: colors.border },
  mandiBadge: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#143126', alignItems: 'center', justifyContent: 'center' },
  mandiBadgeText: { color: colors.accent, fontWeight: '700' },
  cardTitle: { color: colors.textMuted, fontSize: 12 },
  cardValue: { color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 4 },
  cardMeta: { color: colors.textMuted, fontSize: 11, marginTop: 6 },
  weatherRow: { flexDirection: 'row', gap: 12 },
  weatherCard: { flex: 1, backgroundColor: colors.cardLight, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  weatherDay: { color: colors.textMuted, fontSize: 12 },
  weatherTemp: { color: colors.text, fontSize: 20, fontWeight: '700', marginTop: 6 },
  weatherStatus: { color: colors.textMuted, fontSize: 11, marginTop: 4, textAlign: 'center' },
  advisoryCard: { backgroundColor: colors.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: colors.border, marginBottom: 10 },
  advisoryText: { color: colors.text, fontSize: 13, marginTop: 8, lineHeight: 18 },
  pillRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  alertItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 14, borderWidth: 1, marginBottom: 8 },
  alertLabel: { color: colors.text, fontSize: 14, fontWeight: '600' },
  alertDetail: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
  alertStatus: { fontSize: 12, fontWeight: '700' },
  errorText: { color: '#FCA5A5', fontSize: 12, marginTop: 8 },
  inlineLoader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  inlineLoaderText: { color: colors.textMuted, fontSize: 12 },
  mandiMini: { backgroundColor: colors.cardLight, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 10 },
  mandiName: { color: colors.text, fontSize: 13, fontWeight: '600' },
  mandiMeta: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
  mandiTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  calendarHero: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#3B1F5C',
    borderWidth: 1,
    borderColor: '#4C2A75',
  },
  heroEyebrow: { color: '#C7B6F2', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  heroTitle: { color: '#F5F3FF', fontSize: 16, fontWeight: '800', marginTop: 8 },
  heroBody: { color: '#DAD3FF', fontSize: 12, marginTop: 6, lineHeight: 16 },
  calendarLegend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { color: colors.textMuted, fontSize: 11 },
  calendarHeaderRow: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarHeaderCell: { width: '14.28%', paddingVertical: 6, alignItems: 'center' },
  calendarHeaderText: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginVertical: 4,
  },
  calendarCellEmpty: { backgroundColor: 'transparent' },
  calendarCellToday: { backgroundColor: colors.accentDark, borderWidth: 1, borderColor: '#3ECF9B' },
  calendarCellEvent: { backgroundColor: colors.cardLight, borderWidth: 1, borderColor: colors.border },
  calendarCellText: { color: colors.textMuted, fontSize: 12 },
  calendarCellTextToday: { color: colors.text, fontWeight: '700' },
  calendarDot: { position: 'absolute', bottom: 6, width: 6, height: 6, borderRadius: 3 },
  seasonList: { gap: 10 },
  seasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: colors.cardLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  seasonItemActive: { borderColor: colors.accent, backgroundColor: '#123326' },
  seasonDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#4B5563' },
  seasonDotActive: { backgroundColor: colors.accent },
  seasonTitle: { color: colors.text, fontSize: 13, fontWeight: '700' },
  seasonMeta: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  adaptList: { gap: 10 },
  adaptItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  adaptIndex: { color: colors.accent, fontWeight: '700', width: 18 },
  adaptText: { color: colors.textMuted, fontSize: 12, flex: 1 },
  upcomingList: { gap: 10 },
  upcomingItem: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  upcomingBar: { width: 4 },
  upcomingContent: { flex: 1, padding: 12 },
  upcomingHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  upcomingIcon: { fontSize: 18 },
  upcomingTitle: { color: colors.text, fontSize: 13, fontWeight: '700' },
  upcomingDate: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
  upcomingDesc: { color: colors.textMuted, fontSize: 12, lineHeight: 16 },
})

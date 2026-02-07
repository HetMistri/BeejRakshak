import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/* ─── SVG icon paths ─── */
const ICONS = {
  home: 'M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25',
  weather: 'M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z',
  mandi: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z',
  satellite: 'M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.007H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z',
  advisory: 'M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18',
  alerts: 'M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0M13 10h-2v3H8v2h3v3h2v-3h3v-2h-3v-3z',
  calendar: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z',
  imageQuality: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21zM10.5 8.25a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z',
  selfTrain: 'M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5',
  signout: 'M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9',
  menu: 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5',
  chevronLeft: 'M15.75 19.5L8.25 12l7.5-7.5',
  bell: 'M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0',
  chart: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
}

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: ICONS.home },
  { id: 'weather', label: 'Weather', icon: ICONS.weather },
  { id: 'mandi', label: 'Mandi Prices', icon: ICONS.mandi },
  { id: 'satellite', label: 'SAR Monitor', icon: ICONS.satellite },
  { id: 'advisory', label: 'Crop Advisory', icon: ICONS.advisory },
  { id: 'alerts', label: 'Alert System', icon: ICONS.alerts },
  { id: 'calendar', label: 'Adaptive Calendar', icon: ICONS.calendar },
  { id: 'imageqc', label: 'Image QC', icon: ICONS.imageQuality },
  { id: 'selftrain', label: 'Self Training', icon: ICONS.selfTrain },
]

function Icon({ d, className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  )
}

export default function Dashboard({ session, onSignOut }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [profile, setProfile] = useState(null)
  const [mobileSidebar, setMobileSidebar] = useState(false)

  useEffect(() => {
    if (!session?.id) return
    supabase
      .from('registrations')
      .select('*')
      .eq('user_id', session.id)
      .maybeSingle()
      .then(({ data }) => { if (data) setProfile(data) })
  }, [session?.id])

  const initials = (session?.name || 'F').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  function handleNav(id) {
    setActiveTab(id)
    setMobileSidebar(false)
  }

  return (
    <div className="min-h-screen flex bg-[#f8faf9]">
      {/* Mobile overlay */}
      {mobileSidebar && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden" onClick={() => setMobileSidebar(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static z-40 top-0 bottom-0 flex flex-col bg-[#0c1f17] text-white transition-all duration-300 ease-out ${
          mobileSidebar ? 'left-0' : '-left-72 md:left-0'
        } ${sidebarOpen ? 'w-64' : 'w-[72px]'}`}
      >
        {/* Brand */}
        <div className={`flex items-center gap-3 border-b border-white/[0.06] transition-all duration-300 ${sidebarOpen ? 'px-5 py-5' : 'px-3 py-5 justify-center'}`}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-1.2 0-4.8 1.6-4.8 6.4 0 2.4.8 4 2.4 5.2V21h4.8v-6.4c1.6-1.2 2.4-2.8 2.4-5.2C16.8 4.6 13.2 3 12 3z" />
              <path strokeLinecap="round" d="M12 3v6" />
            </svg>
          </div>
          {sidebarOpen && (
            <div className="animate-fade-in">
              <h1 className="font-extrabold text-sm tracking-tight">BeejRakshak</h1>
              <p className="text-[10px] text-emerald-400/60 font-medium">AgriTech Platform</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                sidebarOpen ? 'px-3 py-3' : 'px-0 py-3 justify-center'
              } ${
                activeTab === item.id
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'text-white/50 hover:bg-white/[0.05] hover:text-white/80'
              }`}
            >
              <div className="relative shrink-0">
                <Icon d={item.icon} className="w-5 h-5" />
                {activeTab === item.id && (
                  <div className="absolute -left-[19px] top-1/2 -translate-y-1/2 w-1 h-5 bg-emerald-400 rounded-r-full" style={sidebarOpen ? {} : { display: 'none' }} />
                )}
              </div>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Profile + signout */}
        <div className="border-t border-white/[0.06] p-3 space-y-2">
          {sidebarOpen && (
            <div className="flex items-center gap-3 px-3 py-2 animate-fade-in">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white/90 truncate">{session?.name || 'Farmer'}</p>
                <p className="text-[11px] text-white/40 truncate">{session?.mobile || ''}</p>
              </div>
            </div>
          )}
          <button
            onClick={onSignOut}
            className={`w-full flex items-center gap-3 rounded-xl text-sm font-medium text-white/40 hover:bg-white/[0.05] hover:text-white/70 transition-all ${
              sidebarOpen ? 'px-3 py-2.5' : 'py-2.5 justify-center'
            }`}
          >
            <Icon d={ICONS.signout} className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-stone-200/60 px-4 md:px-6 py-3 flex items-center gap-4">
          {/* Mobile menu button */}
          <button onClick={() => setMobileSidebar(true)} className="md:hidden p-2 rounded-lg hover:bg-stone-100 text-stone-600">
            <Icon d={ICONS.menu} className="w-5 h-5" />
          </button>
          {/* Desktop collapse */}
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="hidden md:flex p-2 rounded-lg hover:bg-stone-100 text-stone-500 transition-colors"
          >
            <Icon d={sidebarOpen ? ICONS.chevronLeft : ICONS.menu} className="w-5 h-5" />
          </button>

          <div className="flex-1" />

          {/* Notification bell */}
          <button className="relative p-2 rounded-lg hover:bg-stone-100 text-stone-500 transition-colors">
            <Icon d={ICONS.bell} className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Profile */}
          <div className="flex items-center gap-3 pl-3 border-l border-stone-200">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-[11px] font-bold text-white">
              {initials}
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-stone-800 leading-tight">{session?.name || 'Farmer'}</p>
              <p className="text-[11px] text-stone-400">{session?.mobile || ''}</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {activeTab === 'overview' && <OverviewTab session={session} profile={profile} greeting={greeting} />}
          {activeTab === 'weather' && <WeatherTab profile={profile} />}
          {activeTab === 'mandi' && <MandiTab profile={profile} />}
          {activeTab === 'satellite' && <SatelliteTab profile={profile} />}
          {activeTab === 'advisory' && <AdvisoryTab profile={profile} />}
          {activeTab === 'alerts' && <AlertSystemTab profile={profile} />}
          {activeTab === 'calendar' && <AdaptiveCalendarTab profile={profile} />}
          {activeTab === 'imageqc' && <ImageQCTab profile={profile} />}
          {activeTab === 'selftrain' && <SelfTrainingTab profile={profile} />}
        </main>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   OVERVIEW TAB
   ═══════════════════════════════════════════════════ */
function OverviewTab({ session, profile, greeting }) {
  return (
    <div className="space-y-6 max-w-6xl animate-fade-in">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.04] rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/[0.03] rounded-full translate-y-1/2" />
        <div className="relative z-10">
          <p className="text-emerald-200 text-sm font-medium">{greeting}</p>
          <h2 className="text-2xl md:text-3xl font-extrabold mt-1">{session?.name || 'Farmer'}</h2>
          <p className="text-emerald-100/70 text-sm mt-2 max-w-lg">
            Your farm intelligence dashboard. Monitor crops, weather, and market prices — all powered by SAR satellite data.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Location"
          value={profile?.village ? `${profile.village}` : 'Not set'}
          sub={profile?.district || ''}
          gradient="from-emerald-500 to-teal-600"
          iconPath={ICONS.home}
        />
        <StatCard
          label="Primary Crop"
          value={profile?.primary_crop ? cap(profile.primary_crop) : '—'}
          sub={profile?.crop_stage ? cap(profile.crop_stage) + ' stage' : ''}
          gradient="from-amber-500 to-orange-600"
          iconPath={ICONS.advisory}
        />
        <StatCard
          label="Land Area"
          value={profile?.land_area ? `${profile.land_area}` : '—'}
          sub={profile?.land_unit ? cap(profile.land_unit) + 's' : ''}
          gradient="from-blue-500 to-indigo-600"
          iconPath={ICONS.chart}
        />
        <StatCard
          label="SAR Monitor"
          value={profile?.satellite_consent ? 'Active' : 'Inactive'}
          sub={profile?.satellite_consent ? 'All systems go' : 'Enable in settings'}
          gradient={profile?.satellite_consent ? 'from-teal-500 to-cyan-600' : 'from-stone-400 to-stone-500'}
          iconPath={ICONS.satellite}
        />
      </div>

      {/* Detail cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Farm Details */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-stone-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
            <h3 className="font-bold text-stone-800">Farm Profile</h3>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">Registered</span>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              <InfoRow label="Farmer Name" value={profile?.farmer_name || session?.name || '—'} />
              <InfoRow label="Mobile" value={profile?.mobile || session?.mobile || '—'} />
              <InfoRow label="Language" value={profile?.preferred_language ? cap(profile.preferred_language) : '—'} />
              <InfoRow label="Primary Crop" value={profile?.primary_crop ? cap(profile.primary_crop) : '—'} />
              <InfoRow label="Crop Stage" value={profile?.crop_stage ? cap(profile.crop_stage) : '—'} />
              <InfoRow label="Land Area" value={profile?.land_area ? `${profile.land_area} ${profile.land_unit || ''}` : '—'} />
              <InfoRow label="Village" value={profile?.village || '—'} />
              <InfoRow label="District" value={profile?.district || '—'} />
              <InfoRow label="State" value={profile?.state || '—'} />
              <InfoRow label="Market" value={profile?.market_preference ? cap(profile.market_preference.replace(/_/g, ' ')) : '—'} />
            </div>
          </div>
        </div>

        {/* SAR Status */}
        <div className="rounded-2xl bg-white border border-stone-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100">
            <h3 className="font-bold text-stone-800">SAR Satellite</h3>
          </div>
          <div className="p-6 flex flex-col items-center text-center">
            {/* Radar visual */}
            <div className="relative w-32 h-32 mb-4">
              <div className="absolute inset-0 rounded-full border-2 border-emerald-200" />
              <div className="absolute inset-4 rounded-full border border-emerald-200/60" />
              <div className="absolute inset-8 rounded-full border border-emerald-200/40" />
              <div className="absolute inset-[52px] rounded-full bg-emerald-500 animate-pulse" />
              {profile?.satellite_consent && (
                <div className="absolute inset-0 origin-center animate-radar">
                  <div className="w-1/2 h-0.5 bg-gradient-to-r from-emerald-500/80 to-transparent mt-[calc(50%-1px)] ml-[50%]" />
                </div>
              )}
            </div>
            <p className="font-bold text-stone-800">{profile?.satellite_consent ? 'Monitoring Active' : 'Monitoring Inactive'}</p>
            <p className="text-xs text-stone-500 mt-1">
              {profile?.latitude
                ? `Coordinates: ${Number(profile.latitude).toFixed(4)}, ${Number(profile.longitude).toFixed(4)}`
                : 'No coordinates captured'
              }
            </p>
            {profile?.satellite_consent && (
              <div className="mt-4 w-full space-y-2">
                <MiniGauge label="Soil Moisture" value={68} color="emerald" />
                <MiniGauge label="Crop Health" value={82} color="teal" />
                <MiniGauge label="Flood Risk" value={12} color="amber" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InsightCard
          title="Weather Alert"
          desc="Light rainfall expected in the next 48 hours. Good for sowing preparations."
          color="blue"
          icon="🌧️"
        />
        <InsightCard
          title="Market Update"
          desc={`${profile?.primary_crop ? cap(profile.primary_crop) : 'Crop'} prices holding steady at nearby mandis.`}
          color="amber"
          icon="📈"
        />
        <InsightCard
          title="Advisory"
          desc={profile?.crop_stage === 'sowing' ? 'Optimal window for sowing. Soil conditions favorable.' : 'Monitor crop growth regularly for best results.'}
          color="emerald"
          icon="💡"
        />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   FARMCAST — REAL-TIME AGRICULTURAL WEATHER INTELLIGENCE
   ═══════════════════════════════════════════════════ */

/* ── Crop-specific heat/cold thresholds (°C) ── */
const CROP_HEAT_THRESHOLDS = {
  wheat: { optimal: [15, 25], stress: 35 },
  rice: { optimal: [25, 35], stress: 40 },
  cotton: { optimal: [20, 30], stress: 38 },
  soybean: { optimal: [20, 30], stress: 35 },
  maize: { optimal: [18, 27], stress: 35 },
  mustard: { optimal: [15, 25], stress: 35 },
  gram: { optimal: [15, 25], stress: 35 },
  sugarcane: { optimal: [20, 35], stress: 42 },
  groundnut: { optimal: [22, 30], stress: 38 },
}

/* ── Agricultural computation engine ── */

function computeSprayScore(current, forecastList) {
  if (!current || !forecastList?.length) return { score: 0, label: 'No data', factors: [] }
  const windKmh = (current.wind?.speed || 0) * 3.6
  const humidity = current.main?.humidity || 0
  const factors = []

  const windScore = windKmh < 8 ? 100 : windKmh < 15 ? 70 : windKmh < 25 ? 30 : 0
  factors.push({ name: 'Wind Speed', value: `${windKmh.toFixed(1)} km/h`, ok: windKmh < 15 })

  const next4h = forecastList.slice(0, 2)
  const rainExpected = next4h.some(f => (f.pop || 0) > 0.3 || (f.rain?.['3h'] || 0) > 0)
  factors.push({ name: 'Rain (next 4h)', value: rainExpected ? 'Expected' : 'Clear', ok: !rainExpected })

  const humScore = humidity < 70 ? 100 : humidity < 85 ? 60 : 20
  factors.push({ name: 'Humidity', value: `${humidity}%`, ok: humidity < 85 })

  const score = Math.round(windScore * 0.4 + (rainExpected ? 0 : 100) * 0.35 + humScore * 0.25)
  const label = score >= 70 ? 'Safe to Spray' : score >= 40 ? 'Use Caution' : 'Do Not Spray'
  return { score, label, factors }
}

function computeDiseasePressure(current) {
  if (!current) return { score: 0, label: 'No data', detail: '' }
  const temp = current.main?.temp || 0
  const humidity = current.main?.humidity || 0
  const dewPoint = temp - ((100 - humidity) / 5)
  const leafWetness = Math.max(0, 100 - (temp - dewPoint) * 10)

  let score = 0
  if (humidity > 90) score += 40
  else if (humidity > 80) score += 30
  else if (humidity > 70) score += 15

  if (temp >= 20 && temp <= 30) score += 35
  else if (temp >= 15 && temp <= 35) score += 20
  else score += 5

  score += Math.round(leafWetness * 0.25)
  score = Math.min(100, score)

  const label = score >= 70 ? 'High Risk' : score >= 40 ? 'Moderate' : 'Low Risk'
  const detail = score >= 70
    ? 'Fungal infection likely. Apply preventive fungicide immediately.'
    : score >= 40
    ? 'Conditions favor disease. Monitor crops closely for symptoms.'
    : 'Disease pressure is low. Conditions unfavorable for pathogens.'
  return { score, label, detail }
}

function computeHeatStress(current, cropName) {
  if (!current) return { score: 0, label: 'No data', detail: '' }
  const temp = current.main?.temp || 0
  const crop = CROP_HEAT_THRESHOLDS[cropName?.toLowerCase()] || { optimal: [20, 30], stress: 35 }
  const cropLabel = cap(cropName || 'crop')

  let score = 0
  if (temp > crop.stress) score = Math.min(100, 70 + (temp - crop.stress) * 6)
  else if (temp > crop.optimal[1]) score = Math.round(((temp - crop.optimal[1]) / (crop.stress - crop.optimal[1])) * 70)
  else if (temp < crop.optimal[0] - 5) score = Math.min(80, (crop.optimal[0] - 5 - temp) * 8)
  else if (temp < crop.optimal[0]) score = Math.round(((crop.optimal[0] - temp) / 5) * 25)

  const label = score >= 70 ? 'Severe' : score >= 40 ? 'Moderate' : 'Normal'
  const detail = temp > crop.stress
    ? `${temp.toFixed(1)}°C exceeds ${cropLabel} tolerance (${crop.stress}°C). Yield loss risk.`
    : temp > crop.optimal[1]
    ? `Above optimal range (${crop.optimal[0]}–${crop.optimal[1]}°C) for ${cropLabel}.`
    : temp < crop.optimal[0]
    ? `Below optimal range (${crop.optimal[0]}–${crop.optimal[1]}°C) for ${cropLabel}.`
    : `${temp.toFixed(1)}°C is within optimal range for ${cropLabel} growth.`
  return { score, label, detail }
}

function computeFrostRisk(current) {
  if (!current) return { score: 0, label: 'None', detail: '' }
  const temp = current.main?.temp || 20
  const humidity = current.main?.humidity || 50
  const clouds = current.clouds?.all || 0
  const windSpeed = (current.wind?.speed || 0) * 3.6

  let score = 0
  if (temp <= 0) score += 50
  else if (temp <= 4) score += 40
  else if (temp <= 8) score += 20
  else if (temp <= 12) score += 5

  if (clouds < 20) score += 25
  else if (clouds < 50) score += 15
  else score += 5

  if (windSpeed < 5) score += 15
  else if (windSpeed < 10) score += 8

  const dewPoint = temp - ((100 - humidity) / 5)
  if (dewPoint < 0) score += 10

  score = Math.min(100, score)
  const label = score >= 60 ? 'High Risk' : score >= 30 ? 'Moderate' : 'Low'
  const detail = score >= 60
    ? 'Frost likely. Cover sensitive crops and seedlings tonight.'
    : score >= 30
    ? 'Some frost risk. Monitor overnight temperatures carefully.'
    : 'Frost risk is minimal. No protection needed.'
  return { score, label, detail }
}

function computeET0(forecastList) {
  if (!forecastList?.length) return { value: 0, label: 'No data', detail: '' }
  const todayStr = new Date().toDateString()
  let temps = forecastList.filter(f => new Date(f.dt * 1000).toDateString() === todayStr).map(f => f.main.temp)
  if (temps.length < 2) temps = forecastList.slice(0, 4).map(f => f.main.temp)

  const tMax = Math.max(...temps)
  const tMin = Math.min(...temps)
  const tMean = (tMax + tMin) / 2
  const Ra = 15 // extraterrestrial radiation MJ/m²/day (tropical approx)
  const et0 = 0.0023 * (tMean + 17.8) * Math.sqrt(Math.max(0.1, tMax - tMin)) * Ra
  const value = Math.max(0, parseFloat(et0.toFixed(1)))

  const label = value > 6 ? 'Very High' : value > 4 ? 'High' : value > 2 ? 'Moderate' : 'Low'
  const detail = `Estimated ${value}mm water loss/day. ${value > 4 ? 'Increase irrigation frequency.' : 'Moisture loss is manageable.'}`
  return { value, label, detail }
}

function getGoldenHourData(forecastList) {
  if (!forecastList?.length) return []
  return forecastList.slice(0, 8).map(f => {
    const time = new Date(f.dt * 1000)
    const temp = f.main.temp
    const windKmh = (f.wind?.speed || 0) * 3.6
    const humidity = f.main.humidity
    const hasRain = (f.pop || 0) > 0.3 || (f.rain?.['3h'] || 0) > 0
    let activity, suitability

    if (hasRain) { activity = 'Rain expected'; suitability = 'bad' }
    else if (windKmh > 20) { activity = 'Too windy for spraying'; suitability = 'caution' }
    else if (temp > 38) { activity = 'Extreme heat — avoid field'; suitability = 'bad' }
    else if (windKmh < 10 && humidity < 80) { activity = 'Ideal for spraying'; suitability = 'good' }
    else if (temp >= 18 && temp <= 33) { activity = 'Good for field work'; suitability = 'good' }
    else if (temp < 8) { activity = 'Too cold for field work'; suitability = 'caution' }
    else { activity = 'Moderate conditions'; suitability = 'caution' }

    return {
      time, temp: Math.round(temp), windKmh: windKmh.toFixed(0),
      humidity, hasRain, icon: f.weather?.[0]?.icon,
      desc: f.weather?.[0]?.description, activity, suitability,
      pop: Math.round((f.pop || 0) * 100),
    }
  })
}

function getAirQualityImpact(airData) {
  if (!airData?.list?.[0]) return null
  const { components, main } = airData.list[0]
  const pm25 = components.pm2_5 || 0
  const pm10 = components.pm10 || 0
  const o3 = components.o3 || 0

  const photoImpact = pm25 > 100 ? 'Severe' : pm25 > 50 ? 'Moderate' : pm25 > 25 ? 'Mild' : 'Minimal'
  const photoScore = Math.min(100, Math.round(pm25 * 0.7))
  const ozoneRisk = o3 > 120 ? 'High' : o3 > 80 ? 'Moderate' : 'Low'

  const aqiLabels = ['', 'Good', 'Fair', 'Moderate', 'Poor', 'Very Poor']
  const aqiColors = ['', 'emerald', 'teal', 'amber', 'orange', 'red']

  return {
    aqi: main.aqi, aqiLabel: aqiLabels[main.aqi] || 'Unknown',
    aqiColor: aqiColors[main.aqi] || 'stone',
    pm25: pm25.toFixed(1), pm10: pm10.toFixed(1), o3: o3.toFixed(1),
    photoImpact, photoScore, ozoneRisk,
    detail: pm25 > 100
      ? 'Heavy particulate matter blocking sunlight. Crop photosynthesis significantly reduced.'
      : pm25 > 50
      ? 'Moderate air pollution may reduce crop growth over extended exposure.'
      : 'Air quality is acceptable for healthy crop development.',
  }
}

function get5DayAgricast(forecastList) {
  if (!forecastList?.length) return []
  const days = {}
  forecastList.forEach(f => {
    const key = new Date(f.dt * 1000).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })
    if (!days[key]) days[key] = { temps: [], humidity: [], wind: [], rain: 0, pop: [], icons: [] }
    const d = days[key]
    d.temps.push(f.main.temp)
    d.humidity.push(f.main.humidity)
    d.wind.push((f.wind?.speed || 0) * 3.6)
    d.rain += (f.rain?.['3h'] || 0)
    d.pop.push(f.pop || 0)
    d.icons.push(f.weather?.[0]?.icon)
  })

  return Object.entries(days).slice(0, 5).map(([date, d]) => {
    const maxTemp = Math.round(Math.max(...d.temps))
    const minTemp = Math.round(Math.min(...d.temps))
    const avgHumidity = Math.round(d.humidity.reduce((a, b) => a + b, 0) / d.humidity.length)
    const maxWind = Math.round(Math.max(...d.wind))
    const totalRain = d.rain
    const maxPop = Math.round(Math.max(...d.pop) * 100)
    const iconCounts = {}
    d.icons.forEach(ic => { iconCounts[ic] = (iconCounts[ic] || 0) + 1 })
    const mainIcon = Object.entries(iconCounts).sort((a, b) => b[1] - a[1])[0]?.[0]

    let advice, adviceType = 'info'
    if (totalRain > 10) { advice = 'Heavy rain expected. Secure stored grain. Do not apply pesticides.'; adviceType = 'danger' }
    else if (totalRain > 2) { advice = 'Light rain likely. Good for soil moisture, but avoid pesticide application.'; adviceType = 'warning' }
    else if (maxWind > 20) { advice = 'Strong winds expected. Not suitable for spraying or transplanting.'; adviceType = 'warning' }
    else if (maxTemp > 40) { advice = 'Extreme heat. Irrigate early morning. Avoid midday fieldwork.'; adviceType = 'danger' }
    else if (maxWind < 12 && totalRain < 1 && maxTemp < 36) { advice = 'Excellent conditions for spraying, harvesting, and field work.'; adviceType = 'good' }
    else { advice = 'Moderate conditions. Suitable for most farming activities.'; adviceType = 'info' }

    return { date, maxTemp, minTemp, avgHumidity, maxWind, totalRain: totalRain.toFixed(1), maxPop, mainIcon, advice, adviceType }
  })
}

/* ── Risk gauge color helpers ── */
const RISK_FILLS = { emerald: 'from-emerald-400 to-emerald-600', amber: 'from-amber-400 to-amber-600', red: 'from-red-400 to-red-600' }
const RISK_BGS = { emerald: 'bg-emerald-100', amber: 'bg-amber-100', red: 'bg-red-100' }
const RISK_BADGES = { emerald: 'bg-emerald-100 text-emerald-700', amber: 'bg-amber-100 text-amber-700', red: 'bg-red-100 text-red-700' }

function riskColor(score, inverted) {
  const s = inverted ? 100 - score : score
  if (s >= 70) return 'red'
  if (s >= 40) return 'amber'
  return 'emerald'
}

/* ── Main WeatherTab (FarmCast) Component ── */
function WeatherTab({ profile }) {
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [airQuality, setAirQuality] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const timerRef = useRef(null)

  const fetchAll = useCallback(async () => {
    const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
    if (!API_KEY) { setError('Weather API key not configured'); setLoading(false); return }
    try {
      const lat = profile?.latitude, lon = profile?.longitude
      const params = lat && lon
        ? `lat=${lat}&lon=${lon}`
        : `q=${encodeURIComponent(profile?.village || profile?.district || 'Ahmedabad')},IN`

      const [cRes, fRes] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?${params}&appid=${API_KEY}&units=metric`),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?${params}&appid=${API_KEY}&units=metric`),
      ])
      if (!cRes.ok || !fRes.ok) throw new Error('Weather API request failed')
      const cData = await cRes.json()
      const fData = await fRes.json()
      setWeather(cData)
      setForecast(fData)

      // Air quality requires lat/lon — use coords from current weather response
      const aLat = cData.coord?.lat, aLon = cData.coord?.lon
      if (aLat != null && aLon != null) {
        const aRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${aLat}&lon=${aLon}&appid=${API_KEY}`)
        if (aRes.ok) setAirQuality(await aRes.json())
      }
      setLastUpdated(new Date())
      setError(null)
    } catch (e) {
      setError(e.message || 'Failed to fetch weather data')
    } finally {
      setLoading(false)
    }
  }, [profile?.latitude, profile?.longitude, profile?.village, profile?.district])

  useEffect(() => {
    fetchAll()
    timerRef.current = setInterval(fetchAll, 60000)
    return () => clearInterval(timerRef.current)
  }, [fetchAll])

  /* Compute agricultural intelligence */
  const cropName = profile?.primary_crop || ''
  const spray = computeSprayScore(weather, forecast?.list)
  const disease = computeDiseasePressure(weather)
  const heat = computeHeatStress(weather, cropName)
  const frost = computeFrostRisk(weather)
  const et0 = computeET0(forecast?.list)
  const goldenHours = getGoldenHourData(forecast?.list)
  const airImpact = getAirQualityImpact(airQuality)
  const agricast = get5DayAgricast(forecast?.list)

  const windDeg = weather?.wind?.deg || 0
  const DIRS = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW']
  const windDir = DIRS[Math.round(windDeg / 22.5) % 16]

  /* ── Loading state ── */
  if (loading) return (
    <div className="flex items-center justify-center py-32 animate-fade-in">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-stone-600 font-semibold">Loading FarmCast Intelligence...</p>
        <p className="text-stone-400 text-sm mt-1">Fetching real-time weather data for your farm</p>
      </div>
    </div>
  )

  /* ── Error state (only if no cached data) ── */
  if (error && !weather) return (
    <div className="max-w-6xl animate-fade-in">
      <div className="rounded-2xl bg-red-50 border border-red-200 p-8 text-center">
        <p className="text-red-700 font-bold text-lg">Weather Data Unavailable</p>
        <p className="text-red-500 text-sm mt-2">{error}</p>
        <button
          onClick={() => { setLoading(true); fetchAll() }}
          className="mt-4 px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 max-w-6xl animate-fade-in">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">FarmCast</h2>
          <p className="text-xs text-stone-400">Real-Time Agricultural Weather Intelligence</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-full">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-red-600">LIVE</span>
          </span>
          {lastUpdated && (
            <span className="text-[10px] text-stone-400">Updated {lastUpdated.toLocaleTimeString()}</span>
          )}
        </div>
      </div>

      {/* ── Current Weather Hero ── */}
      <div className="rounded-2xl bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-600 p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/4 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/4 -translate-x-1/4" />
        <div className="relative z-10">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sky-200 text-sm font-medium">{weather?.name || profile?.village || 'Your Location'}</span>
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              </div>
              <div className="flex items-end gap-1">
                <span className="text-7xl font-extrabold tracking-tighter">{Math.round(weather?.main?.temp ?? 0)}°</span>
                <span className="text-2xl text-sky-200 mb-3">C</span>
              </div>
              <p className="text-sky-100 capitalize text-lg">{weather?.weather?.[0]?.description || ''}</p>
              <p className="text-sky-200/70 text-sm">Feels like {Math.round(weather?.main?.feels_like ?? 0)}°C</p>
            </div>
            <div className="text-right">
              {weather?.weather?.[0]?.icon && (
                <img
                  src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
                  alt={weather.weather[0].description}
                  className="w-32 h-32 -mt-4 -mr-2 drop-shadow-2xl"
                />
              )}
            </div>
          </div>

          {/* Weather detail grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 mt-6 pt-5 border-t border-white/20">
            {[
              ['Humidity', `${weather?.main?.humidity ?? 0}%`],
              ['Wind', `${((weather?.wind?.speed || 0) * 3.6).toFixed(1)} km/h ${windDir}`],
              ['Pressure', `${weather?.main?.pressure ?? 0} hPa`],
              ['Visibility', `${((weather?.visibility ?? 10000) / 1000).toFixed(1)} km`],
              ['Clouds', `${weather?.clouds?.all ?? 0}%`],
              ['Dew Point', `${((weather?.main?.temp ?? 0) - ((100 - (weather?.main?.humidity ?? 50)) / 5)).toFixed(1)}°C`],
              ['Sunrise', weather?.sys?.sunrise ? new Date(weather.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'],
              ['Sunset', weather?.sys?.sunset ? new Date(weather.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-sky-300/70 text-[10px] uppercase tracking-wider">{label}</p>
                <p className="text-white font-semibold text-sm">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Crop Risk Intelligence ── */}
      <div className="rounded-2xl bg-white border border-stone-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-stone-800">Crop Risk Intelligence</h3>
            <p className="text-xs text-stone-400 mt-0.5">Real-time agricultural risk indices from live weather data</p>
          </div>
          {cropName && (
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200 capitalize">{cropName}</span>
          )}
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Spray Window */}
          {(() => {
            const c = riskColor(spray.score, true)
            return (
              <div className="rounded-xl border border-stone-200 p-4 hover-lift">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🌿</span>
                    <h4 className="font-bold text-stone-800 text-sm">Spray Window</h4>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${RISK_BADGES[c]}`}>{spray.label}</span>
                </div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-stone-400">Safety Score</span>
                  <span className="font-bold text-stone-700">{spray.score}%</span>
                </div>
                <div className={`h-2.5 rounded-full ${RISK_BGS[c]}`}>
                  <div className={`h-full rounded-full bg-gradient-to-r ${RISK_FILLS[c]} transition-all duration-1000`} style={{ width: `${spray.score}%` }} />
                </div>
                {spray.factors.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-stone-100 space-y-1">
                    {spray.factors.map((f, fi) => (
                      <div key={fi} className="flex items-center justify-between text-[10px]">
                        <span className="text-stone-400">{f.name}</span>
                        <span className={`font-semibold ${f.ok ? 'text-emerald-600' : 'text-red-500'}`}>{f.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })()}

          {/* Disease Pressure */}
          {(() => {
            const c = riskColor(disease.score, false)
            return (
              <div className="rounded-xl border border-stone-200 p-4 hover-lift">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🦠</span>
                    <h4 className="font-bold text-stone-800 text-sm">Disease Pressure</h4>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${RISK_BADGES[c]}`}>{disease.label}</span>
                </div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-stone-400">Fungal Risk</span>
                  <span className="font-bold text-stone-700">{disease.score}%</span>
                </div>
                <div className={`h-2.5 rounded-full ${RISK_BGS[c]}`}>
                  <div className={`h-full rounded-full bg-gradient-to-r ${RISK_FILLS[c]} transition-all duration-1000`} style={{ width: `${disease.score}%` }} />
                </div>
                <p className="text-[10px] text-stone-500 mt-2">{disease.detail}</p>
              </div>
            )
          })()}

          {/* Heat Stress */}
          {(() => {
            const c = riskColor(heat.score, false)
            return (
              <div className="rounded-xl border border-stone-200 p-4 hover-lift">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🌡️</span>
                    <h4 className="font-bold text-stone-800 text-sm">Heat Stress</h4>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${RISK_BADGES[c]}`}>{heat.label}</span>
                </div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-stone-400">Stress Level</span>
                  <span className="font-bold text-stone-700">{heat.score}%</span>
                </div>
                <div className={`h-2.5 rounded-full ${RISK_BGS[c]}`}>
                  <div className={`h-full rounded-full bg-gradient-to-r ${RISK_FILLS[c]} transition-all duration-1000`} style={{ width: `${heat.score}%` }} />
                </div>
                <p className="text-[10px] text-stone-500 mt-2">{heat.detail}</p>
              </div>
            )
          })()}

          {/* Frost Risk */}
          {(() => {
            const c = riskColor(frost.score, false)
            return (
              <div className="rounded-xl border border-stone-200 p-4 hover-lift">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">❄️</span>
                    <h4 className="font-bold text-stone-800 text-sm">Frost Risk</h4>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${RISK_BADGES[c]}`}>{frost.label}</span>
                </div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-stone-400">Frost Probability</span>
                  <span className="font-bold text-stone-700">{frost.score}%</span>
                </div>
                <div className={`h-2.5 rounded-full ${RISK_BGS[c]}`}>
                  <div className={`h-full rounded-full bg-gradient-to-r ${RISK_FILLS[c]} transition-all duration-1000`} style={{ width: `${frost.score}%` }} />
                </div>
                <p className="text-[10px] text-stone-500 mt-2">{frost.detail}</p>
              </div>
            )
          })()}

          {/* Evapotranspiration */}
          {(() => {
            const c = et0.value > 5 ? 'red' : et0.value > 3 ? 'amber' : 'emerald'
            return (
              <div className="rounded-xl border border-stone-200 p-4 hover-lift">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💧</span>
                    <h4 className="font-bold text-stone-800 text-sm">Evapotranspiration</h4>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${RISK_BADGES[c]}`}>{et0.label}</span>
                </div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-stone-400">Water Loss Rate</span>
                  <span className="font-bold text-stone-700">{et0.value} mm/day</span>
                </div>
                <div className={`h-2.5 rounded-full ${RISK_BGS[c]}`}>
                  <div className={`h-full rounded-full bg-gradient-to-r ${RISK_FILLS[c]} transition-all duration-1000`} style={{ width: `${Math.min(100, (et0.value / 8) * 100)}%` }} />
                </div>
                <p className="text-[10px] text-stone-500 mt-2">{et0.detail}</p>
              </div>
            )
          })()}
        </div>
      </div>

      {/* ── Golden Hour Planner ── */}
      {goldenHours.length > 0 && (
        <div className="rounded-2xl bg-white border border-stone-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100">
            <h3 className="font-bold text-stone-800">Golden Hour Planner</h3>
            <p className="text-xs text-stone-400 mt-0.5">Best windows for farming activities over the next 24 hours</p>
          </div>
          <div className="p-4 overflow-x-auto">
            <div className="flex gap-3 min-w-max pb-2">
              {goldenHours.map((h, hi) => {
                const cardBg = h.suitability === 'good'
                  ? 'border-emerald-200 bg-emerald-50'
                  : h.suitability === 'caution'
                  ? 'border-amber-200 bg-amber-50'
                  : 'border-red-200 bg-red-50'
                const dot = h.suitability === 'good' ? 'bg-emerald-500' : h.suitability === 'caution' ? 'bg-amber-500' : 'bg-red-500'
                return (
                  <div key={hi} className={`w-[140px] shrink-0 rounded-xl border p-3 ${cardBg} hover-lift transition-all`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-stone-700">
                        {h.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${dot}`} />
                    </div>
                    {h.icon && (
                      <img src={`https://openweathermap.org/img/wn/${h.icon}.png`} alt="" className="w-10 h-10 mx-auto" />
                    )}
                    <p className="text-lg font-bold text-stone-800 text-center">{h.temp}°C</p>
                    <p className="text-[10px] text-stone-500 text-center">{h.windKmh} km/h &middot; {h.humidity}%</p>
                    {h.pop > 0 && (
                      <p className="text-[10px] text-blue-600 font-semibold text-center mt-0.5">Rain {h.pop}%</p>
                    )}
                    <div className="mt-2 pt-2 border-t border-stone-200/60">
                      <p className="text-[10px] font-semibold text-stone-600 text-center leading-tight">{h.activity}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Air Quality Impact on Crops ── */}
      {airImpact && (
        <div className="rounded-2xl bg-white border border-stone-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-stone-800">Air Quality Impact on Crops</h3>
              <p className="text-xs text-stone-400 mt-0.5">Pollution effects on crop photosynthesis and leaf health</p>
            </div>
            <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
              airImpact.aqiColor === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
              airImpact.aqiColor === 'teal' ? 'bg-teal-100 text-teal-700' :
              airImpact.aqiColor === 'amber' ? 'bg-amber-100 text-amber-700' :
              airImpact.aqiColor === 'orange' ? 'bg-orange-100 text-orange-700' :
              airImpact.aqiColor === 'red' ? 'bg-red-100 text-red-700' :
              'bg-stone-100 text-stone-700'
            }`}>AQI: {airImpact.aqiLabel}</span>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="rounded-xl bg-stone-50 border border-stone-100 p-4">
                <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">PM2.5</p>
                <p className="text-2xl font-bold text-stone-800 mt-1">{airImpact.pm25} <span className="text-xs font-normal text-stone-400">µg/m³</span></p>
                <p className="text-xs text-stone-500 mt-1">Photosynthesis: <span className="font-semibold">{airImpact.photoImpact}</span></p>
              </div>
              <div className="rounded-xl bg-stone-50 border border-stone-100 p-4">
                <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">PM10</p>
                <p className="text-2xl font-bold text-stone-800 mt-1">{airImpact.pm10} <span className="text-xs font-normal text-stone-400">µg/m³</span></p>
                <p className="text-xs text-stone-500 mt-1">Leaf deposit: <span className="font-semibold">{parseFloat(airImpact.pm10) > 100 ? 'Heavy' : parseFloat(airImpact.pm10) > 50 ? 'Moderate' : 'Light'}</span></p>
              </div>
              <div className="rounded-xl bg-stone-50 border border-stone-100 p-4">
                <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Ozone (O₃)</p>
                <p className="text-2xl font-bold text-stone-800 mt-1">{airImpact.o3} <span className="text-xs font-normal text-stone-400">µg/m³</span></p>
                <p className="text-xs text-stone-500 mt-1">Leaf damage: <span className="font-semibold">{airImpact.ozoneRisk}</span></p>
              </div>
            </div>
            <div className="rounded-xl bg-gradient-to-r from-stone-50 to-stone-100/50 border border-stone-100 p-4">
              <p className="text-sm text-stone-600">{airImpact.detail}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── 5-Day Agricultural Forecast ── */}
      {agricast.length > 0 && (
        <div className="rounded-2xl bg-white border border-stone-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100">
            <h3 className="font-bold text-stone-800">5-Day Agricultural Forecast</h3>
            <p className="text-xs text-stone-400 mt-0.5">Weather outlook with crop-specific farming recommendations</p>
          </div>
          <div className="divide-y divide-stone-100">
            {agricast.map((day, di) => {
              const tc = {
                good: 'border-emerald-300 bg-emerald-50',
                warning: 'border-amber-300 bg-amber-50',
                danger: 'border-red-300 bg-red-50',
                info: 'border-blue-300 bg-blue-50',
              }
              return (
                <div key={di} className={`px-6 py-4 border-l-4 ${tc[day.adviceType]} hover:brightness-[0.98] transition-all`}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      {day.mainIcon && (
                        <img src={`https://openweathermap.org/img/wn/${day.mainIcon}.png`} alt="" className="w-10 h-10" />
                      )}
                      <div>
                        <p className="font-bold text-stone-800 text-sm">{day.date}</p>
                        <p className="text-xs text-stone-500">{day.minTemp}° — {day.maxTemp}°C</p>
                      </div>
                    </div>
                    <div className="flex gap-4 text-xs text-stone-500">
                      <span>Humidity {day.avgHumidity}%</span>
                      <span>Wind {day.maxWind} km/h</span>
                      {parseFloat(day.totalRain) > 0 && (
                        <span className="text-blue-600 font-semibold">Rain {day.totalRain}mm</span>
                      )}
                      {day.maxPop > 0 && <span className="text-blue-500">({day.maxPop}%)</span>}
                    </div>
                  </div>
                  <p className="text-sm text-stone-600 mt-2 sm:ml-[52px]">{day.advice}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   MANDI TAB
   ═══════════════════════════════════════════════════ */
function MandiTab({ profile }) {
  const crop = profile?.primary_crop ? cap(profile.primary_crop) : 'Wheat'
  const prices = [
    { mandi: 'Ahmedabad APMC', price: '₹2,450', trend: 'up', change: '+₹120' },
    { mandi: 'Rajkot Market', price: '₹2,380', trend: 'down', change: '-₹40' },
    { mandi: 'Surat Mandi', price: '₹2,510', trend: 'up', change: '+₹85' },
    { mandi: 'Vadodara APMC', price: '₹2,420', trend: 'stable', change: '₹0' },
  ]

  return (
    <div className="space-y-6 max-w-6xl animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-stone-800">Mandi Prices</h2>
        <span className="px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">{crop}</span>
      </div>

      {/* Price highlight */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/[0.06] rounded-full -translate-y-1/3 translate-x-1/4" />
        <div className="relative z-10">
          <p className="text-amber-100 text-sm font-medium">Best price today for {crop}</p>
          <p className="text-4xl font-extrabold mt-2">₹2,510 <span className="text-lg font-medium text-amber-200">/ quintal</span></p>
          <p className="text-amber-100 text-sm mt-1">Surat Mandi — 45 km from your location</p>
        </div>
      </div>

      {/* Price table */}
      <div className="rounded-2xl bg-white border border-stone-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100">
          <h3 className="font-bold text-stone-800">Nearby Mandis</h3>
        </div>
        <div className="divide-y divide-stone-100">
          {prices.map((p, i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
              <div>
                <p className="font-semibold text-stone-800">{p.mandi}</p>
                <p className="text-xs text-stone-400 mt-0.5">{crop} per quintal</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-stone-800">{p.price}</p>
                <p className={`text-xs font-medium ${p.trend === 'up' ? 'text-emerald-600' : p.trend === 'down' ? 'text-red-500' : 'text-stone-400'}`}>
                  {p.change}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   SATELLITE TAB
   ═══════════════════════════════════════════════════ */
function SatelliteTab({ profile }) {
  return (
    <div className="space-y-6 max-w-6xl animate-fade-in">
      <h2 className="text-2xl font-bold text-stone-800">SAR Satellite Monitoring</h2>

      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0c1f17] to-[#0a2a1f] p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute top-1/2 right-8 -translate-y-1/2 w-40 h-40 opacity-30">
          <div className="absolute inset-0 rounded-full border-2 border-emerald-500/50" />
          <div className="absolute inset-4 rounded-full border border-emerald-500/30" />
          <div className="absolute inset-8 rounded-full border border-emerald-500/20" />
          <div className="absolute inset-[68px] rounded-full bg-emerald-400 animate-pulse" />
          <div className="absolute inset-0 origin-center animate-radar">
            <div className="w-1/2 h-0.5 bg-gradient-to-r from-emerald-400/80 to-transparent mt-[calc(50%-1px)] ml-[50%]" />
          </div>
        </div>
        <div className="relative z-10 max-w-lg">
          <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">Synthetic Aperture Radar</p>
          <h3 className="text-xl font-bold mt-2">Government SAR Satellites</h3>
          <p className="text-emerald-200/60 text-sm mt-2">Works through clouds, day and night. Monitoring your farm for soil moisture, crop health, flood risk, and sowing validation.</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Soil Moisture', value: '68%', icon: '🌧️', color: 'emerald' },
          { label: 'Flood Risk', value: 'Low', icon: '🚜', color: 'blue' },
          { label: 'Crop Growth', value: 'Normal', icon: '🌱', color: 'teal' },
          { label: 'Sowing Valid.', value: 'Verified', icon: '⏱️', color: 'amber' },
        ].map((m, i) => (
          <div key={i} className="rounded-2xl bg-white border border-stone-200/80 shadow-sm p-5 hover-lift">
            <span className="text-2xl">{m.icon}</span>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mt-3">{m.label}</p>
            <p className="text-xl font-bold text-stone-800 mt-1">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Gauges */}
      {profile?.satellite_consent && (
        <div className="rounded-2xl bg-white border border-stone-200/80 shadow-sm p-6">
          <h3 className="font-bold text-stone-800 mb-4">Farm Health Metrics</h3>
          <div className="space-y-4">
            <GaugeBar label="Soil Moisture" value={68} max={100} color="emerald" unit="%" />
            <GaugeBar label="NDVI (Crop Health)" value={0.72} max={1} color="teal" unit="" />
            <GaugeBar label="Flood Risk Index" value={12} max={100} color="blue" unit="%" />
            <GaugeBar label="Growth Consistency" value={85} max={100} color="amber" unit="%" />
          </div>
        </div>
      )}

      {profile?.latitude && (
        <div className="rounded-2xl bg-stone-50 border border-stone-200 p-6 text-center">
          <p className="text-sm text-stone-500">
            Farm coordinates: <span className="font-mono font-semibold text-stone-700">{Number(profile.latitude).toFixed(4)}, {Number(profile.longitude).toFixed(4)}</span>
          </p>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   ADVISORY TAB
   ═══════════════════════════════════════════════════ */
function AdvisoryTab({ profile }) {
  const crop = profile?.primary_crop ? cap(profile.primary_crop) : 'Crop'
  const stage = profile?.crop_stage ? cap(profile.crop_stage) : 'Growing'

  const advisories = [
    { priority: 'high', title: 'Irrigation Advisory', text: `Based on soil moisture data (68%), reduce irrigation frequency for ${crop}. SAR data shows adequate moisture levels.`, time: '2 hours ago' },
    { priority: 'medium', title: 'Pest Alert', text: `${stage} stage ${crop} crops in your region reporting increased pest activity. Monitor closely.`, time: '6 hours ago' },
    { priority: 'low', title: 'Fertilizer Timing', text: `Optimal window for nitrogen application begins in 3 days based on your crop stage and weather forecast.`, time: '1 day ago' },
    { priority: 'info', title: 'Government Scheme', text: 'PM-KISAN installment disbursement scheduled for next week. Ensure Aadhaar linkage is updated.', time: '2 days ago' },
  ]

  const colors = {
    high: 'border-red-300 bg-red-50',
    medium: 'border-amber-300 bg-amber-50',
    low: 'border-blue-300 bg-blue-50',
    info: 'border-stone-300 bg-stone-50',
  }

  const dots = {
    high: 'bg-red-500',
    medium: 'bg-amber-500',
    low: 'bg-blue-500',
    info: 'bg-stone-400',
  }

  return (
    <div className="space-y-6 max-w-6xl animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-stone-800">Crop Advisory</h2>
        <span className="text-xs text-stone-400">{crop} — {stage} stage</span>
      </div>

      {/* Advisory hero */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/[0.04] rounded-full -translate-y-1/3 translate-x-1/4" />
        <div className="relative z-10">
          <p className="text-emerald-200 text-sm font-medium">Personalised for your farm</p>
          <h3 className="text-xl font-bold mt-1">AI-Powered Crop Intelligence</h3>
          <p className="text-emerald-100/70 text-sm mt-2">
            Advisories based on your location, crop ({crop}), growth stage ({stage}), SAR satellite data, and real-time weather.
          </p>
        </div>
      </div>

      {/* Advisories */}
      <div className="space-y-3">
        {advisories.map((a, i) => (
          <div key={i} className={`rounded-xl border-l-4 p-4 ${colors[a.priority]} hover-lift`}>
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${dots[a.priority]}`} />
              <h4 className="font-bold text-stone-800 text-sm">{a.title}</h4>
              <span className="text-[10px] text-stone-400 ml-auto">{a.time}</span>
            </div>
            <p className="text-sm text-stone-600 ml-4">{a.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   AUTONOMOUS ALERT SYSTEM TAB
   ═══════════════════════════════════════════════════ */
function AlertSystemTab({ profile }) {
  const crop = profile?.primary_crop ? cap(profile.primary_crop) : 'Crop'
  const village = profile?.village || 'Your area'

  const ALERT_RULES = [
    { id: 1, name: 'Flood Risk Alert', trigger: 'SAR moisture > 85%', status: 'active', severity: 'critical', lastTriggered: '12 hours ago', desc: 'Triggers when soil waterlogging is detected via SAR satellite data' },
    { id: 2, name: 'Pest Outbreak Warning', trigger: 'Humidity > 80% + Temp 25-32°C', status: 'active', severity: 'high', lastTriggered: '2 days ago', desc: 'Monitors weather conditions favorable for pest breeding' },
    { id: 3, name: 'Frost Alert', trigger: 'Temp forecast < 4°C', status: 'active', severity: 'critical', lastTriggered: 'Never', desc: 'Early warning for frost damage risk to standing crops' },
    { id: 4, name: 'Mandi Price Drop', trigger: `${crop} price drops > 10%`, status: 'active', severity: 'medium', lastTriggered: '5 days ago', desc: 'Alerts when market price for your crop drops significantly' },
    { id: 5, name: 'Irrigation Needed', trigger: 'Soil moisture < 30%', status: 'paused', severity: 'medium', lastTriggered: '1 day ago', desc: 'Based on SAR soil moisture estimation for your farm coordinates' },
    { id: 6, name: 'Optimal Harvest Window', trigger: 'NDVI plateau + weather clear', status: 'active', severity: 'low', lastTriggered: 'Never', desc: 'Identifies the best harvest window using satellite and weather data' },
  ]

  const RECENT_ALERTS = [
    { time: '2h ago', title: 'Heavy Rainfall Warning', text: `${village}: 40mm rainfall expected in next 24h. Secure stored grain.`, severity: 'critical' },
    { time: '8h ago', title: 'Soil Moisture High', text: `Your farm plot shows 78% soil moisture. Hold irrigation for 2 days.`, severity: 'high' },
    { time: '1d ago', title: `${crop} Price Update`, text: `${crop} price at nearest mandi increased by ₹85/quintal.`, severity: 'low' },
    { time: '3d ago', title: 'Growth Anomaly Detected', text: 'SAR data shows uneven growth in NW quadrant. Inspect for nutrient deficiency.', severity: 'medium' },
  ]

  const severityColors = {
    critical: { bg: 'bg-red-50', border: 'border-red-300', dot: 'bg-red-500', text: 'text-red-700', badge: 'bg-red-100 text-red-700' },
    high: { bg: 'bg-orange-50', border: 'border-orange-300', dot: 'bg-orange-500', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700' },
    medium: { bg: 'bg-amber-50', border: 'border-amber-300', dot: 'bg-amber-500', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' },
    low: { bg: 'bg-blue-50', border: 'border-blue-300', dot: 'bg-blue-500', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
  }

  return (
    <div className="space-y-6 max-w-6xl animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-stone-800">Autonomous Alert System</h2>
        <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          System Active
        </span>
      </div>

      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-orange-600 p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-56 h-56 bg-white/[0.05] rounded-full -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/[0.03] rounded-full translate-y-1/2" />
        <div className="relative z-10">
          <p className="text-red-200 text-xs font-semibold uppercase tracking-wider">Zero-Human-Intervention</p>
          <h3 className="text-xl font-bold mt-2">Smart Alert Engine</h3>
          <p className="text-red-100/70 text-sm mt-2 max-w-xl">
            Autonomous rules engine that monitors SAR satellite data, weather feeds, soil sensors, and mandi prices in real-time.
            Alerts are triggered automatically — no manual checking needed.
          </p>
        </div>
      </div>

      {/* Architecture diagram */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Data Sources', value: '6', sub: 'SAR, Weather, Mandi, Soil, NDVI, Govt', color: 'from-violet-500 to-purple-600' },
          { label: 'Active Rules', value: String(ALERT_RULES.filter(r => r.status === 'active').length), sub: 'Monitoring 24/7', color: 'from-emerald-500 to-teal-600' },
          { label: 'Alerts Sent', value: '14', sub: 'This month', color: 'from-amber-500 to-orange-600' },
          { label: 'Avg Response', value: '<2m', sub: 'Detection to alert', color: 'from-sky-500 to-blue-600' },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl bg-white border border-stone-200/80 shadow-sm p-5 hover-lift">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 shadow-md`}>
              <span className="text-white font-bold text-sm">{s.value}</span>
            </div>
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">{s.label}</p>
            <p className="text-lg font-bold text-stone-800 mt-0.5">{s.value}</p>
            <p className="text-xs text-stone-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Recent alerts feed */}
      <div className="rounded-2xl bg-white border border-stone-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <h3 className="font-bold text-stone-800">Recent Alerts</h3>
          <span className="text-xs text-stone-400">Last 7 days</span>
        </div>
        <div className="divide-y divide-stone-100">
          {RECENT_ALERTS.map((a, i) => {
            const c = severityColors[a.severity]
            return (
              <div key={i} className={`px-6 py-4 ${c.bg} border-l-4 ${c.border} hover:brightness-[0.98] transition-all`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                  <h4 className="font-bold text-stone-800 text-sm">{a.title}</h4>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.badge} ml-auto`}>{a.severity}</span>
                  <span className="text-[10px] text-stone-400">{a.time}</span>
                </div>
                <p className="text-sm text-stone-600 ml-4">{a.text}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Alert rules */}
      <div className="rounded-2xl bg-white border border-stone-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100">
          <h3 className="font-bold text-stone-800">Alert Rules</h3>
          <p className="text-xs text-stone-400 mt-0.5">Autonomous rules that run continuously on your farm data</p>
        </div>
        <div className="divide-y divide-stone-100">
          {ALERT_RULES.map((rule) => {
            const c = severityColors[rule.severity]
            return (
              <div key={rule.id} className="px-6 py-4 flex items-center gap-4 hover:bg-stone-50 transition-colors">
                <div className={`w-3 h-3 rounded-full ${c.dot} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-stone-800 text-sm">{rule.name}</p>
                    {rule.status === 'paused' && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-500">Paused</span>
                    )}
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5">{rule.desc}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-stone-400 font-mono">{rule.trigger}</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">Last: {rule.lastTriggered}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   ADAPTIVE CALENDAR TAB
   ═══════════════════════════════════════════════════ */
function AdaptiveCalendarTab({ profile }) {
  const crop = profile?.primary_crop ? cap(profile.primary_crop) : 'Wheat'
  const stage = profile?.crop_stage ? cap(profile.crop_stage) : 'Vegetative'

  const today = new Date()
  const monthName = today.toLocaleString('default', { month: 'long' })
  const year = today.getFullYear()
  const daysInMonth = new Date(year, today.getMonth() + 1, 0).getDate()
  const firstDay = new Date(year, today.getMonth(), 1).getDay()

  // Generate calendar events (mock but contextual)
  const events = {
    [today.getDate()]: { type: 'today', label: 'Today' },
    [today.getDate() + 2]: { type: 'irrigation', label: 'Irrigation', color: 'bg-blue-500' },
    [today.getDate() + 4]: { type: 'fertilizer', label: 'Fertilizer', color: 'bg-emerald-500' },
    [today.getDate() + 7]: { type: 'pest', label: 'Pest Spray', color: 'bg-amber-500' },
    [today.getDate() + 12]: { type: 'harvest', label: 'Harvest Check', color: 'bg-orange-500' },
    [today.getDate() + 15]: { type: 'mandi', label: 'Mandi Visit', color: 'bg-purple-500' },
  }

  const UPCOMING = [
    { date: `${monthName} ${today.getDate() + 2}`, title: 'Scheduled Irrigation', desc: 'SAR data shows soil moisture dropping to 32%. Irrigate before it reaches critical 25% threshold.', icon: '💧', color: 'border-blue-300 bg-blue-50' },
    { date: `${monthName} ${today.getDate() + 4}`, title: 'Nitrogen Application', desc: `${crop} in ${stage} stage needs nitrogen boost. Weather window is clear for next 3 days.`, icon: '🧪', color: 'border-emerald-300 bg-emerald-50' },
    { date: `${monthName} ${today.getDate() + 7}`, title: 'Preventive Pest Spray', desc: 'Humidity forecast 82% this week. Apply preventive spray to avoid fungal infection.', icon: '🛡️', color: 'border-amber-300 bg-amber-50' },
    { date: `${monthName} ${today.getDate() + 12}`, title: 'Pre-Harvest Assessment', desc: 'NDVI plateau detected. Conduct field inspection to confirm harvest readiness.', icon: '🌾', color: 'border-orange-300 bg-orange-50' },
    { date: `${monthName} ${today.getDate() + 15}`, title: 'Mandi Price Window', desc: `${crop} prices trending up. Optimal selling window projected for this period.`, icon: '📊', color: 'border-purple-300 bg-purple-50' },
  ]

  const SEASONS = [
    { name: 'Kharif', months: 'Jun - Oct', crops: 'Rice, Cotton, Soybean', active: today.getMonth() >= 5 && today.getMonth() <= 9 },
    { name: 'Rabi', months: 'Nov - Mar', crops: 'Wheat, Mustard, Gram', active: today.getMonth() >= 10 || today.getMonth() <= 2 },
    { name: 'Zaid', months: 'Mar - Jun', crops: 'Watermelon, Cucumber', active: today.getMonth() >= 2 && today.getMonth() <= 5 },
  ]

  return (
    <div className="space-y-6 max-w-6xl animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-stone-800">Adaptive Calendar</h2>
        <span className="text-xs text-stone-400">{crop} &middot; {stage} stage</span>
      </div>

      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/[0.05] rounded-full -translate-y-1/3 translate-x-1/4" />
        <div className="relative z-10">
          <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider">AI-Powered Scheduling</p>
          <h3 className="text-xl font-bold mt-2">Farm calendar that adapts to your crop, weather, and satellite data</h3>
          <p className="text-indigo-100/70 text-sm mt-2 max-w-xl">
            Every task is auto-scheduled based on real-time SAR moisture data, weather forecasts, crop growth stage, and market trends.
            The calendar updates itself — you just follow it.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Calendar grid */}
        <div className="lg:col-span-3 rounded-2xl bg-white border border-stone-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
            <h3 className="font-bold text-stone-800">{monthName} {year}</h3>
            <div className="flex gap-1">
              {[
                { label: 'Irrigation', color: 'bg-blue-500' },
                { label: 'Fertilizer', color: 'bg-emerald-500' },
                { label: 'Pest', color: 'bg-amber-500' },
                { label: 'Harvest', color: 'bg-orange-500' },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1 text-[9px] text-stone-400 px-1.5">
                  <span className={`w-2 h-2 rounded-full ${l.color}`} />{l.label}
                </div>
              ))}
            </div>
          </div>
          <div className="p-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-center text-[10px] font-semibold text-stone-400 uppercase py-1">{d}</div>
              ))}
            </div>
            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const ev = events[day]
                const isToday = day === today.getDate()
                return (
                  <div
                    key={day}
                    className={`relative aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all ${
                      isToday
                        ? 'bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/30'
                        : ev
                          ? 'bg-stone-50 font-medium hover:bg-stone-100'
                          : 'text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {day}
                    {ev && !isToday && (
                      <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${ev.color || 'bg-emerald-500'}`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Season timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl bg-white border border-stone-200/80 shadow-sm p-5">
            <h4 className="font-bold text-stone-800 text-sm mb-3">Crop Seasons</h4>
            <div className="space-y-3">
              {SEASONS.map((s, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${s.active ? 'border-emerald-300 bg-emerald-50' : 'border-stone-200 bg-stone-50'}`}>
                  <div className={`w-3 h-3 rounded-full ${s.active ? 'bg-emerald-500 animate-pulse' : 'bg-stone-300'}`} />
                  <div>
                    <p className="text-sm font-bold text-stone-800">{s.name} <span className="font-normal text-stone-400">({s.months})</span></p>
                    <p className="text-xs text-stone-500">{s.crops}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-200 p-5">
            <h4 className="font-bold text-stone-800 text-sm">How it adapts</h4>
            <ul className="mt-2 space-y-2 text-xs text-stone-600">
              <li className="flex gap-2"><span className="text-indigo-500 font-bold">1.</span>Reads SAR moisture + NDVI daily</li>
              <li className="flex gap-2"><span className="text-indigo-500 font-bold">2.</span>Checks 7-day weather forecast</li>
              <li className="flex gap-2"><span className="text-indigo-500 font-bold">3.</span>Matches crop stage requirements</li>
              <li className="flex gap-2"><span className="text-indigo-500 font-bold">4.</span>Reschedules tasks automatically</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Upcoming tasks */}
      <div className="rounded-2xl bg-white border border-stone-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100">
          <h3 className="font-bold text-stone-800">Upcoming Farm Tasks</h3>
          <p className="text-xs text-stone-400 mt-0.5">Auto-generated based on your crop, weather, and satellite data</p>
        </div>
        <div className="divide-y divide-stone-100">
          {UPCOMING.map((t, i) => (
            <div key={i} className={`px-6 py-4 border-l-4 ${t.color} hover:brightness-[0.98] transition-all`}>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xl">{t.icon}</span>
                <div>
                  <p className="font-bold text-stone-800 text-sm">{t.title}</p>
                  <p className="text-[10px] text-stone-400">{t.date}</p>
                </div>
              </div>
              <p className="text-sm text-stone-600 ml-9">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   IMAGE-BASED QUALITY ESTIMATION TAB
   ═══════════════════════════════════════════════════ */
function ImageQCTab({ profile }) {
  const crop = profile?.primary_crop ? cap(profile.primary_crop) : 'Crop'

  const QUALITY_PARAMS = [
    { name: 'Grain Size', score: 88, grade: 'A', desc: 'Above average grain size detected', color: 'emerald' },
    { name: 'Color Consistency', score: 74, grade: 'B+', desc: 'Slight color variation in 12% of samples', color: 'teal' },
    { name: 'Moisture Content', score: 91, grade: 'A+', desc: 'Optimal moisture level for storage', color: 'blue' },
    { name: 'Foreign Matter', score: 95, grade: 'A+', desc: 'Minimal foreign particles detected', color: 'emerald' },
    { name: 'Damage Index', score: 82, grade: 'A', desc: '4% pest damage, 2% mechanical damage', color: 'amber' },
    { name: 'Overall Grade', score: 86, grade: 'A', desc: 'Premium quality — eligible for higher mandi rate', color: 'emerald' },
  ]

  const HISTORY = [
    { date: 'Feb 5, 2026', crop: crop, grade: 'A', score: 86, status: 'Premium' },
    { date: 'Jan 20, 2026', crop: crop, grade: 'B+', score: 78, status: 'Standard' },
    { date: 'Jan 8, 2026', crop: crop, grade: 'A', score: 84, status: 'Premium' },
  ]

  return (
    <div className="space-y-6 max-w-6xl animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-stone-800">Image-Based Quality Estimation</h2>
        <span className="px-3 py-1.5 bg-violet-50 text-violet-700 text-xs font-semibold rounded-full border border-violet-200">AI Vision</span>
      </div>

      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/[0.05] rounded-full -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-white/[0.04] rounded-full translate-y-1/3" />
        <div className="relative z-10">
          <p className="text-violet-200 text-xs font-semibold uppercase tracking-wider">Computer Vision + ML</p>
          <h3 className="text-xl font-bold mt-2">Snap a photo. Get instant quality grade.</h3>
          <p className="text-violet-100/70 text-sm mt-2 max-w-xl">
            Our on-device ML model analyses grain images for size, color, moisture, damage, and foreign matter.
            Get a mandi-ready quality certificate in seconds — no lab needed.
          </p>
        </div>
      </div>

      {/* Upload area */}
      <div className="rounded-2xl border-2 border-dashed border-violet-300 bg-violet-50/50 p-8 text-center hover:border-violet-400 hover:bg-violet-50 transition-all cursor-pointer">
        <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-4">
          <Icon d={ICONS.imageQuality} className="w-8 h-8 text-violet-500" />
        </div>
        <p className="font-bold text-stone-800">Upload crop image for analysis</p>
        <p className="text-sm text-stone-500 mt-1">Take a photo of your grain sample or upload from gallery</p>
        <div className="mt-4 flex justify-center gap-3">
          <span className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-bold shadow-lg shadow-violet-500/25">
            Take Photo
          </span>
          <span className="px-4 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-700 text-sm font-bold">
            Upload Image
          </span>
        </div>
      </div>

      {/* Latest analysis */}
      <div className="rounded-2xl bg-white border border-stone-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <h3 className="font-bold text-stone-800">Latest Analysis — {crop}</h3>
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">Grade A</span>
        </div>
        <div className="p-6 space-y-4">
          {QUALITY_PARAMS.map((p, i) => (
            <div key={i}>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-stone-700">{p.name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    p.grade.startsWith('A') ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>{p.grade}</span>
                </div>
                <span className="font-bold text-stone-800">{p.score}%</span>
              </div>
              <GaugeBar label="" value={p.score} max={100} color={p.color} unit="" />
              <p className="text-xs text-stone-400 mt-1">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      <div className="rounded-2xl bg-white border border-stone-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100">
          <h3 className="font-bold text-stone-800">Analysis History</h3>
        </div>
        <div className="divide-y divide-stone-100">
          {HISTORY.map((h, i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
              <div>
                <p className="font-semibold text-stone-800 text-sm">{h.crop}</p>
                <p className="text-xs text-stone-400">{h.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-stone-700">{h.score}%</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  h.status === 'Premium' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>{h.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   SELF TRAINING TAB
   ═══════════════════════════════════════════════════ */
function SelfTrainingTab({ profile }) {
  const crop = profile?.primary_crop ? cap(profile.primary_crop) : 'Crop'

  const MODULES = [
    {
      id: 1, title: 'Understanding SAR Satellite Data', level: 'Beginner', duration: '8 min',
      desc: 'Learn how Synthetic Aperture Radar works, what soil moisture maps mean, and how to use satellite data for irrigation decisions.',
      lessons: 4, completed: 3, color: 'from-teal-500 to-emerald-600', icon: '🛰️',
    },
    {
      id: 2, title: `Best Practices for ${crop} Cultivation`, level: 'Intermediate', duration: '12 min',
      desc: `Stage-wise guide for ${crop}: soil preparation, sowing techniques, water management, and harvest timing based on NDVI data.`,
      lessons: 6, completed: 2, color: 'from-amber-500 to-orange-600', icon: '🌾',
    },
    {
      id: 3, title: 'Reading Mandi Price Trends', level: 'Beginner', duration: '6 min',
      desc: 'How to interpret price charts, identify best selling windows, and use price alerts to maximize your income.',
      lessons: 3, completed: 3, color: 'from-purple-500 to-violet-600', icon: '📈',
    },
    {
      id: 4, title: 'Pest & Disease Identification', level: 'Intermediate', duration: '10 min',
      desc: 'Visual guide to common pests and diseases. Learn to spot early signs and take preventive action before crop damage spreads.',
      lessons: 5, completed: 1, color: 'from-red-500 to-rose-600', icon: '🔬',
    },
    {
      id: 5, title: 'Government Schemes & Subsidies', level: 'Beginner', duration: '5 min',
      desc: 'Navigate PM-KISAN, crop insurance, MSP schemes, and subsidy applications. Step-by-step with Aadhaar linkage.',
      lessons: 3, completed: 0, color: 'from-blue-500 to-indigo-600', icon: '🏛️',
    },
    {
      id: 6, title: 'Image-Based Crop Grading', level: 'Advanced', duration: '15 min',
      desc: 'Master the art of grain quality assessment. Learn what makes Grade A vs Grade B, and how to prepare samples for mandi certification.',
      lessons: 4, completed: 0, color: 'from-fuchsia-500 to-pink-600', icon: '📸',
    },
  ]

  const totalLessons = MODULES.reduce((s, m) => s + m.lessons, 0)
  const completedLessons = MODULES.reduce((s, m) => s + m.completed, 0)
  const overallProgress = Math.round((completedLessons / totalLessons) * 100)

  return (
    <div className="space-y-6 max-w-6xl animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-stone-800">Self Training</h2>
        <span className="text-xs text-stone-400">{completedLessons}/{totalLessons} lessons completed</span>
      </div>

      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/[0.05] rounded-full -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/[0.03] rounded-full translate-y-1/2" />
        <div className="relative z-10">
          <p className="text-emerald-200 text-xs font-semibold uppercase tracking-wider">Learn at your own pace</p>
          <h3 className="text-xl font-bold mt-2">Knowledge is the best seed</h3>
          <p className="text-emerald-100/70 text-sm mt-2 max-w-xl">
            Bite-sized, practical modules designed for farmers. Available in your preferred language.
            Learn about satellite data, crop management, market strategies, and government schemes.
          </p>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex-1 max-w-xs">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-emerald-200">Overall Progress</span>
                <span className="font-bold">{overallProgress}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full">
                <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${overallProgress}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniCard title="Modules" value={String(MODULES.length)} sub="Available courses" accent="sky" />
        <MiniCard title="Completed" value={String(MODULES.filter(m => m.completed === m.lessons).length)} sub={`of ${MODULES.length} modules`} accent="blue" />
        <MiniCard title="Lessons Done" value={String(completedLessons)} sub={`of ${totalLessons} total`} accent="amber" />
        <MiniCard title="Avg Duration" value="9 min" sub="Per module" accent="sky" />
      </div>

      {/* Modules grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MODULES.map((m) => {
          const pct = Math.round((m.completed / m.lessons) * 100)
          const done = m.completed === m.lessons
          return (
            <div key={m.id} className="rounded-2xl bg-white border border-stone-200/80 shadow-sm overflow-hidden hover-lift group cursor-pointer">
              <div className={`h-2 bg-gradient-to-r ${m.color}`} />
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{m.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-stone-800 text-sm leading-snug">{m.title}</h4>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-medium text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">{m.level}</span>
                      <span className="text-[10px] text-stone-400">{m.duration}</span>
                      <span className="text-[10px] text-stone-400">{m.lessons} lessons</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-stone-500 mt-3 leading-relaxed">{m.desc}</p>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="text-stone-400">{m.completed}/{m.lessons} lessons</span>
                    <span className="font-bold text-stone-600">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-stone-100 rounded-full">
                    <div className={`h-full rounded-full bg-gradient-to-r ${m.color} transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                    done
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-stone-100 text-stone-600 group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-md'
                  }`}>
                    {done ? 'Completed' : m.completed > 0 ? 'Continue' : 'Start'}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════════ */
function StatCard({ label, value, sub, gradient, iconPath }) {
  return (
    <div className="rounded-2xl bg-white border border-stone-200/80 shadow-sm p-5 hover-lift group">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform duration-300`}>
        <Icon d={iconPath} className="w-5 h-5 text-white" />
      </div>
      <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">{label}</p>
      <p className="text-lg font-bold text-stone-800 mt-0.5 capitalize">{value}</p>
      {sub && <p className="text-xs text-stone-400 capitalize">{sub}</p>}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm py-2 border-b border-stone-100 last:border-0">
      <span className="text-stone-400">{label}</span>
      <span className="font-medium text-stone-700 capitalize">{value}</span>
    </div>
  )
}

function MiniGauge({ label, value, color }) {
  const bg = color === 'emerald' ? 'bg-emerald-100' : color === 'teal' ? 'bg-teal-100' : 'bg-amber-100'
  const fill = color === 'emerald' ? 'bg-emerald-500' : color === 'teal' ? 'bg-teal-500' : 'bg-amber-500'
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-stone-500">{label}</span>
        <span className="font-bold text-stone-700">{value}%</span>
      </div>
      <div className={`h-2 rounded-full ${bg}`}>
        <div className={`h-full rounded-full ${fill} transition-all duration-700`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function GaugeBar({ label, value, max, color, unit }) {
  const pct = (value / max) * 100
  const fills = { emerald: 'from-emerald-400 to-emerald-600', teal: 'from-teal-400 to-teal-600', blue: 'from-blue-400 to-blue-600', amber: 'from-amber-400 to-amber-600' }
  const bgs = { emerald: 'bg-emerald-100', teal: 'bg-teal-100', blue: 'bg-blue-100', amber: 'bg-amber-100' }
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="text-stone-500 font-medium">{label}</span>
        <span className="font-bold text-stone-700">{value}{unit}</span>
      </div>
      <div className={`h-3 rounded-full ${bgs[color] || 'bg-stone-100'}`}>
        <div className={`h-full rounded-full bg-gradient-to-r ${fills[color]} transition-all duration-1000`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function InsightCard({ title, desc, color, icon }) {
  const styles = {
    blue: 'border-blue-200 bg-blue-50',
    amber: 'border-amber-200 bg-amber-50',
    emerald: 'border-emerald-200 bg-emerald-50',
  }
  return (
    <div className={`rounded-2xl border p-5 ${styles[color] || styles.emerald} hover-lift`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <h4 className="font-bold text-stone-800 text-sm">{title}</h4>
      </div>
      <p className="text-sm text-stone-600">{desc}</p>
    </div>
  )
}

function MiniCard({ title, value, sub, accent }) {
  const styles = {
    sky: 'border-sky-200 bg-sky-50',
    blue: 'border-blue-200 bg-blue-50',
    amber: 'border-amber-200 bg-amber-50',
  }
  return (
    <div className={`rounded-2xl border p-5 ${styles[accent] || 'border-stone-200 bg-white'} hover-lift`}>
      <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-bold text-stone-800 mt-1">{value}</p>
      <p className="text-xs text-stone-500 mt-0.5">{sub}</p>
    </div>
  )
}

function cap(s) {
  if (!s) return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

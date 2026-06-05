'use client'

import { Suspense, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { completeOnboarding, type ListingInput } from './actions'

// Nicht-lineare Schieberegler-Mappings:
// Preis: 0–70 → 200–2000 € (feiner), 70–100 → 2000–4000 € (grober)
// Größe: 0–75 → 7–120 m² (feiner), 75–100 → 120–300 m² (grober)

function mapPriceSlider(v: number): number {
  if (v <= 70) return Math.round(200 + (v / 70) * 1800)
  return Math.round(2000 + ((v - 70) / 30) * 2000)
}

function mapSizeSlider(v: number): number {
  if (v <= 75) return Math.round(7 + (v / 75) * 113)
  return Math.round(120 + ((v - 75) / 25) * 180)
}

// ── Inline SVG Icons (Heroicons-Stil, 20×20) ─────────────────────────────────

function IconCamera({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  )
}

function IconSearch({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  )
}

function IconHome({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}

function IconArrows({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m16 3 4 4-4 4"/>
      <path d="M20 7H4"/>
      <path d="m8 21-4-4 4-4"/>
      <path d="M4 17h16"/>
    </svg>
  )
}

function IconHeart({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  )
}

function IconSparkles({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z"/>
    </svg>
  )
}

function IconShare({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
      <polyline points="16 6 12 2 8 6"/>
      <line x1="12" y1="2" x2="12" y2="15"/>
    </svg>
  )
}

function IconCheck({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

type Role = 'search' | 'offer' | 'both' | 'vermittler'
type HousingType = 'whole' | 'wg_room' | 'sublet'

const ROLES: { value: Role; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { value: 'search',    label: 'Ich suche eine Wohnung',       Icon: IconSearch },
  { value: 'offer',     label: 'Ich biete eine Wohnung an',    Icon: IconHome   },
  { value: 'both',      label: 'Beides',                       Icon: IconArrows },
  { value: 'vermittler',label: 'Ich vermittle nur — gutes Karma', Icon: IconHeart },
]

const HOUSING_TYPES: { value: HousingType; label: string }[] = [
  { value: 'whole',   label: 'Ganze Wohnung' },
  { value: 'wg_room', label: 'WG-Zimmer'     },
  { value: 'sublet',  label: 'Zwischenmiete' },
]

function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inviteToken = searchParams.get('invite_token') ?? undefined
  const supabase = createClient()

  const [screen, setScreen] = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Screen 1
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [role, setRole] = useState<Role | null>(null)

  // Screen 2
  const [listingKind, setListingKind] = useState<'search' | 'offer'>('search')
  const [housingType, setHousingType] = useState<HousingType>('whole')
  const [priceSlider, setPriceSlider] = useState(35)
  const [sizeSlider, setSizeSlider] = useState(30)
  const [durationFrom, setDurationFrom] = useState('')
  const [durationTo, setDurationTo] = useState('')

  // Screen 3
  const [ownToken, setOwnToken] = useState('')
  const [interestedCount, setInterestedCount] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const price = mapPriceSlider(priceSlider)
  const size = mapSizeSlider(sizeSlider)

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Das Bild darf maximal 5 MB groß sein.')
      return
    }
    setErrorMsg(null)
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleScreen1Next() {
    if (!firstName.trim() || !lastName.trim() || !role || loading) return
    setErrorMsg(null)
    if (role === 'vermittler') {
      setLoading(true)
      await submitOnboarding(undefined)
    } else {
      setListingKind(role === 'offer' ? 'offer' : 'search')
      setScreen(2)
    }
  }

  async function handleScreen2Submit() {
    setErrorMsg(null)
    if (housingType === 'sublet') {
      if (!durationFrom || !durationTo) {
        setErrorMsg('Bitte beide Datumswerte für die Zwischenmiete angeben.')
        return
      }
      if (durationFrom >= durationTo) {
        setErrorMsg('Das Startdatum muss vor dem Enddatum liegen.')
        return
      }
    }
    const listing: ListingInput = {
      kind: listingKind,
      housingType,
      size,
      price,
      ...(housingType === 'sublet' ? { durationFrom, durationTo } : {}),
    }
    await submitOnboarding(listing)
  }

  async function submitOnboarding(listing: ListingInput | undefined) {
    setLoading(true)

    let avatarUrl: string | undefined
    if (avatarFile) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.storage
          .from('avatars')
          .upload(user.id, avatarFile, { upsert: true, contentType: avatarFile.type })
        if (data) avatarUrl = data.path
        // Falls Bucket noch nicht existiert: Foto wird übersprungen, kein Fehler
      }
    }

    const result = await completeOnboarding({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      avatarUrl,
      inviteToken,
      listing,
    })

    setLoading(false)

    if (!result.success) {
      setErrorMsg(result.error ?? 'Fehler beim Speichern.')
      return
    }

    setOwnToken(result.ownToken ?? '')
    if (result.interestedCount !== undefined) setInterestedCount(result.interestedCount)
    setScreen(3)
  }

  async function handleShare() {
    const link = `${window.location.origin}/join/${ownToken}`
    const shareData = {
      title: 'Nestwork',
      text: 'Ich organisiere Wohnungsvermittlungen über Nestwork. Komm in mein Netzwerk:',
      url: link,
    }
    if (navigator.share) {
      try { await navigator.share(shareData) } catch { /* Dialog geschlossen */ }
    } else {
      await navigator.clipboard.writeText(`${shareData.text}\n${link}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const progress = screen === 1 ? 33 : screen === 2 ? 66 : 100

  // Shared input class
  const inputCls = 'w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-400 transition-colors'

  return (
    // Kein flex-col hier — verhindert iOS-Viewport-Zoom bei Date-Inputs
    <main className="min-h-screen p-6 bg-base" style={{ maxWidth: 480, margin: '0 auto' }}>

      {/* Fortschrittsbalken */}
      <div className="w-full h-1 bg-gray-200 rounded-full mt-4 mb-8">
        <div
          className="h-1 rounded-full transition-all duration-300"
          style={{ width: `${progress}%`, backgroundColor: '#6B3CF6' }}
        />
      </div>

      {/* ── Screen 1: Profil ── */}
      {screen === 1 && (
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#6B3CF6' }}>
              Richte dein Profil ein
            </h1>
            <p className="text-gray-500 text-sm mt-1">Schritt 1 von 3</p>
          </div>

          {/* Foto */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0 bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors"
              aria-label="Profilbild hochladen"
            >
              {avatarPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarPreview} alt="Profilbild Vorschau" className="w-full h-full object-cover" />
              ) : (
                <IconCamera className="w-6 h-6 text-gray-400" />
              )}
            </button>
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm font-medium cursor-pointer"
                style={{ color: '#6B3CF6' }}
              >
                Foto hinzufügen
              </button>
              <p className="text-xs text-gray-400 mt-0.5">Optional · max. 5 MB</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {/* Name */}
          <div className="flex flex-col gap-3">
            <label className="sr-only" htmlFor="firstName">Vorname</label>
            <input
              id="firstName"
              type="text"
              placeholder="Vorname *"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className={inputCls}
              style={{ fontSize: '16px' }}
              autoComplete="given-name"
            />
            <label className="sr-only" htmlFor="lastName">Nachname</label>
            <input
              id="lastName"
              type="text"
              placeholder="Nachname *"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              className={inputCls}
              style={{ fontSize: '16px' }}
              autoComplete="family-name"
            />
          </div>

          {/* Rolle */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Was treibt dich her?</p>
            <div className="flex flex-col gap-2">
              {ROLES.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-left cursor-pointer transition-all"
                  style={
                    role === value
                      ? { borderColor: '#6B3CF6', backgroundColor: '#F3EFFE' }
                      : { borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }
                  }
                >
                  <span
                    className="flex-shrink-0"
                    style={{ color: role === value ? '#6B3CF6' : '#9CA3AF' }}
                  >
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className="text-sm font-medium text-gray-800">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <p className="text-sm text-red-500 text-center" role="alert">{errorMsg}</p>
          )}

          <button
            onClick={handleScreen1Next}
            disabled={!firstName.trim() || !lastName.trim() || !role || loading}
            className="w-full py-3 rounded-2xl font-semibold text-white cursor-pointer transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#6B3CF6' }}
          >
            {loading ? 'Wird gespeichert…' : 'Weiter'}
          </button>
        </div>
      )}

      {/* ── Screen 2: Listing ── */}
      {screen === 2 && (
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#6B3CF6' }}>
              {listingKind === 'offer' ? 'Dein Angebot' : 'Dein Gesuch'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">Schritt 2 von 3</p>
            {role === 'both' && (
              <p className="text-xs text-gray-400 mt-1">
                Das zweite kannst du später im Profil ergänzen.
              </p>
            )}
          </div>

          {/* Toggle Gesuch / Angebot — nur bei "Beides" */}
          {role === 'both' && (
            <div className="flex gap-2">
              {(['search', 'offer'] as const).map(k => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setListingKind(k)}
                  className="flex-1 py-2 rounded-xl text-sm font-medium border cursor-pointer transition-all"
                  style={
                    listingKind === k
                      ? { backgroundColor: '#6B3CF6', borderColor: '#6B3CF6', color: '#FFFFFF' }
                      : { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', color: '#4B5563' }
                  }
                >
                  {k === 'search' ? 'Gesuch' : 'Angebot'}
                </button>
              ))}
            </div>
          )}

          {/* Wohnungstyp */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Wohnungstyp</p>
            <div className="flex flex-col gap-2">
              {HOUSING_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setHousingType(value)}
                  className="w-full px-4 py-3 rounded-2xl border text-left text-sm font-medium cursor-pointer transition-all"
                  style={
                    housingType === value
                      ? { backgroundColor: '#6B3CF6', borderColor: '#6B3CF6', color: '#FFFFFF' }
                      : { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', color: '#1F2937' }
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Preis-Schieberegler */}
          {/* Fix: tabular-nums + min-w verhindert Layout-Shift beim Tippen */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-gray-700">
                {listingKind === 'offer' ? 'Warmmiete (warm)' : 'Maximalbudget (warm)'}
              </p>
              <span
                className="text-lg font-bold text-right"
                style={{
                  color: '#6B3CF6',
                  fontVariantNumeric: 'tabular-nums',
                  minWidth: '5.5rem',
                }}
              >
                {price.toLocaleString('de-DE')} €
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={priceSlider}
              onChange={e => setPriceSlider(Number(e.target.value))}
              className="w-full cursor-pointer"
              style={{ accentColor: '#6B3CF6' }}
              aria-label="Warmmiete"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>200 €</span>
              <span>4.000 €</span>
            </div>
          </div>

          {/* Größen-Schieberegler */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-gray-700">
                {listingKind === 'offer' ? 'Wohnungsgröße' : 'Mindestgröße'}
              </p>
              <span
                className="text-lg font-bold text-right"
                style={{
                  color: '#6B3CF6',
                  fontVariantNumeric: 'tabular-nums',
                  minWidth: '4rem',
                }}
              >
                {size} m²
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={sizeSlider}
              onChange={e => setSizeSlider(Number(e.target.value))}
              className="w-full cursor-pointer"
              style={{ accentColor: '#6B3CF6' }}
              aria-label="Größe in Quadratmeter"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>7 m²</span>
              <span>300 m²</span>
            </div>
          </div>

          {/* Zeitraum — nur bei Zwischenmiete */}
          {housingType === 'sublet' && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Zeitraum</p>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label htmlFor="durationFrom" className="text-xs text-gray-500 mb-1 block">
                    Von
                  </label>
                  {/* font-size 16px verhindert iOS-Viewport-Zoom beim Antippen */}
                  <input
                    id="durationFrom"
                    type="date"
                    value={durationFrom}
                    onChange={e => setDurationFrom(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-900 bg-white focus:outline-none"
                    style={{ fontSize: '16px' }}
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="durationTo" className="text-xs text-gray-500 mb-1 block">
                    Bis
                  </label>
                  <input
                    id="durationTo"
                    type="date"
                    value={durationTo}
                    onChange={e => setDurationTo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-900 bg-white focus:outline-none"
                    style={{ fontSize: '16px' }}
                  />
                </div>
              </div>
            </div>
          )}

          {errorMsg && (
            <p className="text-sm text-red-500 text-center" role="alert">{errorMsg}</p>
          )}

          <button
            onClick={handleScreen2Submit}
            disabled={loading}
            className="w-full py-3 rounded-2xl font-semibold text-white cursor-pointer transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#6B3CF6' }}
          >
            {loading ? 'Wird gespeichert…' : 'Speichern'}
          </button>
        </div>
      )}

      {/* ── Screen 3: Einladen ── */}
      {screen === 3 && (
        <div className="flex flex-col gap-6 items-center text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#F3EFFE', color: '#6B3CF6' }}
          >
            <IconSparkles className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#6B3CF6' }}>
              Profil steht!
            </h1>
            {interestedCount !== null && listingKind === 'offer' && (
              <p className="text-gray-600 mt-2 text-sm">
                In deinem Netzwerk gibt es{' '}
                <strong>{interestedCount}</strong>{' '}
                {interestedCount === 1
                  ? 'Person, die potentiell an deiner Wohnung interessiert ist.'
                  : 'Personen, die potentiell an deiner Wohnung interessiert sind.'}
              </p>
            )}
          </div>

          <div className="w-full text-left">
            <p className="font-semibold text-gray-800 mb-1">Lad jetzt deine ersten Kontakte ein</p>
            <p className="text-sm text-gray-500 mb-4">
              Nestwork funktioniert nur wenn dein Netzwerk dabei ist. Teile deinen Link.
            </p>

            {ownToken && (
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 mb-4 text-xs text-gray-500 break-all select-all">
                {typeof window !== 'undefined'
                  ? `${window.location.origin}/join/${ownToken}`
                  : `/join/${ownToken}`}
              </div>
            )}

            <button
              onClick={handleShare}
              className="w-full py-3 rounded-2xl font-semibold text-white mb-3 cursor-pointer transition-all flex items-center justify-center gap-2"
              style={{ backgroundColor: copied ? '#16A34A' : '#F06292' }}
            >
              {copied
                ? <><IconCheck className="w-5 h-5" /> Link kopiert</>
                : <><IconShare className="w-5 h-5" /> Kontakte einladen</>
              }
            </button>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-3 rounded-2xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors"
            >
              Weiter zum Dashboard
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingContent />
    </Suspense>
  )
}

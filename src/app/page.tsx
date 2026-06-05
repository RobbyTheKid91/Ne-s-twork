'use client'

import Link from 'next/link'
import { useState } from 'react'

const translations = {
  de: {
    headline: 'Finde deine Traumwohnung durch Freunde und Freundesfreunde!',
    subline: 'Die besten Wohnungen bekommst du weil du jemanden kennst, der/die jemanden kennt. Mit Nestwork machst du dein Netzwerk zur Wohnungsvermittlung.',
    steps: [
      { title: 'Profil anlegen', text: 'Trag ein was du suchst — einmal, in zwei Minuten.' },
      { title: 'Mit Freunden vernetzen', text: 'Lad deine Kontakte ein. Je größer dein Netz, desto mehr Chancen.' },
      { title: 'Traumwohnung landet im Schoß', text: 'Wenn jemand in deinem Netzwerk etwas Passendes anbietet, erfährst du es.' },
    ],
    consent: 'Ich akzeptiere die',
    consentLink: 'Datenschutzerklärung',
    consentSuffix: 'und bin damit einverstanden, dass meine Daten zur Nutzung von Nestwork verarbeitet werden.',
    cta: 'Mit Google anmelden',
    hint: 'Du brauchst einen Einladungslink von einem Bekannten',
    impressum: 'Impressum',
    datenschutz: 'Datenschutz',
  },
  en: {
    headline: 'Find your dream apartment through friends and friends of friends!',
    subline: 'The best apartments come through people you know, who know someone. With Nestwork, your network becomes your housing search.',
    steps: [
      { title: 'Create your profile', text: 'Enter what you\'re looking for — once, in two minutes.' },
      { title: 'Connect with friends', text: 'Invite your contacts. The bigger your network, the more chances.' },
      { title: 'Your dream apartment finds you', text: 'When someone in your network has a match, you\'ll hear about it.' },
    ],
    consent: 'I accept the',
    consentLink: 'Privacy Policy',
    consentSuffix: 'and agree that my data will be processed for the use of Nestwork.',
    cta: 'Sign in with Google',
    hint: 'You need an invitation link from someone you know',
    impressum: 'Imprint',
    datenschutz: 'Privacy Policy',
  },
}

type Lang = keyof typeof translations

export default function LandingPage() {
  const [accepted, setAccepted] = useState(false)
  const [lang, setLang] = useState<Lang>('de')
  const t = translations[lang]

  async function signInWithGoogle() {
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen bg-base flex flex-col">

      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #F06292, #6B3CF6)' }}
      />

      <main className="flex-1 flex flex-col px-6 pt-10 pb-6 w-full mx-auto" style={{ maxWidth: 440 }}>

        {/* Logo + Sprachschalter */}
        <div className="flex items-center justify-between mb-10">
          <span className="text-2xl font-bold tracking-tight" style={{ color: '#6B3CF6' }}>
            Nestwork
          </span>
          <button
            onClick={() => setLang(lang === 'de' ? 'en' : 'de')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors cursor-pointer bg-white"
            aria-label="Sprache wechseln"
          >
            {lang === 'de' ? (
              <><FlagDE /> EN</>
            ) : (
              <><FlagEN /> DE</>
            )}
          </button>
        </div>

        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold leading-snug tracking-tight mb-4" style={{ color: '#6B3CF6' }}>
            {t.headline}
          </h1>
          <p className="text-gray-500 text-base leading-relaxed">
            {t.subline}
          </p>
        </div>

        {/* 3 Schritte */}
        <div className="space-y-3 mb-10">
          <Step icon={<UserIcon />} number="1" title={t.steps[0].title} text={t.steps[0].text} />
          <Step icon={<EnvelopeIcon />} number="2" title={t.steps[1].title} text={t.steps[1].text} />
          <Step icon={<SparklesIcon />} number="3" title={t.steps[2].title} text={t.steps[2].text} />
        </div>

        {/* CTA */}
        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <div className="relative flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="sr-only"
              />
              <div
                className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150"
                style={{
                  borderColor: accepted ? '#6B3CF6' : '#D1D5DB',
                  backgroundColor: accepted ? '#6B3CF6' : 'white',
                }}
              >
                {accepted && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-xs text-gray-500 leading-relaxed">
              {t.consent}{' '}
              <Link
                href="/datenschutz"
                className="underline transition-colors"
                style={{ color: '#6B3CF6' }}
                onClick={(e) => e.stopPropagation()}
              >
                {t.consentLink}
              </Link>{' '}
              {t.consentSuffix}
            </span>
          </label>

          <button
            onClick={signInWithGoogle}
            disabled={!accepted}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border-2 rounded-2xl font-semibold text-gray-700 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              borderColor: accepted ? '#6B3CF6' : '#E5E7EB',
              boxShadow: accepted ? '0 0 0 3px #6B3CF620' : 'none',
            }}
          >
            <GoogleIcon />
            {t.cta}
          </button>

          <p className="text-center text-xs text-gray-400">
            {t.hint}
          </p>
        </div>

      </main>

      {/* Footer */}
      <footer className="py-6 flex items-center justify-center gap-6">
        <Link href="/impressum" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
          {t.impressum}
        </Link>
        <span className="text-gray-200">·</span>
        <Link href="/datenschutz" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
          {t.datenschutz}
        </Link>
      </footer>

    </div>
  )
}

function Step({ icon, number, title, text }: { icon: React.ReactNode; number: string; title: string; text: string }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-gray-100">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: '#6B3CF6' + '12' }}
      >
        <div style={{ color: '#6B3CF6' }}>{icon}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-bold" style={{ color: '#6B3CF6' }}>{number}</span>
          <span className="text-sm font-semibold text-gray-800">{title}</span>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">{text}</p>
      </div>
    </div>
  )
}

function FlagDE() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" aria-hidden="true">
      <rect width="16" height="4" y="0" fill="#000" />
      <rect width="16" height="4" y="4" fill="#D00" />
      <rect width="16" height="4" y="8" fill="#FFCE00" />
    </svg>
  )
}

function FlagEN() {
  return (
    <svg width="16" height="12" viewBox="0 0 60 40" aria-hidden="true">
      <rect width="60" height="40" fill="#012169"/>
      <path d="M0,0 L60,40 M60,0 L0,40" stroke="#fff" strokeWidth="8"/>
      <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" strokeWidth="5"/>
      <path d="M30,0 V40 M0,20 H60" stroke="#fff" strokeWidth="13"/>
      <path d="M30,0 V40 M0,20 H60" stroke="#C8102E" strokeWidth="8"/>
    </svg>
  )
}

function EnvelopeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  )
}

function SparklesIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456z" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className="flex-shrink-0">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

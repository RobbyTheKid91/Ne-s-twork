import Link from 'next/link'

export default function ImpressumPage() {
  return (
    <main className="min-h-screen bg-base pb-12" style={{ maxWidth: 480, margin: '0 auto' }}>

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <Link
          href="/"
          className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
          aria-label="Zurück"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </Link>
        <h1 className="text-xl font-bold" style={{ color: '#6B3CF6' }}>Impressum</h1>
      </div>

      <div className="px-4 pt-5 pb-10 space-y-6 text-sm text-gray-700 leading-relaxed">

        <p className="text-xs text-gray-400">Angaben gemäß § 5 DDG</p>

        <section className="space-y-1">
          <p className="font-semibold text-gray-900">Verantwortlicher</p>
          <p>Robert Lüders</p>
          <p className="text-gray-400 italic">TODO: Straße und Hausnummer</p>
          <p className="text-gray-400 italic">TODO: PLZ und Ort</p>
        </section>

        <section className="space-y-1">
          <p className="font-semibold text-gray-900">Kontakt</p>
          <p>
            E-Mail:{' '}
            <a href="mailto:hallo@robertlueders.de" className="underline" style={{ color: '#6B3CF6' }}>
              hallo@robertlueders.de
            </a>
          </p>
        </section>

        <section className="space-y-1">
          <p className="font-semibold text-gray-900">Hinweis zum Dienst</p>
          <p className="text-gray-500 text-xs">
            Nestwork ist ein privates Netzwerk-Tool ohne gewerbliche Absicht. Es dient ausschließlich der Vernetzung von Bekannten bei der Wohnungssuche in Berlin und ist nur über persönliche Einladung zugänglich.
          </p>
        </section>

      </div>
    </main>
  )
}

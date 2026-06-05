import Link from 'next/link'

export default function DatenschutzPage() {
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
        <h1 className="text-xl font-bold" style={{ color: '#6B3CF6' }}>Datenschutz</h1>
      </div>

      <div className="px-4 pt-5 pb-10 space-y-6 text-sm text-gray-700 leading-relaxed">

        <p className="text-xs text-gray-400">Stand: Juni 2025</p>

        {/* 1. Verantwortlicher */}
        <section className="space-y-2">
          <h2 className="font-semibold text-gray-900">1. Verantwortlicher</h2>
          <p>
            Robert Lüders<br />
            <span className="text-gray-400 italic">TODO: Adresse ergänzen</span><br />
            E-Mail:{' '}
            <a href="mailto:hallo@robertlueders.de" className="underline" style={{ color: '#6B3CF6' }}>
              hallo@robertlueders.de
            </a>
          </p>
        </section>

        {/* 2. Welche Daten */}
        <section className="space-y-2">
          <h2 className="font-semibold text-gray-900">2. Welche Daten wir verarbeiten</h2>
          <p>
            Bei der Nutzung von Nestwork werden folgende personenbezogene Daten gespeichert:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-600 text-xs">
            <li>Vor- und Nachname</li>
            <li>E-Mail-Adresse (von Google übermittelt)</li>
            <li>Profilbild (optional, von dir hochgeladen oder von Google übernommen)</li>
            <li>Wohnungsinserate (Gesuch oder Angebot mit deinen Kriterien)</li>
            <li>Netzwerkverbindungen (wer wen eingeladen hat)</li>
            <li>Einladungstoken (eindeutiger Link pro Nutzer)</li>
          </ul>
          <p className="text-xs text-gray-500">
            Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) und Art. 6 Abs. 1 lit. a DSGVO (Einwilligung beim Login).
          </p>
        </section>

        {/* 3. Google OAuth */}
        <section className="space-y-2">
          <h2 className="font-semibold text-gray-900">3. Login über Google</h2>
          <p className="text-xs text-gray-600">
            Die Anmeldung erfolgt über Google OAuth. Dabei wird dein Google-Profil (Name, E-Mail-Adresse, Profilbild) an Nestwork übermittelt. Wir speichern diese Daten in unserer Datenbank. Google verarbeitet dabei eigene Daten gemäß der{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
              style={{ color: '#6B3CF6' }}
            >
              Google-Datenschutzerklärung
            </a>
            .
          </p>
        </section>

        {/* 4. Supabase */}
        <section className="space-y-2">
          <h2 className="font-semibold text-gray-900">4. Hosting und Datenbank (Supabase)</h2>
          <p className="text-xs text-gray-600">
            Alle Daten werden in der Infrastruktur von Supabase Inc. gespeichert. Der Datenbankserver befindet sich in der EU (Frankfurt). Supabase ist als Auftragsverarbeiter gemäß Art. 28 DSGVO tätig und verpflichtet sich zur Einhaltung der DSGVO. Ein Data Processing Agreement (DPA) liegt vor.
          </p>
        </section>

        {/* 5. Cookies */}
        <section className="space-y-2">
          <h2 className="font-semibold text-gray-900">5. Session-Cookie</h2>
          <p className="text-xs text-gray-600">
            Nach dem Login wird ein Session-Cookie gesetzt, das dich als eingeloggten Nutzer identifiziert. Dieses Cookie ist technisch notwendig für den Betrieb der App und wird nach dem Logout oder Ablauf der Session gelöscht. Es enthält keine personenbezogenen Daten außer einer verschlüsselten Session-ID. Tracking-Cookies oder Cookies zu Werbezwecken setzen wir nicht ein.
          </p>
        </section>

        {/* 6. Datenweitergabe */}
        <section className="space-y-2">
          <h2 className="font-semibold text-gray-900">6. Datenweitergabe an Dritte</h2>
          <p className="text-xs text-gray-600">
            Deine Kontaktdaten (E-Mail) werden im Rahmen der Vermittlungsfunktion nur dann weitergegeben, wenn du aktiv einen vorformulierten Text kopierst und selbst weiterschickst. Eine automatische Weitergabe an Dritte findet nicht statt. Ebene-2-Kontakte in deinem Netzwerk sehen deine persönlichen Daten nicht — sie werden serverseitig anonymisiert.
          </p>
        </section>

        {/* 7. Speicherdauer */}
        <section className="space-y-2">
          <h2 className="font-semibold text-gray-900">7. Speicherdauer</h2>
          <p className="text-xs text-gray-600">
            Deine Daten werden so lange gespeichert, wie dein Account aktiv ist. Du kannst jederzeit die Löschung deines Accounts und aller zugehörigen Daten beantragen (siehe unten).
          </p>
        </section>

        {/* 8. Rechte */}
        <section className="space-y-2">
          <h2 className="font-semibold text-gray-900">8. Deine Rechte</h2>
          <p className="text-xs text-gray-600">Du hast das Recht auf:</p>
          <ul className="list-disc list-inside space-y-1 text-xs text-gray-600">
            <li>Auskunft über deine gespeicherten Daten (Art. 15 DSGVO)</li>
            <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
            <li>Löschung deiner Daten ("Recht auf Vergessenwerden", Art. 17 DSGVO)</li>
            <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
            <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
            <li>Beschwerde bei einer Aufsichtsbehörde (z.B. Berliner Beauftragte für Datenschutz)</li>
          </ul>
          <p className="text-xs text-gray-600 mt-2">
            Für alle Anfragen wende dich an:{' '}
            <a href="mailto:hallo@robertlueders.de" className="underline" style={{ color: '#6B3CF6' }}>
              hallo@robertlueders.de
            </a>
          </p>
        </section>

      </div>
    </main>
  )
}

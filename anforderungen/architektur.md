# Nestwork v0.1 — Technische Architektur

> Begleitdokument zu `f1-grundgeruest.md`. Beschreibt wie die Anforderungen technisch umgesetzt werden.

---

## 1. Stack (festgelegt)

| Schicht | Technologie | Warum |
|---|---|---|
| Frontend | **Next.js 15** (App Router) als PWA | Server-Auth-Checks, mobile-first, "Add to Home Screen" out of the box |
| Backend / DB | **Supabase** (Postgres + Auth + Storage) | Auth mit Google, RLS für Datenschutz, Storage für Bilder — alles aus einer Hand |
| Hosting | **Vercel** (Frontend) + **Supabase Cloud** (Backend) | Kostenlos zum Start, ein Deploy-Klick |
| Graph-Visualisierung | **react-force-graph** | Leichtgewichtig, mobil bedienbar, Zoom/Pan, einfache Ebenen-Darstellung |
| Login v0.1 | **nur Google** (OAuth) | Apple erst in v0.2 (spart 99 €/Jahr Developer-Account) |

**Erklärt für nicht-Techniker:** Next.js ist die Website selbst (was Maria im Browser sieht). Supabase ist der Maschinenraum dahinter — speichert wer mit wem verbunden ist, wer was sucht, und kümmert sich um den Login. Vercel ist der Ort an dem die Website im Internet liegt.

---

## 2. Datenmodell

Drei Tabellen reichen für v0.1.

### `profiles`
Ein Eintrag pro Nutzer. Hängt direkt am Login-Account.
```
id            UUID  (= auth.uid, Primary Key)
first_name    TEXT  NOT NULL
last_name     TEXT  NOT NULL
email         TEXT  NOT NULL          -- aus dem OAuth-Login
avatar_url    TEXT                    -- optional, zeigt auf privaten Storage-Bucket
created_at    TIMESTAMPTZ DEFAULT NOW()
```

### `invites`
Einladungslinks. Eigene Tabelle statt Spalte in `profiles` — damit ein Nutzer in v0.2 mehrere Links haben kann, ohne Datenbank-Umbau.
```
token       TEXT PRIMARY KEY            -- der Teil aus /join/[token]
owner_id    UUID REFERENCES profiles(id) ON DELETE CASCADE
created_at  TIMESTAMPTZ DEFAULT NOW()
```
- **v0.1:** genau ein `invites`-Eintrag pro Nutzer (der feste Link) — bei Profil-Erstellung angelegt
- **v0.2:** beliebig viele Einträge pro Nutzer; Datenmodell bleibt identisch, nur die Erzeugungs-Logik ändert sich

### `connections`
Wer hat wen eingeladen. Gerichtet gespeichert (für "über Maria"), aber für die Netzwerk-Distanz beidseitig behandelt.
```
id          UUID DEFAULT gen_random_uuid() PRIMARY KEY
inviter_id  UUID REFERENCES profiles(id) ON DELETE CASCADE
invitee_id  UUID REFERENCES profiles(id) ON DELETE CASCADE
created_at  TIMESTAMPTZ DEFAULT NOW()
UNIQUE (inviter_id, invitee_id)
```

### `listings`
Ein Gesuch ODER ein Angebot. Ein Nutzer kann mehrere haben (oder keins → reiner Vermittler).
```
id            UUID DEFAULT gen_random_uuid() PRIMARY KEY
user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE
kind          TEXT  -- 'search' | 'offer'
housing_type  TEXT  -- 'whole' | 'wg_room' | 'sublet'
size          INT   -- bei offer: m² der Wohnung; bei search: Mindestgröße
price         INT   -- bei offer: Miete; bei search: max. Budget
duration_from DATE  -- nur relevant bei sublet
duration_to   DATE  -- nur relevant bei sublet
status        TEXT  DEFAULT 'active'  -- 'active' | 'paused' | 'taken' (nur offer)
created_at    TIMESTAMPTZ DEFAULT NOW()
```

**Reiner Vermittler:** hat einen `profiles`-Eintrag, aber keinen `listings`-Eintrag. Fertig — kein Sonderfall nötig.

---

## 3. Auth-Flow (US-0)

1. Nutzer klickt "Mit Google anmelden" → Supabase Auth übernimmt OAuth (Apple folgt in v0.2)
2. Nach erstem Login existiert ein Auth-Account, aber noch kein `profiles`-Eintrag
3. Onboarding-Screen: Vor-/Nachname (aus Google vorausgefüllt), optional Foto, optional Gesuch/Angebot → erstellt `profiles` + ggf. `listings`
4. Kam der Nutzer über `/join/[token]`? → zusätzlich `connections`-Eintrag (inviter = Token-Besitzer)
5. Erster Nutzer (Robert) kommt ohne Token → kein `connections`-Eintrag, startet allein
6. Onboarding endet mit "Lad deine ersten 3 Kontakte ein" + Share-Button

**Sicherheit:** Auth-Status wird serverseitig in der Next.js-Middleware geprüft, nie nur im Browser.

---

## 4. Der Kern: Netzwerk-Abfrage mit Anonymisierung (US-3, US-4)

Das ist der heikelste Teil. RLS allein reicht nicht, weil wir Ebene-2-Kontakte *teilweise* zeigen wollen.

**Lösung: eine `SECURITY DEFINER`-Datenbankfunktion `get_my_network()`.**

Sie macht in einem Schritt:
1. Ebene 1 berechnen = alle direkten Verbindungen des eingeloggten Nutzers
2. Ebene 2 berechnen = Verbindungen dieser Personen (ohne sich selbst und ohne Ebene-1-Dopplungen)
3. Für **Ebene 1**: volle Daten zurückgeben (Name, Foto, E-Mail, Listings)
4. Für **Ebene 2**: nur `housing_type`, `size`, `price`, `status` + Name des Zwischenknotens. Name, Foto, E-Mail der Ebene-2-Person werden als `NULL` zurückgegeben — sie verlassen die Datenbank gar nicht

**Erklärt für nicht-Techniker:** Stell dir einen Pförtner vor der vor der Datenbank steht. Fragt Jonas nach seinem Netzwerk, gibt der Pförtner die Daten seiner direkten Freunde komplett raus. Bei den Freunden-der-Freunde schwärzt er Name, Foto und Mail schon *bevor* er die Akte rausreicht. Es ist technisch unmöglich an die geschwärzten Daten zu kommen, weil sie nie das Gebäude verlassen. Genau das verlangt die DSGVO — Schutz an der Quelle, nicht erst auf dem Bildschirm.

**RLS zusätzlich:** Die Basis-Tabellen bekommen trotzdem RLS. Direkter Zugriff auf `profiles`/`listings` liefert nur eigene Daten. Das Netzwerk gibt es ausschließlich über die geprüfte Funktion.

---

## 5. Match-Logik (US-2, US-5)

Eine SQL-Funktion `find_matches(offer_id)` bzw. `count_interested(offer_id)`. Ein Angebot matcht ein Gesuch wenn **alle** gelten:

```
offer.housing_type = search.housing_type
AND offer.price <= search.price          -- Angebotsmiete ≤ Budget
AND offer.size  >= search.size           -- Wohnung ≥ Mindestgröße
AND offer.status = 'active'
AND (
     offer.housing_type <> 'sublet'      -- Dauer nur bei Zwischenmiete prüfen
     OR (offer.duration_from <= search.duration_to
         AND offer.duration_to >= search.duration_from)  -- Zeiträume überlappen
)
```

- **Counter nach Angebot speichern (US-2):** `count_interested` zählt die matchenden Suchenden auf **Ebene 1** des Anbieters → "X Personen interessiert"
- **Vermittlungs-Liste (US-5):** zeigt nur Suchende, die für den Betrachter vermittelbar sind = beide Parteien auf seiner Ebene 1

---

## 6. Einladungslink & Vermittlung (US-1, US-5)

- `invite_token` wird bei Profil-Erstellung einmalig erzeugt (kurzer, zufälliger String)
- `/join/[token]` schlägt den Inviter nach und zeigt "[Name] hat dich eingeladen"
- Teilen über die **Web Share API** (nativer Teilen-Dialog), Fallback: Kopier-Button
- Vermittlungs-Text wird im Frontend aus den Match-Daten zusammengebaut und per Clipboard-API kopiert — kein WhatsApp-Deep-Link, funktioniert mit jedem Messenger

---

## 7. Profilbilder (Storage + DSGVO)

- Privater Supabase-Storage-Bucket, **nicht** öffentlich
- Zugriff nur über **signierte URLs**, die das Backend ausschließlich für Ebene-1-Betrachter erzeugt
- Ebene-2-Betrachter bekommen gar keine URL → das Foto ist technisch unerreichbar
- Beim Löschen eines Profils wird auch das Bild entfernt (Recht auf Löschung)

---

## 8. PWA & Seitenstruktur

**PWA:** `manifest.json` (Name, Icon, Farben #6B3CF6/#F06292) + Service Worker fürs Caching → installierbar über "Add to Home Screen".

**Routen:**
```
/                 Landing Page
/login            Google/Apple Login
/onboarding       Profil + erste Kontakte (US-0)
/dashboard        Graph + Karten-Grid + Matches (US-3, US-4)
/join/[token]     Einladungs-Landing (US-2)
/profile          Eigenes Profil, Listings verwalten (US-6)
```

---

## 9. DSGVO-Checkliste (aus den Anforderungen)

- [x] Login nur über OAuth — keine eigene Passwortspeicherung
- [x] Ebene-2-Anonymisierung in der DB-Funktion erzwungen (nicht im Frontend)
- [x] E-Mail nur für Ebene-1-Kontakte sichtbar
- [x] Profilbilder privat, Zugriff nur für Berechtigte über signierte URLs
- [x] Löschung von Profil, Listings und Bildern jederzeit möglich (`ON DELETE CASCADE`)
- [x] Kontaktdaten-Weitergabe nur nach aktiver Zustimmung (Vermittlungs-Flow fragt)
- [ ] Datenschutzerklärung + Impressum (Pflicht vor Go-Live — noch zu erstellen)

---

## 10. Getroffene Entscheidungen

1. **Stack:** Next.js + Supabase + Vercel ✓
2. **Graph-Library:** react-force-graph ✓
3. **Login:** v0.1 nur Google; Apple in v0.2 ✓

---

## 11. Ausstehende Arbeit / Backlog

Hier wird festgehalten, was bewusst aufgeschoben oder noch offen ist — damit nichts verloren geht.

### Vor Go-Live von v0.1 zwingend nötig
- [ ] Datenschutzerklärung + Impressum erstellen (rechtliche Pflicht)
- [ ] Offene Entscheidungen aus Abschnitt 10 klären (Stack, Graph-Lib, Apple-Login)

### Bewusst auf v0.2 verschoben
- [ ] **Individuelle Einladungslinks** statt einem festen Link pro Nutzer → `invites`-Tabelle ist bereits dafür vorbereitet; ergänzt wird ein `label`-Feld (z.B. "für Maria")
- [ ] **Tracking über welchen Link jemand kam** → später `via_token`-Feld in `connections` ergänzen (billige Migration, daher jetzt weggelassen)
- [ ] **Aktive Vermittlung über Ebene 2** (aktuell nur sichtbar, nicht vermittelbar)
- [ ] **Karma-Punktesystem** (in v0.1 nur als Wording/Framing vorhanden, keine Mechanik)
- [ ] **Apple-Login** (falls in v0.1 nur Google startet)
- [ ] Optional: automatische Benachrichtigung per Mail bei neuem Match

### Technische Schulden / später zu prüfen
- [ ] Performance der Netzwerk-Abfrage bei wachsenden Netzwerken (Ebene-2-Traversierung) — für v0.1 unkritisch, bei Wachstum Indizes/Caching prüfen
- [ ] Missbrauch des festen Links (jeder mit Link kann beitreten) — wird mit individuellen Links in v0.2 entschärft

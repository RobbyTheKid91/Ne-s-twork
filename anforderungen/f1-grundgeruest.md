# Nestwork v0.1 — Vibe-Prozess Dokumentation

---

## Schritt 0 — Feature-Definition

**Feature:** Nestwork v0.1 — Berlin Housing Network Tool

**Beschreibung:**
Eine mobile-first PWA für gut vernetzte Berliner, die Wohnungsgesuche und -angebote in ihrem Netzwerk sichtbar machen — bevor sie im Gespräch vergessen werden. Kernfunktion: Einladungslink teilen → Profil selbst ausfüllen → Matches im Netzwerk sehen → als Vermittler aktiv werden. Ein Profil kann suchen, anbieten, beides — oder ein reines Vermittler-Profil sein, das nur Kontakte verbindet.

**Einordnung:** Greenfield-Projekt, kein bestehender Code. Dieses Feature ist das gesamte v0.1.

**Scope v0.1:**
- Landing Page (`/`)
- Onboarding (erstes Profil + erste Kontakte einladen)
- Dashboard mit Netzwerk-Graph + Karten-Grid (`/dashboard`)
- Einladungs-Landing-Page (`/join/[token]`)
- Profil-Seite (`/profile`) — enthält Gesuch und/oder Angebot
- Match-Vermittlungs-Ansicht (innerhalb Dashboard)

**Technisch:**
- Mobile-first PWA (kein App Store, installierbar via "Add to Home Screen")
- Login über **Google- oder Apple-Account** (OAuth), kein eigenes Passwort
- Erster Nutzer ist Robert selbst (Login über Google) — startet das Netzwerk
- Dauerhafter Einladungslink pro Nutzer (`/join/[token]`)
- Teilbar via nativem Share-Button oder Kopieren
- Echtes Backend mit Auth, Netzwerklogik und Storage für Profilbilder
- **Durchgängig DSGVO-konform** (siehe eigener Abschnitt unten)

**Netzwerklogik:**
- Eine Verbindung ist beidseitig Ebene 1 — egal wer wen eingeladen hat
- Jeder Nutzer sieht sein Netzwerk bis Ebene 2 (direkte Kontakte + deren Kontakte)
- Ebene-2-Kontakte werden anonymisiert angezeigt
- **Vermittlungs-Regel:** Vermitteln (vorformulierter Text + Kontaktdaten) darf nur, wer zu *beiden* Parteien eine Ebene-1-Verbindung hat
- Match-Logik (alle Bedingungen müssen zusammen erfüllt sein):
  - **Wohnungstyp:** exakte Übereinstimmung (Ganze Wohnung / WG-Zimmer / Zwischenmiete)
  - **Preis:** Angebotspreis ≤ Budget des Suchenden (z.B. Sucher max. 800 €, Angebot 1–800 € → Match)
  - **Größe:** Angebotsgröße ≥ Mindestgröße des Suchenden
  - **Dauer:** nur bei Zwischenmiete relevant — Zeiträume müssen sich überschneiden; bei Ganzer Wohnung / WG-Zimmer nur Info-Feld

**Design:** Electric Pop — `#FAFAFA` Base, `#6B3CF6` Violett, `#F06292` Pink

**Bewusst ausgeschlossen (v0.1):** Chat, automatische E-Mails, Push-Notifications, Karma-System, Nutzer-Verifizierung, Native App, App Store, aktive Vermittlung über Ebene 2

**Ziele für v0.2:**
- Aktive Vermittlung auch über Ebene 2
- Individuelle Einladungslinks statt einem festen Link pro Nutzer (Tracking + Sicherheit)
- Optional: automatische Benachrichtigung per Mail

---

## Schritt 1 — User Stories

**US-0 — Login & Onboarding**
Als neuer Nutzer möchte ich mich mit meinem Google- oder Apple-Account anmelden und durch ein kurzes Onboarding geführt werden, damit ich sofort startklar bin — auch wenn mein Netzwerk noch leer ist.

**US-1 — Einladungslink teilen**
Als eingeloggter Nutzer möchte ich meinen dauerhaften Einladungslink per Share-Button oder Kopieren teilen, damit Kontakte sich direkt über diesen Link in meinem Netzwerk registrieren können.

**US-2 — Profil anlegen über Einladungslink**
Als neuer Nutzer möchte ich über einen Einladungslink ein Profil anlegen (suchen, anbieten oder beides, mit optionalem Profilbild), damit ich ohne Umwege Teil des Netzwerks werde.

**US-3 — Dashboard mit Matches**
Als eingeloggter Nutzer möchte ich auf meinem Dashboard sehen, wer in meinem Netzwerk sucht und wer anbietet, damit ich potenzielle Matches auf einen Blick erkenne.

**US-4 — Netzwerk-Graph**
Als eingeloggter Nutzer möchte ich meinen Netzwerk-Graphen sehen (ich im Zentrum, Ebene 1 und 2), damit das "ich kenne jemanden der jemanden kennt" für mich sichtbar wird.

**US-5 — Match-Vermittlung**
Als eingeloggter Nutzer möchte ich bei einem Angebot in meinem Netzwerk sehen, welche passenden Suchenden ich vermitteln kann, damit ich selbst entscheiden kann, wen ich zuerst verbinde.

**US-6 — Angebot/Gesuch verwalten**
Als Anbieter möchte ich mein Angebot pausieren, als vergeben markieren oder löschen können, damit ich nicht weiter angeschrieben werde sobald die Wohnung weg ist.

---

## Schritt 2 — Akzeptanzkriterien

**US-0 — Login & Onboarding**
- Login ausschließlich über Google- oder Apple-Account (OAuth), kein Passwort
- Nach erstem Login: geführtes Onboarding — erst eigenes Profil ausfüllen (Name, optional suchen/anbieten), dann Screen "Lad deine ersten 3 Kontakte ein" mit großem Share-Button
- Der allererste Nutzer (Robert) kann sich ohne Einladungslink anmelden und startet das Netzwerk
- Bei leerem Netzwerk ist der Leerzustand eine Handlungsaufforderung, keine Sackgasse

**US-1 — Einladungslink teilen**
- Jeder registrierte Nutzer hat einen dauerhaften, einzigartigen Link (`/join/[token]`)
- Ein Tippen auf "Teilen" öffnet den nativen Share-Dialog des Geräts
- Der Link ist auf dem Dashboard jederzeit sichtbar und per Klick kopierbar

**US-2 — Profil anlegen über Einladungslink**
- Der Einladungslink zeigt den Namen des Einladenden ("Jonas hat dich eingeladen")
- Registrierung über Google/Apple-Login
- Pflichtfelder: **Vor- und Nachname** (damit der Vermittler eindeutig zuordnen kann)
- Formular erlaubt: suchen, anbieten, beides gleichzeitig — oder keins von beidem (reines Vermittler-Profil)
- Ein reiner Vermittler nimmt am Netzwerk teil, lädt Kontakte ein und vermittelt, ohne selbst zu suchen oder anzubieten
- Framing im UI für diesen Modus: "Sei ein:e gute:r Freund:in und sammle Karma als Vermittler:in" — rein motivierende Botschaft, **kein** Punktesystem, kein Zähler, keine Logik dahinter
- Profilbild optional hochladbar
- Wohnungs-Felder: Typ (Ganze Wohnung / WG-Zimmer / Zwischenmiete), Dauer, Größe, Preis bzw. Budget
- Nach dem Speichern automatisch mit dem Einladenden verbunden (beidseitig Ebene 1)
- Nach dem Speichern eines Angebots: Bestätigungsmeldung "In deinem Netzwerk gibt es X Personen, die potentiell an deiner Wohnung interessiert sind" (X = vermittelbare Suchende auf Ebene 1)

**US-3 — Dashboard mit Matches**
- Ebene-1-Kontakte: vollständig sichtbar (Vor-/Nachname, Foto, Kriterien, E-Mail)
- Ebene-2-Kontakte: anonymisiert (kein Name, kein Foto, keine E-Mail — nur "Gesuch" oder "Angebot", Typ, Größe, Preis + "Kontakt von [Name]")
- Anonymisierung erfolgt **im Backend** — anonymisierte Daten werden gar nicht erst an den Client ausgeliefert
- Visueller Indikator markiert Matches zwischen Suchenden und Anbietenden
- Matches aus Ebene 2 zeigen den Zwischenknoten ("über Maria")

**US-4 — Netzwerk-Graph**
- Graph zeigt eingeloggten Nutzer im Zentrum
- Ebene 1 und Ebene 2 visuell unterscheidbar
- Ein Klick auf einen Knoten öffnet die Kontaktkarte (Ebene 1 vollständig, Ebene 2 anonymisiert)

**US-5 — Match-Vermittlung**
- Bei einem Angebot sieht der eingeloggte Nutzer eine Liste aller passenden Suchenden, die er vermitteln kann (= beide Parteien auf seiner Ebene 1)
- Pro Eintrag: Vor-/Nachname + Suchkriterien des Suchenden
- Auswahl einer Person → App zeigt vorformulierten Text: "Hey [Name des Anbietenden], ich kenn jemanden in meinem Netzwerk der/die eine [Typ, Größe, Preis] sucht. Darf ich deine Kontaktdaten weitergeben?"
- Text ist per Klick kopierbar — Jonas fügt ihn selbst in WhatsApp, Telegram o.ä. ein

**US-6 — Angebot/Gesuch verwalten**
- Ein Angebot hat einen Status: **aktiv / pausiert / vergeben**
- Der Anbieter kann selbst pausieren (sobald genug Anfragen kommen) oder auf "vergeben" setzen
- Pausierte und vergebene Angebote verschwinden sofort aus allen Match-Listen und Dashboards im Netzwerk
- Ein Angebot oder Gesuch kann vom Ersteller jederzeit mit einem Klick komplett gelöscht werden

---

## DSGVO-Anforderungen (durchgängig)

- Login nur über OAuth (Google/Apple) — keine eigene Passwortspeicherung
- Ebene-2-Anonymisierung im Backend erzwingen, nicht nur im Frontend (keine Namen, Fotos, E-Mails in der API-Antwort)
- E-Mail-Adressen nur für Ebene-1-Kontakte und nur im Vermittlungskontext sichtbar
- Profilbilder DSGVO-konform speichern; Zugriff nur für berechtigte Betrachter (Ebene 1)
- Nutzer kann eigene Daten und Angebote jederzeit löschen (Recht auf Löschung)
- Datenweitergabe (Kontaktdaten) passiert nur nach aktiver Zustimmung des Betroffenen (Vermittlungs-Flow fragt um Erlaubnis)
- Diese Punkte fließen verbindlich in die Architektur ein

---

## Schritt 2b — Feature-Check

Feature-Definition stimmt mit User Stories und Akzeptanzkriterien überein.

**Ergänzungen gegenüber ursprünglicher Definition:**
- Reines Vermittler-Profil möglich (weder suchen noch anbieten); Karma als Wording/Framing ("Sei ein:e gute:r Freund:in"), aber kein echtes Punktesystem (das bleibt v0.2-Kandidat)
- US-0: Login (Google/Apple OAuth) + geführtes Onboarding inkl. Cold-Start-Lösung
- Vor- und Nachname als Pflichtfeld, E-Mail der Ebene-1-Kontakte sichtbar
- Vermittlungs-Regel präzisiert: beidseitig Ebene 1 statt "nur direkte Kontakte"
- Match-Logik mathematisch definiert (Preis, Größe, Typ, Dauer nur bei Zwischenmiete)
- US-6: Angebots-Status (aktiv/pausiert/vergeben) gegen Doppelvermittlung
- Eigener DSGVO-Abschnitt, Anonymisierung im Backend
- Counter "X interessierte" auf vermittelbare Ebene-1-Suchende beschränkt
- Instagram-Verteilung gestrichen; fester Link in v0.1, individuelle Links als v0.2-Ziel

**Geändert:**
- Jonas schickt Link, Empfänger füllt Profil selbst aus (Jonas erstellt keine Karte für andere)

---

## Offene Anforderungen (noch nicht umgesetzt)

### Bezirks-Auswahl bei Gesuch und Angebot

Gesuche und Angebote sollen einen optionalen Bezirksfilter bekommen. Berlin hat 12 Bezirke:

1. Mitte
2. Friedrichshain-Kreuzberg
3. Pankow
4. Charlottenburg-Wilmersdorf
5. Spandau
6. Steglitz-Zehlendorf
7. Tempelhof-Schöneberg
8. Neukölln
9. Treptow-Köpenick
10. Marzahn-Hellersdorf
11. Lichtenberg
12. Reinickendorf

**Verhalten:**
- **Gesuch:** Alle 12 Bezirke sind per Default ausgewählt (Nutzer schränkt aktiv ein)
- **Angebot:** Kein Bezirk vorausgewählt (Anbieter wählt den konkreten Bezirk)
- UI: Multi-Select-Dropdown oder Chip-Auswahl (per Klick an/abwählbar)
- Bezirke fließen in die Match-Logik ein: Match nur wenn der Angebots-Bezirk in den Gesuchs-Bezirken enthalten ist

**Datenbankänderung erforderlich:**
- `listings`-Tabelle braucht eine neue Spalte, z.B. `districts TEXT[]` (Array der ausgewählten Bezirke)
- Migration als eigenes SQL-Skript anlegen

**Scope:** v0.1-Erweiterung — erst umsetzen wenn Listing-Verwaltung (Löschen/Pausieren) fertig ist.

---

## Schritt 2c — Refactoring-Check

Entfällt — Greenfield-Projekt, kein bestehender Code.

---

## Session Handoff — Join-Seite /join/[token] fertig

### Where it started
Fortsetzung: Onboarding-Flow war fertig. Ziel dieser Session: Join-Seite bauen —
neuer Nutzer öffnet Einladungslink, sieht wer ihn eingeladen hat, meldet sich an.

### Decisions locked + what shipped
- Join-Seite als Server Component (`src/app/join/[token]/page.tsx`)
- Zwei separate Queries statt JOIN (zuverlässiger mit Supabase RLS): erst invites, dann profiles
- Fehlermeldung bei ungültigem Token: "Dieser Einladungslink ist ungültig."
- Initialen-Kreis als Avatar-Fallback (Gradient violett → pink)
- `encodeURIComponent(token)` in der Login-URL
- Bild-Domains eingeschränkt in `next.config.ts` (*.supabase.co + lh3.googleusercontent.com)
- RLS-Policies für anonyme Nutzer ergänzt — beide bereits in Supabase ausgeführt:
  - `sql-04-rls-join-anon.sql` — invites für alle lesbar (token ist das Geheimnis)
  - `sql-05-rls-profiles-anon.sql` — profiles für alle lesbar (kein Passwort/E-Mail drin)
- sql-03-rls-fix-invites.sql aus letzter Session: ebenfalls bereits in Supabase ausgeführt

### Key files for next session
- `src/app/join/[token]/page.tsx` — Join-Seite
- `next.config.ts` — Bild-Domains
- `anforderungen/f1-grundgeruest.md` — vollständige Anforderungen
- `anforderungen/architektur.md` — Stack, Datenmodell, DSGVO

### Running state
- Background processes: none
- Dev servers / ports: none (npm run dev → localhost:3000)
- Open worktrees / branches: none

### Verification
- `npm run build` — fehlerfrei (zuletzt geprüft: ✓)
- `localhost:3000/join/[echter-token-aus-invites-tabelle]` → Name des Einladenden erscheint
- `localhost:3000/join/ungueltig` → Fehlermeldung erscheint
- "Jetzt beitreten" → `/login?invite_token=[token]` → Onboarding → Verbindung erstellt

### Deferred + open questions
- Deferred: /dashboard existiert noch nicht — nach Login landet man auf 404
- Deferred: /profile existiert noch nicht
- Deferred: Root-Seite / zeigt noch Next.js-Platzhalter
- Deferred: PWA-Icons public/icons/icon-192.png + icon-512.png fehlen noch
- Deferred: Storage-Bucket "avatars" in Supabase muss manuell angelegt werden

### Pick up here
/vibe-prozess aktivieren, dann Dashboard bauen: /dashboard mit Netzwerk-Karten und Match-Indikator (US-3).

---

## Session Handoff — Bezirks-Auswahl für Listings (12 Berliner Bezirke)

### Where it started
Fortsetzung des Nestwork-Projekts. Dashboard war fertig, nächstes Feature war offen. Robert wählte die Bezirks-Auswahl — 12 Berliner Bezirke als optionaler Filter bei Gesuch/Angebot, inkl. Match-Logik und DB-Migration.

### Decisions locked + what shipped
- DB-Migration ausgeführt: `listings.districts TEXT[] NOT NULL DEFAULT '{}'` — Script liegt unter `anforderungen/sql-06-districts.sql`, bereits in Supabase ausgeführt
- `Listing`-Typ erweitert um `districts?: string[] | null` — `src/app/dashboard/NetworkCard.tsx`
- `ListingInput` + Server Actions (`addListing`, `updateListing`) übergeben `districts` — `src/app/dashboard/actions.ts`
- Bezirks-Chip-UI im Modal: "Alle Bezirke"-Toggle + 12 Einzelchips; Gesuch-Default alle 12, Angebot-Default leer; `allSelected` nutzt `ALL_DISTRICTS.every(d => districts.includes(d))` — `src/app/dashboard/AddListingSheet.tsx`
- `isMatch()` prüft Bezirke: Angebots-Bezirk muss in Gesuchs-Bezirken enthalten sein; Angebot ohne Bezirk → kein Filter; Select-Query um `districts` erweitert — `src/app/dashboard/page.tsx`
- ListingCard zeigt Bezirke an (`Berlin · Mitte, Neukölln`) — `src/app/dashboard/OwnListings.tsx`
- `npm run build` fehlerfrei bestätigt
- Manuelle Abnahmetests durch Robert abgeschlossen

### Key files for next session
- `anforderungen/f1-grundgeruest.md` — vollständige Anforderungen, User Stories, offene Punkte
- `anforderungen/architektur.md` — Stack, Datenmodell, DSGVO
- `src/app/dashboard/page.tsx` — Match-Logik und Dashboard-Struktur
- `src/app/dashboard/AddListingSheet.tsx` — Modal mit Bezirks-UI

### Running state
- Background processes: none
- Dev servers / ports: none (npm run dev → localhost:3000)
- Open worktrees / branches: none

### Verification
- `npm run build` — fehlerfrei (zuletzt bestätigt ✓)
- `localhost:3000/dashboard` eingeloggt → Listing-Modal öffnen → Chip-Grid mit 12 Bezirken sichtbar
- Neues Gesuch → alle 12 vorausgewählt; neues Angebot → keine vorausgewählt
- Commit + Push noch ausstehend — macht Robert selbst

### Deferred + open questions
- Deferred: /profile — Seite fehlt noch komplett
- Deferred: / Landing Page — noch Next.js-Default-Template
- Deferred: Netzwerk-Graph (react-force-graph)
- Deferred: PWA-Icons public/icons/icon-192.png + icon-512.png — fehlen, 404 im Browser-Log
- Deferred: Supabase Storage-Bucket "avatars" manuell anlegen
- Open: Gesuch mit 0 Bezirken (alle manuell abgewählt) ist speicherbar — bewusst so gelassen (optional), aber keine Validierung vorhanden; bei Bedarf `handleSubmit` in `AddListingSheet.tsx` um Mindest-1-Bezirk-Check erweitern

### Pick up here
/vibe-prozess aktivieren, dann entscheiden ob /profile oder Landing Page / als nächstes kommt — beide sind eigenständige Features ohne weitere DB-Migration.

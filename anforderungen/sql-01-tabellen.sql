-- ============================================================
-- Nestwork v0.1 — Schritt 1: Tabellen + RLS Policies
-- Ausführen im Supabase SQL Editor
-- ============================================================

-- PROFILES: ein Eintrag pro Nutzer
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  email       TEXT NOT NULL,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Eigenes Profil lesen und bearbeiten
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_delete_own" ON profiles
  FOR DELETE USING (auth.uid() = id);


-- INVITES: Einladungslinks (eine Tabelle statt Spalte, für v0.2-Erweiterung)
CREATE TABLE invites (
  token       TEXT PRIMARY KEY,
  owner_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- Eigene Einladungslinks verwalten
CREATE POLICY "invites_select_own" ON invites
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "invites_insert_own" ON invites
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "invites_delete_own" ON invites
  FOR DELETE USING (auth.uid() = owner_id);


-- CONNECTIONS: wer hat wen eingeladen (beidseitige Verbindung)
CREATE TABLE connections (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inviter_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invitee_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (inviter_id, invitee_id)
);

ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- Eigene Verbindungen sehen (als Einlader oder Eingeladener)
CREATE POLICY "connections_select_own" ON connections
  FOR SELECT USING (
    auth.uid() = inviter_id OR auth.uid() = invitee_id
  );

-- Neue Verbindung nur als Eingeladener anlegen (beim Join-Flow)
CREATE POLICY "connections_insert_invitee" ON connections
  FOR INSERT WITH CHECK (auth.uid() = invitee_id);


-- LISTINGS: Gesuche und Angebote
CREATE TABLE listings (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  kind          TEXT NOT NULL CHECK (kind IN ('search', 'offer')),
  housing_type  TEXT NOT NULL CHECK (housing_type IN ('whole', 'wg_room', 'sublet')),
  size          INT,
  price         INT,
  duration_from DATE,
  duration_to   DATE,
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'taken')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Eigene Listings verwalten
CREATE POLICY "listings_select_own" ON listings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "listings_insert_own" ON listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "listings_update_own" ON listings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "listings_delete_own" ON listings
  FOR DELETE USING (auth.uid() = user_id);

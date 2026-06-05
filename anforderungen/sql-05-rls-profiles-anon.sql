-- ============================================================
-- Nestwork v0.1 — Schritt 5: Profiles lesbar für Join-Seite
-- Problem: Der Join von invites → profiles schlägt fehl weil
--          profiles-RLS anonyme Nutzer blockiert.
-- Lösung: Anonyme Nutzer dürfen profiles lesen — profiles
--         enthalten nur first_name, last_name, avatar_url,
--         keine E-Mails (die liegen in auth.users).
-- ============================================================

CREATE POLICY "profiles_select_public"
  ON profiles
  FOR SELECT
  USING (true);

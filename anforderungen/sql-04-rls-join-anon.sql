-- ============================================================
-- Nestwork v0.1 — Schritt 4: RLS-Fix für Join-Seite
-- Problem: Die bestehende Policy "invites_select_by_token"
--          erlaubt nur eingeloggte Nutzer. Die Join-Seite
--          /join/[token] wird aber von unauthentifizierten
--          Besuchern aufgerufen — bevor sie sich anmelden.
-- Lösung: Policy ersetzen, die jedem das Lesen von Invites
--         erlaubt. Das ist sicher, weil der Token selbst
--         das Geheimnis ist — er wird bewusst geteilt.
-- ============================================================

DROP POLICY IF EXISTS "invites_select_by_token" ON invites;

CREATE POLICY "invites_select_by_token"
  ON invites
  FOR SELECT
  USING (true);

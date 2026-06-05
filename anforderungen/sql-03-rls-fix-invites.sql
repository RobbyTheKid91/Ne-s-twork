-- ============================================================
-- Nestwork v0.1 — Schritt 3: RLS-Fix für Einladungstoken
-- Problem: Neue Nutzer können den Token des Einladers nicht
--          lesen, weil die bestehende Policy nur den eigenen
--          Token erlaubt. Für den Einladungslink-Flow muss
--          jeder eingeloggte Nutzer fremde Tokens nachschlagen
--          können (Tokens sind keine sensiblen Daten — sie
--          werden bewusst geteilt).
-- ============================================================

CREATE POLICY "invites_select_by_token"
  ON invites
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

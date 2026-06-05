-- ============================================================
-- Nestwork v0.1 — Schritt 2: Netzwerk- und Match-Funktionen
-- Erst ausführen NACHDEM Skript 1 erfolgreich war
-- ============================================================


-- -------------------------------------------------------
-- get_my_network()
-- Gibt das Netzwerk des eingeloggten Nutzers zurück.
-- Ebene 1: volle Daten (Name, Mail, Foto, Listings)
-- Ebene 2: anonymisiert — Name/Mail/Foto sind NULL,
--          nur Wohnungsdaten + "über [Name]" kommen raus.
-- DSGVO: Die geschwärzten Felder verlassen die DB nie.
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION get_my_network()
RETURNS TABLE (
  profile_id    UUID,
  level         INT,
  first_name    TEXT,
  last_name     TEXT,
  email         TEXT,
  avatar_url    TEXT,
  via_id        UUID,
  via_first_name TEXT,
  via_last_name  TEXT,
  listings      JSONB
)
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
AS $$
  WITH
  -- Ebene 1: alle direkten Verbindungen des eingeloggten Nutzers
  level1 AS (
    SELECT
      CASE WHEN inviter_id = auth.uid() THEN invitee_id ELSE inviter_id END AS profile_id
    FROM connections
    WHERE inviter_id = auth.uid() OR invitee_id = auth.uid()
  ),
  -- Ebene 2: Verbindungen der Ebene-1-Personen
  --          ohne den eingeloggten Nutzer selbst
  --          ohne Personen die bereits auf Ebene 1 sind
  level2 AS (
    SELECT DISTINCT ON (
      CASE WHEN c.inviter_id = l1.profile_id THEN c.invitee_id ELSE c.inviter_id END
    )
      CASE WHEN c.inviter_id = l1.profile_id THEN c.invitee_id ELSE c.inviter_id END AS profile_id,
      l1.profile_id AS via_id
    FROM connections c
    JOIN level1 l1 ON (c.inviter_id = l1.profile_id OR c.invitee_id = l1.profile_id)
    WHERE
      CASE WHEN c.inviter_id = l1.profile_id THEN c.invitee_id ELSE c.inviter_id END != auth.uid()
      AND CASE WHEN c.inviter_id = l1.profile_id THEN c.invitee_id ELSE c.inviter_id END
          NOT IN (SELECT profile_id FROM level1)
  )

  -- Ebene 1: volle Daten
  SELECT
    p.id,
    1,
    p.first_name,
    p.last_name,
    p.email,
    p.avatar_url,
    NULL::UUID,
    NULL::TEXT,
    NULL::TEXT,
    COALESCE(
      (SELECT jsonb_agg(jsonb_build_object(
        'id', l.id, 'kind', l.kind, 'housing_type', l.housing_type,
        'size', l.size, 'price', l.price, 'status', l.status,
        'duration_from', l.duration_from, 'duration_to', l.duration_to
      )) FROM listings l WHERE l.user_id = p.id AND l.status = 'active'),
      '[]'::jsonb
    )
  FROM profiles p
  JOIN level1 l1 ON p.id = l1.profile_id

  UNION ALL

  -- Ebene 2: anonymisiert (NULL für Name, Mail, Foto)
  SELECT
    p.id,
    2,
    NULL::TEXT,   -- first_name → anonymisiert
    NULL::TEXT,   -- last_name  → anonymisiert
    NULL::TEXT,   -- email      → anonymisiert
    NULL::TEXT,   -- avatar_url → anonymisiert
    l2.via_id,
    via_p.first_name,
    via_p.last_name,
    COALESCE(
      (SELECT jsonb_agg(jsonb_build_object(
        'id', l.id, 'kind', l.kind, 'housing_type', l.housing_type,
        'size', l.size, 'price', l.price, 'status', l.status,
        'duration_from', l.duration_from, 'duration_to', l.duration_to
      )) FROM listings l WHERE l.user_id = p.id AND l.status = 'active'),
      '[]'::jsonb
    )
  FROM profiles p
  JOIN level2 l2 ON p.id = l2.profile_id
  JOIN profiles via_p ON via_p.id = l2.via_id
$$;


-- -------------------------------------------------------
-- find_matches(offer_id)
-- Findet alle Suchenden auf Ebene 1 des eingeloggten
-- Nutzers, die zu einem bestimmten Angebot passen.
-- Grundlage für den Vermittlungs-Flow (US-5).
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION find_matches(p_offer_id UUID)
RETURNS TABLE (
  searcher_id   UUID,
  first_name    TEXT,
  last_name     TEXT,
  email         TEXT,
  listing_id    UUID,
  housing_type  TEXT,
  size          INT,
  price         INT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
AS $$
  WITH
  offer AS (
    SELECT * FROM listings
    WHERE id = p_offer_id AND kind = 'offer' AND status = 'active'
  ),
  level1 AS (
    SELECT CASE WHEN inviter_id = auth.uid() THEN invitee_id ELSE inviter_id END AS profile_id
    FROM connections
    WHERE inviter_id = auth.uid() OR invitee_id = auth.uid()
  )
  SELECT
    p.id, p.first_name, p.last_name, p.email,
    l.id, l.housing_type, l.size, l.price
  FROM listings l
  JOIN profiles p ON p.id = l.user_id
  JOIN level1 l1 ON l.user_id = l1.profile_id
  CROSS JOIN offer o
  WHERE
    l.kind = 'search'
    AND l.housing_type = o.housing_type
    AND o.price <= l.price
    AND o.size >= l.size
    AND (
      o.housing_type <> 'sublet'
      OR (
        l.duration_from IS NOT NULL AND l.duration_to IS NOT NULL
        AND o.duration_from <= l.duration_to
        AND o.duration_to >= l.duration_from
      )
    )
$$;


-- -------------------------------------------------------
-- count_interested(offer_id)
-- Zählt die passenden Suchenden auf Ebene 1.
-- Für die Bestätigungsmeldung nach dem Einstellen
-- eines Angebots: "X Personen könnten interessiert sein"
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION count_interested(p_offer_id UUID)
RETURNS INT
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
AS $$
  WITH
  offer AS (
    SELECT * FROM listings
    WHERE id = p_offer_id AND kind = 'offer' AND status = 'active'
  ),
  level1 AS (
    SELECT CASE WHEN inviter_id = auth.uid() THEN invitee_id ELSE inviter_id END AS profile_id
    FROM connections
    WHERE inviter_id = auth.uid() OR invitee_id = auth.uid()
  )
  SELECT COUNT(*)::INT
  FROM listings l
  JOIN level1 l1 ON l.user_id = l1.profile_id
  CROSS JOIN offer o
  WHERE
    l.kind = 'search'
    AND l.housing_type = o.housing_type
    AND o.price <= l.price
    AND o.size >= l.size
    AND (
      o.housing_type <> 'sublet'
      OR (
        l.duration_from IS NOT NULL AND l.duration_to IS NOT NULL
        AND o.duration_from <= l.duration_to
        AND o.duration_to >= l.duration_from
      )
    )
$$;

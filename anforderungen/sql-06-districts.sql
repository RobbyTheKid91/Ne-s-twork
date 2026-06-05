-- Migration: Bezirks-Spalte für Listings
-- Ausführen in Supabase SQL Editor

ALTER TABLE listings ADD COLUMN districts TEXT[] NOT NULL DEFAULT '{}';

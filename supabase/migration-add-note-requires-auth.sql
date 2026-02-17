-- Migration : ajouter les champs note et requires_auth à resource_proposals
-- Exécuter dans Supabase : SQL Editor > New Query

ALTER TABLE resource_proposals
  ADD COLUMN IF NOT EXISTS note TEXT,
  ADD COLUMN IF NOT EXISTS requires_auth BOOLEAN NOT NULL DEFAULT false;

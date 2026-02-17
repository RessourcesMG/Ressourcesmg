-- Bandeaux d'informations (announcements) gérés depuis l'espace webmaster
-- Exécuter dans Supabase : SQL Editor > New Query

CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Lecture publique : tous les visiteurs peuvent voir les annonces actives
CREATE POLICY "Lecture publique des annonces actives" ON announcements
  FOR SELECT USING (is_active = true);

-- Modification : uniquement via service role (API avec auth webmaster)
-- Pas de policy UPDATE/INSERT/DELETE pour les utilisateurs anonymes

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_announcements_created ON announcements(created_at DESC);

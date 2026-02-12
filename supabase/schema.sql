-- Exécuter ce script dans Supabase : SQL Editor > New Query
-- Crée la table pour les ressources personnalisées ajoutées par le webmaster

CREATE TABLE IF NOT EXISTS custom_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL,
  requires_auth BOOLEAN NOT NULL DEFAULT false,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE custom_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique" ON custom_resources
  FOR SELECT USING (true);

-- Tables pour l'édition des blocs par le webmaster
CREATE TABLE IF NOT EXISTS managed_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Circle',
  sort_order INT NOT NULL DEFAULT 0,
  is_specialty BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS managed_resources (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES managed_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL,
  requires_auth BOOLEAN NOT NULL DEFAULT false,
  note TEXT,
  sort_order INT NOT NULL DEFAULT 0
);

ALTER TABLE managed_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE managed_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique managed_categories" ON managed_categories FOR SELECT USING (true);
CREATE POLICY "Lecture publique managed_resources" ON managed_resources FOR SELECT USING (true);

-- Propositions de ressources (formulaire public)
CREATE TABLE IF NOT EXISTS resource_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  category_id TEXT REFERENCES managed_categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE resource_proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Insertion publique" ON resource_proposals FOR INSERT WITH CHECK (true);

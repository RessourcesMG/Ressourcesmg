-- Exécuter dans Supabase SQL Editor (après schema.sql)
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

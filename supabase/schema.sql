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

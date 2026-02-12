-- Propositions de ressources envoyées par les utilisateurs (formulaire public)
-- Exécuter dans Supabase : SQL Editor > New Query

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

-- Lecture : aucune (les propositions ne sont visibles que via l'API avec auth webmaster)
-- Insertion : politique permissive pour permettre les soumissions publiques via l'API
CREATE POLICY "Insertion publique" ON resource_proposals
  FOR INSERT WITH CHECK (true);

-- Lecture/Modification : uniquement via service role (API)
-- Pas de policy SELECT/UPDATE pour les utilisateurs anonymes

-- Table pour les clics sur les ressources
CREATE TABLE IF NOT EXISTS analytics_resource_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id TEXT NOT NULL,
  resource_name TEXT NOT NULL,
  category_id TEXT NOT NULL,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table pour les recherches effectuées
CREATE TABLE IF NOT EXISTS analytics_search_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  result_count INT NOT NULL DEFAULT 0,
  searched_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index pour les requêtes du dashboard
CREATE INDEX IF NOT EXISTS idx_analytics_clicks_resource ON analytics_resource_clicks(resource_id);
CREATE INDEX IF NOT EXISTS idx_analytics_clicks_at ON analytics_resource_clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_analytics_search_query ON analytics_search_queries(query);
CREATE INDEX IF NOT EXISTS idx_analytics_search_at ON analytics_search_queries(searched_at);

ALTER TABLE analytics_resource_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_search_queries ENABLE ROW LEVEL SECURITY;

-- Lecture : aucune (données sensibles, accessibles uniquement via API avec auth webmaster)
-- Insertion : publique (pour enregistrer les clics/recherches côté client)
CREATE POLICY "Insertion publique analytics_clicks" ON analytics_resource_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "Insertion publique analytics_search" ON analytics_search_queries FOR INSERT WITH CHECK (true);

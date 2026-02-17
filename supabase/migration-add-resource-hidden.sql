-- Migration pour ajouter le champ is_hidden aux ressources
-- Permet de masquer des ressources sans les supprimer

ALTER TABLE managed_resources 
ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT false;

-- Créer un index pour améliorer les performances lors du filtrage
CREATE INDEX IF NOT EXISTS idx_managed_resources_is_hidden 
ON managed_resources(is_hidden);

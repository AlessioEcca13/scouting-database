-- Migration: Create player_lists table
-- Description: Tabella per gestire liste di giocatori e formazioni

CREATE TABLE IF NOT EXISTS player_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  player_ids UUID[] DEFAULT '{}',
  formation TEXT DEFAULT '4-3-3',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index per ricerca veloce
CREATE INDEX IF NOT EXISTS idx_player_lists_created_at ON player_lists(created_at DESC);

-- Trigger per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_player_lists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_player_lists_updated_at
  BEFORE UPDATE ON player_lists
  FOR EACH ROW
  EXECUTE FUNCTION update_player_lists_updated_at();

-- Commenti
COMMENT ON TABLE player_lists IS 'Liste di giocatori per formazioni tattiche';
COMMENT ON COLUMN player_lists.name IS 'Nome della lista';
COMMENT ON COLUMN player_lists.description IS 'Descrizione opzionale della lista';
COMMENT ON COLUMN player_lists.player_ids IS 'Array di ID giocatori nella lista';
COMMENT ON COLUMN player_lists.formation IS 'Formazione tattica (es. 4-3-3, 4-4-2)';

-- ============================================
-- TABELLA TACTICAL_FORMATIONS
-- ============================================
-- Tabella per salvare le formazioni tattiche create dagli utenti

CREATE TABLE IF NOT EXISTS tactical_formations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  formation_type TEXT NOT NULL, -- es: '4-3-3', '4-4-2', etc.
  position_assignments JSONB NOT NULL DEFAULT '{}', -- { "LB_20_25": [player_id1, player_id2], ... }
  player_colors JSONB DEFAULT '{}', -- { player_id: "color_category", ... }
  display_attributes JSONB DEFAULT '{"team": true, "age": false, "role": true, "value": false}',
  field_color TEXT DEFAULT 'green', -- 'green', 'blue', 'red', 'gray'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_tactical_formations_created_at ON tactical_formations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tactical_formations_name ON tactical_formations(name);

-- RLS (Row Level Security) - Tutti possono leggere e scrivere
ALTER TABLE tactical_formations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tutti possono leggere formazioni"
  ON tactical_formations
  FOR SELECT
  USING (true);

CREATE POLICY "Tutti possono creare formazioni"
  ON tactical_formations
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Tutti possono aggiornare formazioni"
  ON tactical_formations
  FOR UPDATE
  USING (true);

CREATE POLICY "Tutti possono eliminare formazioni"
  ON tactical_formations
  FOR DELETE
  USING (true);

-- Trigger per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_tactical_formations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tactical_formations_updated_at
  BEFORE UPDATE ON tactical_formations
  FOR EACH ROW
  EXECUTE FUNCTION update_tactical_formations_updated_at();

-- Commenti
COMMENT ON TABLE tactical_formations IS 'Formazioni tattiche salvate dagli utenti';
COMMENT ON COLUMN tactical_formations.name IS 'Nome della formazione (es: 4-3-3 Offensivo)';
COMMENT ON COLUMN tactical_formations.formation_type IS 'Tipo di modulo (es: 4-3-3, 4-4-2)';
COMMENT ON COLUMN tactical_formations.position_assignments IS 'Assegnazione giocatori alle posizioni';
COMMENT ON COLUMN tactical_formations.player_colors IS 'Colori personalizzati per i giocatori';
COMMENT ON COLUMN tactical_formations.display_attributes IS 'Attributi da visualizzare (squadra, età, ruolo, valore)';
COMMENT ON COLUMN tactical_formations.field_color IS 'Colore del campo (green, blue, red, gray)';

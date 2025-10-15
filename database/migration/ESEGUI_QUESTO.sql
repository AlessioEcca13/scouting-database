-- ========================================
-- 🚀 SCRIPT MIGRAZIONE COMPLETO
-- ========================================
-- COPIA E INCOLLA QUESTO SCRIPT SU SUPABASE SQL EDITOR
-- ========================================

-- Aggiungi TUTTE le colonne mancanti
ALTER TABLE players ADD COLUMN IF NOT EXISTS contract_expiry VARCHAR(50);
ALTER TABLE players ADD COLUMN IF NOT EXISTS height_cm INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS weight_kg INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS market_value_numeric DECIMAL(10,2);
ALTER TABLE players ADD COLUMN IF NOT EXISTS market_value_updated VARCHAR(20);
ALTER TABLE players ADD COLUMN IF NOT EXISTS profile_image TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS natural_position VARCHAR(100);
ALTER TABLE players ADD COLUMN IF NOT EXISTS other_positions TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS birth_place VARCHAR(100);
ALTER TABLE players ADD COLUMN IF NOT EXISTS shirt_number INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS field_position_x DECIMAL(5,2);
ALTER TABLE players ADD COLUMN IF NOT EXISTS field_position_y DECIMAL(5,2);

-- Crea indici per performance
CREATE INDEX IF NOT EXISTS idx_players_contract_expiry ON players(contract_expiry);
CREATE INDEX IF NOT EXISTS idx_players_height_cm ON players(height_cm);
CREATE INDEX IF NOT EXISTS idx_players_market_value_numeric ON players(market_value_numeric DESC);
CREATE INDEX IF NOT EXISTS idx_players_natural_position ON players(natural_position);

-- Verifica che tutto sia stato creato
SELECT 
    column_name, 
    data_type
FROM 
    information_schema.columns
WHERE 
    table_name = 'players'
    AND column_name IN (
        'contract_expiry',
        'height_cm', 
        'weight_kg', 
        'market_value_numeric',
        'market_value_updated',
        'profile_image',
        'natural_position',
        'other_positions',
        'birth_place',
        'shirt_number',
        'field_position_x',
        'field_position_y'
    )
ORDER BY column_name;

-- ✅ FATTO! Se vedi 12 righe, la migrazione è completa.

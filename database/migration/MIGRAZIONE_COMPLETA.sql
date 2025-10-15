-- ========================================
-- 🚀 MIGRAZIONE COMPLETA - COPIA TUTTO
-- ========================================
-- Esegui questo script su Supabase SQL Editor
-- ========================================

-- 1. AGGIUNGI TUTTE LE COLONNE MANCANTI
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

-- 2. AGGIUNGI COMMENTI
COMMENT ON COLUMN players.contract_expiry IS 'Scadenza contratto';
COMMENT ON COLUMN players.height_cm IS 'Altezza in centimetri';
COMMENT ON COLUMN players.weight_kg IS 'Peso in kilogrammi';
COMMENT ON COLUMN players.market_value_numeric IS 'Valore di mercato in milioni €';
COMMENT ON COLUMN players.market_value_updated IS 'Data aggiornamento valore';
COMMENT ON COLUMN players.profile_image IS 'URL immagine profilo';
COMMENT ON COLUMN players.natural_position IS 'Ruolo naturale';
COMMENT ON COLUMN players.other_positions IS 'Altri ruoli possibili';
COMMENT ON COLUMN players.birth_place IS 'Luogo di nascita';
COMMENT ON COLUMN players.shirt_number IS 'Numero maglia';
COMMENT ON COLUMN players.field_position_x IS 'Coordinata X campo (0-100)';
COMMENT ON COLUMN players.field_position_y IS 'Coordinata Y campo (0-100)';

-- 3. CREA INDICI PER PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_players_contract_expiry ON players(contract_expiry);
CREATE INDEX IF NOT EXISTS idx_players_height_cm ON players(height_cm);
CREATE INDEX IF NOT EXISTS idx_players_market_value_numeric ON players(market_value_numeric DESC);
CREATE INDEX IF NOT EXISTS idx_players_natural_position ON players(natural_position);
CREATE INDEX IF NOT EXISTS idx_players_shirt_number ON players(shirt_number);

-- 4. VERIFICA COLONNE CREATE
SELECT 
    column_name, 
    data_type,
    is_nullable
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

-- ✅ FATTO! 
-- Se vedi 12 righe nella query sopra, la migrazione è completa.
-- Ora puoi aggiungere giocatori con tutti i nuovi campi!

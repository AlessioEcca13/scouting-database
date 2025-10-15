-- ========================================
-- MIGRAZIONE: Aggiungi Campi Transfermarkt
-- ========================================
-- Data: 11 Ottobre 2025
-- Descrizione: Aggiunge campi per integrazione Transfermarkt
-- ========================================

-- 1. AGGIUNGI NUOVE COLONNE
-- ========================================

-- Scadenza contratto (MANCANTE!)
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS contract_expiry VARCHAR(50);

-- Altezza in cm (intero)
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS height_cm INTEGER;

-- Peso in kg (intero)
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS weight_kg INTEGER;

-- Valore di mercato (float in milioni)
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS market_value_numeric DECIMAL(10,2);

-- Data ultimo aggiornamento valore di mercato
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS market_value_updated VARCHAR(20);

-- Immagine profilo (URL)
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS profile_image TEXT;

-- Ruolo naturale
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS natural_position VARCHAR(100);

-- Altri ruoli possibili
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS other_positions TEXT;

-- ========================================
-- 2. COMMENTI SULLE COLONNE
-- ========================================

COMMENT ON COLUMN players.height_cm IS 'Altezza in centimetri (es: 192)';
COMMENT ON COLUMN players.weight_kg IS 'Peso in kilogrammi (es: 85)';
COMMENT ON COLUMN players.market_value_numeric IS 'Valore di mercato in milioni di euro (es: 3.5)';
COMMENT ON COLUMN players.market_value_updated IS 'Data ultimo aggiornamento valore (es: 23/09/2025)';
COMMENT ON COLUMN players.profile_image IS 'URL immagine profilo da Transfermarkt';
COMMENT ON COLUMN players.natural_position IS 'Ruolo naturale del giocatore';
COMMENT ON COLUMN players.other_positions IS 'Altri ruoli in cui può giocare';

-- ========================================
-- 3. CREA INDICI PER PERFORMANCE (OPZIONALE)
-- ========================================

CREATE INDEX IF NOT EXISTS idx_players_height_cm ON players(height_cm);
CREATE INDEX IF NOT EXISTS idx_players_market_value_numeric ON players(market_value_numeric DESC);
CREATE INDEX IF NOT EXISTS idx_players_natural_position ON players(natural_position);

-- ========================================
-- 4. MIGRA DATI ESISTENTI (SE NECESSARIO)
-- ========================================

-- Se hai già dati nel campo 'height' come stringa (es: "1,92 m"),
-- puoi convertirli in height_cm con questo script:

/*
UPDATE players 
SET height_cm = (
    CASE 
        WHEN height ~ '^\d+,\d+' THEN 
            CAST(REPLACE(SUBSTRING(height FROM '^\d+,\d+'), ',', '.') AS DECIMAL) * 100
        WHEN height ~ '^\d+\.\d+' THEN 
            CAST(SUBSTRING(height FROM '^\d+\.\d+') AS DECIMAL) * 100
        WHEN height ~ '^\d+$' THEN 
            CAST(height AS INTEGER)
        ELSE NULL
    END
)
WHERE height IS NOT NULL AND height_cm IS NULL;
*/

-- Se hai già dati nel campo 'market_value' come stringa (es: "3,50 mln €"),
-- puoi convertirli in market_value_numeric:

/*
UPDATE players 
SET market_value_numeric = (
    CASE 
        WHEN market_value ~ '\d+[,.]?\d*\s*mln' THEN 
            CAST(REPLACE(REGEXP_REPLACE(market_value, '[^\d,.]', '', 'g'), ',', '.') AS DECIMAL)
        WHEN market_value ~ '\d+[,.]?\d*\s*k' THEN 
            CAST(REPLACE(REGEXP_REPLACE(market_value, '[^\d,.]', '', 'g'), ',', '.') AS DECIMAL) / 1000
        ELSE NULL
    END
)
WHERE market_value IS NOT NULL AND market_value_numeric IS NULL;
*/

-- ========================================
-- 5. VERIFICA LE MODIFICHE
-- ========================================

-- Controlla le nuove colonne
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'players'
    AND column_name IN (
        'height_cm', 
        'weight_kg', 
        'market_value_numeric',
        'market_value_updated',
        'profile_image',
        'natural_position',
        'other_positions'
    )
ORDER BY 
    ordinal_position;

-- Conta i record
SELECT 
    COUNT(*) as total_players,
    COUNT(height_cm) as with_height,
    COUNT(weight_kg) as with_weight,
    COUNT(market_value_numeric) as with_market_value,
    COUNT(profile_image) as with_image
FROM 
    players;

-- ========================================
-- ✅ MIGRAZIONE COMPLETATA!
-- ========================================

-- Le nuove colonne sono state aggiunte con successo.
-- Ora puoi importare giocatori da Transfermarkt con tutti i dati.

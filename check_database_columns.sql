-- ========================================
-- VERIFICA COLONNE DATABASE
-- ========================================
-- Esegui questo script nel SQL Editor di Supabase

-- 1. Verifica se le colonne height_cm e weight_kg esistono
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'players' 
AND column_name IN ('height_cm', 'weight_kg', 'market_value', 'market_value_numeric')
ORDER BY column_name;

-- 2. Verifica i dati di un giocatore specifico (Penrice)
SELECT 
    name,
    height_cm,
    weight_kg,
    market_value,
    market_value_numeric,
    specific_position,
    natural_position,
    other_positions
FROM players 
WHERE name ILIKE '%penrice%'
LIMIT 5;

-- 3. Conta quanti giocatori hanno altezza/peso
SELECT 
    COUNT(*) as totale_giocatori,
    COUNT(height_cm) as con_altezza,
    COUNT(weight_kg) as con_peso,
    COUNT(market_value) as con_valore
FROM players;

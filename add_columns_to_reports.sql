-- ESEGUI QUESTO SQL DIRETTAMENTE SU SUPABASE SQL EDITOR
-- https://djfwugugjbgflgfdbufd.supabase.co/project/djfwugugjbgflgfdbufd/sql

-- 1. Aggiungi colonne current_value e potential_value
ALTER TABLE player_reports 
ADD COLUMN IF NOT EXISTS current_value INTEGER CHECK (current_value >= 1 AND current_value <= 5);

ALTER TABLE player_reports 
ADD COLUMN IF NOT EXISTS potential_value INTEGER CHECK (potential_value >= 1 AND potential_value <= 5);

-- 2. Imposta valori default per record esistenti (se ce ne sono)
UPDATE player_reports 
SET current_value = 3 
WHERE current_value IS NULL;

UPDATE player_reports 
SET potential_value = 3 
WHERE potential_value IS NULL;

-- 3. Verifica che le colonne siano state aggiunte
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'player_reports'
AND column_name IN ('current_value', 'potential_value')
ORDER BY ordinal_position;

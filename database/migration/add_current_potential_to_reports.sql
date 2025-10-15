-- ========================================
-- AGGIUNGE VALUTAZIONI ATTUALE E POTENZIALE AI REPORT
-- ========================================
-- Aggiunge le colonne current_value e potential_value alla tabella player_reports
-- per allinearla con i campi presenti nel form

-- 1. Aggiungi colonne current_value e potential_value
ALTER TABLE player_reports 
ADD COLUMN IF NOT EXISTS current_value INTEGER CHECK (current_value >= 1 AND current_value <= 5),
ADD COLUMN IF NOT EXISTS potential_value INTEGER CHECK (potential_value >= 1 AND potential_value <= 5);

-- 2. Imposta valori default per record esistenti (se ce ne sono)
UPDATE player_reports 
SET current_value = 3 
WHERE current_value IS NULL;

UPDATE player_reports 
SET potential_value = 3 
WHERE potential_value IS NULL;

-- 3. Commenti per documentazione
COMMENT ON COLUMN player_reports.current_value IS 'Valutazione valore attuale del giocatore (1-5 stelle)';
COMMENT ON COLUMN player_reports.potential_value IS 'Valutazione potenziale del giocatore (1-5 stelle)';

-- ========================================
-- VERIFICA INSTALLAZIONE
-- ========================================

-- Verifica che le colonne siano state aggiunte
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'player_reports'
AND column_name IN ('current_value', 'potential_value')
ORDER BY ordinal_position;

-- ✅ FATTO! Le colonne current_value e potential_value sono state aggiunte

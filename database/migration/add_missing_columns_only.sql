-- Script semplice per aggiungere solo i campi mancanti
-- Esegui questo se hai già la tabella player_reports

-- Aggiunge match_name se non esiste
ALTER TABLE player_reports 
ADD COLUMN IF NOT EXISTS match_name VARCHAR(255);

-- Aggiunge athletic_data_rating se non esiste
ALTER TABLE player_reports 
ADD COLUMN IF NOT EXISTS athletic_data_rating VARCHAR(10);

-- Verifica i campi aggiunti
SELECT 
    column_name, 
    data_type,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'player_reports'
AND column_name IN ('match_name', 'athletic_data_rating')
ORDER BY column_name;

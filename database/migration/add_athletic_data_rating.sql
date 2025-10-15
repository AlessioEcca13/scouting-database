-- Aggiunge il campo athletic_data_rating alla tabella player_reports
-- Questo campo è visibile solo quando check_type = 'Dati'

ALTER TABLE player_reports 
ADD COLUMN IF NOT EXISTS athletic_data_rating VARCHAR(10);

-- Commento per documentazione
COMMENT ON COLUMN player_reports.athletic_data_rating IS 'Valutazione dati atletici: 🔴 (Scarso), 🟠 (Insufficiente), 🟡 (Sufficiente), 🟢 (Buono), 🏆 (Top). Visibile solo se check_type = Dati';

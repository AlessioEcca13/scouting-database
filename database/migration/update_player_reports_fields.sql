-- Aggiorna i campi della tabella player_reports per allinearsi al nuovo schema

-- Aggiunge il campo match_name (nome della partita es: "Juve-Milan")
ALTER TABLE player_reports 
ADD COLUMN IF NOT EXISTS match_name VARCHAR(255);

-- Aggiunge il campo athletic_data_rating (valutazione dati atletici)
ALTER TABLE player_reports 
ADD COLUMN IF NOT EXISTS athletic_data_rating VARCHAR(10);

-- Rimuove i vecchi campi se esistono (uno alla volta per evitare errori)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'player_reports' AND column_name = 'competition') THEN
        ALTER TABLE player_reports DROP COLUMN competition;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'player_reports' AND column_name = 'opponent_team') THEN
        ALTER TABLE player_reports DROP COLUMN opponent_team;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'player_reports' AND column_name = 'matches_watched') THEN
        ALTER TABLE player_reports DROP COLUMN matches_watched;
    END IF;
END $$;

-- Aggiorna il default del check_type
ALTER TABLE player_reports 
ALTER COLUMN check_type SET DEFAULT 'Live';

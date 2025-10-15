-- Aggiunge il campo is_scouted per distinguere giocatori con report da segnalazioni

-- Aggiunge il campo is_scouted (default true per compatibilità con dati esistenti)
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS is_scouted BOOLEAN DEFAULT true;

-- Commento per documentazione
COMMENT ON COLUMN players.is_scouted IS 'true = Giocatore con report (Database), false = Segnalazione senza report';

-- Crea indice per performance
CREATE INDEX IF NOT EXISTS idx_players_is_scouted ON players(is_scouted);

-- Verifica
SELECT 
    column_name, 
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'players'
AND column_name = 'is_scouted';

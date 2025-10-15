-- Aggiunge il campo signaler_name alla tabella players
-- Questo campo identifica chi ha segnalato il giocatore

ALTER TABLE players 
ADD COLUMN IF NOT EXISTS signaler_name TEXT;

-- Commento per documentare il campo
COMMENT ON COLUMN players.signaler_name IS 'Nome della persona che ha segnalato il giocatore (es: Alessio, Roberto)';

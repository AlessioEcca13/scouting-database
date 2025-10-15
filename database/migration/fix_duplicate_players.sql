-- Migration: Fix duplicate players
-- Description: Rimuove giocatori duplicati e aggiunge constraint UNIQUE sul nome

-- STEP 1: Trova e mostra i duplicati (per verifica)
-- Esegui questa query per vedere quali giocatori sono duplicati
SELECT name, COUNT(*) as count, STRING_AGG(id::text, ', ') as ids
FROM players
GROUP BY name
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- STEP 2: Elimina i duplicati mantenendo solo il record più recente per ogni nome
-- Questa query elimina tutti i duplicati tranne quello con l'ID più alto (più recente)
DELETE FROM players a
USING (
  SELECT name, MAX(id) as max_id
  FROM players
  GROUP BY name
  HAVING COUNT(*) > 1
) b
WHERE a.name = b.name
AND a.id < b.max_id;

-- STEP 3: Aggiungi constraint UNIQUE sul nome per prevenire futuri duplicati
-- NOTA: Questo fallirà se ci sono ancora duplicati, quindi esegui prima lo STEP 2
ALTER TABLE players
ADD CONSTRAINT players_name_unique UNIQUE (name);

-- STEP 4: Crea un indice per migliorare le performance delle ricerche per nome
CREATE INDEX IF NOT EXISTS idx_players_name ON players(name);

-- STEP 5: (Opzionale) Se vuoi permettere duplicati ma solo con team diverso
-- Commenta lo STEP 3 e usa questo invece:
-- ALTER TABLE players
-- ADD CONSTRAINT players_name_team_unique UNIQUE (name, team);

-- Verifica finale: controlla che non ci siano più duplicati
SELECT name, COUNT(*) as count
FROM players
GROUP BY name
HAVING COUNT(*) > 1;
-- Questa query dovrebbe restituire 0 righe se tutto è andato bene

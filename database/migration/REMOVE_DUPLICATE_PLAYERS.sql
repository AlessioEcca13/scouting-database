-- ============================================
-- RIMUOVI GIOCATORI DUPLICATI
-- ============================================
-- Questo script trova e rimuove giocatori duplicati
-- mantenendo solo il primo inserito (più vecchio)

-- STEP 1: Trova duplicati (stesso nome + anno nascita)
SELECT 
  name,
  birth_year,
  COUNT(*) as count,
  STRING_AGG(id::text, ', ') as ids
FROM players
GROUP BY name, birth_year
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC;

-- STEP 2: Per ogni gruppo di duplicati, mantieni solo il primo (created_at più vecchio)
-- ATTENZIONE: Questo elimina i duplicati! Esegui solo se sei sicuro!

-- Esempio per Finn Surman (sostituisci con i tuoi duplicati)
-- DELETE FROM players 
-- WHERE name = 'Finn Surman' 
-- AND birth_year = 2002
-- AND id NOT IN (
--   SELECT id 
--   FROM players 
--   WHERE name = 'Finn Surman' AND birth_year = 2002
--   ORDER BY created_at ASC 
--   LIMIT 1
-- );

-- STEP 3: Script automatico per rimuovere TUTTI i duplicati
-- ATTENZIONE: Esegui solo dopo aver verificato i duplicati!

WITH duplicates AS (
  SELECT 
    name,
    birth_year,
    nationality,
    MIN(created_at) as first_created
  FROM players
  GROUP BY name, birth_year, nationality
  HAVING COUNT(*) > 1
),
to_keep AS (
  SELECT p.id
  FROM players p
  INNER JOIN duplicates d 
    ON p.name = d.name 
    AND p.birth_year = d.birth_year 
    AND COALESCE(p.nationality, '') = COALESCE(d.nationality, '')
    AND p.created_at = d.first_created
)
DELETE FROM players
WHERE id IN (
  SELECT p.id
  FROM players p
  INNER JOIN duplicates d 
    ON p.name = d.name 
    AND p.birth_year = d.birth_year 
    AND COALESCE(p.nationality, '') = COALESCE(d.nationality, '')
  WHERE p.id NOT IN (SELECT id FROM to_keep)
);

-- STEP 4: Verifica che non ci siano più duplicati
SELECT 
  name,
  birth_year,
  nationality,
  COUNT(*) as count
FROM players
GROUP BY name, birth_year, nationality
HAVING COUNT(*) > 1;

-- Dovrebbe restituire 0 righe se tutto è ok

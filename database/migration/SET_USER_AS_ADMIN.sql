-- ============================================
-- IMPOSTA UTENTE COME ADMIN
-- ============================================

-- STEP 1: Trova il tuo user ID
-- Guarda nella console del browser dopo il login, vedrai:
-- 👤 Profilo caricato: tua-email@example.com (user)
-- Oppure esegui questa query per vedere tutti gli utenti:

SELECT id, email, role, is_active 
FROM users_profiles 
ORDER BY created_at DESC;

-- STEP 2: Aggiorna il ruolo a 'admin'
-- Sostituisci 'TUO_USER_ID' con l'ID trovato sopra

UPDATE users_profiles 
SET role = 'admin' 
WHERE id = 'TUO_USER_ID';

-- Oppure se conosci la tua email:
UPDATE users_profiles 
SET role = 'admin' 
WHERE email = 'tua-email@example.com';

-- STEP 3: Verifica il cambiamento
SELECT id, email, role, is_active 
FROM users_profiles 
WHERE email = 'tua-email@example.com';

-- Dovrebbe mostrare: role = 'admin'

-- ============================================
-- NOTA: Con il bypass attivo, il ruolo viene
-- determinato dall'email, non dal database.
-- Quindi questo script funzionerà solo quando
-- riabiliteremo la query al database.
-- ============================================

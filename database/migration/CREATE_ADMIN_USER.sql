-- ============================================
-- CREA ACCOUNT ADMIN CON ACCESSO COMPLETO
-- ============================================

-- STEP 1: Prima crea l'utente tramite Supabase Dashboard
-- Authentication → Users → Add User
-- Email: admin@scouting.com
-- Password: Admin123!
-- Conferma email automaticamente

-- STEP 2: Dopo aver creato l'utente, prendi il suo ID e inseriscilo qui sotto
-- Sostituisci 'USER_ID_QUI' con l'ID reale dell'utente appena creato

-- Inserisci o aggiorna il profilo admin
INSERT INTO users_profiles (id, email, role, is_active, created_at)
VALUES (
  'USER_ID_QUI', -- Sostituisci con l'ID dell'utente creato
  'admin@scouting.com',
  'admin',
  true,
  NOW()
)
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'admin',
  is_active = true;

-- STEP 3: Verifica che il profilo sia stato creato
SELECT id, email, role, is_active 
FROM users_profiles 
WHERE email = 'admin@scouting.com';

-- ============================================
-- CREDENZIALI ADMIN
-- ============================================
-- Email: admin@scouting.com
-- Password: Admin123!
-- Ruolo: admin
-- Accesso: COMPLETO a tutte le funzionalità

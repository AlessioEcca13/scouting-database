-- ============================================
-- VERIFICA SE PROFILO UTENTE ESISTE
-- ============================================

-- 1. Conta quanti profili ci sono
SELECT COUNT(*) as total_profiles FROM users_profiles;

-- 2. Mostra tutti i profili (primi 10)
SELECT id, email, role, created_at 
FROM users_profiles 
ORDER BY created_at DESC 
LIMIT 10;

-- 3. Cerca il profilo specifico dell'utente che sta avendo problemi
-- Sostituisci con il tuo user ID: cb9911bb-4017-4dac-bed6-e627405802ef
SELECT * 
FROM users_profiles 
WHERE id = 'cb9911bb-4017-4dac-bed6-e627405802ef';

-- 4. Verifica struttura tabella
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users_profiles'
ORDER BY ordinal_position;

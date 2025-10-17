-- ============================================
-- TEST QUERY RLS - Verifica Performance
-- ============================================
-- Esegui questa query su Supabase SQL Editor per testare la velocità

-- 1. Verifica quali policies sono attive
SELECT 
  policyname,
  cmd,
  qual as "using_clause",
  with_check
FROM pg_policies
WHERE tablename = 'users_profiles'
ORDER BY policyname;

-- 2. Test query semplice (dovrebbe essere istantanea)
-- Sostituisci 'YOUR_USER_ID' con il tuo user ID reale
-- SELECT * FROM users_profiles WHERE id = 'YOUR_USER_ID';

-- 3. Se la query sopra è lenta (> 1 secondo), le policies sono il problema
-- In quel caso, esegui FIX_RLS_FINAL.sql

-- 4. Dopo aver eseguito FIX_RLS_FINAL.sql, ri-esegui questo test
-- La query dovrebbe essere istantanea (< 100ms)

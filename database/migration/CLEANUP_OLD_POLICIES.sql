-- ============================================
-- CLEANUP POLICIES VECCHIE - users_profiles
-- ============================================
-- Rimuovi le policies duplicate/vecchie che causano conflitti

-- Rimuovi le 3 policies vecchie duplicate
DROP POLICY IF EXISTS "insert_own_profile" ON users_profiles;
DROP POLICY IF EXISTS "select_all_profiles" ON users_profiles;
DROP POLICY IF EXISTS "update_own_profile" ON users_profiles;

-- Verifica che siano rimaste solo le 4 policies nuove
SELECT 
  policyname,
  cmd,
  qual as "using_clause"
FROM pg_policies
WHERE tablename = 'users_profiles'
ORDER BY policyname;

-- Dovrebbero rimanere solo:
-- 1. authenticated_delete_own
-- 2. authenticated_insert_own
-- 3. authenticated_select_all
-- 4. authenticated_update_own

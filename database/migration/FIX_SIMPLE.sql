-- ============================================
-- FIX TIMEOUT - VERSIONE SEMPLICE
-- ============================================
-- Script minimalista per risolvere il timeout
-- Copia e incolla TUTTO nel SQL Editor di Supabase
-- ============================================

-- 1. Rimuovi tutte le policy vecchie
DROP POLICY IF EXISTS "Users can view own profile" ON users_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON users_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON users_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON users_profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON users_profiles;
DROP POLICY IF EXISTS "select_all_profiles" ON users_profiles;
DROP POLICY IF EXISTS "update_own_profile" ON users_profiles;
DROP POLICY IF EXISTS "insert_own_profile" ON users_profiles;

-- 2. Crea le nuove policy (semplici, senza ricorsione)
CREATE POLICY "select_all_profiles"
  ON users_profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "update_own_profile"
  ON users_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "insert_own_profile"
  ON users_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 3. Assicurati che RLS sia abilitato
ALTER TABLE users_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Verifica (mostra le policy create)
SELECT 
  policyname,
  cmd as operation
FROM pg_policies 
WHERE tablename = 'users_profiles'
ORDER BY policyname;

-- 5. Test query (deve essere istantanea)
SELECT COUNT(*) as total_users FROM users_profiles;

-- Fix RLS Policies per users_profiles
-- Problema: ricorsione infinita nelle policy che controllano il ruolo

-- 1. Rimuovi le policy esistenti con ricorsione
DROP POLICY IF EXISTS "Users can view own profile" ON users_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON users_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON users_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON users_profiles;

-- 2. Policy SELECT semplice: tutti gli utenti autenticati possono vedere tutti i profili
CREATE POLICY "Authenticated users can view all profiles"
  ON users_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- 3. Policy UPDATE: solo il proprio profilo
CREATE POLICY "Users can update own profile"
  ON users_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Verifica
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd
FROM pg_policies 
WHERE tablename = 'users_profiles';

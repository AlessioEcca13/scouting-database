-- ============================================
-- FIX DEFINITIVO RLS POLICIES - users_profiles
-- ============================================
-- Problema: Query timeout durante login con password salvata
-- Causa: RLS policies ricorsive o troppo complesse
-- Soluzione: Policies semplici e dirette senza ricorsione

-- STEP 1: Disabilita RLS temporaneamente per debug
ALTER TABLE users_profiles DISABLE ROW LEVEL SECURITY;

-- STEP 2: Rimuovi TUTTE le policies esistenti (incluse quelle nuove)
DROP POLICY IF EXISTS "Users can view own profile" ON users_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON users_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON users_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON users_profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON users_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON users_profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON users_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users_profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON users_profiles;
DROP POLICY IF EXISTS "authenticated_select_all" ON users_profiles;
DROP POLICY IF EXISTS "authenticated_insert_own" ON users_profiles;
DROP POLICY IF EXISTS "authenticated_update_own" ON users_profiles;
DROP POLICY IF EXISTS "authenticated_delete_own" ON users_profiles;

-- STEP 3: Riabilita RLS
ALTER TABLE users_profiles ENABLE ROW LEVEL SECURITY;

-- STEP 4: Crea policies SEMPLICI e NON RICORSIVE

-- SELECT: Tutti gli utenti autenticati possono vedere tutti i profili
-- IMPORTANTE: Usa solo auth.uid(), NON fare query alla tabella stessa
CREATE POLICY "authenticated_select_all"
  ON users_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Solo per il proprio profilo (durante registrazione)
CREATE POLICY "authenticated_insert_own"
  ON users_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- UPDATE: Solo il proprio profilo
CREATE POLICY "authenticated_update_own"
  ON users_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- DELETE: Solo il proprio profilo (opzionale, di solito non serve)
CREATE POLICY "authenticated_delete_own"
  ON users_profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- STEP 5: Verifica policies create
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'users_profiles'
ORDER BY policyname;

-- STEP 6: Test query (esegui dopo aver applicato le policies)
-- Sostituisci 'YOUR_USER_ID' con il tuo user ID
-- SELECT * FROM users_profiles WHERE id = 'YOUR_USER_ID';

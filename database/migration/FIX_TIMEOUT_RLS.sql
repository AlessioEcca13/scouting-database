-- ============================================
-- FIX TIMEOUT CARICAMENTO PROFILO
-- ============================================
-- Problema: Le policy RLS su users_profiles causano ricorsione infinita
-- Soluzione: Policy semplificate senza ricorsione
--
-- ISTRUZIONI:
-- 1. Vai su Supabase Dashboard → SQL Editor
-- 2. Copia e incolla TUTTO questo file
-- 3. Premi RUN (o Cmd/Ctrl + Enter)
-- ============================================

-- ============================================
-- STEP 1: Rimuovi tutte le policy esistenti
-- ============================================
DROP POLICY IF EXISTS "Users can view own profile" ON users_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON users_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON users_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON users_profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON users_profiles;

-- ============================================
-- STEP 2: Crea policy semplificate SENZA ricorsione
-- ============================================

-- Policy 1: SELECT - Tutti gli utenti autenticati possono vedere tutti i profili
-- (Semplice e senza ricorsione)
CREATE POLICY "select_all_profiles"
  ON users_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy 2: UPDATE - Gli utenti possono aggiornare solo il proprio profilo
-- (Usa auth.uid() direttamente, senza query ricorsive)
CREATE POLICY "update_own_profile"
  ON users_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 3: INSERT - Solo per nuovi utenti (tramite trigger)
CREATE POLICY "insert_own_profile"
  ON users_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- ============================================
-- STEP 3: Assicurati che RLS sia abilitato
-- ============================================
ALTER TABLE users_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- VERIFICA FINALE
-- ============================================

-- Mostra le policy create
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

-- Verifica che RLS sia abilitato
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'users_profiles';

-- Test query (dovrebbe funzionare istantaneamente)
SELECT 
  id, 
  email, 
  full_name, 
  role,
  scout_name
FROM users_profiles
LIMIT 5;

-- ============================================
-- RISULTATO ATTESO
-- ============================================
-- Dovresti vedere:
-- 1. 3 policy: select_all_profiles, update_own_profile, insert_own_profile
-- 2. RLS abilitato (rls_enabled = true)
-- 3. Lista dei profili utenti (se esistono)
--
-- Se vedi questi risultati, il problema è risolto!
-- Ricarica l'app React e il login dovrebbe funzionare senza timeout.
-- ============================================

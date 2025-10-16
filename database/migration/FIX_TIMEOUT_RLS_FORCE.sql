-- ============================================
-- FIX TIMEOUT - VERSIONE FORZATA
-- ============================================
-- Questa versione FORZA la rimozione di tutte le policy
-- e ricrea quelle corrette da zero
-- ============================================

-- STEP 1: Disabilita temporaneamente RLS per permettere le modifiche
ALTER TABLE users_profiles DISABLE ROW LEVEL SECURITY;

-- STEP 2: Rimuovi TUTTE le policy esistenti (anche quelle con nomi diversi)
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'users_profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON users_profiles', pol.policyname);
        RAISE NOTICE 'Rimossa policy: %', pol.policyname;
    END LOOP;
END $$;

-- STEP 3: Verifica che tutte le policy siano state rimosse
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename = 'users_profiles';
    
    IF policy_count > 0 THEN
        RAISE EXCEPTION 'Ancora % policy presenti! Rimuovile manualmente.', policy_count;
    ELSE
        RAISE NOTICE '✅ Tutte le policy rimosse con successo';
    END IF;
END $$;

-- STEP 4: Crea le nuove policy SEMPLICI (senza ricorsione)

-- Policy 1: SELECT - Tutti gli autenticati vedono tutti i profili
CREATE POLICY "select_all_profiles"
  ON users_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy 2: UPDATE - Solo il proprio profilo
CREATE POLICY "update_own_profile"
  ON users_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 3: INSERT - Solo per nuovi utenti
CREATE POLICY "insert_own_profile"
  ON users_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- STEP 5: Riabilita RLS
ALTER TABLE users_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- VERIFICA FINALE
-- ============================================

-- Mostra le policy create
SELECT 
  '=== POLICY FINALI ===' as info,
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies 
WHERE tablename = 'users_profiles'
ORDER BY policyname;

-- Test query (deve essere ISTANTANEA)
SELECT 
  '=== TEST QUERY ===' as info,
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
  COUNT(CASE WHEN role = 'scout' THEN 1 END) as scouts
FROM users_profiles;

-- Mostra alcuni profili
SELECT 
  '=== PROFILI ESISTENTI ===' as info,
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
-- 1. Messaggi "✅ Creata policy: ..."
-- 2. 3 policy: select_all_profiles, update_own_profile, insert_own_profile
-- 3. Test query completata ISTANTANEAMENTE
-- 4. Lista dei profili utenti
--
-- Se tutto è OK, ricarica l'app React e prova il login!
-- ============================================

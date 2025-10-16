-- ============================================
-- VERIFICA STATO RLS - Esegui questo PRIMA del fix
-- ============================================
-- Questo script mostra lo stato attuale delle policy RLS
-- per capire se il fix è stato applicato o meno
-- ============================================

-- 1. Verifica che la tabella users_profiles esista
SELECT 
  'Tabella users_profiles' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'users_profiles') 
    THEN '✅ Esiste' 
    ELSE '❌ Non esiste' 
  END as status;

-- 2. Verifica se RLS è abilitato
SELECT 
  'RLS Status' as check_type,
  CASE 
    WHEN rowsecurity THEN '✅ Abilitato' 
    ELSE '❌ Disabilitato' 
  END as status
FROM pg_tables 
WHERE tablename = 'users_profiles';

-- 3. Mostra TUTTE le policy attuali
SELECT 
  '=== POLICY ATTUALI ===' as info,
  policyname,
  cmd as operation,
  CASE 
    WHEN policyname LIKE '%select_all_profiles%' THEN '✅ Policy corretta'
    WHEN policyname LIKE '%Admins%' THEN '❌ Policy problematica (ricorsione)'
    ELSE '⚠️ Policy da verificare'
  END as status
FROM pg_policies 
WHERE tablename = 'users_profiles'
ORDER BY policyname;

-- 4. Mostra il CODICE delle policy (per vedere se hanno ricorsione)
SELECT 
  policyname,
  cmd,
  qual as using_clause,
  with_check
FROM pg_policies 
WHERE tablename = 'users_profiles'
ORDER BY policyname;

-- 5. Test query veloce (dovrebbe essere istantanea se il fix è applicato)
-- NOTA: Questa query potrebbe andare in timeout se il problema persiste
-- In quel caso, interrompi l'esecuzione (Cmd/Ctrl + C)
SELECT 
  'Test Query' as check_type,
  COUNT(*) as num_profiles
FROM users_profiles;

-- ============================================
-- INTERPRETAZIONE RISULTATI
-- ============================================
-- 
-- SE VEDI:
-- - Policy "select_all_profiles" → ✅ Fix applicato
-- - Policy "Admins can view all profiles" → ❌ Fix NON applicato
-- - Query timeout → ❌ Problema RLS ancora presente
-- 
-- AZIONE:
-- - Se il fix NON è applicato → Esegui FIX_TIMEOUT_RLS.sql
-- - Se il fix È applicato ma c'è ancora timeout → Problema diverso
-- ============================================

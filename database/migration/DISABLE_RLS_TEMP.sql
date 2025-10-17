-- ============================================
-- DISABILITA RLS TEMPORANEAMENTE - users_profiles
-- ============================================
-- Questo disabilita completamente RLS per testare se è la causa del timeout
-- ATTENZIONE: Meno sicuro, ma utile per debug

-- Disabilita RLS sulla tabella users_profiles
ALTER TABLE users_profiles DISABLE ROW LEVEL SECURITY;

-- Verifica che RLS sia disabilitato
SELECT 
  schemaname,
  tablename,
  rowsecurity as "RLS_enabled"
FROM pg_tables
WHERE tablename = 'users_profiles';

-- Dovrebbe mostrare: RLS_enabled = false

-- Se dopo questo il timeout sparisce, allora il problema sono le policies
-- In quel caso, possiamo lavorare su policies ancora più semplici

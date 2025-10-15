-- Fix RLS per player_reports
-- Esegui questo nel SQL Editor di Supabase

-- Abilita RLS
ALTER TABLE player_reports ENABLE ROW LEVEL SECURITY;

-- Rimuovi policy esistenti se presenti
DROP POLICY IF EXISTS "player_reports_select_policy" ON player_reports;
DROP POLICY IF EXISTS "player_reports_insert_policy" ON player_reports;
DROP POLICY IF EXISTS "player_reports_update_policy" ON player_reports;
DROP POLICY IF EXISTS "player_reports_delete_policy" ON player_reports;

-- Policy: Tutti gli utenti autenticati possono leggere tutti i report
CREATE POLICY "player_reports_select_policy" ON player_reports
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Tutti gli utenti autenticati possono inserire report
CREATE POLICY "player_reports_insert_policy" ON player_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Tutti gli utenti autenticati possono aggiornare report
CREATE POLICY "player_reports_update_policy" ON player_reports
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Tutti gli utenti autenticati possono eliminare report
CREATE POLICY "player_reports_delete_policy" ON player_reports
  FOR DELETE
  TO authenticated
  USING (true);

-- Verifica le policy create
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'player_reports'
ORDER BY policyname;

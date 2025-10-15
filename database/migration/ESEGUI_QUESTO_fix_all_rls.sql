-- ============================================
-- FIX COMPLETO RLS - ESEGUI QUESTO FILE
-- ============================================
-- Copia e incolla TUTTO questo file nel SQL Editor di Supabase
-- e premi RUN (o Cmd/Ctrl + Enter)

-- ============================================
-- 1. PLAYERS
-- ============================================
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "players_select_policy" ON players;
DROP POLICY IF EXISTS "players_insert_policy" ON players;
DROP POLICY IF EXISTS "players_update_policy" ON players;
DROP POLICY IF EXISTS "players_delete_policy" ON players;

CREATE POLICY "players_select_policy" ON players
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "players_insert_policy" ON players
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "players_update_policy" ON players
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "players_delete_policy" ON players
  FOR DELETE TO authenticated USING (true);

-- ============================================
-- 2. PLAYER_LISTS
-- ============================================
ALTER TABLE player_lists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "player_lists_select_policy" ON player_lists;
DROP POLICY IF EXISTS "player_lists_insert_policy" ON player_lists;
DROP POLICY IF EXISTS "player_lists_update_policy" ON player_lists;
DROP POLICY IF EXISTS "player_lists_delete_policy" ON player_lists;

CREATE POLICY "player_lists_select_policy" ON player_lists
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "player_lists_insert_policy" ON player_lists
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "player_lists_update_policy" ON player_lists
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "player_lists_delete_policy" ON player_lists
  FOR DELETE TO authenticated USING (true);

-- ============================================
-- 3. PLAYER_REPORTS
-- ============================================
ALTER TABLE player_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "player_reports_select_policy" ON player_reports;
DROP POLICY IF EXISTS "player_reports_insert_policy" ON player_reports;
DROP POLICY IF EXISTS "player_reports_update_policy" ON player_reports;
DROP POLICY IF EXISTS "player_reports_delete_policy" ON player_reports;

CREATE POLICY "player_reports_select_policy" ON player_reports
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "player_reports_insert_policy" ON player_reports
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "player_reports_update_policy" ON player_reports
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "player_reports_delete_policy" ON player_reports
  FOR DELETE TO authenticated USING (true);

-- ============================================
-- 4. USER_PROFILES (se esiste)
-- ============================================
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_profiles') THEN
    ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "user_profiles_select_policy" ON user_profiles;
    DROP POLICY IF EXISTS "user_profiles_insert_policy" ON user_profiles;
    DROP POLICY IF EXISTS "user_profiles_update_policy" ON user_profiles;
    
    CREATE POLICY "user_profiles_select_policy" ON user_profiles
      FOR SELECT TO authenticated USING (true);
    
    CREATE POLICY "user_profiles_insert_policy" ON user_profiles
      FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "user_profiles_update_policy" ON user_profiles
      FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================
-- VERIFICA FINALE
-- ============================================
-- Mostra tutte le policy create
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('players', 'player_lists', 'player_reports', 'user_profiles')
ORDER BY tablename, policyname;

-- Mostra stato RLS per tutte le tabelle
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('players', 'player_lists', 'player_reports', 'user_profiles')
ORDER BY tablename;

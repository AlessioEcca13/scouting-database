-- Migration: Add RLS policies for all tables
-- Description: Abilita Row Level Security e crea policy per accesso dati

-- ============================================
-- PLAYER_LISTS - Liste giocatori
-- ============================================

-- Abilita RLS
ALTER TABLE player_lists ENABLE ROW LEVEL SECURITY;

-- Policy: Tutti gli utenti autenticati possono leggere tutte le liste
CREATE POLICY "player_lists_select_policy" ON player_lists
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Tutti gli utenti autenticati possono inserire liste
CREATE POLICY "player_lists_insert_policy" ON player_lists
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Tutti gli utenti autenticati possono aggiornare liste
CREATE POLICY "player_lists_update_policy" ON player_lists
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Tutti gli utenti autenticati possono eliminare liste
CREATE POLICY "player_lists_delete_policy" ON player_lists
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- PLAYERS - Giocatori
-- ============================================

-- Verifica se RLS è già abilitato, altrimenti abilitalo
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'players' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE players ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Elimina policy esistenti se ci sono conflitti
DROP POLICY IF EXISTS "players_select_policy" ON players;
DROP POLICY IF EXISTS "players_insert_policy" ON players;
DROP POLICY IF EXISTS "players_update_policy" ON players;
DROP POLICY IF EXISTS "players_delete_policy" ON players;

-- Policy: Tutti gli utenti autenticati possono leggere tutti i giocatori
CREATE POLICY "players_select_policy" ON players
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Tutti gli utenti autenticati possono inserire giocatori
CREATE POLICY "players_insert_policy" ON players
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Tutti gli utenti autenticati possono aggiornare giocatori
CREATE POLICY "players_update_policy" ON players
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Tutti gli utenti autenticati possono eliminare giocatori
CREATE POLICY "players_delete_policy" ON players
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- PLAYER_REPORTS - Report giocatori
-- ============================================

-- Verifica se la tabella esiste
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'player_reports'
  ) THEN
    -- Abilita RLS se non già abilitato
    IF NOT EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename = 'player_reports' 
      AND rowsecurity = true
    ) THEN
      ALTER TABLE player_reports ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Elimina policy esistenti
    DROP POLICY IF EXISTS "player_reports_select_policy" ON player_reports;
    DROP POLICY IF EXISTS "player_reports_insert_policy" ON player_reports;
    DROP POLICY IF EXISTS "player_reports_update_policy" ON player_reports;
    DROP POLICY IF EXISTS "player_reports_delete_policy" ON player_reports;

    -- Crea nuove policy
    CREATE POLICY "player_reports_select_policy" ON player_reports
      FOR SELECT
      TO authenticated
      USING (true);

    CREATE POLICY "player_reports_insert_policy" ON player_reports
      FOR INSERT
      TO authenticated
      WITH CHECK (true);

    CREATE POLICY "player_reports_update_policy" ON player_reports
      FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);

    CREATE POLICY "player_reports_delete_policy" ON player_reports
      FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;

-- ============================================
-- USER_PROFILES - Profili utente
-- ============================================

-- Verifica se la tabella esiste
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'user_profiles'
  ) THEN
    -- Abilita RLS se non già abilitato
    IF NOT EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename = 'user_profiles' 
      AND rowsecurity = true
    ) THEN
      ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Elimina policy esistenti
    DROP POLICY IF EXISTS "user_profiles_select_policy" ON user_profiles;
    DROP POLICY IF EXISTS "user_profiles_insert_policy" ON user_profiles;
    DROP POLICY IF EXISTS "user_profiles_update_policy" ON user_profiles;

    -- Policy: Gli utenti possono vedere tutti i profili
    CREATE POLICY "user_profiles_select_policy" ON user_profiles
      FOR SELECT
      TO authenticated
      USING (true);

    -- Policy: Gli utenti possono inserire solo il proprio profilo
    CREATE POLICY "user_profiles_insert_policy" ON user_profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);

    -- Policy: Gli utenti possono aggiornare solo il proprio profilo
    CREATE POLICY "user_profiles_update_policy" ON user_profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================
-- Verifica finale
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
ORDER BY tablename, policyname;

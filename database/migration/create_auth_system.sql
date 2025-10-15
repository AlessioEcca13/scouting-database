-- Migration: Create Authentication System
-- Description: Sistema di autenticazione con ruoli e permessi

-- ============================================
-- STEP 1: Crea tabella users_profiles
-- ============================================
CREATE TABLE IF NOT EXISTS users_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'scout', 'viewer')),
  scout_name TEXT, -- Nome dello scout per collegamento con player_reports
  can_add_players BOOLEAN DEFAULT false,
  can_edit_players BOOLEAN DEFAULT false,
  can_delete_players BOOLEAN DEFAULT false,
  can_add_reports BOOLEAN DEFAULT false,
  can_view_all_reports BOOLEAN DEFAULT false,
  can_manage_lists BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STEP 2: Indici per performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_profiles_email ON users_profiles(email);
CREATE INDEX IF NOT EXISTS idx_users_profiles_role ON users_profiles(role);
CREATE INDEX IF NOT EXISTS idx_users_profiles_scout_name ON users_profiles(scout_name);

-- ============================================
-- STEP 3: Trigger per aggiornare updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_users_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_users_profiles_updated_at
  BEFORE UPDATE ON users_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_users_profiles_updated_at();

-- ============================================
-- STEP 4: Funzione per creare profilo automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Nuovo Utente'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'viewer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger per creare profilo quando si registra un nuovo utente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STEP 5: Inserisci utenti predefiniti
-- ============================================
-- NOTA: Questi utenti devono essere creati prima in Supabase Auth
-- Vai su Authentication → Users → Add User

-- Esempio di come inserire profili manualmente:
-- INSERT INTO users_profiles (id, email, full_name, role, scout_name, can_add_players, can_edit_players, can_delete_players, can_add_reports, can_view_all_reports, can_manage_lists)
-- VALUES 
--   ('uuid-admin', 'admin@lamecca.com', 'Admin', 'admin', NULL, true, true, true, true, true, true),
--   ('uuid-roberto', 'roberto@lamecca.com', 'Roberto', 'scout', 'Roberto', true, true, false, true, false, true),
--   ('uuid-alessio', 'alessio@lamecca.com', 'Alessio', 'scout', 'Alessio', true, true, false, true, false, true);

-- ============================================
-- STEP 6: Policies RLS (Row Level Security)
-- ============================================

-- Abilita RLS sulla tabella
ALTER TABLE users_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Gli utenti possono vedere il proprio profilo
CREATE POLICY "Users can view own profile"
  ON users_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Gli admin possono vedere tutti i profili
CREATE POLICY "Admins can view all profiles"
  ON users_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Gli admin possono modificare tutti i profili
CREATE POLICY "Admins can update all profiles"
  ON users_profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Gli utenti possono aggiornare il proprio profilo (solo alcuni campi)
CREATE POLICY "Users can update own profile"
  ON users_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = (SELECT role FROM users_profiles WHERE id = auth.uid()) -- Non possono cambiare il proprio ruolo
  );

-- ============================================
-- STEP 7: Funzione helper per verificare permessi
-- ============================================
CREATE OR REPLACE FUNCTION check_user_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  has_permission BOOLEAN;
BEGIN
  SELECT 
    CASE permission_name
      WHEN 'can_add_players' THEN can_add_players
      WHEN 'can_edit_players' THEN can_edit_players
      WHEN 'can_delete_players' THEN can_delete_players
      WHEN 'can_add_reports' THEN can_add_reports
      WHEN 'can_view_all_reports' THEN can_view_all_reports
      WHEN 'can_manage_lists' THEN can_manage_lists
      ELSE false
    END INTO has_permission
  FROM users_profiles
  WHERE id = auth.uid() AND is_active = true;
  
  RETURN COALESCE(has_permission, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 8: View per ruoli predefiniti
-- ============================================
CREATE OR REPLACE VIEW role_permissions AS
SELECT 
  'admin' as role,
  'Amministratore' as role_display,
  true as can_add_players,
  true as can_edit_players,
  true as can_delete_players,
  true as can_add_reports,
  true as can_view_all_reports,
  true as can_manage_lists
UNION ALL
SELECT 
  'scout' as role,
  'Scout' as role_display,
  true as can_add_players,
  true as can_edit_players,
  false as can_delete_players,
  true as can_add_reports,
  false as can_view_all_reports,
  true as can_manage_lists
UNION ALL
SELECT 
  'viewer' as role,
  'Visualizzatore' as role_display,
  false as can_add_players,
  false as can_edit_players,
  false as can_delete_players,
  false as can_add_reports,
  true as can_view_all_reports,
  false as can_manage_lists;

-- ============================================
-- STEP 9: Commenti
-- ============================================
COMMENT ON TABLE users_profiles IS 'Profili utenti con ruoli e permessi';
COMMENT ON COLUMN users_profiles.role IS 'Ruolo: admin, scout, viewer';
COMMENT ON COLUMN users_profiles.scout_name IS 'Nome scout per collegamento con player_reports';
COMMENT ON COLUMN users_profiles.can_add_players IS 'Permesso di aggiungere giocatori';
COMMENT ON COLUMN users_profiles.can_edit_players IS 'Permesso di modificare giocatori';
COMMENT ON COLUMN users_profiles.can_delete_players IS 'Permesso di eliminare giocatori';
COMMENT ON COLUMN users_profiles.can_add_reports IS 'Permesso di compilare report';
COMMENT ON COLUMN users_profiles.can_view_all_reports IS 'Permesso di vedere tutti i report (anche di altri scout)';
COMMENT ON COLUMN users_profiles.can_manage_lists IS 'Permesso di gestire liste e formazioni';

-- ============================================
-- VERIFICA FINALE
-- ============================================
-- Verifica che la tabella sia stata creata
SELECT 'users_profiles table created successfully' as status;

-- Mostra i ruoli disponibili
SELECT * FROM role_permissions;

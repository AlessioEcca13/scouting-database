-- Elimina tabelle se esistono (per reset)
DROP TABLE IF EXISTS player_history CASCADE;
DROP TABLE IF EXISTS players CASCADE;

-- Abilita UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabella principale calciatori
CREATE TABLE players (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Dati anagrafici
    name VARCHAR(255) NOT NULL,
    birth_year INTEGER,
    team VARCHAR(255),
    nationality VARCHAR(100),
    
    -- Informazioni tecniche
    general_role VARCHAR(100),
    specific_position VARCHAR(100),
    functions_labels TEXT,
    preferred_foot VARCHAR(20) CHECK (preferred_foot IN ('Destro', 'Sinistro', 'Ambidestro')),
    
    -- Caratteristiche fisiche
    athleticism TEXT,
    athletic_evaluation INTEGER CHECK (athletic_evaluation >= 1 AND athletic_evaluation <= 5),
    key_characteristics TEXT,
    
    -- Valutazioni
    potential_value INTEGER CHECK (potential_value >= 1 AND potential_value <= 5),
    current_value INTEGER CHECK (current_value >= 1 AND current_value <= 5),
    data_potential_value INTEGER CHECK (data_potential_value >= 1 AND data_potential_value <= 5),
    
    -- Note e feedback
    notes TEXT,
    transfermarket_link TEXT,
    director_feedback VARCHAR(100),
    check_type VARCHAR(100),
    outcome VARCHAR(255),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Campi aggiuntivi
    profile_image TEXT,
    videos JSONB DEFAULT '[]'::jsonb,
    tags TEXT[],
    is_archived BOOLEAN DEFAULT FALSE
);

-- Indici per performance
CREATE INDEX idx_players_name ON players(name);
CREATE INDEX idx_players_team ON players(team);
CREATE INDEX idx_players_role ON players(general_role);
CREATE INDEX idx_players_year ON players(birth_year);
CREATE INDEX idx_players_potential ON players(potential_value);
CREATE INDEX idx_players_archived ON players(is_archived);

-- Trigger per updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_players_updated_at BEFORE UPDATE
    ON players FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabella storico modifiche
CREATE TABLE player_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    changed_by UUID REFERENCES auth.users(id),
    change_date TIMESTAMPTZ DEFAULT NOW(),
    change_type VARCHAR(50),
    old_data JSONB,
    new_data JSONB,
    change_notes TEXT
);

-- Row Level Security (RLS)
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_history ENABLE ROW LEVEL SECURITY;

-- Policy: tutti possono leggere
CREATE POLICY "Players are viewable by everyone" 
    ON players FOR SELECT 
    USING (true);

-- Policy: solo utenti autenticati possono inserire
CREATE POLICY "Players are insertable by authenticated users" 
    ON players FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: solo utenti autenticati possono aggiornare
CREATE POLICY "Players are updatable by authenticated users" 
    ON players FOR UPDATE 
    USING (auth.uid() IS NOT NULL);
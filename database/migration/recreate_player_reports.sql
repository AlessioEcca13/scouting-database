-- ========================================
-- RICREA TABELLA PLAYER_REPORTS CON SCHEMA AGGIORNATO
-- ========================================
-- ATTENZIONE: Questo script elimina e ricrea la tabella
-- Tutti i report esistenti verranno persi!

-- 1. Elimina la tabella esistente
DROP TABLE IF EXISTS player_reports CASCADE;

-- 2. Ricrea la tabella con lo schema corretto
CREATE TABLE player_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    
    -- Informazioni scout (chi ha compilato)
    scout_name VARCHAR(255) NOT NULL,
    scout_role VARCHAR(100),
    report_date TIMESTAMP DEFAULT NOW(),
    
    -- Tipo di check
    check_type VARCHAR(50) DEFAULT 'Live',
    
    -- Contesto osservazione (visibile solo se check_type != 'Dati')
    match_name VARCHAR(255),
    match_date DATE,
    
    -- Valutazione dati atletici (visibile solo se check_type = 'Dati')
    athletic_data_rating VARCHAR(10),
    
    -- Valutazione finale (A, B, C, D)
    final_rating VARCHAR(1) CHECK (final_rating IN ('A', 'B', 'C', 'D')),
    
    -- Feedback testuale
    strengths TEXT,
    weaknesses TEXT,
    notes TEXT,
    
    -- Raccomandazione
    recommendation VARCHAR(100),
    priority VARCHAR(50) DEFAULT 'Media',
    
    -- Feedback direttore
    director_feedback TEXT,
    director_feedback_date TIMESTAMP,
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Crea indici per performance
CREATE INDEX idx_player_reports_player_id ON player_reports(player_id);
CREATE INDEX idx_player_reports_scout_name ON player_reports(scout_name);
CREATE INDEX idx_player_reports_check_type ON player_reports(check_type);
CREATE INDEX idx_player_reports_final_rating ON player_reports(final_rating);
CREATE INDEX idx_player_reports_priority ON player_reports(priority);

-- 4. Abilita Row Level Security
ALTER TABLE player_reports ENABLE ROW LEVEL SECURITY;

-- 5. Policy per permettere a tutti di leggere
CREATE POLICY "Allow public read access" ON player_reports
    FOR SELECT USING (true);

-- 6. Policy per permettere a tutti di inserire
CREATE POLICY "Allow public insert access" ON player_reports
    FOR INSERT WITH CHECK (true);

-- 7. Policy per permettere a tutti di aggiornare
CREATE POLICY "Allow public update access" ON player_reports
    FOR UPDATE USING (true);

-- 8. Policy per permettere a tutti di eliminare
CREATE POLICY "Allow public delete access" ON player_reports
    FOR DELETE USING (true);

-- 9. Funzione per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_player_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Trigger per aggiornare updated_at
DROP TRIGGER IF EXISTS trigger_update_player_reports_updated_at ON player_reports;
CREATE TRIGGER trigger_update_player_reports_updated_at
    BEFORE UPDATE ON player_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_player_reports_updated_at();

-- 11. Verifica lo schema creato
SELECT 
    column_name, 
    data_type,
    character_maximum_length,
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'player_reports'
ORDER BY ordinal_position;

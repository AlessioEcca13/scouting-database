-- ========================================
-- SISTEMA MULTI-REPORT PER GIOCATORI
-- ========================================
-- Permette a più scout di inserire report per lo stesso giocatore

-- 1. Crea tabella player_reports
-- Ogni report è una valutazione indipendente dello stesso giocatore
CREATE TABLE IF NOT EXISTS player_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    
    -- Informazioni scout (chi ha compilato)
    scout_name VARCHAR(255) NOT NULL,
    scout_role VARCHAR(100), -- Es: "Direttore Sportivo", "Scout", "Allenatore"
    report_date TIMESTAMP DEFAULT NOW(),
    
    -- Tipo di check
    check_type VARCHAR(50) DEFAULT 'Live', -- Live, Video, Video/Live, Dati
    
    -- Contesto osservazione (visibile solo se check_type != 'Dati')
    match_name VARCHAR(255), -- es: "Juve-Milan"
    match_date DATE,
    
    -- Valutazione dati atletici (visibile solo se check_type = 'Dati')
    athletic_data_rating VARCHAR(10), -- 🔴🟠🟡🟢🏆
    
    -- VALUTAZIONE FINALE (A, B, C, D) - Solo valutazione qualitativa dello scout
    final_rating VARCHAR(1) CHECK (final_rating IN ('A', 'B', 'C', 'D')),
    
    -- FEEDBACK TESTUALE - Tutti i report hanno gli stessi campi
    strengths TEXT,
    weaknesses TEXT,
    notes TEXT,
    
    -- RACCOMANDAZIONE - Tutti i report hanno gli stessi campi
    recommendation VARCHAR(100), -- Acquistare, Monitorare, Scartare, Approfondire
    priority VARCHAR(50) DEFAULT 'Media', -- Bassa, Media, Alta, Urgente
    
    -- FEEDBACK DIRETTORE (aggiunto dopo, non nel form iniziale)
    director_feedback TEXT,
    director_name VARCHAR(255),
    director_feedback_date TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT fk_player FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

-- 2. Crea indici per ricerche veloci
CREATE INDEX IF NOT EXISTS idx_player_reports_player_id ON player_reports(player_id);
CREATE INDEX IF NOT EXISTS idx_player_reports_scout_name ON player_reports(scout_name);
CREATE INDEX IF NOT EXISTS idx_player_reports_report_date ON player_reports(report_date DESC);
CREATE INDEX IF NOT EXISTS idx_player_reports_priority ON player_reports(priority);

-- 3. Trigger per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_player_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_player_reports_updated_at
    BEFORE UPDATE ON player_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_player_reports_updated_at();

-- 4. Abilita Row Level Security (RLS)
ALTER TABLE player_reports ENABLE ROW LEVEL SECURITY;

-- Policy per lettura (tutti possono leggere)
CREATE POLICY "Enable read access for all users" ON player_reports
    FOR SELECT USING (true);

-- Policy per inserimento (tutti possono inserire)
CREATE POLICY "Enable insert access for all users" ON player_reports
    FOR INSERT WITH CHECK (true);

-- Policy per aggiornamento (tutti possono aggiornare)
CREATE POLICY "Enable update access for all users" ON player_reports
    FOR UPDATE USING (true);

-- Policy per eliminazione (tutti possono eliminare)
CREATE POLICY "Enable delete access for all users" ON player_reports
    FOR DELETE USING (true);

-- 5. Commenti per documentazione
COMMENT ON TABLE player_reports IS 'Report di scouting multipli per ogni giocatore';
COMMENT ON COLUMN player_reports.scout_name IS 'Nome dello scout che ha compilato il report';
COMMENT ON COLUMN player_reports.match_date IS 'Data della partita osservata (opzionale)';
COMMENT ON COLUMN player_reports.overall_rating IS 'Valutazione complessiva 1-5 stelle';
COMMENT ON COLUMN player_reports.recommendation IS 'Raccomandazione finale (es: Acquistare, Monitorare, Scartare)';

-- 6. Vista per statistiche aggregate
CREATE OR REPLACE VIEW player_reports_summary AS
SELECT 
    p.id as player_id,
    p.name as player_name,
    COUNT(pr.id) as total_reports,
    ROUND(AVG(pr.overall_rating), 2) as avg_overall_rating,
    ROUND(AVG(pr.technical_rating), 2) as avg_technical_rating,
    ROUND(AVG(pr.physical_rating), 2) as avg_physical_rating,
    ROUND(AVG(pr.tactical_rating), 2) as avg_tactical_rating,
    ROUND(AVG(pr.mental_rating), 2) as avg_mental_rating,
    MAX(pr.report_date) as last_report_date,
    ARRAY_AGG(DISTINCT pr.scout_name) as scouts
FROM players p
LEFT JOIN player_reports pr ON p.id = pr.player_id
GROUP BY p.id, p.name;

COMMENT ON VIEW player_reports_summary IS 'Vista aggregata con statistiche dei report per giocatore';

-- 7. Funzione per ottenere il report più recente
CREATE OR REPLACE FUNCTION get_latest_report(p_player_id UUID)
RETURNS TABLE (
    report_id UUID,
    scout_name VARCHAR,
    report_date TIMESTAMP,
    overall_rating INTEGER,
    notes TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pr.id,
        pr.scout_name,
        pr.report_date,
        pr.overall_rating,
        pr.notes
    FROM player_reports pr
    WHERE pr.player_id = p_player_id
    ORDER BY pr.report_date DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- VERIFICA INSTALLAZIONE
-- ========================================

-- Verifica che la tabella sia stata creata
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'player_reports';

-- Verifica colonne
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'player_reports'
ORDER BY ordinal_position;

-- ✅ FATTO! La tabella player_reports è pronta per l'uso

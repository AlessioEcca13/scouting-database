const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configurazione
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Mapping dei campi Excel -> Database
const fieldMapping = {
    'Nome': 'name',
    'Anno': 'birth_year',
    'Squadra': 'team',
    'Naz': 'nationality',
    'Ruolo Generale': 'general_role',
    'Posizone': 'specific_position',
    'Funzioni/Etichette': 'functions_labels',
    'Piede': 'preferred_foot',
    'Atletismo': 'athleticism',
    'Valutazione Atletica': 'athletic_evaluation',
    'Caratteristiche Chiave': 'key_characteristics',
    'Valore Potenziale ': 'potential_value',
    'Valore Attuale  Dati': 'current_value',
    'Valore Potenziale Dati': 'data_potential_value',
    'Note ': 'notes',
    'Transfermarket': 'transfermarket_link',
    'Director Feedback ': 'director_feedback',
    'CHECK': 'check_type',
    'ESITO': 'outcome'
};

async function importFromExcel(filePath) {
    console.log('📂 Lettura file Excel:', filePath);
    
    try {
        // Leggi il file Excel
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0]; // Usa il primo foglio
        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet);
        
        console.log(`✅ Trovati ${rawData.length} record nel foglio "${sheetName}"`);
        
        // Trasforma i dati
        const players = rawData.map(row => {
            const player = {};
            
            for (const [excelField, dbField] of Object.entries(fieldMapping)) {
                if (row[excelField] !== undefined && row[excelField] !== null) {
                    // Gestisci il campo piede
                    if (dbField === 'preferred_foot') {
                        const foot = row[excelField];
                        if (foot === 'Dx' || foot === 'Destro') {
                            player[dbField] = 'Destro';
                        } else if (foot === 'Sx' || foot === 'Sinistro') {
                            player[dbField] = 'Sinistro';
                        } else if (foot === 'Entrambi' || foot === 'Ambidestro') {
                            player[dbField] = 'Ambidestro';
                        }
                    }
                    // Converti numeri
                    else if (['birth_year', 'potential_value', 'current_value', 
                              'data_potential_value', 'athletic_evaluation'].includes(dbField)) {
                        const value = parseInt(row[excelField]);
                        if (!isNaN(value)) {
                            player[dbField] = value;
                        }
                    }
                    // Altri campi
                    else {
                        player[dbField] = row[excelField].toString().trim();
                    }
                }
            }
            
            // Aggiungi campi richiesti per RLS
            player.created_by = null; // Temporaneo per importazione
            player.updated_by = null;
            
            return player;
        }).filter(p => p.name); // Filtra record senza nome
        
        console.log(`📝 Pronti per importare ${players.length} giocatori`);
        
        // Importa in batch
        const batchSize = 50;
        let imported = 0;
        
        for (let i = 0; i < players.length; i += batchSize) {
            const batch = players.slice(i, i + batchSize);
            
            const { data, error } = await supabase
                .from('players')
                .insert(batch);
            
            if (error) {
                console.error('❌ Errore batch', i/batchSize + 1, ':', error.message);
            } else {
                imported += batch.length;
                console.log(`✅ Importati ${imported}/${players.length} giocatori`);
            }
        }
        
        console.log('🎉 Importazione completata!');
        console.log(`   Totale giocatori importati: ${imported}`);
        
    } catch (error) {
        console.error('❌ Errore durante importazione:', error);
        process.exit(1);
    }
}

// Esegui lo script
if (process.argv.length < 3) {
    console.log('Uso: node import-excel.js <percorso-file-excel>');
    console.log('Esempio: node import-excel.js ../DATABASE.xlsx');
    process.exit(1);
}

const excelFile = process.argv[2];
importFromExcel(excelFile);
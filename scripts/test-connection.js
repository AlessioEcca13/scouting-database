const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configurazione
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🔗 Test connessione Supabase...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? 'Presente' : 'Mancante');

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variabili ambiente mancanti!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    try {
        // Test connessione con una query semplice
        const { data, error } = await supabase
            .from('players')
            .select('count')
            .limit(1);
        
        if (error) {
            console.error('❌ Errore connessione:', error.message);
            return;
        }
        
        console.log('✅ Connessione Supabase riuscita!');
        console.log('📊 Database pronto per importazione');
        
    } catch (error) {
        console.error('❌ Errore:', error.message);
    }
}

testConnection();

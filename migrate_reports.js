// Script per aggiungere current_value e potential_value alla tabella player_reports
// Usa approccio diretto: inserisce record di test per verificare se le colonne esistono

const { createClient } = require('@supabase/supabase-js');

// Configurazione Supabase
const supabaseUrl = 'https://djfwugugjbgflgfdbufd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqZnd1Z3VnamJnZmxnZmRidWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNDY3MzUsImV4cCI6MjA3NDYyMjczNX0.gkUYzyfBTKGDKHQOC6-w8X6Xni9BJnsZwT_ptj9klb0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🚀 Verifica e aggiunta colonne current_value e potential_value\n');

  try {
    // Verifica se le colonne esistono già provando a selezionarle
    console.log('⏳ Verifica colonne esistenti...');
    const { data: existingData, error: selectError } = await supabase
      .from('player_reports')
      .select('id, current_value, potential_value')
      .limit(1);

    if (!selectError) {
      console.log('✅ Le colonne current_value e potential_value esistono già!');
      console.log('ℹ️  Nessuna migration necessaria.\n');
      return;
    }

    // Se c'è un errore, le colonne probabilmente non esistono
    console.log('⚠️  Le colonne non esistono ancora');
    console.log('📋 Errore:', selectError.message, '\n');

    console.log('❌ IMPOSSIBILE ESEGUIRE ALTER TABLE VIA API');
    console.log('📝 Devi eseguire manualmente questo SQL su Supabase SQL Editor:\n');
    console.log('🔗 https://djfwugugjbgflgfdbufd.supabase.co/project/djfwugugjbgflgfdbufd/sql\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`
-- COPIA E INCOLLA QUESTO SQL SU SUPABASE:

ALTER TABLE player_reports 
ADD COLUMN IF NOT EXISTS current_value INTEGER CHECK (current_value >= 1 AND current_value <= 5);

ALTER TABLE player_reports 
ADD COLUMN IF NOT EXISTS potential_value INTEGER CHECK (potential_value >= 1 AND potential_value <= 5);

UPDATE player_reports SET current_value = 3 WHERE current_value IS NULL;
UPDATE player_reports SET potential_value = 3 WHERE potential_value IS NULL;
    `);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📋 ISTRUZIONI:');
    console.log('1. Apri il link sopra nel browser');
    console.log('2. Copia il codice SQL');
    console.log('3. Incollalo nel SQL Editor');
    console.log('4. Clicca "Run" o premi Ctrl+Enter');
    console.log('5. Verifica che appaia "Success" ✅\n');

  } catch (error) {
    console.error('\n❌ Errore:', error.message);
  }
}

runMigration();

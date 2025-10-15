// Script per eseguire la migration: aggiungere current_value e potential_value a player_reports
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configurazione Supabase
const supabaseUrl = 'https://djfwugugjbgflgfdbufd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqZnd1Z3VnamJnZmxnZmRidWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNDY3MzUsImV4cCI6MjA3NDYyMjczNX0.gkUYzyfBTKGDKHQOC6-w8X6Xni9BJnsZwT_ptj9klb0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🚀 Inizio migration: Aggiunta current_value e potential_value a player_reports\n');

  try {
    // Leggi il file SQL
    const sqlPath = path.join(__dirname, 'database', 'migration', 'add_current_potential_to_reports.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 File SQL caricato:', sqlPath);
    console.log('📝 Contenuto SQL:\n', sqlContent.substring(0, 200) + '...\n');

    // Esegui le query SQL una per una
    const queries = sqlContent
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0 && !q.startsWith('--') && !q.startsWith('COMMENT'));

    console.log(`📊 Trovate ${queries.length} query da eseguire\n`);

    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      console.log(`\n⏳ Esecuzione query ${i + 1}/${queries.length}...`);
      console.log('Query:', query.substring(0, 100) + '...');

      const { data, error } = await supabase.rpc('exec_sql', { sql: query });

      if (error) {
        console.error(`❌ Errore query ${i + 1}:`, error);
        
        // Se l'errore è che la colonna esiste già, continua
        if (error.message && error.message.includes('already exists')) {
          console.log('⚠️  Colonna già esistente, continuo...');
          continue;
        }
        
        throw error;
      }

      console.log(`✅ Query ${i + 1} completata con successo`);
    }

    console.log('\n🎉 Migration completata con successo!');
    console.log('\n📋 Verifica colonne aggiunte...');

    // Verifica che le colonne siano state aggiunte
    const { data: columns, error: verifyError } = await supabase
      .from('player_reports')
      .select('*')
      .limit(1);

    if (verifyError) {
      console.error('❌ Errore verifica:', verifyError);
    } else {
      console.log('✅ Verifica completata');
      if (columns && columns.length > 0) {
        const sampleRecord = columns[0];
        console.log('\n📊 Colonne disponibili:', Object.keys(sampleRecord).join(', '));
        console.log('\n✅ current_value presente:', 'current_value' in sampleRecord ? '✅' : '❌');
        console.log('✅ potential_value presente:', 'potential_value' in sampleRecord ? '✅' : '❌');
      }
    }

  } catch (error) {
    console.error('\n❌ Errore durante la migration:', error);
    process.exit(1);
  }
}

// Esegui la migration
runMigration();

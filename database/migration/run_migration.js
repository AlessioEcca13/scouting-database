// Script per eseguire le migrazioni del database
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://djfwugugjbgflgfdbufd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqZnd1Z3VnamJnZmxnZmRidWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNDY3MzUsImV4cCI6MjA3NDYyMjczNX0.gkUYzyfBTKGDKHQOC6-w8X6Xni9BJnsZwT_ptj9klb0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('🚀 Esecuzione migrazione...\n');
    
    // Leggi il file SQL
    const sqlFile = path.join(__dirname, 'update_player_reports_fields.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('📄 SQL da eseguire:');
    console.log(sql);
    console.log('\n');
    
    // Esegui la migrazione
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('❌ Errore durante la migrazione:', error);
      process.exit(1);
    }
    
    console.log('✅ Migrazione completata con successo!');
    console.log('\nCampi aggiunti:');
    console.log('  - match_name VARCHAR(255)');
    console.log('  - athletic_data_rating VARCHAR(10)');
    console.log('\nCampi rimossi:');
    console.log('  - competition');
    console.log('  - opponent_team');
    console.log('  - matches_watched');
    
  } catch (error) {
    console.error('❌ Errore:', error);
    process.exit(1);
  }
}

runMigration();

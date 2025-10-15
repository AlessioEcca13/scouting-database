// Verifica le colonne della tabella player_reports
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://djfwugugjbgflgfdbufd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqZnd1Z3VnamJnZmxnZmRidWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNDY3MzUsImV4cCI6MjA3NDYyMjczNX0.gkUYzyfBTKGDKHQOC6-w8X6Xni9BJnsZwT_ptj9klb0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
  console.log('🔍 Verifica colonne tabella player_reports\n');

  try {
    // Prova a selezionare tutti i campi
    const { data, error } = await supabase
      .from('player_reports')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Errore:', error.message);
      return;
    }

    if (data && data.length > 0) {
      console.log('✅ Record trovato. Colonne disponibili:\n');
      const columns = Object.keys(data[0]);
      columns.forEach((col, index) => {
        console.log(`${index + 1}. ${col}`);
      });
    } else {
      console.log('⚠️  Nessun record nella tabella');
      console.log('📋 Provo a inserire un record di test per vedere le colonne...\n');
      
      // Prova a inserire un record minimo
      const { data: insertData, error: insertError } = await supabase
        .from('player_reports')
        .insert([{
          player_id: '00000000-0000-0000-0000-000000000000', // UUID fake
          scout_name: 'TEST',
          check_type: 'Live',
          final_rating: 'B',
          current_value: 3,
          potential_value: 3,
          strengths: 'test',
          weaknesses: 'test',
          notes: 'test'
        }])
        .select();

      if (insertError) {
        console.error('❌ Errore inserimento test:', insertError);
        console.log('\n📋 Dettagli errore:');
        console.log('Code:', insertError.code);
        console.log('Message:', insertError.message);
        console.log('Details:', insertError.details);
        console.log('Hint:', insertError.hint);
      } else {
        console.log('✅ Inserimento test riuscito!');
        console.log('📋 Colonne disponibili:\n');
        const columns = Object.keys(insertData[0]);
        columns.forEach((col, index) => {
          console.log(`${index + 1}. ${col}`);
        });
        
        // Elimina il record di test
        await supabase
          .from('player_reports')
          .delete()
          .eq('scout_name', 'TEST');
        console.log('\n🗑️  Record di test eliminato');
      }
    }

  } catch (error) {
    console.error('\n❌ Errore:', error.message);
  }
}

checkColumns();

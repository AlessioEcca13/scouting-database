// Script per applicare le RLS policies via Supabase
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://djfwugugjbgflgfdbufd.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqZnd1Z3VnamJnZmxnZmRidWZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTA0NjczNSwiZXhwIjoyMDc0NjIyNzM1fQ.VYECnXxQCEO8Jj8Ey-Oc9QfVWvqxZlCEJQJlHfOLxXs';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyRLSPolicies() {
  console.log('🔒 Applicazione RLS Policies...\n');

  try {
    // 1. PLAYER_LISTS
    console.log('📋 Configurazione player_lists...');
    
    // Abilita RLS
    await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE player_lists ENABLE ROW LEVEL SECURITY;'
    }).catch(() => console.log('  RLS già abilitato'));

    // Drop existing policies
    const listsPolicies = ['player_lists_select_policy', 'player_lists_insert_policy', 'player_lists_update_policy', 'player_lists_delete_policy'];
    for (const policy of listsPolicies) {
      await supabase.rpc('exec_sql', {
        sql: `DROP POLICY IF EXISTS "${policy}" ON player_lists;`
      }).catch(() => {});
    }

    // Create policies
    const listsQueries = [
      `CREATE POLICY "player_lists_select_policy" ON player_lists FOR SELECT TO authenticated USING (true);`,
      `CREATE POLICY "player_lists_insert_policy" ON player_lists FOR INSERT TO authenticated WITH CHECK (true);`,
      `CREATE POLICY "player_lists_update_policy" ON player_lists FOR UPDATE TO authenticated USING (true) WITH CHECK (true);`,
      `CREATE POLICY "player_lists_delete_policy" ON player_lists FOR DELETE TO authenticated USING (true);`
    ];

    for (const query of listsQueries) {
      const { error } = await supabase.rpc('exec_sql', { sql: query });
      if (error) console.error('  ❌ Errore:', error.message);
    }
    console.log('  ✅ Policy player_lists create\n');

    // 2. PLAYERS
    console.log('👥 Configurazione players...');
    
    await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE players ENABLE ROW LEVEL SECURITY;'
    }).catch(() => console.log('  RLS già abilitato'));

    const playersPolicies = ['players_select_policy', 'players_insert_policy', 'players_update_policy', 'players_delete_policy'];
    for (const policy of playersPolicies) {
      await supabase.rpc('exec_sql', {
        sql: `DROP POLICY IF EXISTS "${policy}" ON players;`
      }).catch(() => {});
    }

    const playersQueries = [
      `CREATE POLICY "players_select_policy" ON players FOR SELECT TO authenticated USING (true);`,
      `CREATE POLICY "players_insert_policy" ON players FOR INSERT TO authenticated WITH CHECK (true);`,
      `CREATE POLICY "players_update_policy" ON players FOR UPDATE TO authenticated USING (true) WITH CHECK (true);`,
      `CREATE POLICY "players_delete_policy" ON players FOR DELETE TO authenticated USING (true);`
    ];

    for (const query of playersQueries) {
      const { error } = await supabase.rpc('exec_sql', { sql: query });
      if (error) console.error('  ❌ Errore:', error.message);
    }
    console.log('  ✅ Policy players create\n');

    console.log('✅ RLS Policies applicate con successo!');
    console.log('\n📝 Nota: Ora tutti gli utenti autenticati possono accedere a tutti i dati.');
    
  } catch (error) {
    console.error('❌ Errore durante l\'applicazione delle policy:', error);
  }
}

// Metodo alternativo: Esegui query SQL dirette
async function applyRLSPoliciesDirectSQL() {
  console.log('🔒 Applicazione RLS Policies (metodo diretto)...\n');

  const queries = [
    // PLAYER_LISTS
    'ALTER TABLE player_lists ENABLE ROW LEVEL SECURITY;',
    'DROP POLICY IF EXISTS "player_lists_select_policy" ON player_lists;',
    'DROP POLICY IF EXISTS "player_lists_insert_policy" ON player_lists;',
    'DROP POLICY IF EXISTS "player_lists_update_policy" ON player_lists;',
    'DROP POLICY IF EXISTS "player_lists_delete_policy" ON player_lists;',
    'CREATE POLICY "player_lists_select_policy" ON player_lists FOR SELECT TO authenticated USING (true);',
    'CREATE POLICY "player_lists_insert_policy" ON player_lists FOR INSERT TO authenticated WITH CHECK (true);',
    'CREATE POLICY "player_lists_update_policy" ON player_lists FOR UPDATE TO authenticated USING (true) WITH CHECK (true);',
    'CREATE POLICY "player_lists_delete_policy" ON player_lists FOR DELETE TO authenticated USING (true);',
    
    // PLAYERS
    'ALTER TABLE players ENABLE ROW LEVEL SECURITY;',
    'DROP POLICY IF EXISTS "players_select_policy" ON players;',
    'DROP POLICY IF EXISTS "players_insert_policy" ON players;',
    'DROP POLICY IF EXISTS "players_update_policy" ON players;',
    'DROP POLICY IF EXISTS "players_delete_policy" ON players;',
    'CREATE POLICY "players_select_policy" ON players FOR SELECT TO authenticated USING (true);',
    'CREATE POLICY "players_insert_policy" ON players FOR INSERT TO authenticated WITH CHECK (true);',
    'CREATE POLICY "players_update_policy" ON players FOR UPDATE TO authenticated USING (true) WITH CHECK (true);',
    'CREATE POLICY "players_delete_policy" ON players FOR DELETE TO authenticated USING (true);'
  ];

  for (const query of queries) {
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql: query });
      if (error) {
        console.log(`⚠️  ${query.substring(0, 50)}... - ${error.message}`);
      } else {
        console.log(`✅ ${query.substring(0, 50)}...`);
      }
    } catch (err) {
      console.log(`⚠️  ${query.substring(0, 50)}... - ${err.message}`);
    }
  }

  console.log('\n✅ Completato!');
}

// Esegui
console.log('╔════════════════════════════════════════╗');
console.log('║  Applicazione RLS Policies Supabase   ║');
console.log('╚════════════════════════════════════════╝\n');

console.log('⚠️  IMPORTANTE: Questo script richiede la service_role key.');
console.log('⚠️  Se non funziona, esegui le query manualmente nel SQL Editor di Supabase.\n');
console.log('📄 File SQL: database/migration/add_rls_policies.sql\n');

applyRLSPoliciesDirectSQL();

import { createClient } from '@supabase/supabase-js';

// Legge le variabili d'ambiente
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Verifica che le credenziali siano presenti
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Credenziali Supabase mancanti!', { supabaseUrl, supabaseAnonKey });
}

// Crea un'unica istanza del client Supabase (singleton pattern)
let supabaseInstance = null;

export const getSupabase = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage
      }
    });
  }
  return supabaseInstance;
};

// Export del client per retrocompatibilità
export const supabase = getSupabase();

// Funzioni helper per i giocatori
export const playerService = {
  // Ottieni tutti i giocatori
  async getAll(filters = {}) {
    const supabase = getSupabase();
    let query = supabase
      .from('players')
      .select('*')
      .order('name', { ascending: true });

    if (filters.searchTerm) {
      query = query.or(`name.ilike.%${filters.searchTerm}%,team.ilike.%${filters.searchTerm}%`);
    }

    if (filters.role) {
      query = query.eq('general_role', filters.role);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Aggiungi un giocatore
  async create(playerData) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('players')
      .insert([{
        ...playerData,
        created_at: new Date().toISOString(),
        created_by: null,
        updated_by: null
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Aggiorna un giocatore
  async update(id, updates) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('players')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
        updated_by: null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Elimina un giocatore
  async delete(id) {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Sottoscrivi ai cambiamenti
  subscribe(callback) {
    const supabase = getSupabase();
    const subscription = supabase
      .channel('players_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'players' },
        callback
      )
      .subscribe();

    return subscription;
  }
};

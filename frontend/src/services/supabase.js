import { createClient } from '@supabase/supabase-js';

// Legge le variabili d'ambiente
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Mancano le variabili ambiente Supabase!');
}

// Crea client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Funzioni helper per i giocatori
export const playerService = {
    // Ottieni tutti i giocatori
    async getAll() {
        const { data, error } = await supabase
            .from('players')
            .select('*')
            .eq('is_archived', false)
            .order('name');
        
        if (error) throw error;
        return data;
    },

    // Ottieni singolo giocatore
    async getById(id) {
        const { data, error } = await supabase
            .from('players')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        return data;
    },

    // Crea nuovo giocatore
    async create(player) {
        const { data, error } = await supabase
            .from('players')
            .insert([player])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    // Aggiorna giocatore
    async update(id, updates) {
        const { data, error } = await supabase
            .from('players')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    // Elimina (archivia) giocatore
    async delete(id) {
        const { error } = await supabase
            .from('players')
            .update({ is_archived: true })
            .eq('id', id);
        
        if (error) throw error;
    },

    // Ricerca giocatori
    async search(query) {
        const { data, error } = await supabase
            .from('players')
            .select('*')
            .eq('is_archived', false)
            .or(`name.ilike.%${query}%,team.ilike.%${query}%`)
            .order('name');
        
        if (error) throw error;
        return data;
    }
};
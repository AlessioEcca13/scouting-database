// src/supabaseClient.js - Istanza Supabase condivisa
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Crea una singola istanza condivisa
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

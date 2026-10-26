import { createClient } from '@supabase/supabase-js';

const env = import.meta.env;

const supabaseUrl = env.VITE_SUPABASE_URL || env.VITESUPABASEURL;

const supabaseAnonKey =
  env.VITE_SUPABASE_ANON_KEY ||
  env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  env.VITESUPABASEPUBLISHABLEKEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

import { createClient } from '@supabase/supabase-js';

const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (typeof process !== 'undefined' ? process.env : {});

const supabaseUrl =
  env.VITE_SUPABASE_URL ||
  env.VITESUPABASEURL ||
  "https://ytkvkvzqlbkjctnpxqoz.supabase.co";

const supabaseAnonKey =
  env.VITE_SUPABASE_ANON_KEY ||
  env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  env.VITESUPABASEPUBLISHABLEKEY ||
  "sb_publishable_-4y7Oaqf8D93rm3nkIQcrQ_7Z0wPG5-";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

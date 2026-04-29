import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] ⚠️ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env file.\n' +
    'Auth features (Login, Register, Google Sign-In) will NOT work.\n' +
    'Get your keys from: https://supabase.com/dashboard → Project Settings → API'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

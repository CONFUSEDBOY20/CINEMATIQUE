import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const isProduction = import.meta.env.PROD;
  throw new Error(
    isProduction
      ? 'Missing Supabase Environment Variables — add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your Vercel project settings, then redeploy.'
      : 'Missing Supabase Environment Variables — check your .env file (copy from .env.example)'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

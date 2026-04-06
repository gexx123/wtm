import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV === 'development') {
    console.warn('Missing Supabase environment variables. Database features will be disabled.');
  }
}

// Singleton instance for client-side usage
// Fallback to empty strings only if they exist, otherwise we avoid calling createClient during build if possible
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as any); // Type cast to prevent breakdown elsewhere if they haven't set it yet

export default supabase;

import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';

// Retrieve credentials from Vite env or local storage
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('apex_supabase_url') : null;
const storedKey = typeof window !== 'undefined' ? localStorage.getItem('apex_supabase_key') : null;

export const supabaseUrl: string = storedUrl || envUrl || '';
export const supabaseAnonKey: string = storedKey || envKey || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('your-project')
  );
};

// Fallback dummy client if credentials aren't set yet, to avoid initialization crashes
const fallbackUrl = 'https://placeholder-project.supabase.co';
const fallbackKey = 'placeholder-key';

export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured() ? supabaseUrl : fallbackUrl,
  isSupabaseConfigured() ? supabaseAnonKey : fallbackKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export function updateSupabaseConfig(url: string, key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('apex_supabase_url', url.trim());
    localStorage.setItem('apex_supabase_key', key.trim());
    window.location.reload();
  }
}

export function clearSupabaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('apex_supabase_url');
    localStorage.removeItem('apex_supabase_key');
    window.location.reload();
  }
}

export type { SupabaseUser };

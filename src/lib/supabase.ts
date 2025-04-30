
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Get environment variables with fallbacks to prevent crashes during development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Check if we're in a browser environment before showing the warning
if (typeof window !== 'undefined') {
  // Only show warning in development environment
  if (import.meta.env.DEV && (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY)) {
    console.warn(
      'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. ' +
      'The app will run with a placeholder client, but database operations will fail.'
    );
  }
}

// Create the Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;
};


import { createClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

// Use the Supabase URL and anon key from the auto-generated client
const SUPABASE_URL = "https://ijfyxxrmmeogkkaswumr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqZnl4eHJtbWVvZ2trYXN3dW1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5NzQ4NDQsImV4cCI6MjA2MTU1MDg0NH0.n08eyzQKMZPY-zDjiTLmq-FWTMF8Xfmb9y5TyEonTqM";

// Create the Supabase client with the correct types
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return true; // We now have hardcoded values from the auto-generated client
};

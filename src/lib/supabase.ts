
import { createClient } from '@supabase/supabase-js';

// Define the Database type here, since we can't modify the auto-generated types file
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nom: string;
          prenom: string;
          telephone: string;
          role: string;
          date_creation: string;
        };
        Insert: {
          id: string;
          nom: string;
          prenom: string;
          telephone: string;
          role: string;
          date_creation?: string;
        };
        Update: {
          id?: string;
          nom?: string;
          prenom?: string;
          telephone?: string;
          role?: string;
          date_creation?: string;
        };
      };
      // Include other tables needed for type safety
      patients: {
        Row: {
          id: string;
          user_id: string;
          date_naissance: string;
          adresse: string;
          nss: string;
          medecin?: string;
        };
      };
      medecins: {
        Row: {
          id: string;
          user_id: string;
          specialite: string;
        };
      };
      rendez_vous: {
        Row: {
          id: string;
          patient_id: string;
          medecin_id: string;
          date: string;
          heure: string;
          duree: number;
          motif: string;
          statut: string;
        };
      };
    };
  };
};

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


import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, Role } from '@/types';
import { toast } from 'sonner';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  role: Role | null;
  isSupabaseReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseReady, setIsSupabaseReady] = useState(isSupabaseConfigured());

  useEffect(() => {
    // If Supabase is not properly configured, don't attempt to fetch the session
    if (!isSupabaseReady) {
      setIsLoading(false);
      return;
    }
    
    // Check if there's an active session
    const getSession = async () => {
      setIsLoading(true);
      
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (sessionData?.session) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', sessionData.session.user.id)
            .single();
            
          if (userError) throw userError;
          
          if (userData) {
            setCurrentUser(userData as User);
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        toast.error("Erreur lors de la récupération de la session");
      } finally {
        setIsLoading(false);
      }
    };
    
    getSession();
    
    // Only set up auth subscription if Supabase is configured
    if (isSupabaseReady) {
      // Subscribe to auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_IN' && session) {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();
              
            if (userError) {
              console.error('Error fetching user data:', userError);
            } else if (userData) {
              setCurrentUser(userData as User);
            }
          } else if (event === 'SIGNED_OUT') {
            setCurrentUser(null);
          }
        }
      );
      
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [isSupabaseReady]);

  const login = async (email: string, password: string) => {
    if (!isSupabaseReady) {
      toast.error("La configuration Supabase est incomplète. Connexion indisponible.");
      return;
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        toast.error("Email ou mot de passe incorrect");
        throw error;
      }
      
      if (data.user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (userError) throw userError;
        
        if (userData) {
          toast.success(`Bienvenue, ${userData.prenom} ${userData.nom}`);
          setCurrentUser(userData as User);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error("Erreur lors de la connexion");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (!isSupabaseReady) {
      setCurrentUser(null);
      toast.info("Vous êtes déconnecté");
      return;
    }
    
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      toast.info("Vous êtes déconnecté");
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  const value = {
    currentUser,
    isLoading,
    login,
    logout,
    isAuthenticated: !!currentUser,
    role: currentUser?.role as Role | null,
    isSupabaseReady,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

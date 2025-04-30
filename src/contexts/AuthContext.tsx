
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, Role } from '@/types';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

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
  const [isSupabaseReady, setIsSupabaseReady] = useState(true); // Always true now that we have hardcoded values

  useEffect(() => {
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
            .from('profiles')
            .select('*')
            .eq('id', sessionData.session.user.id)
            .single();
            
          if (userError) throw userError;
          
          if (userData) {
            // Convert from profiles table format to our User type
            const user: User = {
              id: userData.id,
              nom: userData.nom,
              prenom: userData.prenom,
              email: sessionData.session.user.email || '',
              telephone: userData.telephone,
              role: userData.role as Role,
              dateCreation: userData.date_creation
            };
            setCurrentUser(user);
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
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
              
          if (userError) {
            console.error('Error fetching user data:', userError);
          } else if (userData) {
            // Convert from profiles table format to our User type
            const user: User = {
              id: userData.id,
              nom: userData.nom,
              prenom: userData.prenom,
              email: session.user.email || '',
              telephone: userData.telephone,
              role: userData.role as Role,
              dateCreation: userData.date_creation
            };
            setCurrentUser(user);
          }
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
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
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (userError) throw userError;
        
        if (userData) {
          // Convert from profiles table format to our User type
          const user: User = {
            id: userData.id,
            nom: userData.nom,
            prenom: userData.prenom,
            email: data.user.email || '',
            telephone: userData.telephone,
            role: userData.role as Role,
            dateCreation: userData.date_creation
          };
          
          toast.success(`Bienvenue, ${userData.prenom} ${userData.nom}`);
          setCurrentUser(user);
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

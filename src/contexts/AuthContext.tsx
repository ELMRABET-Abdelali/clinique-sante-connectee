
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, Role } from '@/types';
import { toast } from 'sonner';
import { mockUsers } from '@/data/mockData';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  role: Role | null;
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

  useEffect(() => {
    // Vérifier s'il y a un utilisateur dans le stockage local
    const storedUser = localStorage.getItem('clinicUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulation d'une authentification
      const user = mockUsers.find(u => u.email === email);
      
      // Simuler un délai d'authentification
      await new Promise(r => setTimeout(r, 800));
      
      if (user && password === 'password') { // Mot de passe fixe pour la démo
        setCurrentUser(user);
        localStorage.setItem('clinicUser', JSON.stringify(user));
        toast.success(`Bienvenue, ${user.prenom} ${user.nom}`);
      } else {
        toast.error("Email ou mot de passe incorrect");
        throw new Error("Identifiants invalides");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('clinicUser');
    toast.info("Vous êtes déconnecté");
  };

  const value = {
    currentUser,
    isLoading,
    login,
    logout,
    isAuthenticated: !!currentUser,
    role: currentUser?.role || null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

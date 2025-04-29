
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  User, Bell, Calendar, LogOut, BarChart2
} from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Badge } from '@/components/ui/badge';

const roleLabels = {
  admin: "Administrateur",
  secretaire: "Secrétaire",
  patient: "Patient"
};

export function Header() {
  const { currentUser, logout, role } = useAuth();
  const { messages } = useData();
  
  // Compter les messages non lus pour l'utilisateur connecté
  const unreadMessages = currentUser ? 
    messages.filter(m => m.destinataireId === currentUser.id && !m.lu).length : 0;

  if (!currentUser) return null;

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center">
              <div className="bg-clinic-500 text-white p-2 rounded-md mr-2">
                <BarChart2 size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-clinic-800">
                  Clinique Santé Connectée
                </h1>
                <p className="text-sm text-gray-600">
                  Système de gestion
                </p>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Link to="/messages" className="relative">
              <Button variant="ghost" size="icon">
                <Bell size={20} />
                {unreadMessages > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive">
                    {unreadMessages}
                  </Badge>
                )}
              </Button>
            </Link>
            
            {/* Rendez-vous rapide (pour secrétaire) */}
            {role === 'secretaire' && (
              <Link to="/rendez-vous">
                <Button variant="ghost" size="icon">
                  <Calendar size={20} />
                </Button>
              </Link>
            )}
            
            {/* Profil utilisateur */}
            <div className="flex items-center">
              <Link to="/profile" className="flex items-center mr-4">
                <div className="w-8 h-8 bg-clinic-100 rounded-full flex items-center justify-center mr-2">
                  <User size={18} className="text-clinic-500" />
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-medium">
                    {currentUser.prenom} {currentUser.nom}
                  </div>
                  <div className="text-xs text-gray-500">
                    {roleLabels[role as keyof typeof roleLabels]}
                  </div>
                </div>
              </Link>
              
              {/* Déconnexion */}
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                aria-label="Déconnexion"
              >
                <LogOut size={18} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

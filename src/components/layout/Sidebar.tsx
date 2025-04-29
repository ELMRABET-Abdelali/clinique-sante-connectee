
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  HomeIcon,
  Users,
  Calendar,
  FileText,
  MessageSquare,
  Stethoscope,
  Settings,
  LogOut
} from 'lucide-react';

export function Sidebar() {
  const { role, logout } = useAuth();
  
  // Definir les liens de navigation en fonction du rôle
  const getNavLinks = () => {
    const commonLinks = [
      {
        name: 'Tableau de bord',
        href: '/',
        icon: HomeIcon
      },
      {
        name: 'Messages',
        href: '/messages',
        icon: MessageSquare
      }
    ];
    
    const adminLinks = [
      {
        name: 'Patients',
        href: '/patients',
        icon: Users
      },
      {
        name: 'Médecins',
        href: '/medecins',
        icon: Stethoscope
      },
      {
        name: 'Rendez-vous',
        href: '/rendez-vous',
        icon: Calendar
      },
      {
        name: 'Factures',
        href: '/factures',
        icon: FileText
      }
    ];
    
    const secretaireLinks = [
      {
        name: 'Patients',
        href: '/patients',
        icon: Users
      },
      {
        name: 'Rendez-vous',
        href: '/rendez-vous',
        icon: Calendar
      },
      {
        name: 'Factures',
        href: '/factures',
        icon: FileText
      }
    ];
    
    const patientLinks = [
      {
        name: 'Rendez-vous',
        href: '/rendez-vous',
        icon: Calendar
      },
      {
        name: 'Factures',
        href: '/factures',
        icon: FileText
      }
    ];
    
    switch (role) {
      case 'admin':
        return [...commonLinks, ...adminLinks];
      case 'secretaire':
        return [...commonLinks, ...secretaireLinks];
      case 'patient':
        return [...commonLinks, ...patientLinks];
      default:
        return commonLinks;
    }
  };

  return (
    <div className="h-screen w-64 bg-white border-r flex flex-col">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800">Clinique Santé</h2>
        <p className="text-xs text-gray-500">Système de gestion</p>
      </div>
      <nav className="flex-1 px-4 pb-4">
        <ul className="space-y-1">
          {getNavLinks().map((link) => (
            <li key={link.href}>
              <NavLink
                to={link.href}
                className={({ isActive }) => cn(
                  "flex items-center px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors",
                  isActive && "bg-clinic-50 text-clinic-900 font-medium"
                )}
              >
                <link.icon className="h-5 w-5 mr-3" />
                {link.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="px-4 pb-6 border-t pt-4">
        <ul className="space-y-1">
          <li>
            <NavLink
              to="/parametres"
              className={({ isActive }) => cn(
                "flex items-center px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors",
                isActive && "bg-clinic-50 text-clinic-900 font-medium"
              )}
            >
              <Settings className="h-5 w-5 mr-3" />
              Paramètres
            </NavLink>
          </li>
          <li>
            <button
              onClick={logout}
              className="w-full flex items-center px-4 py-2 rounded-md text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Déconnexion
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}

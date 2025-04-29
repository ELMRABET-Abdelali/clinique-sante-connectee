
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, User, Stethoscope, Calendar, 
  FileText, MessageSquare, Settings, LayoutDashboard,
  ClipboardList
} from 'lucide-react';

interface SidebarLinkProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, label, icon, active }) => (
  <Link 
    to={to} 
    className={cn(
      "flex items-center py-3 px-4 rounded-lg transition-all hover:bg-clinic-50",
      active ? "bg-clinic-50 text-clinic-600 font-medium" : "text-gray-600"
    )}
  >
    <div className={cn(
      "mr-3",
      active ? "text-clinic-500" : "text-gray-500"
    )}>
      {icon}
    </div>
    <span>{label}</span>
  </Link>
);

export function Sidebar() {
  const { role } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  // Définir les liens en fonction du rôle de l'utilisateur
  const getLinks = () => {
    const adminLinks = [
      { to: "/", label: "Tableau de bord", icon: <LayoutDashboard size={20} />, paths: ["/"] },
      { to: "/utilisateurs", label: "Utilisateurs", icon: <Users size={20} />, paths: ["/utilisateurs"] },
      { to: "/patients", label: "Patients", icon: <User size={20} />, paths: ["/patients", "/patients/nouveau", /^\/patients\/detail\/.*$/] },
      { to: "/medecins", label: "Médecins", icon: <Stethoscope size={20} />, paths: ["/medecins", "/medecins/nouveau", /^\/medecins\/detail\/.*$/] },
      { to: "/rendez-vous", label: "Rendez-vous", icon: <Calendar size={20} />, paths: ["/rendez-vous", "/rendez-vous/nouveau"] },
      { to: "/factures", label: "Factures", icon: <FileText size={20} />, paths: ["/factures", /^\/factures\/detail\/.*$/] },
      { to: "/messages", label: "Messages", icon: <MessageSquare size={20} />, paths: ["/messages"] },
      { to: "/settings", label: "Paramètres", icon: <Settings size={20} />, paths: ["/settings"] },
    ];
    
    const secretaireLinks = [
      { to: "/", label: "Tableau de bord", icon: <LayoutDashboard size={20} />, paths: ["/"] },
      { to: "/patients", label: "Patients", icon: <User size={20} />, paths: ["/patients", "/patients/nouveau", /^\/patients\/detail\/.*$/] },
      { to: "/rendez-vous", label: "Rendez-vous", icon: <Calendar size={20} />, paths: ["/rendez-vous", "/rendez-vous/nouveau"] },
      { to: "/factures", label: "Factures", icon: <FileText size={20} />, paths: ["/factures", /^\/factures\/detail\/.*$/] },
      { to: "/messages", label: "Messages", icon: <MessageSquare size={20} />, paths: ["/messages"] },
    ];
    
    const patientLinks = [
      { to: "/", label: "Tableau de bord", icon: <LayoutDashboard size={20} />, paths: ["/"] },
      { to: "/rendez-vous", label: "Mes rendez-vous", icon: <Calendar size={20} />, paths: ["/rendez-vous"] },
      { to: "/dossier", label: "Mon dossier médical", icon: <ClipboardList size={20} />, paths: ["/dossier"] },
      { to: "/factures", label: "Mes factures", icon: <FileText size={20} />, paths: ["/factures", /^\/factures\/detail\/.*$/] },
      { to: "/messages", label: "Messages", icon: <MessageSquare size={20} />, paths: ["/messages"] },
    ];
    
    switch (role) {
      case "admin":
        return adminLinks;
      case "secretaire":
        return secretaireLinks;
      case "patient":
        return patientLinks;
      default:
        return [];
    }
  };

  const links = getLinks();
  
  if (links.length === 0) return null;

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full">
      <div className="py-6 px-4">
        <nav>
          <ul className="space-y-1">
            {links.map((link, index) => {
              // Vérifie si le chemin actuel correspond à l'un des chemins du lien
              const isActive = link.paths.some(path => {
                if (path instanceof RegExp) {
                  return path.test(currentPath);
                }
                return path === currentPath;
              });
              
              return (
                <li key={index}>
                  <SidebarLink 
                    to={link.to} 
                    label={link.label} 
                    icon={link.icon} 
                    active={isActive} 
                  />
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}

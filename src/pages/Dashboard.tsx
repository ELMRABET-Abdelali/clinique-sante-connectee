
import React from 'react';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { SecretaireDashboard } from '@/components/dashboard/SecretaireDashboard';
import { PatientDashboard } from '@/components/dashboard/PatientDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
  const { role, isAuthenticated } = useAuth();

  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Afficher le tableau de bord en fonction du rôle de l'utilisateur
  switch (role) {
    case 'admin':
      return <AdminDashboard />;
    case 'secretaire':
      return <SecretaireDashboard />;
    case 'patient':
      return <PatientDashboard />;
    default:
      return (
        <div className="text-center py-16">
          <h2 className="text-xl font-bold text-red-600">Erreur d'accès</h2>
          <p className="text-gray-600">
            Votre rôle utilisateur n'est pas reconnu par le système.
          </p>
        </div>
      );
  }
};

export default Dashboard;


import React from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users, User, Stethoscope, Calendar, 
  FileText, CheckCircle, XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Fonction pour obtenir la date du jour au format français
const formatDateFr = (date: Date) => {
  return date.toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
};

export function AdminDashboard() {
  const { users, patients, medecins, rendezVous, factures } = useData();
  const today = new Date();
  const formattedDate = formatDateFr(today);

  // Statistiques rapides pour le tableau de bord
  const todayAppointments = rendezVous.filter(
    rdv => rdv.date === today.toISOString().split('T')[0]
  );
  
  const unpaidInvoices = factures.filter(f => f.statut === 'non_payee');
  
  // Calcul des revenus totaux
  const totalRevenue = factures.reduce((sum, facture) => sum + facture.montantTotal, 0);
  
  const paidInvoicesCount = factures.filter(f => f.statut === 'payee').length;
  const invoicePaymentRate = factures.length > 0 
    ? Math.round((paidInvoicesCount / factures.length) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          Tableau de bord administrateur
        </h2>
        <p className="text-gray-600">{formattedDate}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Utilisateurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{users.length}</div>
                <p className="text-xs text-gray-500">Total des utilisateurs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{patients.length}</div>
                <p className="text-xs text-gray-500">Patients enregistrés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Médecins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                <Stethoscope className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{medecins.length}</div>
                <p className="text-xs text-gray-500">Médecins actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Rendez-vous
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{todayAppointments.length}</div>
                <p className="text-xs text-gray-500">Rendez-vous aujourd'hui</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Aperçu Financier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-gray-600">Factures non payées</span>
                </div>
                <div className="text-lg font-medium text-destructive">
                  {unpaidInvoices.length}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-gray-600">Taux de paiement</span>
                </div>
                <div className="text-lg font-medium text-green-600">
                  {invoicePaymentRate}%
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-gray-600">Revenus totaux</span>
                </div>
                <div className="text-lg font-medium">
                  {totalRevenue}€
                </div>
              </div>
              
              <Link to="/factures" className="text-sm text-clinic-500 hover:text-clinic-600 flex items-center">
                Voir toutes les factures
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Rendez-vous aujourd'hui</CardTitle>
          </CardHeader>
          <CardContent>
            {todayAppointments.length > 0 ? (
              <div className="space-y-3">
                {todayAppointments.slice(0, 3).map(rdv => {
                  const patient = patients.find(p => p.id === rdv.patientId);
                  const medecin = medecins.find(m => m.id === rdv.medecinId);
                  
                  return (
                    <div key={rdv.id} className="flex items-start p-3 border rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-clinic-100 flex items-center justify-center mr-3">
                        {rdv.statut === 'confirme' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : rdv.statut === 'annule' ? (
                          <XCircle className="h-4 w-4 text-red-600" />
                        ) : (
                          <Calendar className="h-4 w-4 text-yellow-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="font-medium">
                            {patient?.prenom} {patient?.nom}
                          </span>
                          <span className="text-sm text-gray-600">
                            {rdv.heure}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Dr. {medecin?.prenom} {medecin?.nom} • {rdv.motif}
                        </p>
                      </div>
                    </div>
                  );
                })}
                
                {todayAppointments.length > 3 && (
                  <Link to="/rendez-vous" className="text-sm text-clinic-500 hover:text-clinic-600 flex items-center">
                    Voir tous les rendez-vous ({todayAppointments.length})
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">Aucun rendez-vous aujourd'hui</p>
                <Link to="/rendez-vous/nouveau" className="text-sm text-clinic-500 hover:text-clinic-600 flex items-center justify-center mt-2">
                  Programmer un rendez-vous
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

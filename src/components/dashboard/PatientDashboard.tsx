
import React from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar, FileText, Clock, CheckCircle, XCircle, Pill, ClipboardList
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Fonction pour obtenir la date du jour au format français
const formatDateFr = (date: Date) => {
  return date.toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
};

export function PatientDashboard() {
  const { currentUser } = useAuth();
  const { rendezVous, factures, patients, medecins } = useData();
  const today = new Date();
  const formattedDate = formatDateFr(today);

  // Vérifier si l'utilisateur existe et est un patient
  if (!currentUser || currentUser.role !== 'patient') {
    return <div>Erreur: Accès non autorisé</div>;
  }

  const patientId = currentUser.id;
  
  // Récupérer les informations détaillées du patient
  const patientDetails = patients.find(p => p.id === patientId);
  if (!patientDetails) {
    return <div>Erreur: Données patient introuvables</div>;
  }

  // Trouver le médecin traitant du patient
  const medecinTraitant = patientDetails.medecin 
    ? medecins.find(m => m.id === patientDetails.medecin)
    : null;

  // Filtrer les rendez-vous du patient
  const patientAppointments = rendezVous
    .filter(rdv => rdv.patientId === patientId)
    .sort((a, b) => {
      // Trier par date (future puis passée) et ensuite par heure
      const dateA = new Date(a.date + 'T' + a.heure);
      const dateB = new Date(b.date + 'T' + b.heure);
      return dateA.getTime() - dateB.getTime();
    });

  // Filtrer les rendez-vous à venir
  const upcomingAppointments = patientAppointments
    .filter(rdv => {
      const rdvDate = new Date(rdv.date + 'T' + rdv.heure);
      return rdvDate >= today && rdv.statut !== 'annule';
    });

  // Filtrer les factures du patient
  const patientInvoices = factures
    .filter(f => f.patientId === patientId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculer le nombre de factures non payées
  const unpaidInvoicesCount = patientInvoices
    .filter(f => f.statut === 'non_payee')
    .length;

  // Récupérer les traitements en cours du patient
  const ongoingTreatments = patientDetails.dossierMedical.traitements
    .filter(t => t.etat === 'en_cours');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          Bonjour, {patientDetails.prenom}
        </h2>
        <p className="text-gray-600">{formattedDate}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Vos prochains rendez-vous</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingAppointments.slice(0, 3).map(rdv => {
                    const rdvMedecin = medecins.find(m => m.id === rdv.medecinId);
                    const rdvDate = new Date(rdv.date);
                    const formattedRdvDate = rdvDate.toLocaleDateString('fr-FR', { 
                      day: 'numeric', 
                      month: 'long',
                      year: 'numeric'
                    });
                    
                    return (
                      <div key={rdv.id} className={cn(
                        "flex items-start p-3 border rounded-lg",
                        rdv.statut === 'confirme' ? 'border-l-4 border-l-green-500' :
                        'border-l-4 border-l-yellow-500'
                      )}>
                        <div className="w-12 h-12 rounded-lg bg-clinic-100 flex flex-col items-center justify-center mr-3 text-center">
                          <span className="text-xs text-clinic-700">
                            {new Date(rdv.date).toLocaleDateString('fr-FR', { month: 'short' })}
                          </span>
                          <span className="text-lg font-bold text-clinic-800">
                            {new Date(rdv.date).getDate()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="font-medium">
                              Dr. {rdvMedecin?.prenom} {rdvMedecin?.nom}
                            </span>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="text-sm text-gray-600">
                                {rdv.heure}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {rdv.motif}
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <span className={cn(
                              "text-xs px-2 py-1 rounded-full",
                              rdv.statut === 'confirme' ? 'bg-green-100 text-green-800' :
                              'bg-yellow-100 text-yellow-800'
                            )}>
                              {rdv.statut === 'confirme' ? 'Confirmé' : 'En attente'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formattedRdvDate}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {upcomingAppointments.length > 3 && (
                    <Link to="/rendez-vous" className="text-sm text-clinic-500 hover:text-clinic-600 flex items-center">
                      Voir tous vos rendez-vous ({upcomingAppointments.length})
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500 mb-2">Vous n'avez pas de rendez-vous à venir</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Vos traitements en cours</CardTitle>
            </CardHeader>
            <CardContent>
              {ongoingTreatments.length > 0 ? (
                <div className="space-y-3">
                  {ongoingTreatments.map(traitement => {
                    const traitementMedecin = medecins.find(m => m.id === traitement.medecinId);
                    
                    return (
                      <div key={traitement.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <Pill className="h-4 w-4 text-clinic-500 mr-2" />
                            <span className="font-medium">{traitement.description}</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            Durée: {traitement.duree}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Prescrit par: Dr. {traitementMedecin?.prenom} {traitementMedecin?.nom}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Date de prescription: {new Date(traitement.date).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Pill className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">Vous n'avez pas de traitements en cours</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Votre médecin traitant</CardTitle>
            </CardHeader>
            <CardContent>
              {medecinTraitant ? (
                <div className="text-center py-4">
                  <div className="w-20 h-20 rounded-full bg-clinic-100 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="h-10 w-10 text-clinic-500" />
                  </div>
                  <h3 className="font-bold text-lg">
                    Dr. {medecinTraitant.prenom} {medecinTraitant.nom}
                  </h3>
                  <p className="text-gray-500 mb-3">{medecinTraitant.specialite}</p>
                  <p className="text-sm text-gray-600">
                    {medecinTraitant.telephone}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    {medecinTraitant.email}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <XCircle className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">Aucun médecin traitant assigné</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Vos factures</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Factures impayées</p>
                      <p className="text-xl font-bold text-red-500">
                        {unpaidInvoicesCount}
                      </p>
                    </div>
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  {patientInvoices.slice(0, 3).map(facture => (
                    <Link to={`/factures/detail/${facture.id}`} key={facture.id}>
                      <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{facture.numeroFacture}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(facture.date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{facture.montantTotal}€</p>
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            facture.statut === 'payee' ? 'bg-green-100 text-green-800' : 
                            'bg-red-100 text-red-800'
                          )}>
                            {facture.statut === 'payee' ? 'Payée' : 'Non payée'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                
                {patientInvoices.length > 0 ? (
                  <Link to="/factures" className="text-sm text-clinic-500 hover:text-clinic-600 flex items-center">
                    Voir toutes vos factures
                  </Link>
                ) : (
                  <p className="text-center text-sm text-gray-500 py-2">
                    Aucune facture
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                <Link to="/dossier">
                  <Button variant="secondary" className="w-full justify-start h-auto py-3">
                    <ClipboardList className="h-5 w-5 mr-3 text-clinic-600" />
                    <div className="text-left">
                      <p className="font-medium">Dossier médical</p>
                      <p className="text-xs text-gray-500">Accéder à votre dossier médical</p>
                    </div>
                  </Button>
                </Link>
                
                <Link to="/rendez-vous">
                  <Button variant="secondary" className="w-full justify-start h-auto py-3">
                    <Calendar className="h-5 w-5 mr-3 text-green-600" />
                    <div className="text-left">
                      <p className="font-medium">Rendez-vous</p>
                      <p className="text-xs text-gray-500">Voir tous vos rendez-vous</p>
                    </div>
                  </Button>
                </Link>
                
                <Link to="/messages">
                  <Button variant="secondary" className="w-full justify-start h-auto py-3">
                    <CheckCircle className="h-5 w-5 mr-3 text-blue-600" />
                    <div className="text-left">
                      <p className="font-medium">Messages</p>
                      <p className="text-xs text-gray-500">Communiquer avec la clinique</p>
                    </div>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

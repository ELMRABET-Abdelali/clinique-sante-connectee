
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar, User, Clock, CheckCircle, XCircle, Search, PlusCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
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

export function SecretaireDashboard() {
  const { patients, medecins, rendezVous } = useData();
  const today = new Date();
  const formattedDate = formatDateFr(today);
  const todayStr = today.toISOString().split('T')[0];
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrer les rendez-vous d'aujourd'hui
  const todayAppointments = rendezVous.filter(rdv => rdv.date === todayStr);
  
  // Trier les rendez-vous par heure
  const sortedAppointments = [...todayAppointments].sort((a, b) => {
    return a.heure.localeCompare(b.heure);
  });

  // Filtrer les patients en fonction du terme de recherche
  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.prenom} ${patient.nom}`.toLowerCase();
    const phoneMatch = patient.telephone.includes(searchTerm);
    return fullName.includes(searchTerm.toLowerCase()) || phoneMatch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          Tableau de bord secrétariat
        </h2>
        <p className="text-gray-600">{formattedDate}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Rendez-vous d'aujourd'hui</CardTitle>
              <Link to="/rendez-vous/nouveau">
                <Button variant="outline" size="sm" className="h-8">
                  <PlusCircle className="h-4 w-4 mr-1" /> Nouveau
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {sortedAppointments.length > 0 ? (
                <div className="space-y-3">
                  {sortedAppointments.map(rdv => {
                    const patient = patients.find(p => p.id === rdv.patientId);
                    const medecin = medecins.find(m => m.id === rdv.medecinId);
                    
                    return (
                      <div key={rdv.id} className={cn(
                        "flex items-start p-3 border rounded-lg",
                        rdv.statut === 'confirme' ? 'border-l-4 border-l-green-500' :
                        rdv.statut === 'annule' ? 'border-l-4 border-l-red-500 bg-gray-50' :
                        'border-l-4 border-l-yellow-500'
                      )}>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="font-medium">
                              {patient?.prenom} {patient?.nom}
                            </span>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="text-sm text-gray-600">
                                {rdv.heure} ({rdv.duree} min)
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Dr. {medecin?.prenom} {medecin?.nom} • {rdv.motif}
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <span className={cn(
                              "text-xs px-2 py-1 rounded-full",
                              rdv.statut === 'confirme' ? 'bg-green-100 text-green-800' :
                              rdv.statut === 'annule' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            )}>
                              {rdv.statut === 'confirme' ? 'Confirmé' :
                               rdv.statut === 'annule' ? 'Annulé' : 'En attente'}
                            </span>
                            <Link to={`/patients/detail/${patient?.id}`}>
                              <Button variant="ghost" size="sm" className="h-7 text-xs">
                                Dossier patient
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500 mb-2">Aucun rendez-vous aujourd'hui</p>
                  <Link to="/rendez-vous/nouveau">
                    <Button size="sm">
                      Programmer un rendez-vous
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Planning des médecins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {medecins.map((medecin) => {
                  // Trouver la disponibilité pour aujourd'hui
                  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long' });
                  const disponibilite = medecin.disponibilites.find(
                    d => d.jour.toLowerCase() === today.toLowerCase()
                  );
                  
                  // Compter les rendez-vous pour ce médecin aujourd'hui
                  const rdvCount = todayAppointments.filter(
                    rdv => rdv.medecinId === medecin.id
                  ).length;

                  return (
                    <div key={medecin.id} className="flex items-center justify-between border-b pb-3">
                      <div className="flex items-center">
                        <div className="w-9 h-9 rounded-full bg-clinic-100 flex items-center justify-center mr-3">
                          <User className="h-5 w-5 text-clinic-600" />
                        </div>
                        <div>
                          <p className="font-medium">Dr. {medecin.prenom} {medecin.nom}</p>
                          <p className="text-xs text-gray-500">{medecin.specialite}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {disponibilite ? (
                          <>
                            <p className="text-sm text-gray-700">{disponibilite.debut} - {disponibilite.fin}</p>
                            <p className="text-xs text-gray-500">{rdvCount} rendez-vous aujourd'hui</p>
                          </>
                        ) : (
                          <p className="text-xs text-gray-500">Non disponible aujourd'hui</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-col pb-4">
              <CardTitle className="text-lg mb-3">Recherche Patients</CardTitle>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nom, prénom ou téléphone"
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              {searchTerm ? (
                filteredPatients.length > 0 ? (
                  <div className="space-y-2">
                    {filteredPatients.slice(0, 5).map(patient => (
                      <Link to={`/patients/detail/${patient.id}`} key={patient.id}>
                        <div className="flex items-center p-2 hover:bg-gray-50 rounded-md">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-2">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium">{patient.prenom} {patient.nom}</p>
                            <p className="text-xs text-gray-500">{patient.telephone}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                    {filteredPatients.length > 5 && (
                      <p className="text-xs text-gray-400 text-center pt-1">
                        + {filteredPatients.length - 5} autres résultats
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-sm text-gray-500 py-4">
                    Aucun patient trouvé
                  </p>
                )
              ) : (
                <p className="text-center text-sm text-gray-500 py-4">
                  Saisissez un terme pour rechercher
                </p>
              )}
              
              <div className="mt-4 pt-3 border-t">
                <Link to="/patients/nouveau">
                  <Button className="w-full" variant="outline">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Nouveau patient
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                <Link to="/rendez-vous/nouveau">
                  <Button variant="secondary" className="w-full justify-start h-auto py-3">
                    <Calendar className="h-5 w-5 mr-3 text-clinic-600" />
                    <div className="text-left">
                      <p className="font-medium">Nouveau rendez-vous</p>
                      <p className="text-xs text-gray-500">Programmer un nouveau rendez-vous</p>
                    </div>
                  </Button>
                </Link>
                
                <Link to="/factures">
                  <Button variant="secondary" className="w-full justify-start h-auto py-3">
                    <CheckCircle className="h-5 w-5 mr-3 text-green-600" />
                    <div className="text-left">
                      <p className="font-medium">Gérer les factures</p>
                      <p className="text-xs text-gray-500">Voir et modifier les factures</p>
                    </div>
                  </Button>
                </Link>
                
                <Link to="/messages">
                  <Button variant="secondary" className="w-full justify-start h-auto py-3">
                    <XCircle className="h-5 w-5 mr-3 text-blue-600" />
                    <div className="text-left">
                      <p className="font-medium">Messages</p>
                      <p className="text-xs text-gray-500">Voir les messages reçus</p>
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

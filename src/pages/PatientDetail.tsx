
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Card, CardContent, CardDescription, CardFooter, 
  CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Edit, FileText, Plus, Pill, Stethoscope, Calendar, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Note, Prescription, Traitement, Medicament } from '@/types';

const PatientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { patients, medecins, rendezVous, updatePatient } = useData();
  const { currentUser } = useAuth();
  
  const patient = patients.find(p => p.id === id);
  
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [isAddPrescriptionOpen, setIsAddPrescriptionOpen] = useState(false);
  const [isAddTraitementOpen, setIsAddTraitementOpen] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [prescriptionInstructions, setPrescriptionInstructions] = useState('');
  const [medicaments, setMedicaments] = useState<Medicament[]>([{ nom: '', dosage: '', frequence: '', duree: '' }]);
  const [traitementDescription, setTraitementDescription] = useState('');
  const [traitementDuree, setTraitementDuree] = useState('');
  
  // Filtrer les rendez-vous du patient
  const patientAppointments = rendezVous.filter(rdv => rdv.patientId === id);
  
  if (!patient) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-red-600">Patient non trouvé</h2>
        <p className="text-gray-600 mb-4">
          Le patient recherché n'existe pas ou a été supprimé.
        </p>
        <Button onClick={() => navigate('/patients')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la liste des patients
        </Button>
      </div>
    );
  }
  
  const handleAddNote = () => {
    if (!noteContent || !currentUser) {
      toast.error("Veuillez saisir le contenu de la note");
      return;
    }
    
    const newNote: Note = {
      id: `note-${Date.now()}`,
      date: new Date().toISOString(),
      medecinId: currentUser.id,
      contenu: noteContent
    };
    
    const updatedDossier = {
      ...patient.dossierMedical,
      notes: [...patient.dossierMedical.notes, newNote]
    };
    
    updatePatient(patient.id, { dossierMedical: updatedDossier });
    setIsAddNoteOpen(false);
    setNoteContent('');
    toast.success("Note ajoutée avec succès");
  };
  
  const handleAddMedicament = () => {
    setMedicaments([...medicaments, { nom: '', dosage: '', frequence: '', duree: '' }]);
  };
  
  const handleRemoveMedicament = (index: number) => {
    const updatedMedicaments = [...medicaments];
    updatedMedicaments.splice(index, 1);
    setMedicaments(updatedMedicaments);
  };
  
  const handleChangeMedicament = (index: number, field: keyof Medicament, value: string) => {
    const updatedMedicaments = [...medicaments];
    updatedMedicaments[index] = { ...updatedMedicaments[index], [field]: value };
    setMedicaments(updatedMedicaments);
  };
  
  const handleAddPrescription = () => {
    if (!prescriptionInstructions || medicaments.some(m => !m.nom || !m.dosage) || !currentUser) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    const newPrescription: Prescription = {
      id: `prescription-${Date.now()}`,
      date: new Date().toISOString(),
      medecinId: currentUser.id,
      medicaments: [...medicaments],
      instructions: prescriptionInstructions
    };
    
    const updatedDossier = {
      ...patient.dossierMedical,
      prescriptions: [...patient.dossierMedical.prescriptions, newPrescription]
    };
    
    updatePatient(patient.id, { dossierMedical: updatedDossier });
    setIsAddPrescriptionOpen(false);
    setMedicaments([{ nom: '', dosage: '', frequence: '', duree: '' }]);
    setPrescriptionInstructions('');
    toast.success("Prescription ajoutée avec succès");
  };
  
  const handleAddTraitement = () => {
    if (!traitementDescription || !traitementDuree || !currentUser) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    const newTraitement: Traitement = {
      id: `traitement-${Date.now()}`,
      date: new Date().toISOString(),
      medecinId: currentUser.id,
      description: traitementDescription,
      duree: traitementDuree,
      etat: 'en_cours'
    };
    
    const updatedDossier = {
      ...patient.dossierMedical,
      traitements: [...patient.dossierMedical.traitements, newTraitement]
    };
    
    updatePatient(patient.id, { dossierMedical: updatedDossier });
    setIsAddTraitementOpen(false);
    setTraitementDescription('');
    setTraitementDuree('');
    toast.success("Traitement ajouté avec succès");
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getMedecinName = (medecinId: string) => {
    const medecin = medecins.find(m => m.id === medecinId);
    return medecin ? `Dr. ${medecin.prenom} ${medecin.nom}` : "Médecin inconnu";
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center">
          <Button variant="outline" size="icon" onClick={() => navigate('/patients')} className="mr-4">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">
            Dossier de {patient.prenom} {patient.nom}
          </h1>
        </div>
        <Button variant="outline">
          <Edit className="mr-2 h-4 w-4" />
          Modifier les informations
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Informations patient</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nom complet</p>
              <p>{patient.prenom} {patient.nom}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date de naissance</p>
              <p>{new Date(patient.dateNaissance).toLocaleDateString('fr-FR')}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Numéro de sécurité sociale</p>
              <p>{patient.nss}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Adresse</p>
              <p>{patient.adresse}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
              <p>{patient.telephone}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p>{patient.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date de création du dossier</p>
              <p>{new Date(patient.dateCreation).toLocaleDateString('fr-FR')}</p>
            </div>
          </CardContent>
        </Card>
        
        <div className="lg:col-span-2">
          <Tabs defaultValue="notes" className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="notes" className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Notes
              </TabsTrigger>
              <TabsTrigger value="prescriptions" className="flex items-center">
                <Pill className="h-4 w-4 mr-2" />
                Prescriptions
              </TabsTrigger>
              <TabsTrigger value="traitements" className="flex items-center">
                <Stethoscope className="h-4 w-4 mr-2" />
                Traitements
              </TabsTrigger>
              <TabsTrigger value="rendez-vous" className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Rendez-vous
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="notes">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Notes médicales</CardTitle>
                    <CardDescription>Historique des notes médicales</CardDescription>
                  </div>
                  <Button onClick={() => setIsAddNoteOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter une note
                  </Button>
                </CardHeader>
                <CardContent>
                  {patient.dossierMedical.notes.length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground">Aucune note disponible</p>
                  ) : (
                    <div className="space-y-4">
                      {patient.dossierMedical.notes
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map(note => (
                          <div key={note.id} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <p className="font-medium">{getMedecinName(note.medecinId)}</p>
                              <p className="text-sm text-muted-foreground">{formatDate(note.date)}</p>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{note.contenu}</p>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="prescriptions">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Prescriptions</CardTitle>
                    <CardDescription>Historique des prescriptions médicales</CardDescription>
                  </div>
                  <Button onClick={() => setIsAddPrescriptionOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nouvelle prescription
                  </Button>
                </CardHeader>
                <CardContent>
                  {patient.dossierMedical.prescriptions.length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground">Aucune prescription disponible</p>
                  ) : (
                    <div className="space-y-4">
                      {patient.dossierMedical.prescriptions
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map(prescription => (
                          <div key={prescription.id} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-start mb-3">
                              <p className="font-medium">{getMedecinName(prescription.medecinId)}</p>
                              <p className="text-sm text-muted-foreground">{formatDate(prescription.date)}</p>
                            </div>
                            <div className="space-y-3">
                              <h4 className="text-sm font-medium">Médicaments prescrits:</h4>
                              <ul className="list-disc pl-5 space-y-1">
                                {prescription.medicaments.map((med, index) => (
                                  <li key={index} className="text-sm">
                                    <span className="font-medium">{med.nom}</span> - {med.dosage} 
                                    {med.frequence && `, ${med.frequence}`}
                                    {med.duree && `, pendant ${med.duree}`}
                                  </li>
                                ))}
                              </ul>
                              {prescription.instructions && (
                                <>
                                  <h4 className="text-sm font-medium mt-2">Instructions:</h4>
                                  <p className="text-sm">{prescription.instructions}</p>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="traitements">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Traitements</CardTitle>
                    <CardDescription>Traitements en cours et passés</CardDescription>
                  </div>
                  <Button onClick={() => setIsAddTraitementOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nouveau traitement
                  </Button>
                </CardHeader>
                <CardContent>
                  {patient.dossierMedical.traitements.length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground">Aucun traitement disponible</p>
                  ) : (
                    <div className="space-y-4">
                      {patient.dossierMedical.traitements
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map(traitement => (
                          <div key={traitement.id} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium">{getMedecinName(traitement.medecinId)}</p>
                                <p className="text-xs mt-1">
                                  <span className={`px-2 py-0.5 rounded-full ${
                                    traitement.etat === 'en_cours' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {traitement.etat === 'en_cours' ? 'En cours' : 'Terminé'}
                                  </span>
                                </p>
                              </div>
                              <p className="text-sm text-muted-foreground">{formatDate(traitement.date)}</p>
                            </div>
                            <div className="mt-2">
                              <p className="text-sm">{traitement.description}</p>
                              <p className="text-sm text-muted-foreground mt-1">Durée: {traitement.duree}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="rendez-vous">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Rendez-vous</CardTitle>
                    <CardDescription>Historique des rendez-vous</CardDescription>
                  </div>
                  <Button onClick={() => navigate('/rendez-vous/nouveau', { state: { patientId: patient.id } })}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nouveau rendez-vous
                  </Button>
                </CardHeader>
                <CardContent>
                  {patientAppointments.length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground">Aucun rendez-vous disponible</p>
                  ) : (
                    <div className="space-y-4">
                      {patientAppointments
                        .sort((a, b) => {
                          // Trier par date décroissante
                          const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
                          if (dateComparison !== 0) return dateComparison;
                          // Si même date, trier par heure
                          return b.heure.localeCompare(a.heure);
                        })
                        .map(rdv => {
                          const medecin = medecins.find(m => m.id === rdv.medecinId);
                          const rdvDate = new Date(rdv.date);
                          const formattedDate = rdvDate.toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          });
                          
                          let statusClass = '';
                          let statusText = '';
                          
                          switch (rdv.statut) {
                            case 'confirme':
                              statusClass = 'bg-green-100 text-green-800';
                              statusText = 'Confirmé';
                              break;
                            case 'annule':
                              statusClass = 'bg-red-100 text-red-800';
                              statusText = 'Annulé';
                              break;
                            default:
                              statusClass = 'bg-yellow-100 text-yellow-800';
                              statusText = 'En attente';
                          }
                          
                          return (
                            <div key={rdv.id} className="p-4 border rounded-lg">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">
                                    {medecin ? `Dr. ${medecin.prenom} ${medecin.nom}` : 'Médecin inconnu'}
                                  </p>
                                  <p className="text-sm text-muted-foreground">{rdv.motif}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm">{formattedDate}</p>
                                  <p className="text-sm">{rdv.heure} ({rdv.duree} min)</p>
                                </div>
                              </div>
                              <div className="mt-2 flex justify-between items-center">
                                <span className={`px-2 py-0.5 text-xs rounded-full ${statusClass}`}>
                                  {statusText}
                                </span>
                                <Button variant="outline" size="sm" onClick={() => navigate(`/rendez-vous/${rdv.id}`)}>
                                  Détails
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Dialog pour ajouter une note */}
      <Dialog open={isAddNoteOpen} onOpenChange={setIsAddNoteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter une note médicale</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="noteContent">Contenu de la note</Label>
              <Textarea
                id="noteContent"
                placeholder="Saisissez vos observations médicales..."
                rows={6}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddNoteOpen(false)}>Annuler</Button>
            <Button onClick={handleAddNote}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog pour ajouter une prescription */}
      <Dialog open={isAddPrescriptionOpen} onOpenChange={setIsAddPrescriptionOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouvelle prescription</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Médicaments</Label>
              {medicaments.map((med, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                  <div className="col-span-3">
                    <Input
                      placeholder="Nom"
                      value={med.nom}
                      onChange={(e) => handleChangeMedicament(index, 'nom', e.target.value)}
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      placeholder="Dosage"
                      value={med.dosage}
                      onChange={(e) => handleChangeMedicament(index, 'dosage', e.target.value)}
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      placeholder="Fréquence"
                      value={med.frequence}
                      onChange={(e) => handleChangeMedicament(index, 'frequence', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      placeholder="Durée"
                      value={med.duree}
                      onChange={(e) => handleChangeMedicament(index, 'duree', e.target.value)}
                    />
                  </div>
                  <div className="col-span-1 flex items-center justify-center">
                    {index > 0 && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleRemoveMedicament(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <Button variant="outline" type="button" onClick={handleAddMedicament} className="w-full mt-2">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un médicament
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                placeholder="Instructions complémentaires..."
                rows={3}
                value={prescriptionInstructions}
                onChange={(e) => setPrescriptionInstructions(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPrescriptionOpen(false)}>Annuler</Button>
            <Button onClick={handleAddPrescription}>Créer la prescription</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog pour ajouter un traitement */}
      <Dialog open={isAddTraitementOpen} onOpenChange={setIsAddTraitementOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouveau traitement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description du traitement</Label>
              <Textarea
                id="description"
                placeholder="Description détaillée du traitement..."
                rows={4}
                value={traitementDescription}
                onChange={(e) => setTraitementDescription(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duree">Durée du traitement</Label>
              <Input
                id="duree"
                placeholder="Ex: 2 semaines, 1 mois..."
                value={traitementDuree}
                onChange={(e) => setTraitementDuree(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTraitementOpen(false)}>Annuler</Button>
            <Button onClick={handleAddTraitement}>Ajouter le traitement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientDetail;

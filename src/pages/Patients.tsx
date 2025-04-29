
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Patient } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Search, User, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Patients = () => {
  const { patients, addPatient, updatePatient, deletePatient } = useData();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  
  // Formulaire patient
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [dateNaissance, setDateNaissance] = useState('');
  const [adresse, setAdresse] = useState('');
  const [nss, setNss] = useState('');
  
  // Filtrer les patients en fonction du terme de recherche
  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.prenom} ${patient.nom}`.toLowerCase();
    const contactInfo = `${patient.email} ${patient.telephone}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || contactInfo.includes(searchTerm.toLowerCase());
  });
  
  const resetForm = () => {
    setNom('');
    setPrenom('');
    setEmail('');
    setTelephone('');
    setDateNaissance('');
    setAdresse('');
    setNss('');
    setCurrentPatient(null);
  };
  
  const handleAddPatient = () => {
    if (!nom || !prenom || !email || !telephone || !dateNaissance || !adresse || !nss) {
      toast.error("Veuillez remplir tous les champs requis");
      return;
    }
    
    const newPatient: Patient = {
      id: `patient-${Date.now()}`,
      nom,
      prenom,
      email,
      telephone,
      role: 'patient',
      dateCreation: new Date().toISOString(),
      dateNaissance,
      adresse,
      nss,
      dossierMedical: {
        id: `dossier-${Date.now()}`,
        patientId: `patient-${Date.now()}`,
        notes: [],
        prescriptions: [],
        traitements: []
      }
    };
    
    addPatient(newPatient);
    setIsAddDialogOpen(false);
    resetForm();
    toast.success("Patient ajouté avec succès");
  };
  
  const handleEditPatient = () => {
    if (!currentPatient || !nom || !prenom || !email || !telephone || !dateNaissance || !adresse || !nss) {
      toast.error("Veuillez remplir tous les champs requis");
      return;
    }
    
    const updatedPatient: Partial<Patient> = {
      nom,
      prenom,
      email,
      telephone,
      dateNaissance,
      adresse,
      nss
    };
    
    updatePatient(currentPatient.id, updatedPatient);
    setIsEditDialogOpen(false);
    resetForm();
    toast.success("Patient mis à jour avec succès");
  };
  
  const handleEditClick = (patient: Patient) => {
    setCurrentPatient(patient);
    setNom(patient.nom);
    setPrenom(patient.prenom);
    setEmail(patient.email);
    setTelephone(patient.telephone);
    setDateNaissance(patient.dateNaissance);
    setAdresse(patient.adresse);
    setNss(patient.nss);
    setIsEditDialogOpen(true);
  };
  
  const handleDeletePatient = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce patient ? Cette action est irréversible.")) {
      deletePatient(id);
      toast.success("Patient supprimé avec succès");
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Patients</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau patient
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Rechercher un patient</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, prénom, email ou téléphone..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPatients.length === 0 ? (
            <div className="text-center py-6">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p>Aucun patient trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-muted-foreground">
                    <th className="pb-2 font-medium">Nom</th>
                    <th className="pb-2 font-medium">Contact</th>
                    <th className="pb-2 font-medium">Date de naissance</th>
                    <th className="pb-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => {
                    const birthDate = new Date(patient.dateNaissance);
                    const formattedBirthDate = new Intl.DateTimeFormat('fr-FR').format(birthDate);
                    
                    return (
                      <tr key={patient.id} className="border-t">
                        <td className="py-3">
                          <div className="font-medium">{patient.prenom} {patient.nom}</div>
                          <div className="text-sm text-muted-foreground">NSS: {patient.nss}</div>
                        </td>
                        <td className="py-3">
                          <div className="text-sm">{patient.email}</div>
                          <div className="text-sm">{patient.telephone}</div>
                        </td>
                        <td className="py-3">
                          <div className="text-sm">{formattedBirthDate}</div>
                        </td>
                        <td className="py-3">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/patients/${patient.id}`)}
                            >
                              Dossier
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditClick(patient)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeletePatient(patient.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Dialog pour ajouter un patient */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau patient</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 py-4">
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom</Label>
              <Input
                id="prenom"
                placeholder="Prénom"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nom">Nom</Label>
              <Input
                id="nom"
                placeholder="Nom"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input
                id="telephone"
                placeholder="06 12 34 56 78"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateNaissance">Date de naissance</Label>
              <Input
                id="dateNaissance"
                type="date"
                value={dateNaissance}
                onChange={(e) => setDateNaissance(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nss">Numéro de sécurité sociale</Label>
              <Input
                id="nss"
                placeholder="1 23 45 67 890 123 45"
                value={nss}
                onChange={(e) => setNss(e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="adresse">Adresse</Label>
              <Input
                id="adresse"
                placeholder="Adresse complète"
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddPatient}>
              Ajouter le patient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog pour modifier un patient */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le patient</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 py-4">
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom</Label>
              <Input
                id="prenom"
                placeholder="Prénom"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nom">Nom</Label>
              <Input
                id="nom"
                placeholder="Nom"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input
                id="telephone"
                placeholder="06 12 34 56 78"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateNaissance">Date de naissance</Label>
              <Input
                id="dateNaissance"
                type="date"
                value={dateNaissance}
                onChange={(e) => setDateNaissance(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nss">Numéro de sécurité sociale</Label>
              <Input
                id="nss"
                placeholder="1 23 45 67 890 123 45"
                value={nss}
                onChange={(e) => setNss(e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="adresse">Adresse</Label>
              <Input
                id="adresse"
                placeholder="Adresse complète"
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditPatient}>
              Enregistrer les modifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Patients;

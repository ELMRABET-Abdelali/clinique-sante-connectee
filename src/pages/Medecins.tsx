
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Medecin, Disponibilite } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Stethoscope, Edit, Trash2, Clock, Plus as PlusIcon, Minus } from 'lucide-react';
import { toast } from 'sonner';

const joursArray = [
  'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'
];

const joursFr: Record<string, string> = {
  'lundi': 'Lundi',
  'mardi': 'Mardi',
  'mercredi': 'Mercredi',
  'jeudi': 'Jeudi',
  'vendredi': 'Vendredi',
  'samedi': 'Samedi',
  'dimanche': 'Dimanche'
};

const hoursRange = Array.from({ length: 14 }, (_, i) => {
  const hour = i + 8; // Starting from 8:00 to 21:00
  return `${hour.toString().padStart(2, '0')}:00`;
});

const Medecins = () => {
  const { medecins, addMedecin, updateMedecin, deleteMedecin } = useData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentMedecin, setCurrentMedecin] = useState<Medecin | null>(null);
  
  // Formulaire médecin
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [specialite, setSpecialite] = useState('');
  const [disponibilites, setDisponibilites] = useState<Disponibilite[]>([
    { jour: 'lundi', debut: '09:00', fin: '17:00' }
  ]);
  
  // Filtrer les médecins en fonction du terme de recherche
  const filteredMedecins = medecins.filter(medecin => {
    const fullName = `${medecin.prenom} ${medecin.nom}`.toLowerCase();
    const specialiteInfo = medecin.specialite.toLowerCase();
    const contactInfo = `${medecin.email} ${medecin.telephone}`.toLowerCase();
    
    return fullName.includes(searchTerm.toLowerCase()) || 
           specialiteInfo.includes(searchTerm.toLowerCase()) || 
           contactInfo.includes(searchTerm.toLowerCase());
  });
  
  const resetForm = () => {
    setNom('');
    setPrenom('');
    setEmail('');
    setTelephone('');
    setSpecialite('');
    setDisponibilites([{ jour: 'lundi', debut: '09:00', fin: '17:00' }]);
    setCurrentMedecin(null);
  };
  
  const handleAddMedecin = () => {
    if (!nom || !prenom || !email || !telephone || !specialite) {
      toast.error("Veuillez remplir tous les champs requis");
      return;
    }
    
    // Vérifier que les horaires de disponibilités sont valides
    for (const dispo of disponibilites) {
      if (dispo.debut >= dispo.fin) {
        toast.error("L'heure de début doit être antérieure à l'heure de fin");
        return;
      }
    }
    
    const newMedecin: Medecin = {
      id: `medecin-${Date.now()}`,
      nom,
      prenom,
      email,
      telephone,
      role: 'medecin' as any, // Le type Medecin attend 'medecin', mais le type Role a 'admin', 'secretaire', 'patient'
      dateCreation: new Date().toISOString(),
      specialite,
      disponibilites: [...disponibilites],
      patients: []
    };
    
    addMedecin(newMedecin);
    setIsAddDialogOpen(false);
    resetForm();
    toast.success("Médecin ajouté avec succès");
  };
  
  const handleEditMedecin = () => {
    if (!currentMedecin || !nom || !prenom || !email || !telephone || !specialite) {
      toast.error("Veuillez remplir tous les champs requis");
      return;
    }
    
    // Vérifier que les horaires de disponibilités sont valides
    for (const dispo of disponibilites) {
      if (dispo.debut >= dispo.fin) {
        toast.error("L'heure de début doit être antérieure à l'heure de fin");
        return;
      }
    }
    
    const updatedMedecin: Partial<Medecin> = {
      nom,
      prenom,
      email,
      telephone,
      specialite,
      disponibilites: [...disponibilites]
    };
    
    updateMedecin(currentMedecin.id, updatedMedecin);
    setIsEditDialogOpen(false);
    resetForm();
    toast.success("Médecin mis à jour avec succès");
  };
  
  const handleEditClick = (medecin: Medecin) => {
    setCurrentMedecin(medecin);
    setNom(medecin.nom);
    setPrenom(medecin.prenom);
    setEmail(medecin.email);
    setTelephone(medecin.telephone);
    setSpecialite(medecin.specialite);
    setDisponibilites([...medecin.disponibilites]);
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteMedecin = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce médecin ? Cette action est irréversible.")) {
      deleteMedecin(id);
      toast.success("Médecin supprimé avec succès");
    }
  };
  
  const handleAddDisponibilite = () => {
    // Trouver le premier jour non utilisé
    const usedJours = disponibilites.map(d => d.jour);
    const availableJour = joursArray.find(j => !usedJours.includes(j)) || joursArray[0];
    
    setDisponibilites([...disponibilites, { 
      jour: availableJour, 
      debut: '09:00', 
      fin: '17:00' 
    }]);
  };
  
  const handleRemoveDisponibilite = (index: number) => {
    const newDispos = [...disponibilites];
    newDispos.splice(index, 1);
    setDisponibilites(newDispos);
  };
  
  const handleChangeDisponibilite = (index: number, field: keyof Disponibilite, value: string) => {
    const newDispos = [...disponibilites];
    newDispos[index] = { ...newDispos[index], [field]: value };
    setDisponibilites(newDispos);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Médecins</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau médecin
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Rechercher un médecin</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, spécialité, email..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredMedecins.length === 0 ? (
            <div className="text-center py-6">
              <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p>Aucun médecin trouvé</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMedecins.map((medecin) => (
                <Card key={medecin.id} className="overflow-hidden">
                  <CardHeader className="pb-2 pt-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>Dr. {medecin.prenom} {medecin.nom}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{medecin.specialite}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Email:</span> {medecin.email}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Téléphone:</span> {medecin.telephone}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Patients:</span> {medecin.patients.length}
                      </div>
                      
                      <div className="text-sm mt-4">
                        <p className="text-muted-foreground mb-1">Disponibilités:</p>
                        <div className="space-y-1">
                          {medecin.disponibilites.map((dispo, index) => (
                            <div key={index} className="flex items-center text-xs">
                              <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                              <span className="font-medium">{joursFr[dispo.jour]}:</span> 
                              <span className="ml-1">{dispo.debut} - {dispo.fin}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEditClick(medecin)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Modifier
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleDeleteMedecin(medecin.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Dialog pour ajouter un médecin */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau médecin</DialogTitle>
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
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="specialite">Spécialité</Label>
              <Input
                id="specialite"
                placeholder="Ex: Cardiologie, Dermatologie, etc."
                value={specialite}
                onChange={(e) => setSpecialite(e.target.value)}
              />
            </div>
            
            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-center justify-between">
                <Label>Disponibilités</Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddDisponibilite}
                  type="button"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              </div>
              
              {disponibilites.map((dispo, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 mt-2">
                  <div className="col-span-4">
                    <Select 
                      value={dispo.jour} 
                      onValueChange={(value) => handleChangeDisponibilite(index, 'jour', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Jour" />
                      </SelectTrigger>
                      <SelectContent>
                        {joursArray.map((jour) => (
                          <SelectItem 
                            key={jour} 
                            value={jour}
                            disabled={disponibilites.some((d, i) => i !== index && d.jour === jour)}
                          >
                            {joursFr[jour]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3">
                    <Select 
                      value={dispo.debut} 
                      onValueChange={(value) => handleChangeDisponibilite(index, 'debut', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Début" />
                      </SelectTrigger>
                      <SelectContent>
                        {hoursRange.map((hour) => (
                          <SelectItem key={`start-${hour}`} value={hour}>
                            {hour}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3">
                    <Select 
                      value={dispo.fin} 
                      onValueChange={(value) => handleChangeDisponibilite(index, 'fin', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Fin" />
                      </SelectTrigger>
                      <SelectContent>
                        {hoursRange.map((hour) => (
                          <SelectItem key={`end-${hour}`} value={hour}>
                            {hour}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Button
                      variant="destructive"
                      size="icon"
                      className="w-full h-10"
                      onClick={() => handleRemoveDisponibilite(index)}
                      disabled={disponibilites.length <= 1}
                      type="button"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddMedecin}>
              Ajouter le médecin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog pour modifier un médecin */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier le médecin</DialogTitle>
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
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="specialite">Spécialité</Label>
              <Input
                id="specialite"
                placeholder="Ex: Cardiologie, Dermatologie, etc."
                value={specialite}
                onChange={(e) => setSpecialite(e.target.value)}
              />
            </div>
            
            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-center justify-between">
                <Label>Disponibilités</Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddDisponibilite}
                  type="button"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              </div>
              
              {disponibilites.map((dispo, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 mt-2">
                  <div className="col-span-4">
                    <Select 
                      value={dispo.jour} 
                      onValueChange={(value) => handleChangeDisponibilite(index, 'jour', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Jour" />
                      </SelectTrigger>
                      <SelectContent>
                        {joursArray.map((jour) => (
                          <SelectItem 
                            key={jour} 
                            value={jour}
                            disabled={disponibilites.some((d, i) => i !== index && d.jour === jour)}
                          >
                            {joursFr[jour]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3">
                    <Select 
                      value={dispo.debut} 
                      onValueChange={(value) => handleChangeDisponibilite(index, 'debut', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Début" />
                      </SelectTrigger>
                      <SelectContent>
                        {hoursRange.map((hour) => (
                          <SelectItem key={`start-${hour}`} value={hour}>
                            {hour}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3">
                    <Select 
                      value={dispo.fin} 
                      onValueChange={(value) => handleChangeDisponibilite(index, 'fin', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Fin" />
                      </SelectTrigger>
                      <SelectContent>
                        {hoursRange.map((hour) => (
                          <SelectItem key={`end-${hour}`} value={hour}>
                            {hour}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Button
                      variant="destructive"
                      size="icon"
                      className="w-full h-10"
                      onClick={() => handleRemoveDisponibilite(index)}
                      disabled={disponibilites.length <= 1}
                      type="button"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditMedecin}>
              Enregistrer les modifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Medecins;

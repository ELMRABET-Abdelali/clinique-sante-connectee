
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar as CalendarIcon, Clock, Plus, Edit, Trash2, Search, CalendarDays } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { RendezVous as RendezVousType, Patient, Medecin } from '@/types';

const RendezVous = () => {
  const { rendezVous, medecins, patients, addRendezVous, updateRendezVous, deleteRendezVous } = useData();
  const { role } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedMedecin, setSelectedMedecin] = useState('');
  const [duration, setDuration] = useState('30');
  const [motif, setMotif] = useState('');
  const [currentRdv, setCurrentRdv] = useState<RendezVousType | null>(null);
  
  // Filtrer les rendez-vous en fonction du terme de recherche
  const filteredRendezVous = rendezVous.filter(rdv => {
    const patient = patients.find(p => p.id === rdv.patientId);
    const medecin = medecins.find(m => m.id === rdv.medecinId);
    const searchString = `${patient?.prenom} ${patient?.nom} ${medecin?.prenom} ${medecin?.nom} ${rdv.date} ${rdv.motif}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });
  
  // Trier les rendez-vous par date puis par heure
  const sortedRendezVous = [...filteredRendezVous].sort((a, b) => {
    if (a.date === b.date) {
      return a.heure.localeCompare(b.heure);
    }
    return a.date.localeCompare(b.date);
  });
  
  const handleAddRendezVous = () => {
    if (!selectedPatient || !selectedMedecin || !selectedDate || !selectedTime || !duration || !motif) {
      toast.error("Veuillez remplir tous les champs requis");
      return;
    }
    
    const newRendezVous: RendezVousType = {
      id: `rdv-${Date.now()}`,
      patientId: selectedPatient,
      medecinId: selectedMedecin,
      date: format(selectedDate, 'yyyy-MM-dd'),
      heure: selectedTime,
      duree: parseInt(duration),
      motif: motif,
      statut: 'en_attente'
    };
    
    addRendezVous(newRendezVous);
    setIsAddDialogOpen(false);
    resetForm();
    toast.success("Rendez-vous ajouté avec succès");
  };
  
  const handleEditRendezVous = () => {
    if (!currentRdv || !selectedPatient || !selectedMedecin || !selectedDate || !selectedTime || !duration || !motif) {
      toast.error("Veuillez remplir tous les champs requis");
      return;
    }
    
    const updatedRendezVous: Partial<RendezVousType> = {
      patientId: selectedPatient,
      medecinId: selectedMedecin,
      date: format(selectedDate, 'yyyy-MM-dd'),
      heure: selectedTime,
      duree: parseInt(duration),
      motif: motif
    };
    
    updateRendezVous(currentRdv.id, updatedRendezVous);
    setIsEditDialogOpen(false);
    resetForm();
    toast.success("Rendez-vous mis à jour avec succès");
  };
  
  const handleDeleteRendezVous = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce rendez-vous ?")) {
      deleteRendezVous(id);
      toast.success("Rendez-vous supprimé avec succès");
    }
  };
  
  const handleEditClick = (rdv: RendezVousType) => {
    setCurrentRdv(rdv);
    setSelectedPatient(rdv.patientId);
    setSelectedMedecin(rdv.medecinId);
    setSelectedDate(new Date(rdv.date));
    setSelectedTime(rdv.heure);
    setDuration(rdv.duree.toString());
    setMotif(rdv.motif);
    setIsEditDialogOpen(true);
  };
  
  const resetForm = () => {
    setSelectedPatient('');
    setSelectedMedecin('');
    setSelectedDate(new Date());
    setSelectedTime('09:00');
    setDuration('30');
    setMotif('');
    setCurrentRdv(null);
  };
  
  const getPatientName = (id: string): string => {
    const patient = patients.find(p => p.id === id);
    return patient ? `${patient.prenom} ${patient.nom}` : 'Patient inconnu';
  };
  
  const getMedecinName = (id: string): string => {
    const medecin = medecins.find(m => m.id === id);
    return medecin ? `Dr. ${medecin.prenom} ${medecin.nom}` : 'Médecin inconnu';
  };

  // Formatter le statut pour l'affichage
  const formatStatut = (statut: string): string => {
    switch (statut) {
      case 'confirme': return 'Confirmé';
      case 'annule': return 'Annulé';
      case 'en_attente': return 'En attente';
      default: return statut;
    }
  };
  
  // Obtenir la classe CSS pour le statut
  const getStatutClass = (statut: string): string => {
    switch (statut) {
      case 'confirme': return 'bg-green-100 text-green-800';
      case 'annule': return 'bg-red-100 text-red-800';
      case 'en_attente': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Rendez-vous</h1>
        {(role === 'admin' || role === 'secretaire') && (
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau rendez-vous
          </Button>
        )}
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Rechercher un rendez-vous</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par patient, médecin, date..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sortedRendezVous.length === 0 ? (
            <div className="text-center py-6">
              <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p>Aucun rendez-vous trouvé</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedRendezVous.map((rdv) => (
                <div
                  key={rdv.id}
                  className={cn(
                    "p-4 border rounded-md",
                    rdv.statut === 'confirme' ? 'border-l-4 border-l-green-500' :
                    rdv.statut === 'annule' ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-yellow-500'
                  )}
                >
                  <div className="flex flex-col md:flex-row justify-between">
                    <div>
                      <h3 className="font-medium">{getPatientName(rdv.patientId)}</h3>
                      <p className="text-sm text-muted-foreground">{getMedecinName(rdv.medecinId)}</p>
                    </div>
                    
                    <div className="flex flex-col md:items-end mt-2 md:mt-0">
                      <div className="flex items-center mb-1">
                        <CalendarIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span className="text-sm">
                          {format(new Date(rdv.date), 'dd MMMM yyyy', { locale: fr })}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span className="text-sm">{rdv.heure} ({rdv.duree} min)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex flex-wrap items-center justify-between">
                    <div>
                      <p className="text-sm mt-1">{rdv.motif}</p>
                      <span className={cn("mt-2 inline-block text-xs px-2 py-1 rounded-full", getStatutClass(rdv.statut))}>
                        {formatStatut(rdv.statut)}
                      </span>
                    </div>
                    
                    {(role === 'admin' || role === 'secretaire') && (
                      <div className="flex gap-2 mt-2 md:mt-0">
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(rdv)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Modifier
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteRendezVous(rdv.id)}>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Supprimer
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Dialog pour ajouter un rendez-vous */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un rendez-vous</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="patient">Patient</Label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.prenom} {patient.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="medecin">Médecin</Label>
              <Select value={selectedMedecin} onValueChange={setSelectedMedecin}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un médecin" />
                </SelectTrigger>
                <SelectContent>
                  {medecins.map((medecin) => (
                    <SelectItem key={medecin.id} value={medecin.id}>
                      Dr. {medecin.prenom} {medecin.nom} ({medecin.specialite})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, 'dd MMMM yyyy', { locale: fr }) : <span>Choisir une date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time">Heure</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une heure" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(11)].map((_, i) => {
                      const hour = 8 + i;
                      return (
                        <React.Fragment key={`hour-${hour}`}>
                          <SelectItem value={`${hour.toString().padStart(2, '0')}:00`}>
                            {`${hour.toString().padStart(2, '0')}:00`}
                          </SelectItem>
                          <SelectItem value={`${hour.toString().padStart(2, '0')}:30`}>
                            {`${hour.toString().padStart(2, '0')}:30`}
                          </SelectItem>
                        </React.Fragment>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="duration">Durée (minutes)</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une durée" />
                  </SelectTrigger>
                  <SelectContent>
                    {[15, 30, 45, 60, 90, 120].map((d) => (
                      <SelectItem key={d} value={d.toString()}>
                        {d} minutes
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="motif">Motif du rendez-vous</Label>
              <Input
                id="motif"
                placeholder="Consultation, contrôle, etc."
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddRendezVous}>
              Ajouter le rendez-vous
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog pour modifier un rendez-vous */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le rendez-vous</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="patient">Patient</Label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.prenom} {patient.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="medecin">Médecin</Label>
              <Select value={selectedMedecin} onValueChange={setSelectedMedecin}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un médecin" />
                </SelectTrigger>
                <SelectContent>
                  {medecins.map((medecin) => (
                    <SelectItem key={medecin.id} value={medecin.id}>
                      Dr. {medecin.prenom} {medecin.nom} ({medecin.specialite})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, 'dd MMMM yyyy', { locale: fr }) : <span>Choisir une date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time">Heure</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une heure" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(11)].map((_, i) => {
                      const hour = 8 + i;
                      return (
                        <React.Fragment key={`hour-${hour}`}>
                          <SelectItem value={`${hour.toString().padStart(2, '0')}:00`}>
                            {`${hour.toString().padStart(2, '0')}:00`}
                          </SelectItem>
                          <SelectItem value={`${hour.toString().padStart(2, '0')}:30`}>
                            {`${hour.toString().padStart(2, '0')}:30`}
                          </SelectItem>
                        </React.Fragment>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="duration">Durée (minutes)</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une durée" />
                  </SelectTrigger>
                  <SelectContent>
                    {[15, 30, 45, 60, 90, 120].map((d) => (
                      <SelectItem key={d} value={d.toString()}>
                        {d} minutes
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="statut">Statut</Label>
                <Select value={currentRdv?.statut} onValueChange={(value) => setCurrentRdv(prev => prev ? {...prev, statut: value as any} : null)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en_attente">En attente</SelectItem>
                    <SelectItem value="confirme">Confirmé</SelectItem>
                    <SelectItem value="annule">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="motif">Motif du rendez-vous</Label>
              <Input
                id="motif"
                placeholder="Consultation, contrôle, etc."
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditRendezVous}>
              Enregistrer les modifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RendezVous;

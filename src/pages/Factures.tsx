import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Facture, Service } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, Search, FileText, Edit, Trash2, Download, Check, X 
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const Factures = () => {
  const { factures, patients, medecins, addFacture, updateFacture, deleteFacture } = useData();
  const { role } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('tous');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedMedecin, setSelectedMedecin] = useState('');
  const [services, setServices] = useState<Service[]>([{ description: '', prix: 0, quantite: 1 }]);
  const [currentFacture, setCurrentFacture] = useState<Facture | null>(null);
  
  // Filtrer les factures en fonction du terme de recherche et du statut
  const filteredFactures = factures.filter(facture => {
    const patient = patients.find(p => p.id === facture.patientId);
    const medecin = medecins.find(m => m.id === facture.medecinId);
    const searchString = `${facture.numeroFacture} ${patient?.prenom} ${patient?.nom} ${medecin?.prenom} ${medecin?.nom}`.toLowerCase();
    
    // Filtrer par texte
    const textMatch = searchString.includes(searchTerm.toLowerCase());
    
    // Filtrer par statut
    const statusMatch = statusFilter === 'tous' || facture.statut === statusFilter;
    
    return textMatch && statusMatch;
  });
  
  // Trier les factures par date (la plus récente en premier)
  const sortedFactures = [...filteredFactures].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  const calculateTotal = (serviceList: Service[]): number => {
    return serviceList.reduce((total, service) => total + service.prix * service.quantite, 0);
  };
  
  const handleAddService = () => {
    setServices([...services, { description: '', prix: 0, quantite: 1 }]);
  };
  
  const handleRemoveService = (index: number) => {
    if (services.length > 1) {
      const updatedServices = [...services];
      updatedServices.splice(index, 1);
      setServices(updatedServices);
    } else {
      toast.error("Une facture doit contenir au moins un service");
    }
  };
  
  const handleChangeService = (index: number, field: keyof Service, value: string | number) => {
    const updatedServices = [...services];
    
    if (field === 'prix' || field === 'quantite') {
      updatedServices[index] = { 
        ...updatedServices[index], 
        [field]: typeof value === 'string' ? parseFloat(value) || 0 : value 
      };
    } else {
      updatedServices[index] = { ...updatedServices[index], [field]: value };
    }
    
    setServices(updatedServices);
  };
  
  function handleAddFacture() {
    if (!selectedPatient || !selectedMedecin || services.some(s => !s.description)) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    const montantTotal = calculateTotal(services);
    
    const newFacture: Facture = {
      id: `facture-${Date.now()}`,
      numeroFacture: `F${new Date().getFullYear()}${String(Date.now()).slice(-6)}`,
      date: new Date().toISOString(),
      patientId: selectedPatient,
      medecinId: selectedMedecin,
      services: [...services],
      montantTotal,
      statut: 'non_payee'
    };
    
    addFacture(newFacture);
    setIsAddDialogOpen(false);
    resetForm();
    toast.success("Facture créée avec succès");
  }
  
  function handleEditFacture() {
    if (!currentFacture || !selectedPatient || !selectedMedecin || services.some(s => !s.description)) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    const montantTotal = calculateTotal(services);
    
    const updatedFacture: Partial<Facture> = {
      patientId: selectedPatient,
      medecinId: selectedMedecin,
      services: [...services],
      montantTotal
    };
    
    updateFacture(currentFacture.id, updatedFacture);
    setIsEditDialogOpen(false);
    resetForm();
    toast.success("Facture mise à jour avec succès");
  }
  
  function handleEditClick(facture: Facture) {
    setCurrentFacture(facture);
    setSelectedPatient(facture.patientId);
    setSelectedMedecin(facture.medecinId);
    setServices([...facture.services]);
    setIsEditDialogOpen(true);
  }
  
  function handleDeleteFacture(id: string) {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette facture ? Cette action est irréversible.")) {
      deleteFacture(id);
      toast.success("Facture supprimée avec succès");
    }
  }
  
  function handleToggleStatus(facture: Facture) {
    const newStatus = facture.statut === 'payee' ? 'non_payee' : 'payee';
    
    updateFacture(facture.id, {
      statut: newStatus
    });
    
    toast.success(`Facture marquée comme ${newStatus === 'payee' ? 'payée' : 'non payée'}`);
  }
  
  function handleDownloadFacture(facture: Facture) {
    // Simuler le téléchargement
    toast.success("Téléchargement de la facture démarré");
    setTimeout(() => {
      toast.info("Pour une implémentation réelle, cette fonction exporterait un PDF de la facture");
    }, 1500);
  }
  
  function resetForm() {
    setSelectedPatient('');
    setSelectedMedecin('');
    setServices([{ description: '', prix: 0, quantite: 1 }]);
    setCurrentFacture(null);
  }
  
  function getPatientName(id: string): string {
    const patient = patients.find(p => p.id === id);
    return patient ? `${patient.prenom} ${patient.nom}` : 'Patient inconnu';
  }
  
  function getMedecinName(id: string): string {
    const medecin = medecins.find(m => m.id === id);
    return medecin ? `Dr. ${medecin.prenom} ${medecin.nom}` : 'Médecin inconnu';
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Factures</h1>
        {(role === 'admin' || role === 'secretaire') && (
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle facture
          </Button>
        )}
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Rechercher une facture</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par numéro, patient ou médecin..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les statuts</SelectItem>
                <SelectItem value="payee">Payées</SelectItem>
                <SelectItem value="non_payee">Non payées</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {sortedFactures.length === 0 ? (
            <div className="text-center py-6">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p>Aucune facture trouvée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-muted-foreground">
                    <th className="pb-2 font-medium">N° Facture</th>
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Patient</th>
                    <th className="pb-2 font-medium">Médecin</th>
                    <th className="pb-2 font-medium">Montant</th>
                    <th className="pb-2 font-medium">Statut</th>
                    <th className="pb-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedFactures.map((facture) => (
                    <tr key={facture.id} className="border-t">
                      <td className="py-3">
                        <div className="font-medium">{facture.numeroFacture}</div>
                      </td>
                      <td className="py-3">
                        <div className="text-sm">
                          {format(new Date(facture.date), 'dd MMM yyyy', { locale: fr })}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="text-sm">{getPatientName(facture.patientId)}</div>
                      </td>
                      <td className="py-3">
                        <div className="text-sm">{getMedecinName(facture.medecinId)}</div>
                      </td>
                      <td className="py-3">
                        <div className="font-medium">{facture.montantTotal.toFixed(2)} €</div>
                      </td>
                      <td className="py-3">
                        <div className={cn(
                          "text-xs inline-flex items-center rounded-full px-2 py-1",
                          facture.statut === 'payee' 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        )}>
                          {facture.statut === 'payee' ? 'Payée' : 'Non payée'}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex space-x-1">
                          <Button 
                            variant="outline" 
                            size="sm"
                            title="Télécharger la facture"
                            onClick={() => handleDownloadFacture(facture)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          
                          {(role === 'admin' || role === 'secretaire') && (
                            <>
                              <Button 
                                variant={facture.statut === 'payee' ? "destructive" : "outline"}
                                size="sm"
                                title={facture.statut === 'payee' ? "Marquer comme non payée" : "Marquer comme payée"}
                                onClick={() => handleToggleStatus(facture)}
                              >
                                {facture.statut === 'payee' ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                              </Button>
                              
                              <Button 
                                variant="outline" 
                                size="sm"
                                title="Modifier"
                                onClick={() => handleEditClick(facture)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              
                              <Button 
                                variant="destructive" 
                                size="sm"
                                title="Supprimer"
                                onClick={() => handleDeleteFacture(facture.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Dialog pour ajouter une facture */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Créer une nouvelle facture</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                        Dr. {medecin.prenom} {medecin.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Services</Label>
              {services.map((service, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                  <div className="col-span-6">
                    <Input
                      placeholder="Description du service"
                      value={service.description}
                      onChange={(e) => handleChangeService(index, 'description', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Prix"
                      value={service.prix || ''}
                      onChange={(e) => handleChangeService(index, 'prix', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Qté"
                      value={service.quantite || ''}
                      onChange={(e) => handleChangeService(index, 'quantite', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2 flex items-center">
                    <div className="text-sm text-right w-full pr-2">
                      {(service.prix * service.quantite).toFixed(2)} €
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleRemoveService(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <Button variant="outline" type="button" onClick={handleAddService} className="w-full mt-2">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un service
              </Button>
              
              <div className="flex justify-end mt-4 font-medium">
                <div>Total: {calculateTotal(services).toFixed(2)} €</div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleAddFacture}>Créer la facture</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog pour modifier une facture */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier la facture</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                        Dr. {medecin.prenom} {medecin.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Services</Label>
              {services.map((service, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                  <div className="col-span-6">
                    <Input
                      placeholder="Description du service"
                      value={service.description}
                      onChange={(e) => handleChangeService(index, 'description', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Prix"
                      value={service.prix || ''}
                      onChange={(e) => handleChangeService(index, 'prix', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Qté"
                      value={service.quantite || ''}
                      onChange={(e) => handleChangeService(index, 'quantite', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2 flex items-center">
                    <div className="text-sm text-right w-full pr-2">
                      {(service.prix * service.quantite).toFixed(2)} €
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleRemoveService(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <Button variant="outline" type="button" onClick={handleAddService} className="w-full mt-2">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un service
              </Button>
              
              <div className="flex justify-end mt-4 font-medium">
                <div>Total: {calculateTotal(services).toFixed(2)} €</div>
              </div>
            </div>
            
            {currentFacture && (
              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <Select 
                  value={currentFacture.statut} 
                  onValueChange={(value) => setCurrentFacture({...currentFacture, statut: value as 'payee' | 'non_payee'})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Statut de paiement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="payee">Payée</SelectItem>
                    <SelectItem value="non_payee">Non payée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleEditFacture}>Enregistrer les modifications</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Factures;

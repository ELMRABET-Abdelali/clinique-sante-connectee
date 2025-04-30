import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Facture, Service } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { mockFactures, mockPatients, mockMedecins } from '@/data/mockData';
import { PlusIcon, TrashIcon } from 'lucide-react';

const Factures = () => {
  const { currentUser, role } = useAuth();
  const [factures, setFactures] = useState<Facture[]>([]);
  const [filteredFactures, setFilteredFactures] = useState<Facture[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<string>('tous');
  
  // Pour la création de nouvelle facture
  const [showNewFacture, setShowNewFacture] = useState(false);
  const [newFacture, setNewFacture] = useState<Partial<Facture>>({
    numeroFacture: `F-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    date: new Date().toISOString().split('T')[0],
    patientId: '',
    medecinId: '',
    statut: 'non_payee',
    services: [],
    montantTotal: 0
  });
  
  const [services, setServices] = useState<Service[]>([
    { description: '', prix: 0, quantite: 1 }
  ]);

  useEffect(() => {
    // Dans un cas réel, on chargerait les factures depuis l'API
    let userFactures = [...mockFactures];
    
    // Filtre selon le rôle de l'utilisateur
    if (role === 'patient' && currentUser) {
      userFactures = userFactures.filter(f => f.patientId === currentUser.id);
    } else if (role === 'medecin' && currentUser) {
      userFactures = userFactures.filter(f => f.medecinId === currentUser.id);
    }
    
    setFactures(userFactures);
    setFilteredFactures(userFactures);
  }, [currentUser, role]);

  useEffect(() => {
    // Filtre les factures en fonction des critères de recherche et du statut
    let filtered = [...factures];
    
    if (searchTerm) {
      filtered = filtered.filter(facture => {
        const patient = mockPatients.find(p => p.id === facture.patientId);
        const medecin = mockMedecins.find(m => m.id === facture.medecinId);
        
        return (
          facture.numeroFacture.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient?.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          medecin?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          medecin?.prenom.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }
    
    if (filterStatut !== 'tous') {
      filtered = filtered.filter(facture => facture.statut === filterStatut);
    }
    
    setFilteredFactures(filtered);
  }, [searchTerm, filterStatut, factures]);
  
  const handleAddService = () => {
    setServices([...services, { description: '', prix: 0, quantite: 1 }]);
  };
  
  const handleRemoveService = (index: number) => {
    const updatedServices = services.filter((_, i) => i !== index);
    setServices(updatedServices);
    calculateTotal(updatedServices);
  };
  
  const handleChangeService = (index: number, field: keyof Service, value: string | number) => {
    const updatedServices = [...services];
    
    if (field === 'prix' || field === 'quantite') {
      updatedServices[index] = {
        ...updatedServices[index],
        [field]: typeof value === 'string' ? parseFloat(value) || 0 : value 
      };
    } else {
      updatedServices[index] = { 
        ...updatedServices[index], 
        [field]: String(value)
      };
    }
    
    setServices(updatedServices);
    calculateTotal(updatedServices);
  };
  
  const calculateTotal = (services: Service[]) => {
    const total = services.reduce((sum, service) => {
      return sum + service.prix * service.quantite;
    }, 0);
    
    setNewFacture(prev => ({
      ...prev,
      montantTotal: total
    }));
  };
  
  const handleSubmitFacture = () => {
    if (!newFacture.patientId || !newFacture.medecinId || services.some(s => !s.description)) {
      toast.error("Veuillez compléter tous les champs obligatoires");
      return;
    }
    
    const nouvelleFacture: Facture = {
      id: `fact${Date.now()}`,
      numeroFacture: newFacture.numeroFacture || '',
      date: newFacture.date || new Date().toISOString().split('T')[0],
      patientId: newFacture.patientId || '',
      medecinId: newFacture.medecinId || '',
      services: services,
      montantTotal: newFacture.montantTotal || 0,
      statut: 'non_payee' as const
    };
    
    // Ajoute la nouvelle facture à la liste
    const updatedFactures = [...factures, nouvelleFacture];
    setFactures(updatedFactures);
    setFilteredFactures(updatedFactures);
    
    // Réinitialise le formulaire
    setNewFacture({
      numeroFacture: `F-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      patientId: '',
      medecinId: '',
      statut: 'non_payee' as const,
      services: [],
      montantTotal: 0
    });
    setServices([{ description: '', prix: 0, quantite: 1 }]);
    setShowNewFacture(false);
    
    toast.success("Facture créée avec succès");
  };
  
  const handlePayerFacture = (id: string) => {
    // Met à jour le statut de la facture
    const updatedFactures = factures.map(facture => {
      if (facture.id === id) {
        return { ...facture, statut: 'payee' as const };
      }
      return facture;
    });
    
    setFactures(updatedFactures);
    setFilteredFactures(updatedFactures);
    toast.success("Facture marquée comme payée");
  };

  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Factures</h1>
            <p className="text-gray-500">Gérez les factures des patients</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-[250px]"
              />
              <Select value={filterStatut} onValueChange={setFilterStatut}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous</SelectItem>
                  <SelectItem value="payee">Payée</SelectItem>
                  <SelectItem value="non_payee">Non payée</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Seulement les admins et secrétaires peuvent créer des factures */}
            {(role === 'admin' || role === 'secretaire') && (
              <Button onClick={() => setShowNewFacture(!showNewFacture)}>
                {showNewFacture ? "Annuler" : "Nouvelle facture"}
              </Button>
            )}
          </div>
        </div>
        
        {showNewFacture && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Nouvelle facture</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="numeroFacture">Numéro de facture</Label>
                  <Input
                    id="numeroFacture"
                    value={newFacture.numeroFacture}
                    onChange={(e) => setNewFacture({ ...newFacture, numeroFacture: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newFacture.date}
                    onChange={(e) => setNewFacture({ ...newFacture, date: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="patient">Patient</Label>
                  <Select
                    value={newFacture.patientId}
                    onValueChange={(value) => setNewFacture({ ...newFacture, patientId: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Sélectionner un patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockPatients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.nom} {patient.prenom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="medecin">Médecin</Label>
                  <Select
                    value={newFacture.medecinId}
                    onValueChange={(value) => setNewFacture({ ...newFacture, medecinId: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Sélectionner un médecin" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockMedecins.map((medecin) => (
                        <SelectItem key={medecin.id} value={medecin.id}>
                          Dr. {medecin.nom} {medecin.prenom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Services</h3>
                  <Button variant="outline" size="sm" onClick={handleAddService} className="flex items-center">
                    <PlusIcon className="h-4 w-4 mr-1" /> Ajouter
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {services.map((service, index) => (
                    <div key={index} className="flex gap-3 items-end">
                      <div className="flex-1">
                        <Label htmlFor={`service-desc-${index}`}>Description</Label>
                        <Input
                          id={`service-desc-${index}`}
                          value={service.description}
                          onChange={(e) => handleChangeService(index, 'description', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div className="w-24">
                        <Label htmlFor={`service-price-${index}`}>Prix (€)</Label>
                        <Input
                          id={`service-price-${index}`}
                          type="number"
                          value={service.prix}
                          onChange={(e) => handleChangeService(index, 'prix', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div className="w-24">
                        <Label htmlFor={`service-qty-${index}`}>Quantité</Label>
                        <Input
                          id={`service-qty-${index}`}
                          type="number"
                          value={service.quantite}
                          onChange={(e) => handleChangeService(index, 'quantite', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveService(index)}
                        disabled={services.length === 1}
                      >
                        <TrashIcon className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between items-center border-t pt-4">
                <div className="text-lg font-bold">
                  Total: {newFacture.montantTotal?.toFixed(2)} €
                </div>
                <Button onClick={handleSubmitFacture}>Créer la facture</Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Médecin</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  {(role === 'admin' || role === 'secretaire') && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFactures.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                      Aucune facture trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFactures.map((facture) => {
                    const patient = mockPatients.find(p => p.id === facture.patientId);
                    const medecin = mockMedecins.find(m => m.id === facture.medecinId);
                    
                    return (
                      <TableRow key={facture.id}>
                        <TableCell>{facture.numeroFacture}</TableCell>
                        <TableCell>{facture.date}</TableCell>
                        <TableCell>
                          {patient ? `${patient.prenom} ${patient.nom}` : 'Patient inconnu'}
                        </TableCell>
                        <TableCell>
                          {medecin ? `Dr. ${medecin.prenom} ${medecin.nom}` : 'Médecin inconnu'}
                        </TableCell>
                        <TableCell>{facture.montantTotal.toFixed(2)} €</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            facture.statut === 'payee' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {facture.statut === 'payee' ? 'Payée' : 'Non payée'}
                          </span>
                        </TableCell>
                        {(role === 'admin' || role === 'secretaire') && (
                          <TableCell>
                            {facture.statut === 'non_payee' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handlePayerFacture(facture.id)}
                              >
                                Marquer comme payée
                              </Button>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Factures;

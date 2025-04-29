
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, Patient, Medecin, RendezVous, Facture, Message } from '@/types';
import { 
  mockUsers, mockPatients, mockMedecins, 
  mockRendezVous, mockFactures, mockMessages 
} from '@/data/mockData';
import { toast } from 'sonner';

interface DataContextType {
  users: User[];
  patients: Patient[];
  medecins: Medecin[];
  rendezVous: RendezVous[];
  factures: Facture[];
  messages: Message[];
  
  // Méthodes CRUD pour les utilisateurs
  addUser: (user: User) => void;
  updateUser: (id: string, userData: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  // Méthodes CRUD pour les patients
  addPatient: (patient: Patient) => void;
  updatePatient: (id: string, patientData: Partial<Patient>) => void;
  deletePatient: (id: string) => void;
  
  // Méthodes CRUD pour les médecins
  addMedecin: (medecin: Medecin) => void;
  updateMedecin: (id: string, medecinData: Partial<Medecin>) => void;
  deleteMedecin: (id: string) => void;
  
  // Méthodes CRUD pour les rendez-vous
  addRendezVous: (rdv: RendezVous) => void;
  updateRendezVous: (id: string, rdvData: Partial<RendezVous>) => void;
  deleteRendezVous: (id: string) => void;
  
  // Méthodes CRUD pour les factures
  addFacture: (facture: Facture) => void;
  updateFacture: (id: string, factureData: Partial<Facture>) => void;
  deleteFacture: (id: string) => void;
  
  // Méthodes pour les messages
  addMessage: (message: Message) => void;
  markMessageAsRead: (id: string) => void;
  deleteMessage: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData doit être utilisé à l'intérieur d'un DataProvider");
  }
  return context;
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [medecins, setMedecins] = useState<Medecin[]>(mockMedecins);
  const [rendezVous, setRendezVous] = useState<RendezVous[]>(mockRendezVous);
  const [factures, setFactures] = useState<Facture[]>(mockFactures);
  const [messages, setMessages] = useState<Message[]>(mockMessages);

  // Gestion des utilisateurs
  const addUser = (user: User) => {
    setUsers(prev => [...prev, user]);
    toast.success(`Utilisateur ${user.prenom} ${user.nom} ajouté`);
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    setUsers(prev => prev.map(user => user.id === id ? { ...user, ...userData } : user));
    toast.success("Utilisateur mis à jour");
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
    toast.success("Utilisateur supprimé");
  };

  // Gestion des patients
  const addPatient = (patient: Patient) => {
    setPatients(prev => [...prev, patient]);
    addUser(patient);
    toast.success(`Patient ${patient.prenom} ${patient.nom} ajouté`);
  };

  const updatePatient = (id: string, patientData: Partial<Patient>) => {
    setPatients(prev => prev.map(patient => patient.id === id ? { ...patient, ...patientData } : patient));
    updateUser(id, patientData);
    toast.success("Patient mis à jour");
  };

  const deletePatient = (id: string) => {
    setPatients(prev => prev.filter(patient => patient.id !== id));
    deleteUser(id);
    toast.success("Patient supprimé");
  };

  // Gestion des médecins
  const addMedecin = (medecin: Medecin) => {
    setMedecins(prev => [...prev, medecin]);
    addUser(medecin);
    toast.success(`Médecin ${medecin.prenom} ${medecin.nom} ajouté`);
  };

  const updateMedecin = (id: string, medecinData: Partial<Medecin>) => {
    setMedecins(prev => prev.map(medecin => medecin.id === id ? { ...medecin, ...medecinData } : medecin));
    updateUser(id, medecinData);
    toast.success("Médecin mis à jour");
  };

  const deleteMedecin = (id: string) => {
    setMedecins(prev => prev.filter(medecin => medecin.id !== id));
    deleteUser(id);
    toast.success("Médecin supprimé");
  };

  // Gestion des rendez-vous
  const addRendezVous = (rdv: RendezVous) => {
    setRendezVous(prev => [...prev, rdv]);
    toast.success("Rendez-vous ajouté");
  };

  const updateRendezVous = (id: string, rdvData: Partial<RendezVous>) => {
    setRendezVous(prev => prev.map(rdv => rdv.id === id ? { ...rdv, ...rdvData } : rdv));
    toast.success("Rendez-vous mis à jour");
  };

  const deleteRendezVous = (id: string) => {
    setRendezVous(prev => prev.filter(rdv => rdv.id !== id));
    toast.success("Rendez-vous supprimé");
  };

  // Gestion des factures
  const addFacture = (facture: Facture) => {
    setFactures(prev => [...prev, facture]);
    toast.success("Facture créée");
  };

  const updateFacture = (id: string, factureData: Partial<Facture>) => {
    setFactures(prev => prev.map(facture => facture.id === id ? { ...facture, ...factureData } : facture));
    toast.success("Facture mise à jour");
  };

  const deleteFacture = (id: string) => {
    setFactures(prev => prev.filter(facture => facture.id !== id));
    toast.success("Facture supprimée");
  };

  // Gestion des messages
  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
    toast.success("Message envoyé");
  };

  const markMessageAsRead = (id: string) => {
    setMessages(prev => prev.map(message => message.id === id ? { ...message, lu: true } : message));
  };

  const deleteMessage = (id: string) => {
    setMessages(prev => prev.filter(message => message.id !== id));
    toast.success("Message supprimé");
  };

  const value = {
    users,
    patients,
    medecins,
    rendezVous,
    factures,
    messages,
    addUser,
    updateUser,
    deleteUser,
    addPatient,
    updatePatient,
    deletePatient,
    addMedecin,
    updateMedecin,
    deleteMedecin,
    addRendezVous,
    updateRendezVous,
    deleteRendezVous,
    addFacture,
    updateFacture,
    deleteFacture,
    addMessage,
    markMessageAsRead,
    deleteMessage,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

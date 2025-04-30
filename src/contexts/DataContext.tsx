
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, Patient, Medecin, RendezVous, Facture, Message, Service, Role } from '@/types';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

interface DataContextType {
  users: User[];
  patients: Patient[];
  medecins: Medecin[];
  rendezVous: RendezVous[];
  factures: Facture[];
  messages: Message[];
  
  // Méthodes CRUD pour les utilisateurs
  addUser: (user: User) => Promise<string | undefined>;
  updateUser: (id: string, userData: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  
  // Méthodes CRUD pour les patients
  addPatient: (patient: Patient) => Promise<void>;
  updatePatient: (id: string, patientData: Partial<Patient>) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;
  
  // Méthodes CRUD pour les médecins
  addMedecin: (medecin: Medecin) => Promise<void>;
  updateMedecin: (id: string, medecinData: Partial<Medecin>) => Promise<void>;
  deleteMedecin: (id: string) => Promise<void>;
  
  // Méthodes CRUD pour les rendez-vous
  addRendezVous: (rdv: RendezVous) => Promise<void>;
  updateRendezVous: (id: string, rdvData: Partial<RendezVous>) => Promise<void>;
  deleteRendezVous: (id: string) => Promise<void>;
  
  // Méthodes CRUD pour les factures
  addFacture: (facture: Facture) => Promise<void>;
  updateFacture: (id: string, factureData: Partial<Facture>) => Promise<void>;
  deleteFacture: (id: string) => Promise<void>;
  
  // Méthodes pour les messages
  addMessage: (message: Message) => Promise<void>;
  markMessageAsRead: (id: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
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
  const [users, setUsers] = useState<User[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [rendezVous, setRendezVous] = useState<RendezVous[]>([]);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const { currentUser } = useAuth();

  // Fetch all data on component mount and when currentUser changes
  useEffect(() => {
    if (currentUser) {
      fetchAllData();
    }
  }, [currentUser]);

  // Function to fetch all data from Supabase
  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchUsers(),
        fetchPatients(),
        fetchMedecins(),
        fetchRendezVous(),
        fetchFactures(),
        fetchMessages(),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erreur lors de la récupération des données');
    }
  };

  // Fetch users from Supabase
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*');
      
      if (error) throw error;
      
      if (data) {
        setUsers(data as User[]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erreur lors de la récupération des utilisateurs');
    }
  };

  // Fetch patients from Supabase
  const fetchPatients = async () => {
    try {
      // First get all users with patient role
      const { data: patientUsers, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'patient');
      
      if (userError) throw userError;
      
      if (patientUsers) {
        // For each patient user, get their patient details
        const patientPromises = patientUsers.map(async (user) => {
          const { data: patientData, error: patientError } = await supabase
            .from('patients')
            .select('*')
            .eq('userId', user.id)
            .single();
          
          if (patientError && patientError.code !== 'PGRST116') {
            // PGRST116 is "not found" which we can ignore
            console.error(`Error fetching patient ${user.id}:`, patientError);
            return null;
          }
          
          if (patientData) {
            // Get dossier medical
            const { data: dossierData, error: dossierError } = await supabase
              .from('dossiers_medicaux')
              .select('*')
              .eq('patientId', patientData.id)
              .single();
            
            let dossierMedical = {
              id: '',
              patientId: patientData.id,
              notes: [],
              prescriptions: [],
              traitements: []
            };
            
            if (!dossierError && dossierData) {
              // Get notes, prescriptions, and treatments
              const [notesResult, prescriptionsResult, traitementsResult] = await Promise.all([
                supabase.from('notes').select('*').eq('dossierId', dossierData.id),
                supabase.from('prescriptions').select('*').eq('dossierId', dossierData.id),
                supabase.from('traitements').select('*').eq('dossierId', dossierData.id),
              ]);
              
              dossierMedical = {
                id: dossierData.id,
                patientId: dossierData.patientId,
                notes: notesResult.data || [],
                prescriptions: prescriptionsResult.data || [],
                traitements: traitementsResult.data || [],
              };
            }
            
            // Combine user data with patient data
            return {
              ...user,
              ...patientData,
              dossierMedical,
            } as Patient;
          }
          return null;
        });
        
        const patientsData = (await Promise.all(patientPromises)).filter(Boolean) as Patient[];
        setPatients(patientsData);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Erreur lors de la récupération des patients');
    }
  };

  // Fetch medecins from Supabase
  const fetchMedecins = async () => {
    try {
      // First get all users with medecin role (we need to update the types to include this role)
      const { data: medecinUsers, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'medecin');
      
      if (userError) throw userError;
      
      if (medecinUsers) {
        // For each medecin user, get their medecin details
        const medecinPromises = medecinUsers.map(async (user) => {
          const { data: medecinData, error: medecinError } = await supabase
            .from('medecins')
            .select('*')
            .eq('userId', user.id)
            .single();
          
          if (medecinError && medecinError.code !== 'PGRST116') {
            console.error(`Error fetching medecin ${user.id}:`, medecinError);
            return null;
          }
          
          if (medecinData) {
            // Get disponibilites
            const { data: dispData, error: dispError } = await supabase
              .from('disponibilites')
              .select('*')
              .eq('medecinId', medecinData.id);
            
            // Get patients
            const { data: patientData, error: patientError } = await supabase
              .from('patients')
              .select('id')
              .eq('medecin', medecinData.id);
            
            // Combine user data with medecin data
            return {
              ...user,
              specialite: medecinData.specialite,
              disponibilites: dispError ? [] : (dispData || []),
              patients: patientError ? [] : (patientData || []).map(p => p.id),
            } as Medecin;
          }
          return null;
        });
        
        const medecinsData = (await Promise.all(medecinPromises)).filter(Boolean) as Medecin[];
        setMedecins(medecinsData);
      }
    } catch (error) {
      console.error('Error fetching medecins:', error);
      toast.error('Erreur lors de la récupération des médecins');
    }
  };

  // Fetch rendez-vous from Supabase
  const fetchRendezVous = async () => {
    try {
      const { data, error } = await supabase
        .from('rendez_vous')
        .select('*');
      
      if (error) throw error;
      
      if (data) {
        setRendezVous(data as RendezVous[]);
      }
    } catch (error) {
      console.error('Error fetching rendez-vous:', error);
      toast.error('Erreur lors de la récupération des rendez-vous');
    }
  };

  // Fetch factures from Supabase
  const fetchFactures = async () => {
    try {
      const { data: facturesData, error: facturesError } = await supabase
        .from('factures')
        .select('*');
      
      if (facturesError) throw facturesError;
      
      if (facturesData) {
        // For each facture, get services
        const facturesPromises = facturesData.map(async (facture) => {
          const { data: servicesData, error: servicesError } = await supabase
            .from('services')
            .select('*')
            .eq('factureId', facture.id);
          
          return {
            ...facture,
            services: servicesError ? [] : (servicesData as Service[] || []),
          } as Facture;
        });
        
        const facturesWithServices = await Promise.all(facturesPromises);
        setFactures(facturesWithServices);
      }
    } catch (error) {
      console.error('Error fetching factures:', error);
      toast.error('Erreur lors de la récupération des factures');
    }
  };

  // Fetch messages from Supabase
  const fetchMessages = async () => {
    if (!currentUser) return;
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`expediteurId.eq.${currentUser.id},destinataireId.eq.${currentUser.id}`);
      
      if (error) throw error;
      
      if (data) {
        setMessages(data as Message[]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Erreur lors de la récupération des messages');
    }
  };

  // User CRUD
  const addUser = async (user: User): Promise<string | undefined> => {
    try {
      // First create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: user.email,
        password: 'password', // Default password, should be changed by user
      });
      
      if (authError) throw authError;
      
      if (!authData.user) throw new Error('No user returned from signUp');
      
      // Then create user record with auth user's id
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          telephone: user.telephone,
          role: user.role,
          dateCreation: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) {
        // Clean up auth user if db insert fails
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw error;
      }
      
      if (data) {
        await fetchUsers();
        toast.success(`Utilisateur ${data.prenom} ${data.nom} ajouté`);
        return data.id;
      }
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error("Erreur lors de l'ajout de l'utilisateur");
    }
  };

  const updateUser = async (id: string, userData: Partial<User>) => {
    try {
      const { error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchUsers();
      toast.success("Utilisateur mis à jour");
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error("Erreur lors de la mise à jour de l'utilisateur");
    }
  };

  const deleteUser = async (id: string) => {
    try {
      // Delete user data
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Delete auth user
      await supabase.auth.admin.deleteUser(id);
      
      await fetchUsers();
      toast.success("Utilisateur supprimé");
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error("Erreur lors de la suppression de l'utilisateur");
    }
  };

  // Patient CRUD
  const addPatient = async (patient: Patient) => {
    try {
      // First add user
      const userId = await addUser(patient);
      
      if (!userId) throw new Error("Failed to create user");
      
      // Then add patient data
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .insert({
          userId,
          dateNaissance: patient.dateNaissance,
          adresse: patient.adresse,
          nss: patient.nss,
          medecin: patient.medecin,
        })
        .select()
        .single();
      
      if (patientError) throw patientError;
      
      // Create dossier medical
      const { data: dossierData, error: dossierError } = await supabase
        .from('dossiers_medicaux')
        .insert({
          patientId: patientData.id,
        })
        .select()
        .single();
      
      if (dossierError) throw dossierError;
      
      await fetchPatients();
      toast.success(`Patient ${patient.prenom} ${patient.nom} ajouté`);
    } catch (error) {
      console.error('Error adding patient:', error);
      toast.error("Erreur lors de l'ajout du patient");
    }
  };

  const updatePatient = async (id: string, patientData: Partial<Patient>) => {
    try {
      const patient = patients.find(p => p.id === id);
      if (!patient) throw new Error("Patient non trouvé");
      
      // Update user data
      if (patientData.nom || patientData.prenom || patientData.email || patientData.telephone) {
        await updateUser(patient.id, {
          nom: patientData.nom || patient.nom,
          prenom: patientData.prenom || patient.prenom,
          email: patientData.email || patient.email,
          telephone: patientData.telephone || patient.telephone,
        });
      }
      
      // Update patient specific data
      const { error } = await supabase
        .from('patients')
        .update({
          dateNaissance: patientData.dateNaissance,
          adresse: patientData.adresse,
          nss: patientData.nss,
          medecin: patientData.medecin,
        })
        .eq('userId', id);
      
      if (error) throw error;
      
      await fetchPatients();
      toast.success("Patient mis à jour");
    } catch (error) {
      console.error('Error updating patient:', error);
      toast.error("Erreur lors de la mise à jour du patient");
    }
  };

  const deletePatient = async (id: string) => {
    try {
      const patient = patients.find(p => p.id === id);
      if (!patient) throw new Error("Patient non trouvé");
      
      // Delete patient data
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('userId', id);
      
      if (error) throw error;
      
      // Delete user
      await deleteUser(id);
      
      await fetchPatients();
      toast.success("Patient supprimé");
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast.error("Erreur lors de la suppression du patient");
    }
  };

  // Medecin CRUD
  const addMedecin = async (medecin: Medecin) => {
    try {
      // First add user
      const userId = await addUser(medecin);
      
      if (!userId) throw new Error("Failed to create user");
      
      // Then add medecin data
      const { data: medecinData, error: medecinError } = await supabase
        .from('medecins')
        .insert({
          userId,
          specialite: medecin.specialite,
        })
        .select()
        .single();
      
      if (medecinError) throw medecinError;
      
      // Add disponibilites
      if (medecin.disponibilites && medecin.disponibilites.length > 0) {
        const disponibilitesData = medecin.disponibilites.map(d => ({
          medecinId: medecinData.id,
          jour: d.jour,
          debut: d.debut,
          fin: d.fin,
        }));
        
        const { error: dispError } = await supabase
          .from('disponibilites')
          .insert(disponibilitesData);
        
        if (dispError) throw dispError;
      }
      
      await fetchMedecins();
      toast.success(`Médecin ${medecin.prenom} ${medecin.nom} ajouté`);
    } catch (error) {
      console.error('Error adding medecin:', error);
      toast.error("Erreur lors de l'ajout du médecin");
    }
  };

  const updateMedecin = async (id: string, medecinData: Partial<Medecin>) => {
    try {
      const medecin = medecins.find(m => m.id === id);
      if (!medecin) throw new Error("Médecin non trouvé");
      
      // Update user data
      if (medecinData.nom || medecinData.prenom || medecinData.email || medecinData.telephone) {
        await updateUser(medecin.id, {
          nom: medecinData.nom || medecin.nom,
          prenom: medecinData.prenom || medecin.prenom,
          email: medecinData.email || medecin.email,
          telephone: medecinData.telephone || medecin.telephone,
        });
      }
      
      // Update medecin specific data
      if (medecinData.specialite) {
        const { error } = await supabase
          .from('medecins')
          .update({ specialite: medecinData.specialite })
          .eq('userId', id);
        
        if (error) throw error;
      }
      
      // Update disponibilites if provided
      if (medecinData.disponibilites) {
        const medecinDbData = await supabase
          .from('medecins')
          .select('id')
          .eq('userId', id)
          .single();
        
        if (medecinDbData.error) throw medecinDbData.error;
        
        // Delete existing disponibilites
        await supabase
          .from('disponibilites')
          .delete()
          .eq('medecinId', medecinDbData.data.id);
        
        // Insert new ones
        if (medecinData.disponibilites.length > 0) {
          const disponibilitesData = medecinData.disponibilites.map(d => ({
            medecinId: medecinDbData.data.id,
            jour: d.jour,
            debut: d.debut,
            fin: d.fin,
          }));
          
          const { error: dispError } = await supabase
            .from('disponibilites')
            .insert(disponibilitesData);
          
          if (dispError) throw dispError;
        }
      }
      
      await fetchMedecins();
      toast.success("Médecin mis à jour");
    } catch (error) {
      console.error('Error updating medecin:', error);
      toast.error("Erreur lors de la mise à jour du médecin");
    }
  };

  const deleteMedecin = async (id: string) => {
    try {
      const medecin = medecins.find(m => m.id === id);
      if (!medecin) throw new Error("Médecin non trouvé");
      
      // Get medecin database id
      const medecinDbData = await supabase
        .from('medecins')
        .select('id')
        .eq('userId', id)
        .single();
      
      if (medecinDbData.error) throw medecinDbData.error;
      
      // Delete disponibilites
      await supabase
        .from('disponibilites')
        .delete()
        .eq('medecinId', medecinDbData.data.id);
      
      // Delete medecin
      await supabase
        .from('medecins')
        .delete()
        .eq('userId', id);
      
      // Delete user
      await deleteUser(id);
      
      await fetchMedecins();
      toast.success("Médecin supprimé");
    } catch (error) {
      console.error('Error deleting medecin:', error);
      toast.error("Erreur lors de la suppression du médecin");
    }
  };

  // RendezVous CRUD
  const addRendezVous = async (rdv: RendezVous) => {
    try {
      const { error } = await supabase
        .from('rendez_vous')
        .insert({
          patientId: rdv.patientId,
          medecinId: rdv.medecinId,
          date: rdv.date,
          heure: rdv.heure,
          duree: rdv.duree,
          motif: rdv.motif,
          statut: rdv.statut,
        });
      
      if (error) throw error;
      
      await fetchRendezVous();
      toast.success("Rendez-vous ajouté");
    } catch (error) {
      console.error('Error adding rendez-vous:', error);
      toast.error("Erreur lors de l'ajout du rendez-vous");
    }
  };

  const updateRendezVous = async (id: string, rdvData: Partial<RendezVous>) => {
    try {
      const { error } = await supabase
        .from('rendez_vous')
        .update(rdvData)
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchRendezVous();
      toast.success("Rendez-vous mis à jour");
    } catch (error) {
      console.error('Error updating rendez-vous:', error);
      toast.error("Erreur lors de la mise à jour du rendez-vous");
    }
  };

  const deleteRendezVous = async (id: string) => {
    try {
      const { error } = await supabase
        .from('rendez_vous')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchRendezVous();
      toast.success("Rendez-vous supprimé");
    } catch (error) {
      console.error('Error deleting rendez-vous:', error);
      toast.error("Erreur lors de la suppression du rendez-vous");
    }
  };

  // Facture CRUD
  const addFacture = async (facture: Facture) => {
    try {
      // Add facture
      const { data, error } = await supabase
        .from('factures')
        .insert({
          numeroFacture: facture.numeroFacture,
          date: facture.date,
          patientId: facture.patientId,
          medecinId: facture.medecinId,
          montantTotal: facture.montantTotal,
          statut: facture.statut,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Add services
      if (facture.services && facture.services.length > 0) {
        const servicesData = facture.services.map(s => ({
          factureId: data.id,
          description: s.description,
          prix: s.prix,
          quantite: s.quantite,
        }));
        
        const { error: servicesError } = await supabase
          .from('services')
          .insert(servicesData);
        
        if (servicesError) throw servicesError;
      }
      
      await fetchFactures();
      toast.success("Facture créée");
    } catch (error) {
      console.error('Error adding facture:', error);
      toast.error("Erreur lors de l'ajout de la facture");
    }
  };

  const updateFacture = async (id: string, factureData: Partial<Facture>) => {
    try {
      // Update facture
      const { error } = await supabase
        .from('factures')
        .update({
          numeroFacture: factureData.numeroFacture,
          date: factureData.date,
          patientId: factureData.patientId,
          medecinId: factureData.medecinId,
          montantTotal: factureData.montantTotal,
          statut: factureData.statut,
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update services if provided
      if (factureData.services) {
        // Delete existing services
        await supabase
          .from('services')
          .delete()
          .eq('factureId', id);
        
        // Insert new ones
        if (factureData.services.length > 0) {
          const servicesData = factureData.services.map(s => ({
            factureId: id,
            description: s.description,
            prix: s.prix,
            quantite: s.quantite,
          }));
          
          const { error: servicesError } = await supabase
            .from('services')
            .insert(servicesData);
          
          if (servicesError) throw servicesError;
        }
      }
      
      await fetchFactures();
      toast.success("Facture mise à jour");
    } catch (error) {
      console.error('Error updating facture:', error);
      toast.error("Erreur lors de la mise à jour de la facture");
    }
  };

  const deleteFacture = async (id: string) => {
    try {
      // Delete services first
      await supabase
        .from('services')
        .delete()
        .eq('factureId', id);
      
      // Delete facture
      const { error } = await supabase
        .from('factures')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchFactures();
      toast.success("Facture supprimée");
    } catch (error) {
      console.error('Error deleting facture:', error);
      toast.error("Erreur lors de la suppression de la facture");
    }
  };

  // Message CRUD
  const addMessage = async (message: Message) => {
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          expediteurId: message.expediteurId,
          destinataireId: message.destinataireId,
          date: message.date,
          contenu: message.contenu,
          lu: message.lu,
        });
      
      if (error) throw error;
      
      await fetchMessages();
      toast.success("Message envoyé");
    } catch (error) {
      console.error('Error adding message:', error);
      toast.error("Erreur lors de l'envoi du message");
    }
  };

  const markMessageAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ lu: true })
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchMessages();
      toast.success("Message supprimé");
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error("Erreur lors de la suppression du message");
    }
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

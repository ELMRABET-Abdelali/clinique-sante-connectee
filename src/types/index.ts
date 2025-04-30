
export type Role = 'admin' | 'secretaire' | 'patient' | 'medecin';

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: Role;
  dateCreation: string;
}

export interface Admin extends User {
  role: 'admin';
}

export interface Secretaire extends User {
  role: 'secretaire';
}

export interface Patient extends User {
  role: 'patient';
  dateNaissance: string;
  adresse: string;
  nss: string; // Numéro de sécurité sociale
  medecin?: string; // ID du médecin traitant
  dossierMedical: DossierMedical;
}

export interface Medecin extends User {
  role: 'medecin';
  specialite: string;
  disponibilites: Disponibilite[];
  patients: string[]; // IDs des patients
}

export interface Disponibilite {
  jour: string;
  debut: string;
  fin: string;
}

export interface DossierMedical {
  id: string;
  patientId: string;
  notes: Note[];
  prescriptions: Prescription[];
  traitements: Traitement[];
}

export interface Note {
  id: string;
  date: string;
  medecinId: string;
  contenu: string;
}

export interface Prescription {
  id: string;
  date: string;
  medecinId: string;
  medicaments: Medicament[];
  instructions: string;
}

export interface Medicament {
  nom: string;
  dosage: string;
  frequence: string;
  duree: string;
}

export interface Traitement {
  id: string;
  date: string;
  medecinId: string;
  description: string;
  duree: string;
  etat: 'en_cours' | 'termine';
}

export interface RendezVous {
  id: string;
  patientId: string;
  medecinId: string;
  date: string;
  heure: string;
  duree: number; // en minutes
  motif: string;
  statut: 'confirme' | 'annule' | 'en_attente';
}

export interface Facture {
  id: string;
  numeroFacture: string;
  date: string;
  patientId: string;
  medecinId: string;
  services: Service[];
  montantTotal: number;
  statut: 'payee' | 'non_payee';
}

export interface Service {
  description: string;
  prix: number;
  quantite: number;
}

export interface Message {
  id: string;
  expediteurId: string;
  destinataireId: string;
  date: string;
  contenu: string;
  lu: boolean;
}

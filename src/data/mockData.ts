
import { 
  User, Patient, Medecin, RendezVous, 
  Facture, Message, DossierMedical 
} from '@/types';

export const mockUsers: User[] = [
  {
    id: "admin1",
    nom: "Dubois",
    prenom: "Marie",
    email: "admin@clinique.fr",
    telephone: "0123456789",
    role: "admin",
    dateCreation: "2023-01-15",
  },
  {
    id: "sec1",
    nom: "Leroy",
    prenom: "Sophie",
    email: "secretaire@clinique.fr",
    telephone: "0123456790",
    role: "secretaire",
    dateCreation: "2023-02-10",
  },
  {
    id: "pat1",
    nom: "Martin",
    prenom: "Jean",
    email: "patient@clinique.fr",
    telephone: "0123456791",
    role: "patient",
    dateCreation: "2023-03-20",
  },
  {
    id: "med1",
    nom: "Bernard",
    prenom: "Philippe",
    email: "medecin@clinique.fr",
    telephone: "0123456792",
    role: "medecin", // Corrected from 'secretaire' to 'medecin'
    dateCreation: "2023-01-05",
  }
];

// Dossier médical pour les patients
const dossierMedicalExample: DossierMedical = {
  id: "dm1",
  patientId: "pat1",
  notes: [
    {
      id: "note1",
      date: "2023-05-10",
      medecinId: "med1",
      contenu: "Patient se plaint de maux de tête fréquents."
    },
    {
      id: "note2",
      date: "2023-06-15",
      medecinId: "med1",
      contenu: "Amélioration après traitement analgésique."
    }
  ],
  prescriptions: [
    {
      id: "pres1",
      date: "2023-05-10",
      medecinId: "med1",
      medicaments: [
        {
          nom: "Paracétamol",
          dosage: "1000mg",
          frequence: "Toutes les 6 heures",
          duree: "7 jours"
        }
      ],
      instructions: "Prendre en cas de douleur. Ne pas dépasser la dose prescrite."
    }
  ],
  traitements: [
    {
      id: "trait1",
      date: "2023-05-10",
      medecinId: "med1",
      description: "Traitement anti-migraine",
      duree: "1 mois",
      etat: "en_cours"
    }
  ]
};

export const mockPatients: Patient[] = [
  {
    id: "pat1",
    nom: "Martin",
    prenom: "Jean",
    email: "patient@clinique.fr",
    telephone: "0123456791",
    role: "patient",
    dateCreation: "2023-03-20",
    dateNaissance: "1985-07-12",
    adresse: "15 rue de Paris, 75001 Paris",
    nss: "185076512345678",
    medecin: "med1",
    dossierMedical: dossierMedicalExample
  },
  {
    id: "pat2",
    nom: "Durand",
    prenom: "Lucie",
    email: "lucie.durand@email.fr",
    telephone: "0234567891",
    role: "patient",
    dateCreation: "2023-04-05",
    dateNaissance: "1990-03-25",
    adresse: "27 avenue Victor Hugo, 75016 Paris",
    nss: "290036512345678",
    medecin: "med1",
    dossierMedical: {
      id: "dm2",
      patientId: "pat2",
      notes: [],
      prescriptions: [],
      traitements: []
    }
  }
];

export const mockMedecins: Medecin[] = [
  {
    id: "med1",
    nom: "Bernard",
    prenom: "Philippe",
    email: "medecin@clinique.fr",
    telephone: "0123456792",
    role: "medecin", // Corrected from 'secretaire' to 'medecin' 
    dateCreation: "2023-01-05",
    specialite: "Médecine générale",
    disponibilites: [
      {
        jour: "Lundi",
        debut: "09:00",
        fin: "17:00"
      },
      {
        jour: "Mardi",
        debut: "09:00",
        fin: "17:00"
      },
      {
        jour: "Jeudi",
        debut: "09:00",
        fin: "17:00"
      }
    ],
    patients: ["pat1", "pat2"]
  },
  {
    id: "med2",
    nom: "Petit",
    prenom: "Claire",
    email: "claire.petit@clinique.fr",
    telephone: "0234567892",
    role: "medecin", // Corrected from 'secretaire' to 'medecin'
    dateCreation: "2023-02-15",
    specialite: "Cardiologie",
    disponibilites: [
      {
        jour: "Mercredi",
        debut: "08:30",
        fin: "16:30"
      },
      {
        jour: "Vendredi",
        debut: "08:30",
        fin: "16:30"
      }
    ],
    patients: []
  }
];

// Date du jour formatée en YYYY-MM-DD
const today = new Date().toISOString().split('T')[0];

export const mockRendezVous: RendezVous[] = [
  {
    id: "rdv1",
    patientId: "pat1",
    medecinId: "med1",
    date: today,
    heure: "10:00",
    duree: 30,
    motif: "Consultation de routine",
    statut: "confirme"
  },
  {
    id: "rdv2",
    patientId: "pat2",
    medecinId: "med1",
    date: today,
    heure: "14:30",
    duree: 45,
    motif: "Suivi traitement",
    statut: "confirme"
  },
  {
    id: "rdv3",
    patientId: "pat1",
    medecinId: "med2",
    date: "2023-05-25",
    heure: "09:15",
    duree: 60,
    motif: "Examen cardiologique",
    statut: "en_attente"
  }
];

export const mockFactures: Facture[] = [
  {
    id: "fact1",
    numeroFacture: "F-2023-001",
    date: "2023-05-10",
    patientId: "pat1",
    medecinId: "med1",
    services: [
      {
        description: "Consultation standard",
        prix: 25,
        quantite: 1
      },
      {
        description: "Analyse de sang",
        prix: 15,
        quantite: 1
      }
    ],
    montantTotal: 40,
    statut: "payee"
  },
  {
    id: "fact2",
    numeroFacture: "F-2023-002",
    date: today,
    patientId: "pat2",
    medecinId: "med1",
    services: [
      {
        description: "Consultation standard",
        prix: 25,
        quantite: 1
      }
    ],
    montantTotal: 25,
    statut: "non_payee"
  }
];

export const mockMessages: Message[] = [
  {
    id: "msg1",
    expediteurId: "med1",
    destinataireId: "sec1",
    date: "2023-05-10T09:30:00",
    contenu: "Pouvez-vous préparer le dossier du patient Martin pour cet après-midi ?",
    lu: true
  },
  {
    id: "msg2",
    expediteurId: "sec1",
    destinataireId: "med1",
    date: "2023-05-10T10:15:00",
    contenu: "Le dossier est prêt et disponible dans votre bureau.",
    lu: true
  },
  {
    id: "msg3",
    expediteurId: "med2",
    destinataireId: "sec1",
    date: today + "T08:45:00",
    contenu: "J'aurai 15 minutes de retard ce matin. Veuillez en informer le premier patient.",
    lu: false
  }
];

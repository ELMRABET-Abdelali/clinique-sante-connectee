
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          nom: string
          prenom: string
          telephone: string
          role: string
          dateCreation: string
        }
        Insert: {
          id?: string
          email: string
          nom: string
          prenom: string
          telephone: string
          role: string
          dateCreation?: string
        }
        Update: {
          id?: string
          email?: string
          nom?: string
          prenom?: string
          telephone?: string
          role?: string
          dateCreation?: string
        }
      }
      patients: {
        Row: {
          id: string
          userId: string
          dateNaissance: string
          adresse: string
          nss: string
          medecin?: string
        }
        Insert: {
          id?: string
          userId: string
          dateNaissance: string
          adresse: string
          nss: string
          medecin?: string
        }
        Update: {
          id?: string
          userId?: string
          dateNaissance?: string
          adresse?: string
          nss?: string
          medecin?: string
        }
      }
      dossiers_medicaux: {
        Row: {
          id: string
          patientId: string
        }
        Insert: {
          id?: string
          patientId: string
        }
        Update: {
          id?: string
          patientId?: string
        }
      }
      notes: {
        Row: {
          id: string
          dossierId: string
          date: string
          medecinId: string
          contenu: string
        }
        Insert: {
          id?: string
          dossierId: string
          date: string
          medecinId: string
          contenu: string
        }
        Update: {
          id?: string
          dossierId?: string
          date?: string
          medecinId?: string
          contenu?: string
        }
      }
      prescriptions: {
        Row: {
          id: string
          dossierId: string
          date: string
          medecinId: string
          instructions: string
        }
        Insert: {
          id?: string
          dossierId: string
          date: string
          medecinId: string
          instructions: string
        }
        Update: {
          id?: string
          dossierId?: string
          date?: string
          medecinId?: string
          instructions?: string
        }
      }
      medicaments: {
        Row: {
          id: string
          prescriptionId: string
          nom: string
          dosage: string
          frequence: string
          duree: string
        }
        Insert: {
          id?: string
          prescriptionId: string
          nom: string
          dosage: string
          frequence: string
          duree: string
        }
        Update: {
          id?: string
          prescriptionId?: string
          nom?: string
          dosage?: string
          frequence?: string
          duree?: string
        }
      }
      traitements: {
        Row: {
          id: string
          dossierId: string
          date: string
          medecinId: string
          description: string
          duree: string
          etat: string
        }
        Insert: {
          id?: string
          dossierId: string
          date: string
          medecinId: string
          description: string
          duree: string
          etat: string
        }
        Update: {
          id?: string
          dossierId?: string
          date?: string
          medecinId?: string
          description?: string
          duree?: string
          etat?: string
        }
      }
      medecins: {
        Row: {
          id: string
          userId: string
          specialite: string
        }
        Insert: {
          id?: string
          userId: string
          specialite: string
        }
        Update: {
          id?: string
          userId?: string
          specialite?: string
        }
      }
      disponibilites: {
        Row: {
          id: string
          medecinId: string
          jour: string
          debut: string
          fin: string
        }
        Insert: {
          id?: string
          medecinId: string
          jour: string
          debut: string
          fin: string
        }
        Update: {
          id?: string
          medecinId?: string
          jour?: string
          debut?: string
          fin?: string
        }
      }
      rendez_vous: {
        Row: {
          id: string
          patientId: string
          medecinId: string
          date: string
          heure: string
          duree: number
          motif: string
          statut: string
        }
        Insert: {
          id?: string
          patientId: string
          medecinId: string
          date: string
          heure: string
          duree: number
          motif: string
          statut: string
        }
        Update: {
          id?: string
          patientId?: string
          medecinId?: string
          date?: string
          heure?: string
          duree?: number
          motif?: string
          statut?: string
        }
      }
      factures: {
        Row: {
          id: string
          numeroFacture: string
          date: string
          patientId: string
          medecinId: string
          montantTotal: number
          statut: string
        }
        Insert: {
          id?: string
          numeroFacture: string
          date: string
          patientId: string
          medecinId: string
          montantTotal: number
          statut: string
        }
        Update: {
          id?: string
          numeroFacture?: string
          date?: string
          patientId?: string
          medecinId?: string
          montantTotal?: number
          statut?: string
        }
      }
      services: {
        Row: {
          id: string
          factureId: string
          description: string
          prix: number
          quantite: number
        }
        Insert: {
          id?: string
          factureId: string
          description: string
          prix: number
          quantite: number
        }
        Update: {
          id?: string
          factureId?: string
          description?: string
          prix?: number
          quantite?: number
        }
      }
      messages: {
        Row: {
          id: string
          expediteurId: string
          destinataireId: string
          date: string
          contenu: string
          lu: boolean
        }
        Insert: {
          id?: string
          expediteurId: string
          destinataireId: string
          date: string
          contenu: string
          lu: boolean
        }
        Update: {
          id?: string
          expediteurId?: string
          destinataireId?: string
          date?: string
          contenu?: string
          lu?: boolean
        }
      }
    }
    Views: {}
    Functions: {}
  }
}

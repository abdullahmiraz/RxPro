export type Database = {
  public: {
    Tables: {
      rx_doctors: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          address: string
          qualifications: string
          license_number: string
          security_word: string
          signature_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          address: string
          qualifications: string
          license_number: string
          security_word: string
          signature_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          address?: string
          qualifications?: string
          license_number?: string
          security_word?: string
          signature_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      rx_patients: {
        Row: {
          id: string
          name: string
          age: number
          gender: string
          phone: string
          email: string | null
          address: string
          blood_group: string | null
          date_of_birth: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          age: number
          gender: string
          phone: string
          email?: string | null
          address: string
          blood_group?: string | null
          date_of_birth?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          age?: number
          gender?: string
          phone?: string
          email?: string | null
          address?: string
          blood_group?: string | null
          date_of_birth?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      rx_appointments: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string
          appointment_date: string
          appointment_time: string
          status: string
          reason: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_id: string
          appointment_date: string
          appointment_time: string
          status: string
          reason?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          doctor_id?: string
          appointment_date?: string
          appointment_time?: string
          status?: string
          reason?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      rx_prescriptions: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string
          appointment_id: string | null
          header_data: Record<string, unknown> | null
          complaints: Record<string, unknown> | null
          comorbidity: Record<string, unknown> | null
          examination: Record<string, unknown> | null
          on_examination: Record<string, unknown> | null
          diagnosis: Record<string, unknown> | null
          medications: Record<string, unknown> | null
          investigation: Record<string, unknown> | null
          on_investigation: Record<string, unknown> | null
          advice: Record<string, unknown> | null
          follow_up: Record<string, unknown> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_id: string
          appointment_id?: string | null
          header_data?: Record<string, unknown> | null
          complaints?: Record<string, unknown> | null
          comorbidity?: Record<string, unknown> | null
          examination?: Record<string, unknown> | null
          on_examination?: Record<string, unknown> | null
          diagnosis?: Record<string, unknown> | null
          medications?: Record<string, unknown> | null
          investigation?: Record<string, unknown> | null
          on_investigation?: Record<string, unknown> | null
          advice?: Record<string, unknown> | null
          follow_up?: Record<string, unknown> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          doctor_id?: string
          appointment_id?: string | null
          header_data?: Record<string, unknown> | null
          complaints?: Record<string, unknown> | null
          comorbidity?: Record<string, unknown> | null
          examination?: Record<string, unknown> | null
          on_examination?: Record<string, unknown> | null
          diagnosis?: Record<string, unknown> | null
          medications?: Record<string, unknown> | null
          investigation?: Record<string, unknown> | null
          on_investigation?: Record<string, unknown> | null
          advice?: Record<string, unknown> | null
          follow_up?: Record<string, unknown> | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      rx_setups: {
        Row: {
          id: string
          name: string
          description: string | null
          type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          type: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          type?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      rx_favorite_setups: {
        Row: {
          id: string
          name: string
          description: string | null
          data: Record<string, unknown> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          data?: Record<string, unknown> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          data?: Record<string, unknown> | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      rx_favorite_medicines: {
        Row: {
          id: string
          name: string
          generic_name: string | null
          dosage: string | null
          instructions: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          generic_name?: string | null
          dosage?: string | null
          instructions?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          generic_name?: string | null
          dosage?: string | null
          instructions?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      rx_instructions: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      rx_route_types: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      rx_doctor_info: {
        Row: {
          id: string
          doctor_id: string
          clinic_name: string
          address: string
          phone: string
          email: string
          license_number: string
          qualifications: string
          header_template: string | null
          footer_template: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          doctor_id: string
          clinic_name: string
          address: string
          phone: string
          email: string
          license_number: string
          qualifications: string
          header_template?: string | null
          footer_template?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          doctor_id?: string
          clinic_name?: string
          address?: string
          phone?: string
          email?: string
          license_number?: string
          qualifications?: string
          header_template?: string | null
          footer_template?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

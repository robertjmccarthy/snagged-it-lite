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
      builder_shares: {
        Row: {
          id: string
          user_id: string
          builder_name: string
          builder_email: string
          payment_status: string | null
          payment_intent_id: string | null
          pdf_url: string | null
          email_sent: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          builder_name: string
          builder_email: string
          payment_status?: string | null
          payment_intent_id?: string | null
          pdf_url?: string | null
          email_sent?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          builder_name?: string
          builder_email?: string
          payment_status?: string | null
          payment_intent_id?: string | null
          pdf_url?: string | null
          email_sent?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
          website: string | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
        }
      }
      projects: {
        Row: {
          id: string
          created_at: string | null
          name: string
          address: string
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string | null
          name: string
          address: string
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string | null
          name?: string
          address?: string
          user_id?: string
        }
      }
      snags: {
        Row: {
          id: string
          created_at: string | null
          title: string
          description: string | null
          status: string
          project_id: string
          user_id: string
          location: string | null
          priority: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          title: string
          description?: string | null
          status?: string
          project_id: string
          user_id: string
          location?: string | null
          priority?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string | null
          title?: string
          description?: string | null
          status?: string
          project_id?: string
          user_id?: string
          location?: string | null
          priority?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

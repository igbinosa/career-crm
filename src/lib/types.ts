export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          applied_at: string | null
          assessment_deadline: string | null
          company_id: string | null
          confirmation_number: string | null
          contact_id: string | null
          created_at: string
          escalation_note: string | null
          id: string
          notes: string | null
          outcome: string | null
          posting_url: string | null
          role_title: string
          source: string
          stage: string
          track: string | null
          updated_at: string
        }
        Insert: {
          applied_at?: string | null
          assessment_deadline?: string | null
          company_id?: string | null
          confirmation_number?: string | null
          contact_id?: string | null
          created_at?: string
          escalation_note?: string | null
          id?: string
          notes?: string | null
          outcome?: string | null
          posting_url?: string | null
          role_title: string
          source?: string
          stage?: string
          track?: string | null
          updated_at?: string
        }
        Update: {
          applied_at?: string | null
          assessment_deadline?: string | null
          company_id?: string | null
          confirmation_number?: string | null
          contact_id?: string | null
          created_at?: string
          escalation_note?: string | null
          id?: string
          notes?: string | null
          outcome?: string | null
          posting_url?: string | null
          role_title?: string
          source?: string
          stage?: string
          track?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "reactivation_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          archived: boolean
          created_at: string
          id: string
          name: string
          status_note: string | null
          tier: string
          updated_at: string
          why: string | null
        }
        Insert: {
          archived?: boolean
          created_at?: string
          id?: string
          name: string
          status_note?: string | null
          tier?: string
          updated_at?: string
          why?: string | null
        }
        Update: {
          archived?: boolean
          created_at?: string
          id?: string
          name?: string
          status_note?: string | null
          tier?: string
          updated_at?: string
          why?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          background: string | null
          company_id: string | null
          created_at: string
          email: string | null
          follow_up_due_date: string | null
          id: string
          last_touch_date: string | null
          name: string
          notes: string | null
          referred_by: string | null
          role_title: string | null
          status: string
          updated_at: string
        }
        Insert: {
          background?: string | null
          company_id?: string | null
          created_at?: string
          email?: string | null
          follow_up_due_date?: string | null
          id?: string
          last_touch_date?: string | null
          name: string
          notes?: string | null
          referred_by?: string | null
          role_title?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          background?: string | null
          company_id?: string | null
          created_at?: string
          email?: string | null
          follow_up_due_date?: string | null
          id?: string
          last_touch_date?: string | null
          name?: string
          notes?: string | null
          referred_by?: string | null
          role_title?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "reactivation_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      interactions: {
        Row: {
          application_id: string | null
          body: string | null
          channel: string
          company_id: string | null
          contact_id: string
          created_at: string
          diff_notes: string | null
          direction: string
          id: string
          intended_send_date: string | null
          scenario: string | null
          sent_at: string | null
          status: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          application_id?: string | null
          body?: string | null
          channel?: string
          company_id?: string | null
          contact_id: string
          created_at?: string
          diff_notes?: string | null
          direction?: string
          id?: string
          intended_send_date?: string | null
          scenario?: string | null
          sent_at?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          application_id?: string | null
          body?: string | null
          channel?: string
          company_id?: string | null
          contact_id?: string
          created_at?: string
          diff_notes?: string | null
          direction?: string
          id?: string
          intended_send_date?: string | null
          scenario?: string | null
          sent_at?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interactions_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "reactivation_queue"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      reactivation_queue: {
        Row: {
          company_id: string | null
          days_quiet: number | null
          id: string | null
          last_touch_date: string | null
          name: string | null
          notes: string | null
          role_title: string | null
          status: string | null
        }
        Insert: {
          company_id?: string | null
          days_quiet?: never
          id?: string | null
          last_touch_date?: string | null
          name?: string | null
          notes?: string | null
          role_title?: string | null
          status?: string | null
        }
        Update: {
          company_id?: string | null
          days_quiet?: never
          id?: string | null
          last_touch_date?: string | null
          name?: string | null
          notes?: string | null
          role_title?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

export type Company = Database['public']['Tables']['companies']['Row'];
export type CompanyInsert = Database['public']['Tables']['companies']['Insert'];
export type Contact = Database['public']['Tables']['contacts']['Row'];
export type ContactInsert = Database['public']['Tables']['contacts']['Insert'];
export type Application = Database['public']['Tables']['applications']['Row'];
export type ApplicationInsert = Database['public']['Tables']['applications']['Insert'];
export type Interaction = Database['public']['Tables']['interactions']['Row'];
export type InteractionInsert = Database['public']['Tables']['interactions']['Insert'];
export type ReactivationQueueRow = Database['public']['Views']['reactivation_queue']['Row'];

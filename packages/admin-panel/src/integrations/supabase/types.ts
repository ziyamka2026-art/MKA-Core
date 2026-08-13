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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      document_citations: {
        Row: {
          approved: boolean
          created_at: string
          created_by: string | null
          document_id: string
          id: string
          page: string | null
          section: string | null
          snippet: string
          source_title: string
          updated_at: string
        }
        Insert: {
          approved?: boolean
          created_at?: string
          created_by?: string | null
          document_id: string
          id?: string
          page?: string | null
          section?: string | null
          snippet: string
          source_title: string
          updated_at?: string
        }
        Update: {
          approved?: boolean
          created_at?: string
          created_by?: string | null
          document_id?: string
          id?: string
          page?: string | null
          section?: string | null
          snippet?: string
          source_title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_citations_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "registry_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
        }
        Relationships: []
      }
      rag_queries: {
        Row: {
          answer: string | null
          citations: Json
          created_at: string
          id: string
          question: string
          user_id: string
        }
        Insert: {
          answer?: string | null
          citations?: Json
          created_at?: string
          id?: string
          question: string
          user_id: string
        }
        Update: {
          answer?: string | null
          citations?: Json
          created_at?: string
          id?: string
          question?: string
          user_id?: string
        }
        Relationships: []
      }
      registry_documents: {
        Row: {
          body_text: string | null
          created_at: string
          created_by: string | null
          doc_code: string
          doc_date: string | null
          doc_number: string | null
          doc_type: Database["public"]["Enums"]["doc_type"]
          drive_path: string | null
          id: string
          index_status: Database["public"]["Enums"]["index_status"]
          law_category: string | null
          notes: string | null
          source_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          body_text?: string | null
          created_at?: string
          created_by?: string | null
          doc_code: string
          doc_date?: string | null
          doc_number?: string | null
          doc_type?: Database["public"]["Enums"]["doc_type"]
          drive_path?: string | null
          id?: string
          index_status?: Database["public"]["Enums"]["index_status"]
          law_category?: string | null
          notes?: string | null
          source_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          body_text?: string | null
          created_at?: string
          created_by?: string | null
          doc_code?: string
          doc_date?: string | null
          doc_number?: string | null
          doc_type?: Database["public"]["Enums"]["doc_type"]
          drive_path?: string | null
          id?: string
          index_status?: Database["public"]["Enums"]["index_status"]
          law_category?: string | null
          notes?: string | null
          source_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_contribute: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "owner" | "manager" | "expert" | "viewer"
      doc_type:
        | "قانون"
        | "بخشنامه"
        | "دستورالعمل"
        | "آیین‌نامه"
        | "رأی دیوان"
        | "ابلاغیه"
        | "سایر"
      index_status:
        | "شناسایی‌شده"
        | "دریافت‌شده"
        | "در حال ایندکس"
        | "ایندکس‌شده"
        | "رد‌شده"
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
    Enums: {
      app_role: ["owner", "manager", "expert", "viewer"],
      doc_type: [
        "قانون",
        "بخشنامه",
        "دستورالعمل",
        "آیین‌نامه",
        "رأی دیوان",
        "ابلاغیه",
        "سایر",
      ],
      index_status: [
        "شناسایی‌شده",
        "دریافت‌شده",
        "در حال ایندکس",
        "ایندکس‌شده",
        "رد‌شده",
      ],
    },
  },
} as const

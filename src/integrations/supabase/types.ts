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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      architect_conversations: {
        Row: {
          created_at: string
          id: string
          messages: Json
          summary: string | null
          title: string
          topics: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          messages?: Json
          summary?: string | null
          title?: string
          topics?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          messages?: Json
          summary?: string | null
          title?: string
          topics?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      architect_insights: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string
          id: string
          is_favorite: boolean | null
          source_layer: string | null
          tags: string[] | null
          user_id: string
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          source_layer?: string | null
          tags?: string[] | null
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          source_layer?: string | null
          tags?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "architect_insights_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "architect_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      architect_learnings: {
        Row: {
          archetype: string | null
          created_at: string
          frequency: number | null
          id: string
          last_seen_at: string
          pattern: string
          topic: string
        }
        Insert: {
          archetype?: string | null
          created_at?: string
          frequency?: number | null
          id?: string
          last_seen_at?: string
          pattern: string
          topic: string
        }
        Update: {
          archetype?: string | null
          created_at?: string
          frequency?: number | null
          id?: string
          last_seen_at?: string
          pattern?: string
          topic?: string
        }
        Relationships: []
      }
      audio_scripts: {
        Row: {
          audio_url: string | null
          category: string
          config: Json | null
          created_at: string
          duration_seconds: number | null
          id: string
          is_favorite: boolean
          script: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          audio_url?: string | null
          category: string
          config?: Json | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          is_favorite?: boolean
          script: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          audio_url?: string | null
          category?: string
          config?: Json | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          is_favorite?: boolean
          script?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      commitment_logs: {
        Row: {
          commitment_id: string
          created_at: string
          id: string
          log_date: string
          mood_after: number | null
          mood_before: number | null
          notes: string | null
          practiced: boolean
          user_id: string
        }
        Insert: {
          commitment_id: string
          created_at?: string
          id?: string
          log_date?: string
          mood_after?: number | null
          mood_before?: number | null
          notes?: string | null
          practiced?: boolean
          user_id: string
        }
        Update: {
          commitment_id?: string
          created_at?: string
          id?: string
          log_date?: string
          mood_after?: number | null
          mood_before?: number | null
          notes?: string | null
          practiced?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commitment_logs_commitment_id_fkey"
            columns: ["commitment_id"]
            isOneToOne: false
            referencedRelation: "commitments"
            referencedColumns: ["id"]
          },
        ]
      }
      commitments: {
        Row: {
          behavior: string
          belief: string
          commitment: string
          completed_at: string | null
          completion_reflection: string | null
          created_at: string
          days_practiced: number | null
          deadline: string
          feeling: string
          id: string
          last_check_in: string | null
          reminder_enabled: boolean | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          behavior: string
          belief: string
          commitment: string
          completed_at?: string | null
          completion_reflection?: string | null
          created_at?: string
          days_practiced?: number | null
          deadline: string
          feeling: string
          id?: string
          last_check_in?: string | null
          reminder_enabled?: boolean | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          behavior?: string
          belief?: string
          commitment?: string
          completed_at?: string | null
          completion_reflection?: string | null
          created_at?: string
          days_practiced?: number | null
          deadline?: string
          feeling?: string
          id?: string
          last_check_in?: string | null
          reminder_enabled?: boolean | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          archetype: string | null
          created_at: string
          display_name: string | null
          id: string
          streak: number | null
          tier: string | null
          updated_at: string
          user_id: string
          values: string[] | null
        }
        Insert: {
          archetype?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          streak?: number | null
          tier?: string | null
          updated_at?: string
          user_id: string
          values?: string[] | null
        }
        Update: {
          archetype?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          streak?: number | null
          tier?: string | null
          updated_at?: string
          user_id?: string
          values?: string[] | null
        }
        Relationships: []
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

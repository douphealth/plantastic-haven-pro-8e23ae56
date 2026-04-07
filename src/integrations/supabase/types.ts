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
      community_posts: {
        Row: {
          category: string | null
          content: string
          created_at: string
          id: string
          image_url: string | null
          likes_count: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      plant_journal_entries: {
        Row: {
          created_at: string
          id: string
          milestone_type: string | null
          note: string | null
          photo_url: string | null
          user_id: string
          user_plant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          milestone_type?: string | null
          note?: string | null
          photo_url?: string | null
          user_id: string
          user_plant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          milestone_type?: string | null
          note?: string | null
          photo_url?: string | null
          user_id?: string
          user_plant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plant_journal_entries_user_plant_id_fkey"
            columns: ["user_plant_id"]
            isOneToOne: false
            referencedRelation: "user_plants"
            referencedColumns: ["id"]
          },
        ]
      }
      plants: {
        Row: {
          care_difficulty: string
          category: string | null
          common_names: string[] | null
          common_problems: string[] | null
          created_at: string
          description: string | null
          humidity: string | null
          id: string
          image_url: string | null
          light_needs: string
          name: string
          propagation_methods: string[] | null
          scientific_name: string | null
          temp_max: number | null
          temp_min: number | null
          toxicity_children: boolean | null
          toxicity_pets: boolean | null
          water_frequency_days: number
        }
        Insert: {
          care_difficulty?: string
          category?: string | null
          common_names?: string[] | null
          common_problems?: string[] | null
          created_at?: string
          description?: string | null
          humidity?: string | null
          id?: string
          image_url?: string | null
          light_needs?: string
          name: string
          propagation_methods?: string[] | null
          scientific_name?: string | null
          temp_max?: number | null
          temp_min?: number | null
          toxicity_children?: boolean | null
          toxicity_pets?: boolean | null
          water_frequency_days?: number
        }
        Update: {
          care_difficulty?: string
          category?: string | null
          common_names?: string[] | null
          common_problems?: string[] | null
          created_at?: string
          description?: string | null
          humidity?: string | null
          id?: string
          image_url?: string | null
          light_needs?: string
          name?: string
          propagation_methods?: string[] | null
          scientific_name?: string | null
          temp_max?: number | null
          temp_min?: number | null
          toxicity_children?: boolean | null
          toxicity_pets?: boolean | null
          water_frequency_days?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          care_streak: number
          created_at: string
          display_name: string | null
          id: string
          subscription_tier: Database["public"]["Enums"]["subscription_tier"]
          total_plants_saved: number
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          care_streak?: number
          created_at?: string
          display_name?: string | null
          id?: string
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          total_plants_saved?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          care_streak?: number
          created_at?: string
          display_name?: string | null
          id?: string
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          total_plants_saved?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_plants: {
        Row: {
          created_at: string
          health_score: number
          id: string
          last_watered: string | null
          location: string | null
          next_water_date: string | null
          nickname: string
          notes: string | null
          photo_url: string | null
          plant_id: string | null
          room: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          health_score?: number
          id?: string
          last_watered?: string | null
          location?: string | null
          next_water_date?: string | null
          nickname: string
          notes?: string | null
          photo_url?: string | null
          plant_id?: string | null
          room?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          health_score?: number
          id?: string
          last_watered?: string | null
          location?: string | null
          next_water_date?: string | null
          nickname?: string
          notes?: string | null
          photo_url?: string | null
          plant_id?: string | null
          room?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_plants_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      subscription_tier: "free" | "pro" | "masterclass" | "expert"
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
      subscription_tier: ["free", "pro", "masterclass", "expert"],
    },
  },
} as const

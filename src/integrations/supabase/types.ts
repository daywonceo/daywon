export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      app_sessions: {
        Row: {
          created_at: string
          id: string
          section_breakdown: Json | null
          session_date: string
          total_time_minutes: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          section_breakdown?: Json | null
          session_date: string
          total_time_minutes?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          section_breakdown?: Json | null
          session_date?: string
          total_time_minutes?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      exercise_logs: {
        Row: {
          created_at: string
          difficulty: string | null
          equipment: string | null
          exercise_instructions: string | null
          exercise_name: string
          id: string
          muscle_group: string | null
          reps: number
          sets: number
          user_id: string
          weight_lbs: number | null
          workout_session_id: string | null
        }
        Insert: {
          created_at?: string
          difficulty?: string | null
          equipment?: string | null
          exercise_instructions?: string | null
          exercise_name: string
          id?: string
          muscle_group?: string | null
          reps: number
          sets: number
          user_id: string
          weight_lbs?: number | null
          workout_session_id?: string | null
        }
        Update: {
          created_at?: string
          difficulty?: string | null
          equipment?: string | null
          exercise_instructions?: string | null
          exercise_name?: string
          id?: string
          muscle_group?: string | null
          reps?: number
          sets?: number
          user_id?: string
          weight_lbs?: number | null
          workout_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_logs_workout_session_id_fkey"
            columns: ["workout_session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_difficulty: {
        Row: {
          created_at: string
          difficulty_level: string
          habit_name: string
          id: string
          multiplier: number
        }
        Insert: {
          created_at?: string
          difficulty_level: string
          habit_name: string
          id?: string
          multiplier: number
        }
        Update: {
          created_at?: string
          difficulty_level?: string
          habit_name?: string
          id?: string
          multiplier?: number
        }
        Relationships: []
      }
      habit_photos: {
        Row: {
          activity_date: string
          caption: string | null
          created_at: string | null
          habit_name: string
          id: string
          is_shared: boolean | null
          photo_url: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          activity_date: string
          caption?: string | null
          created_at?: string | null
          habit_name: string
          id?: string
          is_shared?: boolean | null
          photo_url: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          activity_date?: string
          caption?: string | null
          created_at?: string | null
          habit_name?: string
          id?: string
          is_shared?: boolean | null
          photo_url?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      habits: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          status: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          status?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          focus_areas: string[] | null
          id: string
          onboarding_complete: boolean | null
          reminder_opt_in: boolean | null
          reminder_time: string | null
          updated_at: string
          user_intent: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          focus_areas?: string[] | null
          id: string
          onboarding_complete?: boolean | null
          reminder_opt_in?: boolean | null
          reminder_time?: string | null
          updated_at?: string
          user_intent?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          focus_areas?: string[] | null
          id?: string
          onboarding_complete?: boolean | null
          reminder_opt_in?: boolean | null
          reminder_time?: string | null
          updated_at?: string
          user_intent?: string | null
        }
        Relationships: []
      }
      saved_devotions: {
        Row: {
          category: string | null
          content: string
          id: string
          saved_at: string
          title: string
          user_id: string
          verse_reference: string | null
        }
        Insert: {
          category?: string | null
          content: string
          id?: string
          saved_at?: string
          title: string
          user_id: string
          verse_reference?: string | null
        }
        Update: {
          category?: string | null
          content?: string
          id?: string
          saved_at?: string
          title?: string
          user_id?: string
          verse_reference?: string | null
        }
        Relationships: []
      }
      saved_recipes: {
        Row: {
          id: string
          is_dessert: boolean | null
          recipe_category: string | null
          recipe_ingredients: string[]
          recipe_instructions_url: string | null
          recipe_nutrition: Json | null
          recipe_ready_in_minutes: number | null
          recipe_servings: number | null
          recipe_title: string
          saved_at: string
          user_id: string
        }
        Insert: {
          id?: string
          is_dessert?: boolean | null
          recipe_category?: string | null
          recipe_ingredients: string[]
          recipe_instructions_url?: string | null
          recipe_nutrition?: Json | null
          recipe_ready_in_minutes?: number | null
          recipe_servings?: number | null
          recipe_title: string
          saved_at?: string
          user_id: string
        }
        Update: {
          id?: string
          is_dessert?: boolean | null
          recipe_category?: string | null
          recipe_ingredients?: string[]
          recipe_instructions_url?: string | null
          recipe_nutrition?: Json | null
          recipe_ready_in_minutes?: number | null
          recipe_servings?: number | null
          recipe_title?: string
          saved_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_sermons: {
        Row: {
          author: string | null
          category: string | null
          description: string | null
          id: string
          saved_at: string
          title: string
          url: string | null
          user_id: string
        }
        Insert: {
          author?: string | null
          category?: string | null
          description?: string | null
          id?: string
          saved_at?: string
          title: string
          url?: string | null
          user_id: string
        }
        Update: {
          author?: string | null
          category?: string | null
          description?: string | null
          id?: string
          saved_at?: string
          title?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      saved_verses: {
        Row: {
          category: string | null
          id: string
          reference: string
          saved_at: string
          text: string
          translation_name: string
          user_id: string
        }
        Insert: {
          category?: string | null
          id?: string
          reference: string
          saved_at?: string
          text: string
          translation_name: string
          user_id: string
        }
        Update: {
          category?: string | null
          id?: string
          reference?: string
          saved_at?: string
          text?: string
          translation_name?: string
          user_id?: string
        }
        Relationships: []
      }
      user_habit_scores: {
        Row: {
          consistency_rate: number | null
          created_at: string
          id: string
          period_end: string
          period_start: string
          rank_position: number | null
          recency_score: number | null
          score_period: string
          streak_score: number | null
          total_score: number | null
          updated_at: string
          user_id: string
          variety_score: number | null
        }
        Insert: {
          consistency_rate?: number | null
          created_at?: string
          id?: string
          period_end: string
          period_start: string
          rank_position?: number | null
          recency_score?: number | null
          score_period: string
          streak_score?: number | null
          total_score?: number | null
          updated_at?: string
          user_id: string
          variety_score?: number | null
        }
        Update: {
          consistency_rate?: number | null
          created_at?: string
          id?: string
          period_end?: string
          period_start?: string
          rank_position?: number | null
          recency_score?: number | null
          score_period?: string
          streak_score?: number | null
          total_score?: number | null
          updated_at?: string
          user_id?: string
          variety_score?: number | null
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          created_at: string
          current_weight_lbs: number | null
          exercise_name: string
          id: string
          last_increase_date: string | null
          previous_weight_lbs: number | null
          total_sessions: number | null
          updated_at: string
          user_id: string
          weight_increase_percent: number | null
        }
        Insert: {
          created_at?: string
          current_weight_lbs?: number | null
          exercise_name: string
          id?: string
          last_increase_date?: string | null
          previous_weight_lbs?: number | null
          total_sessions?: number | null
          updated_at?: string
          user_id: string
          weight_increase_percent?: number | null
        }
        Update: {
          created_at?: string
          current_weight_lbs?: number | null
          exercise_name?: string
          id?: string
          last_increase_date?: string | null
          previous_weight_lbs?: number | null
          total_sessions?: number | null
          updated_at?: string
          user_id?: string
          weight_increase_percent?: number | null
        }
        Relationships: []
      }
      user_reflections: {
        Row: {
          created_at: string
          devotion_title: string | null
          id: string
          reflection_text: string
          sermon_title: string | null
          updated_at: string
          user_id: string
          verse_reference: string | null
        }
        Insert: {
          created_at?: string
          devotion_title?: string | null
          id?: string
          reflection_text: string
          sermon_title?: string | null
          updated_at?: string
          user_id: string
          verse_reference?: string | null
        }
        Update: {
          created_at?: string
          devotion_title?: string | null
          id?: string
          reflection_text?: string
          sermon_title?: string | null
          updated_at?: string
          user_id?: string
          verse_reference?: string | null
        }
        Relationships: []
      }
      user_top_habits: {
        Row: {
          created_at: string
          habits: string[]
          id: string
          month: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          habits: string[]
          id?: string
          month: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          habits?: string[]
          id?: string
          month?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workout_plans: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          plan_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          plan_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          plan_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workout_sessions: {
        Row: {
          created_at: string
          duration_minutes: number | null
          id: string
          is_completed: boolean | null
          notes: string | null
          planned_day_of_week: number | null
          updated_at: string
          user_id: string
          workout_date: string
          workout_plan_id: string | null
          workout_type: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          is_completed?: boolean | null
          notes?: string | null
          planned_day_of_week?: number | null
          updated_at?: string
          user_id: string
          workout_date: string
          workout_plan_id?: string | null
          workout_type: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          is_completed?: boolean | null
          notes?: string | null
          planned_day_of_week?: number | null
          updated_at?: string
          user_id?: string
          workout_date?: string
          workout_plan_id?: string | null
          workout_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_workout_plan_id_fkey"
            columns: ["workout_plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
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

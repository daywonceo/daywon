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
      challenge_chat: {
        Row: {
          challenge_id: string
          created_at: string
          id: string
          message: string
          message_type: string | null
          team_id: string | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          created_at?: string
          id?: string
          message: string
          message_type?: string | null
          team_id?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          created_at?: string
          id?: string
          message?: string
          message_type?: string | null
          team_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_chat_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_chat_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "challenge_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_comments: {
        Row: {
          challenge_id: string
          content: string
          created_at: string
          id: string
          is_edited: boolean | null
          parent_comment_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          content: string
          created_at?: string
          id?: string
          is_edited?: boolean | null
          parent_comment_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          content?: string
          created_at?: string
          id?: string
          is_edited?: boolean | null
          parent_comment_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      challenge_participants: {
        Row: {
          challenge_id: string
          current_progress: number | null
          id: string
          joined_at: string
          last_progress_update: string | null
          status: string | null
          team_id: string | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          current_progress?: number | null
          id?: string
          joined_at?: string
          last_progress_update?: string | null
          status?: string | null
          team_id?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          current_progress?: number | null
          id?: string
          joined_at?: string
          last_progress_update?: string | null
          status?: string | null
          team_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_team"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "challenge_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_reactions: {
        Row: {
          challenge_id: string
          created_at: string
          id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          created_at?: string
          id?: string
          reaction_type?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          created_at?: string
          id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      challenge_teams: {
        Row: {
          captain_id: string
          challenge_id: string
          created_at: string
          current_members: number | null
          description: string | null
          id: string
          name: string
          total_progress: number | null
          updated_at: string
        }
        Insert: {
          captain_id: string
          challenge_id: string
          created_at?: string
          current_members?: number | null
          description?: string | null
          id?: string
          name: string
          total_progress?: number | null
          updated_at?: string
        }
        Update: {
          captain_id?: string
          challenge_id?: string
          created_at?: string
          current_members?: number | null
          description?: string | null
          id?: string
          name?: string
          total_progress?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_teams_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          challenge_type: string
          created_at: string
          creator_id: string
          description: string
          end_date: string
          entry_requirements: Json | null
          id: string
          is_team_based: boolean | null
          max_participants: number | null
          max_team_size: number | null
          prizes: Json | null
          rules: string | null
          start_date: string
          status: string | null
          target_unit: string | null
          target_value: number | null
          title: string
          updated_at: string
        }
        Insert: {
          challenge_type: string
          created_at?: string
          creator_id: string
          description: string
          end_date: string
          entry_requirements?: Json | null
          id?: string
          is_team_based?: boolean | null
          max_participants?: number | null
          max_team_size?: number | null
          prizes?: Json | null
          rules?: string | null
          start_date: string
          status?: string | null
          target_unit?: string | null
          target_value?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          challenge_type?: string
          created_at?: string
          creator_id?: string
          description?: string
          end_date?: string
          entry_requirements?: Json | null
          id?: string
          is_team_based?: boolean | null
          max_participants?: number | null
          max_team_size?: number | null
          prizes?: Json | null
          rules?: string | null
          start_date?: string
          status?: string | null
          target_unit?: string | null
          target_value?: number | null
          title?: string
          updated_at?: string
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
      habit_activities: {
        Row: {
          activity_date: string
          created_at: string
          habit_id: string
          habit_name: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_date: string
          created_at?: string
          habit_id: string
          habit_name: string
          id?: string
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_date?: string
          created_at?: string
          habit_id?: string
          habit_name?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_activities_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
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
      habit_events: {
        Row: {
          created_at: string
          id: string
          occurred_at: string
          source: string | null
          user_habit_id: string
          value: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          occurred_at?: string
          source?: string | null
          user_habit_id: string
          value?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          occurred_at?: string
          source?: string | null
          user_habit_id?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "habit_events_user_habit_id_fkey"
            columns: ["user_habit_id"]
            isOneToOne: false
            referencedRelation: "user_habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_photos: {
        Row: {
          activity_date: string
          caption: string | null
          created_at: string | null
          habit_id: string | null
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
          habit_id?: string | null
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
          habit_id?: string | null
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
          archived_at: string | null
          category: string | null
          created_at: string
          default_tracking_type: string | null
          description: string | null
          ended_at: string | null
          id: string
          name: string
          status: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          category?: string | null
          created_at?: string
          default_tracking_type?: string | null
          description?: string | null
          ended_at?: string | null
          id?: string
          name: string
          status?: string
          user_id: string
        }
        Update: {
          archived_at?: string | null
          category?: string | null
          created_at?: string
          default_tracking_type?: string | null
          description?: string | null
          ended_at?: string | null
          id?: string
          name?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      meal_plans: {
        Row: {
          created_at: string
          goals: Json | null
          id: string
          meals: Json
          plan_end: string
          plan_start: string
          preferences: Json | null
          shopping_list: Json
          status: string
          title: string | null
          total_daily_targets: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          goals?: Json | null
          id?: string
          meals: Json
          plan_end: string
          plan_start: string
          preferences?: Json | null
          shopping_list: Json
          status?: string
          title?: string | null
          total_daily_targets?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          goals?: Json | null
          id?: string
          meals?: Json
          plan_end?: string
          plan_start?: string
          preferences?: Json | null
          shopping_list?: Json
          status?: string
          title?: string | null
          total_daily_targets?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          actor_id: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          is_read: boolean | null
          message: string
          type: string
          user_id: string
        }
        Insert: {
          actor_id: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          is_read?: boolean | null
          message: string
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          is_read?: boolean | null
          message?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          is_edited: boolean | null
          parent_comment_id: string | null
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_edited?: boolean | null
          parent_comment_id?: string | null
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_edited?: boolean | null
          parent_comment_id?: string | null
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_parent_comment"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reactions: {
        Row: {
          created_at: string
          id: string
          post_id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          reaction_type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          email: string | null
          focus_areas: string[] | null
          id: string
          last_active: string | null
          onboarding_complete: boolean | null
          reminder_opt_in: boolean | null
          reminder_time: string | null
          status: string | null
          updated_at: string
          user_intent: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          focus_areas?: string[] | null
          id: string
          last_active?: string | null
          onboarding_complete?: boolean | null
          reminder_opt_in?: boolean | null
          reminder_time?: string | null
          status?: string | null
          updated_at?: string
          user_intent?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          focus_areas?: string[] | null
          id?: string
          last_active?: string | null
          onboarding_complete?: boolean | null
          reminder_opt_in?: boolean | null
          reminder_time?: string | null
          status?: string | null
          updated_at?: string
          user_intent?: string | null
          username?: string | null
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
      social_posts: {
        Row: {
          caption: string | null
          content: string
          created_at: string
          habit_name: string | null
          habit_type: string | null
          id: string
          is_milestone: boolean | null
          streak_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          content: string
          created_at?: string
          habit_name?: string | null
          habit_type?: string | null
          id?: string
          is_milestone?: boolean | null
          streak_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          caption?: string | null
          content?: string
          created_at?: string
          habit_name?: string | null
          habit_type?: string | null
          id?: string
          is_milestone?: boolean | null
          streak_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      user_habits: {
        Row: {
          created_at: string
          habit_id: string
          id: string
          is_active: boolean
          min_rest_days: number | null
          period: string | null
          reminder_channel: string[] | null
          reminder_time: string | null
          selected_days: number[] | null
          start_date: string
          target_count: number | null
          time_window_end: string | null
          time_window_start: string | null
          tracking_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          habit_id: string
          id?: string
          is_active?: boolean
          min_rest_days?: number | null
          period?: string | null
          reminder_channel?: string[] | null
          reminder_time?: string | null
          selected_days?: number[] | null
          start_date?: string
          target_count?: number | null
          time_window_end?: string | null
          time_window_start?: string | null
          tracking_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          habit_id?: string
          id?: string
          is_active?: boolean
          min_rest_days?: number | null
          period?: string | null
          reminder_channel?: string[] | null
          reminder_time?: string | null
          selected_days?: number[] | null
          start_date?: string
          target_count?: number | null
          time_window_end?: string | null
          time_window_start?: string | null
          tracking_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_habits_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
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
      user_relationships: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_relationships_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_relationships_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      weekly_summaries: {
        Row: {
          created_at: string
          id: string
          metrics: Json | null
          summary_text: string
          updated_at: string
          user_id: string
          week_end: string
          week_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          metrics?: Json | null
          summary_text: string
          updated_at?: string
          user_id: string
          week_end: string
          week_start: string
        }
        Update: {
          created_at?: string
          id?: string
          metrics?: Json | null
          summary_text?: string
          updated_at?: string
          user_id?: string
          week_end?: string
          week_start?: string
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
      calculate_habit_streak: {
        Args: { p_as_of_date?: string; p_user_habit_id: string }
        Returns: number
      }
      discover_potential_friends: {
        Args: { search_query?: string }
        Returns: {
          avatar_url: string
          display_name: string
          id: string
        }[]
      }
      find_or_create_habit: {
        Args: {
          p_category?: string
          p_description?: string
          p_name: string
          p_user_id: string
        }
        Returns: string
      }
      get_anonymized_leaderboard: {
        Args: { score_period_param?: string }
        Returns: {
          consistency_rate: number
          rank_position: number
          score_period: string
          total_score: number
        }[]
      }
      get_connected_profiles: {
        Args: Record<PropertyKey, never>
        Returns: {
          avatar_url: string
          bio: string
          created_at: string
          display_name: string
          id: string
          last_active: string
          status: string
        }[]
      }
      get_public_profiles: {
        Args: Record<PropertyKey, never>
        Returns: {
          avatar_url: string
          bio: string
          created_at: string
          display_name: string
          id: string
          last_active: string
          status: string
        }[]
      }
      get_weekly_habit_summary: {
        Args: { p_user_id: string; p_week_start?: string }
        Returns: {
          completed_count: number
          completion_rate: number
          habit_name: string
          target_count: number
          target_description: string
        }[]
      }
      merge_duplicate_habits: {
        Args: {
          p_keep_habit_id: string
          p_merge_habit_ids: string[]
          p_user_id: string
        }
        Returns: undefined
      }
      search_connected_profiles: {
        Args: { search_query: string }
        Returns: {
          avatar_url: string
          bio: string
          created_at: string
          display_name: string
          id: string
          last_active: string
          status: string
        }[]
      }
      search_public_profiles: {
        Args: { search_query: string }
        Returns: {
          avatar_url: string
          bio: string
          created_at: string
          display_name: string
          id: string
          last_active: string
          status: string
        }[]
      }
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

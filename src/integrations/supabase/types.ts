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
      best_friends: {
        Row: {
          friend_id: string
          id: string
          pinned_at: string
          position: number
          user_id: string
        }
        Insert: {
          friend_id: string
          id?: string
          pinned_at?: string
          position?: number
          user_id: string
        }
        Update: {
          friend_id?: string
          id?: string
          pinned_at?: string
          position?: number
          user_id?: string
        }
        Relationships: []
      }
      blocked_users: {
        Row: {
          blocked_at: string
          blocked_id: string
          blocker_id: string
          id: string
          reason: string | null
        }
        Insert: {
          blocked_at?: string
          blocked_id: string
          blocker_id: string
          id?: string
          reason?: string | null
        }
        Update: {
          blocked_at?: string
          blocked_id?: string
          blocker_id?: string
          id?: string
          reason?: string | null
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
      daily_journals: {
        Row: {
          content: string
          created_at: string
          id: string
          journal_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          journal_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          journal_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      exercise_library: {
        Row: {
          created_at: string | null
          difficulty: string
          equipment: string | null
          exercise_type: string
          id: string
          image_url: string | null
          instructions: string | null
          muscle_group: string
          name: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          difficulty?: string
          equipment?: string | null
          exercise_type?: string
          id?: string
          image_url?: string | null
          instructions?: string | null
          muscle_group: string
          name: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          difficulty?: string
          equipment?: string | null
          exercise_type?: string
          id?: string
          image_url?: string | null
          instructions?: string | null
          muscle_group?: string
          name?: string
          updated_at?: string | null
          video_url?: string | null
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
          notes: string | null
          reps: number
          rest_seconds: number | null
          rpe: number | null
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
          notes?: string | null
          reps: number
          rest_seconds?: number | null
          rpe?: number | null
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
          notes?: string | null
          reps?: number
          rest_seconds?: number | null
          rpe?: number | null
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
      friend_invitations: {
        Row: {
          accepted_at: string | null
          accepted_by_user_id: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          inviter_id: string
          status: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by_user_id?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          inviter_id: string
          status?: string
          token: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by_user_id?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          inviter_id?: string
          status?: string
          token?: string
        }
        Relationships: []
      }
      friend_request_limits: {
        Row: {
          id: string
          last_request_date: string
          requests_sent_today: number
          user_id: string
        }
        Insert: {
          id?: string
          last_request_date?: string
          requests_sent_today?: number
          user_id: string
        }
        Update: {
          id?: string
          last_request_date?: string
          requests_sent_today?: number
          user_id?: string
        }
        Relationships: []
      }
      friend_suggestions: {
        Row: {
          created_at: string | null
          dismissed_at: string | null
          id: string
          mutual_friends_count: number | null
          score: number | null
          shared_habits_count: number | null
          suggested_user_id: string
          suggestion_reason: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dismissed_at?: string | null
          id?: string
          mutual_friends_count?: number | null
          score?: number | null
          shared_habits_count?: number | null
          suggested_user_id: string
          suggestion_reason?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dismissed_at?: string | null
          id?: string
          mutual_friends_count?: number | null
          score?: number | null
          shared_habits_count?: number | null
          suggested_user_id?: string
          suggestion_reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "friend_suggestions_suggested_user_id_fkey"
            columns: ["suggested_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_suggestions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      integration_events: {
        Row: {
          completed_at: string | null
          created_at: string | null
          dedupe_hash: string
          event_type: string
          external_id: string
          id: string
          payload: Json
          processed: boolean | null
          processed_at: string | null
          provider: string
          tags: string[] | null
          title: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          dedupe_hash: string
          event_type: string
          external_id: string
          id?: string
          payload: Json
          processed?: boolean | null
          processed_at?: string | null
          provider: string
          tags?: string[] | null
          title?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          dedupe_hash?: string
          event_type?: string
          external_id?: string
          id?: string
          payload?: Json
          processed?: boolean | null
          processed_at?: string | null
          provider?: string
          tags?: string[] | null
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      integration_rules: {
        Row: {
          active: boolean | null
          created_at: string | null
          habit_id: string
          id: string
          match_type: string
          match_value: string
          provider: string
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          habit_id: string
          id?: string
          match_type: string
          match_value: string
          provider: string
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          habit_id?: string
          id?: string
          match_type?: string
          match_value?: string
          provider?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_rules_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_sync_logs: {
        Row: {
          completed_at: string | null
          error_message: string | null
          id: string
          integration_type: string
          records_processed: number | null
          started_at: string
          status: string
          sync_details: Json | null
          sync_type: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          integration_type: string
          records_processed?: number | null
          started_at?: string
          status?: string
          sync_details?: Json | null
          sync_type: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          integration_type?: string
          records_processed?: number | null
          started_at?: string
          status?: string
          sync_details?: Json | null
          sync_type?: string
          user_id?: string
        }
        Relationships: []
      }
      invite_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string
          expires_at: string
          id: string
          is_used: boolean | null
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by: string
          expires_at?: string
          id?: string
          is_used?: boolean | null
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string
          expires_at?: string
          id?: string
          is_used?: boolean | null
          used_at?: string | null
          used_by?: string | null
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
          {
            foreignKeyName: "post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      privacy_settings: {
        Row: {
          allow_friend_requests: string
          created_at: string
          id: string
          profile_visibility: string
          show_activity: boolean
          show_habits: boolean
          show_online_status: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          allow_friend_requests?: string
          created_at?: string
          id?: string
          profile_visibility?: string
          show_activity?: boolean
          show_habits?: boolean
          show_online_status?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          allow_friend_requests?: string
          created_at?: string
          id?: string
          profile_visibility?: string
          show_activity?: boolean
          show_habits?: boolean
          show_online_status?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          day_won_member_since: string | null
          display_name: string | null
          email: string | null
          focus_areas: string[] | null
          id: string
          is_day_won_member: boolean | null
          last_active: string | null
          name_changed_at: string | null
          onboarding_complete: boolean | null
          reminder_opt_in: boolean | null
          reminder_time: string | null
          status: string | null
          updated_at: string
          user_intent: string | null
          username: string | null
          username_history: Json | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          day_won_member_since?: string | null
          display_name?: string | null
          email?: string | null
          focus_areas?: string[] | null
          id: string
          is_day_won_member?: boolean | null
          last_active?: string | null
          name_changed_at?: string | null
          onboarding_complete?: boolean | null
          reminder_opt_in?: boolean | null
          reminder_time?: string | null
          status?: string | null
          updated_at?: string
          user_intent?: string | null
          username?: string | null
          username_history?: Json | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          day_won_member_since?: string | null
          display_name?: string | null
          email?: string | null
          focus_areas?: string[] | null
          id?: string
          is_day_won_member?: boolean | null
          last_active?: string | null
          name_changed_at?: string | null
          onboarding_complete?: boolean | null
          reminder_opt_in?: boolean | null
          reminder_time?: string | null
          status?: string | null
          updated_at?: string
          user_intent?: string | null
          username?: string | null
          username_history?: Json | null
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
      user_integrations: {
        Row: {
          access_token: string | null
          access_token_encrypted: string | null
          connected_at: string | null
          created_at: string
          id: string
          ignore_before: string | null
          integration_scopes: string[] | null
          integration_settings: Json | null
          integration_status: string | null
          integration_type: string
          is_connected: boolean
          last_sync_at: string | null
          last_synced_at: string | null
          provider_user_id: string | null
          refresh_token: string | null
          refresh_token_encrypted: string | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          access_token_encrypted?: string | null
          connected_at?: string | null
          created_at?: string
          id?: string
          ignore_before?: string | null
          integration_scopes?: string[] | null
          integration_settings?: Json | null
          integration_status?: string | null
          integration_type: string
          is_connected?: boolean
          last_sync_at?: string | null
          last_synced_at?: string | null
          provider_user_id?: string | null
          refresh_token?: string | null
          refresh_token_encrypted?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          access_token_encrypted?: string | null
          connected_at?: string | null
          created_at?: string
          id?: string
          ignore_before?: string | null
          integration_scopes?: string[] | null
          integration_settings?: Json | null
          integration_status?: string | null
          integration_type?: string
          is_connected?: boolean
          last_sync_at?: string | null
          last_synced_at?: string | null
          provider_user_id?: string | null
          refresh_token?: string | null
          refresh_token_encrypted?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
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
          energy_level: string | null
          id: string
          is_completed: boolean | null
          notes: string | null
          paused_at: string | null
          planned_day_of_week: number | null
          rpe_overall: number | null
          started_at: string | null
          total_pause_duration_seconds: number | null
          updated_at: string
          user_id: string
          workout_date: string
          workout_plan_id: string | null
          workout_quality: string | null
          workout_type: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          energy_level?: string | null
          id?: string
          is_completed?: boolean | null
          notes?: string | null
          paused_at?: string | null
          planned_day_of_week?: number | null
          rpe_overall?: number | null
          started_at?: string | null
          total_pause_duration_seconds?: number | null
          updated_at?: string
          user_id: string
          workout_date: string
          workout_plan_id?: string | null
          workout_quality?: string | null
          workout_type: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          energy_level?: string | null
          id?: string
          is_completed?: boolean | null
          notes?: string | null
          paused_at?: string | null
          planned_day_of_week?: number | null
          rpe_overall?: number | null
          started_at?: string | null
          total_pause_duration_seconds?: number | null
          updated_at?: string
          user_id?: string
          workout_date?: string
          workout_plan_id?: string | null
          workout_quality?: string | null
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
      workout_templates: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty: string
          estimated_duration_minutes: number | null
          exercises: Json
          id: string
          is_public: boolean | null
          name: string
          times_used: number | null
          updated_at: string | null
          user_id: string | null
          workout_type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty: string
          estimated_duration_minutes?: number | null
          exercises: Json
          id?: string
          is_public?: boolean | null
          name: string
          times_used?: number | null
          updated_at?: string | null
          user_id?: string | null
          workout_type: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty?: string
          estimated_duration_minutes?: number | null
          exercises?: Json
          id?: string
          is_public?: boolean | null
          name?: string
          times_used?: number | null
          updated_at?: string | null
          user_id?: string | null
          workout_type?: string
        }
        Relationships: []
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
      can_send_friend_request: { Args: { sender_id: string }; Returns: boolean }
      check_username_availability: {
        Args: { username_input: string }
        Returns: Json
      }
      delete_habit_forever: { Args: { p_habit: string }; Returns: undefined }
      discover_potential_friends: {
        Args: { search_query?: string }
        Returns: {
          avatar_url: string
          display_name: string
          id: string
        }[]
      }
      end_habit_today: { Args: { p_habit: string }; Returns: undefined }
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
        Args: never
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
      get_friend_suggestions: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: {
          avatar_url: string
          display_name: string
          mutual_friends_count: number
          score: number
          shared_habits_count: number
          suggestion_reason: string
          user_id: string
          username: string
        }[]
      }
      get_mutual_friends: {
        Args: { user_a: string; user_b: string }
        Returns: {
          avatar_url: string
          display_name: string
          user_id: string
          username: string
        }[]
      }
      get_public_profiles: {
        Args: never
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_friend_request_count: {
        Args: { sender_id: string }
        Returns: undefined
      }
      merge_duplicate_habits: {
        Args: {
          p_keep_habit_id: string
          p_merge_habit_ids: string[]
          p_user_id: string
        }
        Returns: undefined
      }
      normalize_habit_name: { Args: { habit_name: string }; Returns: string }
      redeem_invite_code: { Args: { p_code: string }; Returns: Json }
      resume_habit: { Args: { p_habit: string }; Returns: undefined }
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
      search_users_for_mentions: {
        Args: { search_query: string }
        Returns: {
          avatar_url: string
          bio: string
          display_name: string
          id: string
          username: string
        }[]
      }
      update_username_enhanced: {
        Args: { new_username: string; user_id: string }
        Returns: Json
      }
      update_username_with_history: {
        Args: { new_username: string; user_id: string }
        Returns: boolean
      }
      validate_username_enhanced: {
        Args: { user_id?: string; username_input: string }
        Returns: Json
      }
      validate_username_format: {
        Args: { username_input: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const

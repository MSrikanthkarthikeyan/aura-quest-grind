export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      comments: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          post_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          post_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_activities: {
        Row: {
          created_at: string
          date: string
          has_login: boolean | null
          id: string
          pomodoros_completed: number | null
          quests_completed: number | null
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          created_at?: string
          date: string
          has_login?: boolean | null
          id?: string
          pomodoros_completed?: number | null
          quests_completed?: number | null
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          created_at?: string
          date?: string
          has_login?: boolean | null
          id?: string
          pomodoros_completed?: number | null
          quests_completed?: number | null
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: []
      }
      game_data: {
        Row: {
          achievements: Json | null
          character: Json | null
          created_at: string
          daily_activities: Json | null
          habits: Json | null
          id: string
          updated_at: string
          user_id: string
          user_roles: Json | null
        }
        Insert: {
          achievements?: Json | null
          character?: Json | null
          created_at?: string
          daily_activities?: Json | null
          habits?: Json | null
          id?: string
          updated_at?: string
          user_id: string
          user_roles?: Json | null
        }
        Update: {
          achievements?: Json | null
          character?: Json | null
          created_at?: string
          daily_activities?: Json | null
          habits?: Json | null
          id?: string
          updated_at?: string
          user_id?: string
          user_roles?: Json | null
        }
        Relationships: []
      }
      generated_quests: {
        Row: {
          created_at: string
          id: string
          quests: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          quests: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          quests?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          published: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          published?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          published?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          username?: string | null
        }
        Relationships: []
      }
      quest_sessions: {
        Row: {
          created_at: string
          id: string
          pomodoro_count: number
          quest_id: string
          started_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          pomodoro_count: number
          quest_id: string
          started_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          pomodoro_count?: number
          quest_id?: string
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_onboarding_profiles: {
        Row: {
          created_at: string
          fitness_preferences: string[] | null
          goals: string | null
          id: string
          interests: string[] | null
          quest_style: string | null
          routine: string | null
          skill_level: string | null
          time_commitment: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          fitness_preferences?: string[] | null
          goals?: string | null
          id?: string
          interests?: string[] | null
          quest_style?: string | null
          routine?: string | null
          skill_level?: string | null
          time_commitment?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          fitness_preferences?: string[] | null
          goals?: string | null
          id?: string
          interests?: string[] | null
          quest_style?: string | null
          routine?: string | null
          skill_level?: string | null
          time_commitment?: string | null
          updated_at?: string
          user_id?: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

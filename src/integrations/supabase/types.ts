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
      application_documents: {
        Row: {
          content: Json
          created_at: string
          document_type: string
          id: string
          job_posting_id: string | null
          quality_check: Json
          status: string
          title: string | null
          tone: string | null
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          content?: Json
          created_at?: string
          document_type?: string
          id?: string
          job_posting_id?: string | null
          quality_check?: Json
          status?: string
          title?: string | null
          tone?: string | null
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          content?: Json
          created_at?: string
          document_type?: string
          id?: string
          job_posting_id?: string | null
          quality_check?: Json
          status?: string
          title?: string | null
          tone?: string | null
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "application_documents_job_posting_id_fkey"
            columns: ["job_posting_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
        ]
      }
      application_strategies: {
        Row: {
          arguments: Json
          core_message: string | null
          created_at: string
          id: string
          job_posting_id: string
          keywords: string[]
          motivation_company: string | null
          motivation_role: string | null
          objections: Json
          positioning: string | null
          story_elevator: string | null
          story_long: string | null
          story_one_liner: string | null
          tone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          arguments?: Json
          core_message?: string | null
          created_at?: string
          id?: string
          job_posting_id: string
          keywords?: string[]
          motivation_company?: string | null
          motivation_role?: string | null
          objections?: Json
          positioning?: string | null
          story_elevator?: string | null
          story_long?: string | null
          story_one_liner?: string | null
          tone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          arguments?: Json
          core_message?: string | null
          created_at?: string
          id?: string
          job_posting_id?: string
          keywords?: string[]
          motivation_company?: string | null
          motivation_role?: string | null
          objections?: Json
          positioning?: string | null
          story_elevator?: string | null
          story_long?: string | null
          story_one_liner?: string | null
          tone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_strategies_job_posting_id_fkey"
            columns: ["job_posting_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          application_date: string | null
          contact_person: string | null
          created_at: string
          id: string
          job_posting_id: string
          next_action: string | null
          next_action_date: string | null
          notes: string | null
          position: number
          salary_band: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          application_date?: string | null
          contact_person?: string | null
          created_at?: string
          id?: string
          job_posting_id: string
          next_action?: string | null
          next_action_date?: string | null
          notes?: string | null
          position?: number
          salary_band?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          application_date?: string | null
          contact_person?: string | null
          created_at?: string
          id?: string
          job_posting_id?: string
          next_action?: string | null
          next_action_date?: string | null
          notes?: string | null
          position?: number
          salary_band?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_posting_id_fkey"
            columns: ["job_posting_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
        ]
      }
      company_research: {
        Row: {
          assumptions: Json
          company: string
          created_at: string
          dossier: Json
          id: string
          job_posting_id: string | null
          open_questions: Json
          raw_input: string | null
          sources: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          assumptions?: Json
          company: string
          created_at?: string
          dossier?: Json
          id?: string
          job_posting_id?: string | null
          open_questions?: Json
          raw_input?: string | null
          sources?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          assumptions?: Json
          company?: string
          created_at?: string
          dossier?: Json
          id?: string
          job_posting_id?: string | null
          open_questions?: Json
          raw_input?: string | null
          sources?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_research_job_posting_id_fkey"
            columns: ["job_posting_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_preparations: {
        Row: {
          briefing: Json
          created_at: string
          feedback: Json
          id: string
          interview_type: string
          job_posting_id: string
          preparation_status: string
          questions: Json
          reverse_questions: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          briefing?: Json
          created_at?: string
          feedback?: Json
          id?: string
          interview_type?: string
          job_posting_id: string
          preparation_status?: string
          questions?: Json
          reverse_questions?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          briefing?: Json
          created_at?: string
          feedback?: Json
          id?: string
          interview_type?: string
          job_posting_id?: string
          preparation_status?: string
          questions?: Json
          reverse_questions?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_preparations_job_posting_id_fkey"
            columns: ["job_posting_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_postings: {
        Row: {
          company: string
          contact_person: string | null
          country: string | null
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          location: string | null
          notes: string | null
          original_url: string | null
          priority: number
          publication_date: string | null
          region: string | null
          remote_share: string | null
          salary_range: string | null
          salary_value: number | null
          seniority: string | null
          source: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company: string
          contact_person?: string | null
          country?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          original_url?: string | null
          priority?: number
          publication_date?: string | null
          region?: string | null
          remote_share?: string | null
          salary_range?: string | null
          salary_value?: number | null
          seniority?: string | null
          source?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string
          contact_person?: string | null
          country?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          original_url?: string | null
          priority?: number
          publication_date?: string | null
          region?: string | null
          remote_share?: string | null
          salary_range?: string | null
          salary_value?: number | null
          seniority?: string | null
          source?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      master_cvs: {
        Row: {
          confirmed: boolean
          created_at: string
          extracted_text: string | null
          file_name: string | null
          id: string
          structured_content: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          confirmed?: boolean
          created_at?: string
          extracted_text?: string | null
          file_name?: string | null
          id?: string
          structured_content?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          confirmed?: boolean
          created_at?: string
          extracted_text?: string | null
          file_name?: string | null
          id?: string
          structured_content?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      match_analyses: {
        Row: {
          category_scores: Json
          created_at: string
          cv_recommendations: Json
          differentiators: Json
          fulfilled_requirements: Json
          id: string
          job_posting_id: string
          missing_requirements: Json
          outlook: string | null
          overall_score: number
          partial_requirements: Json
          risks: Json
          summary: string | null
          transferable_skills: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          category_scores?: Json
          created_at?: string
          cv_recommendations?: Json
          differentiators?: Json
          fulfilled_requirements?: Json
          id?: string
          job_posting_id: string
          missing_requirements?: Json
          outlook?: string | null
          overall_score?: number
          partial_requirements?: Json
          risks?: Json
          summary?: string | null
          transferable_skills?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          category_scores?: Json
          created_at?: string
          cv_recommendations?: Json
          differentiators?: Json
          fulfilled_requirements?: Json
          id?: string
          job_posting_id?: string
          missing_requirements?: Json
          outlook?: string | null
          overall_score?: number
          partial_requirements?: Json
          risks?: Json
          summary?: string | null
          transferable_skills?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_analyses_job_posting_id_fkey"
            columns: ["job_posting_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          headline: string | null
          id: string
          linkedin_url: string | null
          location: string | null
          phone: string | null
          settings: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          headline?: string | null
          id: string
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          settings?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          headline?: string | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          settings?: Json
          updated_at?: string
        }
        Relationships: []
      }
      search_profiles: {
        Row: {
          company_sizes: string[]
          contract_type: string | null
          countries: string[]
          created_at: string
          excluded_industries: string[]
          exclusion_criteria: string | null
          id: string
          industries: string[]
          leadership_scope: string | null
          max_office_days: number | null
          regions: string[]
          salary_minimum: number | null
          seniority: string | null
          target_roles: string[]
          travel_readiness: string | null
          updated_at: string
          user_id: string
          work_model: string | null
        }
        Insert: {
          company_sizes?: string[]
          contract_type?: string | null
          countries?: string[]
          created_at?: string
          excluded_industries?: string[]
          exclusion_criteria?: string | null
          id?: string
          industries?: string[]
          leadership_scope?: string | null
          max_office_days?: number | null
          regions?: string[]
          salary_minimum?: number | null
          seniority?: string | null
          target_roles?: string[]
          travel_readiness?: string | null
          updated_at?: string
          user_id: string
          work_model?: string | null
        }
        Update: {
          company_sizes?: string[]
          contract_type?: string | null
          countries?: string[]
          created_at?: string
          excluded_industries?: string[]
          exclusion_criteria?: string | null
          id?: string
          industries?: string[]
          leadership_scope?: string | null
          max_office_days?: number | null
          regions?: string[]
          salary_minimum?: number | null
          seniority?: string | null
          target_roles?: string[]
          travel_readiness?: string | null
          updated_at?: string
          user_id?: string
          work_model?: string | null
        }
        Relationships: []
      }
      star_stories: {
        Row: {
          action: string | null
          created_at: string
          id: string
          job_posting_id: string | null
          learning: string | null
          relevance: string | null
          result: string | null
          situation: string | null
          tags: string[]
          task: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action?: string | null
          created_at?: string
          id?: string
          job_posting_id?: string | null
          learning?: string | null
          relevance?: string | null
          result?: string | null
          situation?: string | null
          tags?: string[]
          task?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action?: string | null
          created_at?: string
          id?: string
          job_posting_id?: string | null
          learning?: string | null
          relevance?: string | null
          result?: string | null
          situation?: string | null
          tags?: string[]
          task?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "star_stories_job_posting_id_fkey"
            columns: ["job_posting_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
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

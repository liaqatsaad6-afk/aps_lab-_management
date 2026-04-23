export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          role: 'lab_assistant' | 'viewer';
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          role?: 'lab_assistant' | 'viewer';
          created_at?: string;
        };
        Update: {
          full_name?: string | null;
          role?: 'lab_assistant' | 'viewer';
        };
      };
      labs: {
        Row: {
          id: string;
          name: string;
          room_no: string | null;
          total_pcs: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          room_no?: string | null;
          total_pcs?: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          room_no?: string | null;
          total_pcs?: number;
        };
      };
      pcs: {
        Row: {
          id: string;
          lab_id: string;
          pc_number: number;
          asset_tag: string | null;
          status: 'ok' | 'issue' | 'under_repair';
          notes: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lab_id: string;
          pc_number: number;
          asset_tag?: string | null;
          status?: 'ok' | 'issue' | 'under_repair';
          notes?: string | null;
          updated_at?: string;
        };
        Update: {
          status?: 'ok' | 'issue' | 'under_repair';
          asset_tag?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
      pc_issues: {
        Row: {
          id: string;
          pc_id: string;
          issue_title: string;
          issue_details: string | null;
          priority: 'low' | 'medium' | 'high';
          issue_status: 'open' | 'in_progress' | 'resolved';
          reported_at: string;
          resolved_at: string | null;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          pc_id: string;
          issue_title: string;
          issue_details?: string | null;
          priority?: 'low' | 'medium' | 'high';
          issue_status?: 'open' | 'in_progress' | 'resolved';
          reported_at?: string;
          resolved_at?: string | null;
          created_by?: string | null;
        };
        Update: {
          issue_title?: string;
          issue_details?: string | null;
          priority?: 'low' | 'medium' | 'high';
          issue_status?: 'open' | 'in_progress' | 'resolved';
          resolved_at?: string | null;
        };
      };
      lab_sessions: {
        Row: {
          id: string;
          lab_id: string;
          session_date: string;
          day_name: string;
          start_time: string;
          end_time: string;
          teacher_name: string;
          class_name: string;
          topic: string;
          teacher_sign: string | null;
          cr_sign: string | null;
          assistant_sign: string | null;
          remarks: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          lab_id: string;
          session_date: string;
          day_name: string;
          start_time: string;
          end_time: string;
          teacher_name: string;
          class_name: string;
          topic: string;
          teacher_sign?: string | null;
          cr_sign?: string | null;
          assistant_sign?: string | null;
          remarks?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          teacher_name?: string;
          class_name?: string;
          topic?: string;
          teacher_sign?: string | null;
          cr_sign?: string | null;
          assistant_sign?: string | null;
          remarks?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      current_app_role: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

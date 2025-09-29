export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      user: {
        Row: {
          id: string;
          name: string;
          email: string;
          email_verified: boolean;
          image: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          email_verified?: boolean;
          image?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          email_verified?: boolean;
          image?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      session: {
        Row: {
          id: string;
          expires_at: string;
          token: string;
          created_at: string;
          updated_at: string;
          ip_address: string | null;
          user_agent: string | null;
          user_id: string;
        };
        Insert: {
          id: string;
          expires_at: string;
          token: string;
          created_at?: string;
          updated_at?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          user_id: string;
        };
        Update: {
          id?: string;
          expires_at?: string;
          token?: string;
          created_at?: string;
          updated_at?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          user_id?: string;
        };
      };
      account: {
        Row: {
          id: string;
          account_id: string;
          provider_id: string;
          user_id: string;
          access_token: string | null;
          refresh_token: string | null;
          id_token: string | null;
          access_token_expires_at: string | null;
          refresh_token_expires_at: string | null;
          scope: string | null;
          password: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          account_id: string;
          provider_id: string;
          user_id: string;
          access_token?: string | null;
          refresh_token?: string | null;
          id_token?: string | null;
          access_token_expires_at?: string | null;
          refresh_token_expires_at?: string | null;
          scope?: string | null;
          password?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          provider_id?: string;
          user_id?: string;
          access_token?: string | null;
          refresh_token?: string | null;
          id_token?: string | null;
          access_token_expires_at?: string | null;
          refresh_token_expires_at?: string | null;
          scope?: string | null;
          password?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      verification: {
        Row: {
          id: string;
          identifier: string;
          value: string;
          expires_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          identifier: string;
          value: string;
          expires_at: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          identifier?: string;
          value?: string;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      category: {
        Row: {
          id: number;
          name: string;
          type: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          type: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          type?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      transaction: {
        Row: {
          id: number;
          user_id: string;
          category_id: number;
          type: string;
          amount: string;
          description: string | null;
          date: string;
          is_approved: boolean;
          receipt_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          category_id: number;
          type: string;
          amount: string;
          description?: string | null;
          date: string;
          is_approved?: boolean;
          receipt_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          category_id?: number;
          type?: string;
          amount?: string;
          description?: string | null;
          date?: string;
          is_approved?: boolean;
          receipt_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      asset: {
        Row: {
          id: number;
          user_id: string;
          name: string;
          description: string | null;
          purchase_date: string;
          purchase_price: string;
          current_value: string | null;
          depreciation_rate: string | null;
          category_id: number;
          maintenance_schedule: string | null;
          insurance_info: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          name: string;
          description?: string | null;
          purchase_date: string;
          purchase_price: string;
          current_value?: string | null;
          depreciation_rate?: string | null;
          category_id: number;
          maintenance_schedule?: string | null;
          insurance_info?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          name?: string;
          description?: string | null;
          purchase_date?: string;
          purchase_price?: string;
          current_value?: string | null;
          depreciation_rate?: string | null;
          category_id?: number;
          maintenance_schedule?: string | null;
          insurance_info?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      investment: {
        Row: {
          id: number;
          user_id: string;
          name: string;
          description: string | null;
          type: string;
          purchase_date: string;
          purchase_price: string;
          current_value: string | null;
          quantity: string | null;
          roi: string | null;
          category_id: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          name: string;
          description?: string | null;
          type: string;
          purchase_date: string;
          purchase_price: string;
          current_value?: string | null;
          quantity?: string | null;
          roi?: string | null;
          category_id: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          name?: string;
          description?: string | null;
          type?: string;
          purchase_date?: string;
          purchase_price?: string;
          current_value?: string | null;
          quantity?: string | null;
          roi?: string | null;
          category_id?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      document: {
        Row: {
          id: number;
          user_id: string;
          name: string;
          url: string;
          type: string;
          related_id: number | null;
          related_type: string | null;
          upload_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          name: string;
          url: string;
          type: string;
          related_id?: number | null;
          related_type?: string | null;
          upload_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          name?: string;
          url?: string;
          type?: string;
          related_id?: number | null;
          related_type?: string | null;
          upload_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_profile: {
        Row: {
          id: number;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
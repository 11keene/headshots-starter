export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          credits: number;
        };
        Insert: {
          id: string;
          credits?: number;
        };
        Update: {
          credits?: number;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: number;
          user_id: string;
          pack: string;
          session_id: string;
          status: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          pack: string;
          session_id: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          pack?: string;
          session_id?: string;
          status?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      credits: {
        Row: {
          created_at: string;
          credits: number;
          id: number;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          credits?: number;
          id?: number;
          user_id: string;
        };
        Update: {
          created_at?: string;
          credits?: number;
          id?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "credits_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      images: {
        Row: {
          created_at: string;
          id: number;
          modelId: number;
          uri: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          modelId: number;
          uri: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          modelId?: number;
          uri?: string;
        };
        Relationships: [
          {
            foreignKeyName: "images_modelId_fkey";
            columns: ["modelId"];
            referencedRelation: "models";
            referencedColumns: ["id"];
          }
        ];
      };
      models: {
        Row: {
          created_at: string;
          id: number;
          modelId: string | null;
          name: string | null;
          status: string;
          type: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          modelId?: string | null;
          name?: string | null;
          status?: string;
          type?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          modelId?: string | null;
          name?: string | null;
          status?: string;
          type?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "models_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      samples: {
        Row: {
          created_at: string;
          id: number;
          modelId: number;
          uri: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          modelId: number;
          uri: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          modelId?: number;
          uri?: string;
        };
        Relationships: [
          {
            foreignKeyName: "samples_modelId_fkey";
            columns: ["modelId"];
            referencedRelation: "models";
            referencedColumns: ["id"];
          }
        ];
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

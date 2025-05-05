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
      /**
       * Users table: stores each user's ID, credit balance, and timestamp
       */
      users: {
        Row: {
          id: string;           // UUID primary key
          credits: number;      // current credit balance
          created_at: string;   // timestamp of row creation
        };
        Insert: {
          id: string;
          credits?: number;
          created_at?: string;
        };
        Update: {
          credits?: number;
          created_at?: string;
        };
        Relationships: [];
      };

      /**
       * Credits log table (optional history of credit changes)
       */
      credits: {
        Row: {
          id: number;
          user_id: string;
          credits: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          credits?: number;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          credits?: number;
          created_at?: string;
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

      /**
       * Orders table: tracks Stripe sessions and payment status
       */
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
          id?: number;
          user_id: string;
          pack: string;
          session_id: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          pack?: string;
          session_id?: string;
          status?: string;
          created_at?: string;
        };
        Relationships: [];
      };

      /**
       * Images table: stores generated image URIs for each model
       */
      images: {
        Row: {
          id: number;
          modelId: number;
          uri: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          modelId: number;
          uri: string;
          created_at?: string;
        };
        Update: {
          modelId?: number;
          uri?: string;
          created_at?: string;
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

      /**
       * Models table: stores fine-tuned model metadata
       */
      models: {
        Row: {
          id: number;
          user_id: string | null;
          name: string | null;
          pack: string | null;
          characteristics: string | null;
          fine_tuned_face_id: string;
          trained_at: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id?: string | null;
          name?: string | null;
          pack?: string | null;
          characteristics?: string | null;
          fine_tuned_face_id: string;
          trained_at?: string;
          created_at?: string;
        };
        Update: {
          user_id?: string | null;
          name?: string | null;
          pack?: string | null;
          characteristics?: string | null;
          fine_tuned_face_id?: string;
          trained_at?: string;
          created_at?: string;
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

      /**
       * Samples table: stores example images per model
       */
      samples: {
        Row: {
          id: number;
          modelId: number;
          uri: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          modelId: number;
          uri: string;
          created_at?: string;
        };
        Update: {
          modelId?: number;
          uri?: string;
          created_at?: string;
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

// File: types/utils.ts

import { Database } from "./supabase";

export type SampleRow = Database["public"]["Tables"]["samples"]["Row"];

// Note: this must exactly match the columns you select in your queries
export interface ModelRowWithSamples {
  id: number;
  user_id: string | null;
  name: string | null;
  pack: string | null;
  characteristics: string | null;
  fine_tuned_face_id: string;
  trained_at: string;
  created_at: string;
  samples: SampleRow[];
}

// other helpers you already have
export type ImageRow = Database["public"]["Tables"]["images"]["Row"];
export type CreditsRow = Database["public"]["Tables"]["credits"]["Row"];

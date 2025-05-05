// File: types/utils.ts
import { Database } from "./supabase";

export type sampleRow = Database["public"]["Tables"]["samples"]["Row"];

export type modelRow = Database["public"]["Tables"]["models"]["Row"] & {
  pack: string | null;
  fine_tuned_face_id: string;
  trained_at: string;
};

export type modelRowWithSamples = modelRow & {
  samples: sampleRow[];
};

export type imageRow   = Database["public"]["Tables"]["images"]["Row"];
export type creditsRow = Database["public"]["Tables"]["credits"]["Row"];

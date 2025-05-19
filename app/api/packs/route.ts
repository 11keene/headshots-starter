// app/api/packs/route.ts
import { NextResponse } from "next/server";
import { packs as packData } from "@/data/packs";

// GET /api/packs
export async function GET() {
  // we assume packData is an array of { id, name, prompt_template, … }
  return NextResponse.json(packData);
}

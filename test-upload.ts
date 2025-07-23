// test-upload.ts
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import fetch from "node-fetch";

// Load env variables from .env.local
dotenv.config({ path: ".env.local" });

// Check env vars
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("Supabase URL:", SUPABASE_URL);
console.log("Supabase Key Loaded:", !!SUPABASE_SERVICE_ROLE_KEY);

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// 1. Image URL to test
const testImageUrl = "https://mp.astria.ai/v2fizqr3gu5nyxa2rfiiynforaqb";

// 2. Bucket and filename
const bucket = "generated";
const fileName = `test-${uuidv4()}.jpg`;

async function runUploadTest() {
  try {
    console.log("[UploadTest] Fetching image from Astria...");
    const response = await fetch(testImageUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`[UploadTest] Uploading ${fileName} to bucket "${bucket}"...`);

    const { error } = await supabase.storage.from(bucket).upload(fileName, buffer, {
      contentType: "image/jpeg",
      upsert: false,
    });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    console.log(`[UploadTest] Uploaded successfully: ${data.publicUrl}`);
  } catch (err) {
    console.error("[UploadTest] Error:", err);
  }
}

runUploadTest();

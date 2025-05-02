// scripts/createTestUser.ts

import "dotenv/config";                   // loads your .env.local
import { supabaseAdmin } from "../lib/supabaseClient";

async function createUser() {
  // Insert a new row with astria_model_id = NULL
  const { data, error } = await supabaseAdmin
    .from("users")
    .insert({ astria_model_id: null })
    .select();

  if (error) {
    console.error("❌ Error creating user:", error);
    process.exit(1);
  }
  console.log("✅ Created user row:", data![0]);
  process.exit(0);
}

createUser();

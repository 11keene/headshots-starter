// File: app/astria/prompt-webhook/route.ts

import { Database } from "@/types/supabase";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

// Environment Variables
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const APP_WEBHOOK_SECRET = process.env.APP_WEBHOOK_SECRET!;

if (!SUPABASE_URL) throw new Error("MISSING NEXT_PUBLIC_SUPABASE_URL!");
if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error("MISSING SUPABASE_SERVICE_ROLE_KEY!");
if (!APP_WEBHOOK_SECRET) throw new Error("MISSING APP_WEBHOOK_SECRET!");

if (!RESEND_API_KEY) {
  console.warn(
    "⚠️ RESEND_API_KEY is missing. Emails will not be sent."
  );
}
if (!RESEND_FROM_EMAIL) {
  console.warn(
    "⚠️ RESEND_FROM_EMAIL is missing. Notification sender address not configured."
  );
}

export async function POST(request: Request) {
  type PromptData = {
    id: number;
    text: string;
    negative_prompt: string;
    steps: null;
    tune_id: number;
    trained_at: string;
    started_training_at: string;
    created_at: string;
    updated_at: string;
    images: string[];
  };

  // 1) Parse incoming body
  const { prompt } = (await request.json()) as { prompt: PromptData };

  // 2) Validate URL params
  const url = new URL(request.url);
  const user_id = url.searchParams.get("user_id");
  const model_id = url.searchParams.get("model_id");
  const webhook_secret = url.searchParams.get("webhook_secret");

  if (!model_id) {
    return NextResponse.json(
      { message: "Malformed URL: no model_id" },
      { status: 400 }
    );
  }
  if (!webhook_secret) {
    return NextResponse.json(
      { message: "Malformed URL: no webhook_secret" },
      { status: 400 }
    );
  }
  if (webhook_secret.toLowerCase() !== APP_WEBHOOK_SECRET.toLowerCase()) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (!user_id) {
    return NextResponse.json(
      { message: "Malformed URL: no user_id" },
      { status: 400 }
    );
  }

  // 3) Initialize Supabase client
  const supabase = createClient<Database>(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    }
  );

  // 4) Fetch the user record
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.admin.getUserById(user_id);

  if (userError || !user) {
    console.error("Supabase user lookup failed:", userError);
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // 5) Insert each image URL into your `images` table
  const allHeadshots = prompt.images;
  const { data: model, error: modelError } = await supabase
  .from("models")
  .select("*")
  .eq("id", model_id as string) // ← pass it as a string (or .toString())
  .single();

  if (modelError || !model) {
    console.error("Model lookup failed:", modelError);
    return NextResponse.json(
      { message: "Server error fetching model" },
      { status: 500 }
    );
  }

  await Promise.all(
    allHeadshots.map((uri) =>
      supabase.from("images").insert({
        images: [uri], // Assuming the `images` column expects an array of strings
        user_id,       // Assuming `user_id` is required in the `images` table
      })
    )
  );

  // 6) Send notification email (if configured)
  if (RESEND_API_KEY && RESEND_FROM_EMAIL) {
    const resend = new Resend(RESEND_API_KEY);
    try {
      await resend.emails.send({
        from: RESEND_FROM_EMAIL,
        to: user.email!,
        subject: `Your ${model.model_url || "AI"} headshots are ready!`,
        html: `
          <p>Hi ${user.email},</p>
          <p>Your headshots have finished processing. Click below to view or download them:</p>
          <ul>
            ${allHeadshots
              .map(
                (uri) =>
                  `<li><a href="${uri}" target="_blank" rel="noopener">${uri}</a></li>`
              )
              .join("")}
          </ul>
          <p>Enjoy!</p>
        `,
      });
      console.log("✅ Notification email sent to", user.email);
    } catch (err) {
      console.error("Failed to send notification email:", err);
    }
  }

  // 7) Respond with success
  return NextResponse.json({ message: "success" }, { status: 200 });
}

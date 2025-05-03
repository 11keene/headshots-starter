// File: app/astria/train-model/route.ts

import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

export async function POST(request: Request) {
  try {
    // 1) Verify the user via Supabase session
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Supabase user verification failed:", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) Parse and type the incoming JSON body
    const {
      urls: images,
      type,
      pack,
      name,
      characteristics,
    } = (await request.json()) as {
      urls: string[];
      type: string;
      pack: string;
      name: string;
      characteristics: string;
    };

    // 3) Ensure the Astria API key is set
    const apiKey = process.env.ASTRIA_API_KEY;
    if (!apiKey) {
      console.error("Missing ASTRIA_API_KEY");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // 4) Call Astria’s Train endpoint directly
    const resp = await fetch("https://api.astria.ai/v1/train", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        images,
        type,
        pack,
        name,
        characteristics,
        userId: user.id,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("Astria training failed:", text);
      return NextResponse.json(
        { error: "Astria training failed" },
        { status: 502 }
      );
    }

    // 5) Return the new modelId
    const { modelId } = (await resp.json()) as { modelId: string };
    return NextResponse.json({ modelId });
  } catch (err) {
    console.error("Error in train-model route:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

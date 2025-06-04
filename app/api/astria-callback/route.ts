// File: app/api/astria-callback/route.ts

import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// We’ll parse Astria’s callback
export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const astriaBody = await req.json();
    console.log("[astria-callback] Received body:", astriaBody);

    // 1) Ensure Astria tells us it succeeded:
    const status = astriaBody.status as string;
    if (status !== "succeeded") {
      console.warn(
        "[astria-callback] Prompt status is not succeeded:",
        status
      );
      return NextResponse.json({}, { status: 200 });
    }

    // 2) Grab the Astria prompt ID
    const astriaPromptId = astriaBody.id as string;
    if (!astriaPromptId) {
      console.error("[astria-callback] Missing astriaBody.id");
      return NextResponse.json({ error: "No astria prompt ID" }, { status: 400 });
    }

    // 3) Look up our mapping to find the correct packId
    const { data: mappingRow, error: mapErr } = await supabase
      .from("astria_mappings")
      .select("pack_id")
      .eq("astria_prompt", astriaPromptId)
      .single();

    if (mapErr || !mappingRow) {
      console.error(
        "[astria-callback] Could not find mapping for Astria prompt:",
        astriaPromptId,
        mapErr
      );
      return NextResponse.json({ error: "Mapping not found" }, { status: 404 });
    }
    const packId = mappingRow.pack_id as string;
    console.log("[astria-callback] Found packId:", packId);

    // 4) Extract the image URL(s) Astria generated (we asked for 1 image)
    //    Astria’s callback has: { data: [ { url: "https://..." } ] }
    const dataArr = astriaBody.data as any[];
    if (!Array.isArray(dataArr) || dataArr.length === 0) {
      console.error("[astria-callback] No images in Astria callback data");
      return NextResponse.json({ error: "No images returned" }, { status: 400 });
    }
    const imageUrl = dataArr[0].url as string;
    if (!imageUrl) {
      console.error("[astria-callback] data[0].url missing");
      return NextResponse.json({ error: "No image URL" }, { status: 400 });
    }
    console.log("[astria-callback] Extracted imageUrl:", imageUrl);

    // 5) Insert that image URL into Supabase “images” table
    const { error: insertImgErr } = await supabase.from("images").insert([
      {
        pack_id: packId,
        url: imageUrl,
        created_at: new Date().toISOString(),
      },
    ]);
    if (insertImgErr) {
      console.error("[astria-callback] Could not insert image row:", insertImgErr);
      // We can still continue to email, even if DB insert fails
    } else {
      console.log("[astria-callback] ✅ Inserted into images table");
    }

    // 6) Trigger the “ready” email by POSTing to your GHL route
    //    We assume we know the user’s email. In your flow, you might have stored
    //    an email address alongside packId in the “packs” table when the user checked out.
    //    Let’s fetch that now:
    const { data: packRow, error: packErr } = await supabase
      .from("packs")
      .select("user_email")  // or whatever column you stored the buyer’s email under
      .eq("id", packId)
      .single();

    if (packErr || !packRow) {
      console.error(
        "[astria-callback] Could not fetch pack row to get userEmail:",
        packErr
      );
    } else {
      const userEmail = (packRow as any).user_email as string;
      if (userEmail) {
        console.log("[astria-callback] Sending-ready-email to:", userEmail);

        // Call our Next.js endpoint to upsert into GHL & fire the email
        await fetch("https://aimavenstudio.com/api/send-ready-email-ghl", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userEmail,
            // we don’t have firstName/lastName on record, so omit them
            packId,
          }),
        });
      } else {
        console.warn(
          "[astria-callback] No user_email found for packId (skip email)"
        );
      }
    }

    // 7) Return HTTP 200 so Astria knows we got it
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    console.error("[astria-callback] Unexpected error:", e);
    return NextResponse.json(
      { error: e.message || "Something went wrong." },
      { status: 500 }
    );
  }
}

// pages/api/astria/create-tune.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  console.log("🔑 Astria API Key:", process.env.ASTRIA_API_KEY);
  console.log("🏁 create-tune invoked");

  try {
    // pull userId & packId from client
    const { userId, packId: rawPackId } = await req.json();

    // strip off the gender suffix to find your internal pack row
    const baseSlug = rawPackId.replace(/-(man|woman)$/, "");
    console.log("ℹ️ Lookup slug:", baseSlug);

    // 1) load your pack record from Supabase
    const { data: pack, error: packErr } = await supabase
      .from("packs")
      .select("id")
      .eq("id", baseSlug)
      .single();

    if (packErr || !pack) {
      console.error("❌ pack not found", packErr);
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }

    // 2) load **your** uploaded files from the user-uploads bucket
    const folder = `${userId}/${rawPackId}`;
      const { data: files, error: filesErr } = await supabase
        .storage
        .from("user-uploads")
        .list(folder);
      if (filesErr) {
        console.error("❌ storage list error", filesErr);
        return NextResponse.json({ error: "Failed to list user uploads" }, { status: 500 });
      }
      const imageUrls = (files || []).map((f) =>
        supabase
          .storage
          .from("user-uploads")
          .getPublicUrl(`${folder}/${f.name}`)
          .data.publicUrl
      ).filter(Boolean);
      if (!imageUrls.length) {
        return NextResponse.json({ error: "No user-uploaded images found" }, { status: 422 });
      }

    // 3) look up the corresponding Astria pack ID by slug
    const listRes = await fetch("https://api.astria.ai/packs", {
      headers: { Authorization: `Bearer ${process.env.ASTRIA_API_KEY!}` },
    });
    const allPacks = (await listRes.json()) as Array<{ id: number; slug: string }>;
    const astriaPack = allPacks.find((p) => p.slug === pack.id);

    if (!astriaPack) {
      console.error("❌ astria pack missing", pack.id);
      return NextResponse.json({ error: "Astria pack not found" }, { status: 404 });
    }

    // 4) load your prompt templates for this pack+gender
    const gender = rawPackId.endsWith("-woman") ? "woman" : "man";
    const { data: templates, error: templatesErr } = await supabase
      .from("prompt_templates")
      .select("prompt_text, sort_order")
      .eq("pack_id", pack.id)
      .eq("gender", gender)
      .order("sort_order", { ascending: true });

    if (templatesErr || !templates) {
      console.error("❌ prompt_templates fetch error", templatesErr);
      return NextResponse.json({ error: "Failed to load prompts" }, { status: 500 });
    }

    const basePrompts = templates.map((t) => t.prompt_text);
    if (!basePrompts.length) {
      return NextResponse.json({ error: "No prompts for this pack and gender" }, { status: 422 });
    }
    console.log(`✔️ Loaded ${basePrompts.length} prompts for gender: ${gender}`);

    // 5) assemble your Astria payload
    const humanName = pack.id.replace(/[-_]/g, " ");
    const title = `${userId}-${rawPackId}-${Date.now()}`;
    const astriaPayload = {
      tune: {
        name: humanName,
        title,
        branch: "fast",
        image_urls: imageUrls,
        base_prompts: basePrompts,
      },
    };
    console.log("▶️ Astria payload:", astriaPayload);

    // 6) POST to Astria’s tunes endpoint
    const tuneRes = await fetch(
      `https://api.astria.ai/tunes?pack_id=${astriaPack.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.ASTRIA_API_KEY!}`,
        },
        body: JSON.stringify(astriaPayload),
      }
    );
    const tuneText = await tuneRes.text();
    console.log(`📛 Astria responded [${tuneRes.status}]:`, tuneText);

    if (!tuneRes.ok) {
      throw new Error(`Astria error ${tuneRes.status}: ${tuneText}`);
    }
    const tune = JSON.parse(tuneText);

    // 7) persist the new tune record
    await supabase.from("astria_tunes").insert({
      user_id: userId,
      pack_id: pack.id,
      tune_id: tune.id,
      status: tune.status,
    });

    // return the new tuneId to the client
    return NextResponse.json({ tuneId: tune.id });
  } catch (e: any) {
    console.error("⛔ create-tune error:", e);
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
  }
}

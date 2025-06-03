import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { contactId, tag } = await req.json();

    if (!contactId || !tag) {
      console.warn("⚠️ Missing contactId or tag in request");
      return NextResponse.json(
        { error: "contactId and tag are required" },
        { status: 400 }
      );
    }

    console.log(`🟡 [GHL] Skipping tag action – API access not yet available.`);
    console.log(`🔖 Would have tagged contact ID "${contactId}" with "${tag}"`);

    return NextResponse.json({
      success: true,
      debug: "Tagging skipped — API temporarily disabled.",
    });
  } catch (err: any) {
    console.error("🔥 Tag contact error:", err.message);
    return NextResponse.json(
      { error: "Internal error during mock tag" },
      { status: 500 }
    );
  }
}

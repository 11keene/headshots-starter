// app/api/astria/list-packs/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  // 1️⃣ Fetch the list of pack metadata
  const listRes = await fetch("https://api.astria.ai/packs", {
    headers: { Authorization: `Bearer ${process.env.ASTRIA_API_KEY}` },
  });
  if (!listRes.ok) {
    return NextResponse.json(
      { error: `Astria list returned ${listRes.status}` },
      { status: listRes.status }
    );
  }
  const packs = (await listRes.json()) as Array<{
    id: number;
    slug: string;
    title: string;
  }>;

  // 2️⃣ For each pack, fetch its detail to grab cover_url
  const detailed = await Promise.all(
    packs.map(async (p) => {
      const detailRes = await fetch(`https://api.astria.ai/p/${p.id}`, {
        headers: { Authorization: `Bearer ${process.env.ASTRIA_API_KEY}` },
      });
      if (!detailRes.ok) {
        // if detail fetch fails, fall back to no cover
        return { ...p, cover_url: null };
      }
      const detail = (await detailRes.json()) as { cover_url: string | null };
      return { ...p, cover_url: detail.cover_url };
    })
  );

  // 3️⃣ Return the augmented list
  return NextResponse.json(detailed);
}

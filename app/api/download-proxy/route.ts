// File: /app/api/download-proxy/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // 1) Read the “url” query parameter (the Astria blob redirect URL)
  const { searchParams } = new URL(req.url);
  const astriaUrl = searchParams.get("url");
  if (!astriaUrl) {
    return NextResponse.json(
      { error: "Missing `url` query parameter" },
      { status: 400 }
    );
  }

  try {
    // 2) Server-side fetch to Astria’s blob/redirect endpoint
    const astriaRes = await fetch(astriaUrl, {
      // include your Astria token or auth headers if needed; in many cases,
      // these “redirect” URLs are publicly accessible once generated.
      // If your blob URLs require an API key, add headers here.
      // headers: { Authorization: `Bearer ${process.env.ASTRIA_API_KEY}` },
    });

    if (!astriaRes.ok) {
      // If Astria returns non-200, bubble it up
      const text = await astriaRes.text();
      console.error(
        `[download-proxy] Astria fetch failed (${astriaRes.status}):`,
        text
      );
      return NextResponse.json(
        { error: `Astria responded ${astriaRes.status}` },
        { status: astriaRes.status }
      );
    }

    // 3) Grab the content type and original filename from Astria’s response headers (if any)
    //    Astria’s redirect will eventually come from ActiveStorage, which often sets:
    //      - content-type: e.g. image/jpeg
    //      - content-disposition: “inline; filename=...”; or “attachment; filename=...”
    //    We will forward those same headers back to the browser.

    const contentType = astriaRes.headers.get("content-type") || "application/octet-stream";
    const contentDisposition =
      astriaRes.headers.get("content-disposition") ||
      // fallback to forcing a generic “downloaded.jpg” if Astria didn’t set it
      `attachment; filename="downloaded.jpg"`;

    // 4) Create a new NextResponse that pipes through the binary body
    const response = new NextResponse(astriaRes.body, {
      status: astriaRes.status,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": contentDisposition,
        // We do NOT set Access-Control-Allow-Origin here for the browser,
        // because your front-end is calling THIS same origin endpoint (no CORS).
      },
    });

    return response;
  } catch (err: any) {
    console.error("[download-proxy] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error during proxy fetch" },
      { status: 500 }
    );
  }
}

// If someone tries to POST here, reject:
export async function POST() {
  return new NextResponse("Method Not Allowed", { status: 405 });
}

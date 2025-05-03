// File: app/astria/inspect-image/route.ts

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // 1) Make sure the Astria key is set
  const apiKey = process.env.ASTRIA_API_KEY;
  if (!apiKey) {
    console.error("Missing ASTRIA_API_KEY");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  // 2) Pull the multipart form data (your images + fields)
  const formData = await request.formData();

  try {
    // 3) Forward to Astria’s inspect endpoint
    const response = await fetch("https://api.astria.ai/images/inspect", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData as unknown as BodyInit,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Astria inspect failed:", text);
      return NextResponse.json(
        { error: "Failed to inspect image" },
        { status: 502 }
      );
    }

    // 4) Relay the JSON response back to the client
    const data = await response.json();
    console.log("Inspection response:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in inspect-image route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

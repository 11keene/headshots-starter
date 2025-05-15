// File: utils/createTune.ts

export async function createTune(
  basePackId: string,
  imageUrls: string[],
  className: string
) {
  if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
    throw new Error("You must pass at least one image URL to createTune.");
  }

  // Build a title that’s only letters, numbers, and spaces
  const tuneTitle = `FineTune ${className} ${Date.now()}`;

  const res = await fetch(
    `https://api.astria.ai/p/${basePackId}/tunes`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.ASTRIA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tune: {
          title: tuneTitle,          // required
          name: className,           // “man” or “woman”
          image_urls: imageUrls,     // array of strings
        },
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("Astria createTune error:", res.status, text);
    throw new Error("Astria model training failed");
  }

  const data = await res.json();
  return data; // includes data.id, etc.
}

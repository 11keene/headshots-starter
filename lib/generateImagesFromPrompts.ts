// File: lib/generateImagesFromPrompts.ts

interface GenerateImagesOptions {
  prompts: string[];
  fineTunedFaceId: string;
  modelId: string;
}

export async function generateImagesFromPrompts({
  prompts,
  fineTunedFaceId,
  modelId,
}: GenerateImagesOptions): Promise<{ image_url: string }[]> {
  console.log(
    "→ Astria call, tuneId:",
    modelId,
    "key prefix:",
    process.env.ASTRIA_API_KEY?.slice(0, 5)
  );

  const res = await fetch(
    `https://api.astria.ai/tunes/${modelId}/generations`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.ASTRIA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompts: prompts.map((prompt) => ({ prompt })),
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("Astria generation error:", res.status, text);
    throw new Error(`Astria generation failed: ${res.status}`);
  }

  const data = await res.json();
  return data.results;
}

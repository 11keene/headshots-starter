// utils/generateImages.ts
export async function generateImages(tuneId: string, prompts: string[]) {
    const res = await fetch(`https://api.astria.ai/tunes/${tuneId}/generations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.ASTRIA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompts: prompts.map((text) => ({
          prompt: text,
        })),
      }),
    });
  
    if (!res.ok) {
      throw new Error("Failed to generate images");
    }
  
    const data = await res.json();
    return data; // This will return the job ID and prompt statuses
  }
  
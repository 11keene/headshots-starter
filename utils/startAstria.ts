// utils/startAstria.ts
export async function startAstria({
    modelId,
    prompts,
    inputs,
  }: {
    modelId: string;
    prompts: string[];
    inputs: string[];
  }) {
    const jobs = await Promise.all(
      prompts.map((prompt) =>
        fetch(`https://api.astria.ai/tunes/${modelId}/generations`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.ASTRIA_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt, inputs }),
        }).then(async (res) => {
          if (!res.ok) {
            const text = await res.text();
            throw new Error(`Astria error: ${res.status} ${text}`);
          }
          return res.json();
        })
      )
    );
    return jobs; // array of generation responses
  }
  
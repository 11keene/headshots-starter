export async function createTune(
  packId: string,
  imageUrls: string[],
  className: "man" | "woman"
) {
  const res = await fetch("https://api.astria.ai/tunes", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.ASTRIA_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: "AI Maven User Tune",
      pack_id: packId,
      class_name: className,
      images: imageUrls.map((url) => ({ url })),
    }),
  });

  const responseText = await res.text();

  if (!res.ok) {
    console.error("❌ Failed to create tune:", responseText);
    throw new Error("Astria model training failed");
  }

  const data = JSON.parse(responseText);
  return data; // Should contain tune.id
}

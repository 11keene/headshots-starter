export async function createTune(packId: string, imageUrls: string[], className: "man" | "woman") {
    const res = await fetch(`https://api.astria.ai/tunes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.ASTRIA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pack_id: packId,
        name: "Test Tune", // ✅ This fixes the "name can’t be blank" error
        class_name: className,
        images: imageUrls.map((url) => ({ url })), // ✅ This needs to contain real URLs
      }),
    });
  
    const responseText = await res.text();
    console.log("Tune response raw text:", responseText);
  
    if (!res.ok) {
      throw new Error("Failed to create tune");
    }
  
    const data = JSON.parse(responseText);
    return data;
  }
  
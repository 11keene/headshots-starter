// utils/getPacks.ts
export async function getPrivatePacks() {
    const res = await fetch("https://api.astria.ai/packs", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.ASTRIA_API_KEY}`,
        "Content-Type": "application/json",
      },
    });
  
    if (!res.ok) {
      console.error(await res.text()); // <- this will give more info
      throw new Error("Failed to fetch private packs");
    }
  
    const data = await res.json();
    return data;
  }
  
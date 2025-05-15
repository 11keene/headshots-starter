// scripts/test-get-pack.ts
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function getPackById(packId: string) {
  const res = await fetch(`https://api.astria.ai/packs/${packId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.ASTRIA_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  const responseText = await res.text();

  if (!res.ok) {
    console.error("Failed to fetch pack:", responseText);
    throw new Error("Pack fetch failed");
  }

  const data = JSON.parse(responseText);
  console.log("✅ Pack Info:", data);
  return data;
}

async function test() {
  const testPackId = "2123"; // 🔁 Replace this with your actual private pack ID if different
  await getPackById(testPackId);
}

test();

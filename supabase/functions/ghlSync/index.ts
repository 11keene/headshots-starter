/// <reference no-default-lib="true" />
/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.189.0/http/server.ts";
import "https://deno.land/std@0.189.0/dotenv/load.ts";

serve(async (req: Request) => {
  try {
    const { event, user } = await req.json() as { event: string; user?: { email?: string; id?: string } };
    if (event === "user.created" && user?.email) {
      const res = await fetch("https://rest.gohighlevel.com/v1/contacts/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("GHL_API_KEY")}`,
        },
        body: JSON.stringify({
          email: user.email,
          customFields: { supabase_id: user.id },
        }),
      });
      if (!res.ok) console.error("GHL sync failed:", await res.text());
      else console.log("GHL contact created for", user.email);
    }
  } catch (err) {
    console.error("Error in ghlSync function:", err);
  }
  return new Response(null, { status: 200 });
});

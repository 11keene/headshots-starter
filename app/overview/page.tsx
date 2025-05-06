// app/overview/page.tsx
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";
import OverviewClient from "@/components/OverviewClient";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const supabase = createServerComponentClient<Database>({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>User not found</div>;
  }

  // ─── Fetch user credits ───────────────────────────────────────────
  const { data: creditRow } = await supabase
    .from("credits")
    .select("credits")
    .eq("user_id", user.id)
    .single();
  const credits = creditRow?.credits ?? 0;

  // ─── Fetch models as before ───────────────────────────────────────
  const { data: models } = await supabase
    .from("models")
    .select(`*, samples (*)`)
    .eq("user_id", user.id);

  // ─── Pass credits down to the client component ───────────────────
  return (
    <OverviewClient
      serverModels={models ?? []}
      serverCredits={credits}
    />
  );
}

// app/overview/page.tsx
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";
import OverviewClient from "@/components/OverviewClient";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const supabase = createServerComponentClient<Database>({ cookies });
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    console.error("Error getting session:", sessionError.message);
  }

  if (!session) {
    redirect("/login");
  }

  const userId = session!.user.id;

  // Fetch user credits
  const { data: creditRow, error: creditError } = await supabase
    .from("credits")
    .select("credits")
    .eq("user_id", userId)
    .single();
  if (creditError) console.error("Error fetching credits:", creditError.message);
  const credits = creditRow?.credits ?? 0;

  // Fetch user models
  const { data: models, error: modelsError } = await supabase
    .from("models")
    .select(`*, samples (*)`)
    .eq("user_id", userId);
  if (modelsError) console.error("Error fetching models:", modelsError.message);

  return (
    <OverviewClient
      serverModels={models ?? []}
      serverCredits={credits}
    />
  );
}

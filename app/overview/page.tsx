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
  } = await supabase.auth.getSession();

  if (!session?.user) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Fetch user credits
  const { data: creditRow } = await supabase
    .from("credits")
    .select("credits")
    .eq("user_id", userId)
    .single();
  const credits = creditRow?.credits ?? 0;

  // Fetch user models
  const { data: models } = await supabase
    .from("models")
    .select(`*, samples (*)`)
    .eq("user_id", userId);

  return (
    <OverviewClient
      serverModels={models ?? []}
      serverCredits={credits}
    />
  );
}

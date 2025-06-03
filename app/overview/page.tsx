// File: app/overview/page.tsx
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import OverviewClient from "@/components/OverviewClient";
import { packs as availablePacks } from "@/data/packs";
import type { Database } from "@/types/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OverviewPage() {
  const supabase = createServerComponentClient<Database>({ cookies });

  // 1) Get logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div className="text-center p-8 text-red-600">User not logged in.</div>;
  }

  // 2) Fetch user credits
  const { data: profile } = await supabase
    .from("users")
    .select("credits")
    .eq("id", user.id)
    .single<{ credits: number }>();

  const serverCredits = profile?.credits ?? 0;

  // 3) Fetch user’s models + samples
  const { data: serverModels } = await supabase
    .from("models")
    .select("*, samples(*)")
    .eq("user_id", user.id);

  // 4) Render the client‐side dashboard, passing down:
  //    • serverModels
  //    • serverCredits
  //    • availablePacks (from data/packs.ts, including “professional-pack-man”)
  //    • user.id              (the logged-in user’s UUID)
  return (
    <OverviewClient
      serverModels={serverModels ?? []}
      serverCredits={serverCredits}
      availablePacks={availablePacks}
      userId={user.id}
    />
  );
}

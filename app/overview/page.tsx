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

  const { data: models } = await supabase
    .from("models")
    .select(`*, samples (*)`)
    .eq("user_id", user.id);

  return <OverviewClient serverModels={models ?? []} />;
}

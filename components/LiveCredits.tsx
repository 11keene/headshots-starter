// components/LiveCredits.tsx
"use client";

import { useEffect, useState } from "react";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";

export default function LiveCredits() {
  const supabase = createPagesBrowserClient();
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    let channel: any;

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // fetch initial value
      const { data: row } = await supabase
        .from("users")
        .select("credits")
        .eq("id", user.id)
        .single<{ credits: number }>();
      setCredits(row?.credits ?? 0);

      // subscribe to updates
      channel = supabase
        .channel(`public:users:id=eq.${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "users",
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            setCredits(payload.new.credits);
          }
        )
        .subscribe();
    })();

    return () => {
      channel && supabase.removeChannel(channel);
    };
  }, [supabase]);

  return <span>{credits} Credits</span>;
}

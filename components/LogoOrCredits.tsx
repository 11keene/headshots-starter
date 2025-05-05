"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/supabase";

export default function LogoOrCredits() {
  const pathname = usePathname();
  const [credits, setCredits] = useState<number | null>(null);

  // 1) Homepage: show logo + name
  if (pathname === "/") {
    return (
      <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
        <Image src="/logo.png" alt="AI Maven Logo" width={28} height={28} className="rounded-full" />
        <span>AI Maven</span>
      </Link>
    );
  }

  // 2) Otherwise, fetch credits
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const supabase = createPagesBrowserClient<Database>();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (isMounted) setCredits(0);
          return;
        }

        const { data: profile } = await supabase
          .from("users")
          .select("credits")
          .eq("id", user.id)
          .single<{ credits: number }>();

        if (isMounted) setCredits(profile?.credits ?? 0);
      } catch (err) {
        console.error("LogoOrCredits error:", err);
        if (isMounted) setCredits(0);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  return (
    <div className="text-sm font-semibold">
      {credits === null ? "… Credits" : `${credits} Credits`}
    </div>
  );
}

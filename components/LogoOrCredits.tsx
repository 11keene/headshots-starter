// components/LogoOrCredits.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import type { Database } from "@/types/supabase";

export default function LogoOrCredits() {
  const pathname = usePathname();
  const supabase = createClientComponentClient<Database>();
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    // only fetch if we’re on a “backend” route
    if (
      pathname.startsWith("/overview") ||
      pathname.startsWith("/get-credits") ||
      pathname.startsWith("/custom-intake")
    ) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          supabase
            .from("users")
            .select("credits")
            .eq("id", user.id)
            .single()
            .then(({ data, error }) => {
              if (!error && data) setCredits(data.credits);
            });
        }
      });
    }
  }, [pathname, supabase]);

  const isBackend =
    pathname.startsWith("/overview") ||
    pathname.startsWith("/get-credits") ||
    pathname.startsWith("/custom-intake");

  if (isBackend) {
    // show credits (or loading)
    return (
      <div className="flex items-center space-x-1">
        <span className="font-medium">{credits ?? "…"}</span>
        <span>Credits</span>
      </div>
    );
  }

  // public — show logo + name
  return (
    <Link href="/" className="flex items-center gap-1">
      <Image
        src="/logo.png"
        alt="AI Maven Logo"
        width={24}
        height={24}
        className="rounded-full"
      />
      <span className="font-semibold">AI Maven</span>
    </Link>
  );
}

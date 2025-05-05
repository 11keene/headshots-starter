// components/LogoOrCredits.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/supabase";

export default function LogoOrCredits() {
  const pathname = usePathname();
  const supabase = createPagesBrowserClient<Database>();
  const [credits, setCredits] = useState<number | null>(null);

  // 1) If we're on the homepage, render your logo + site name
  if (pathname === "/") {
    return (
      <Link
        href="/"
        className="flex items-center gap-2 text-lg font-semibold"
      >
        <Image
          src="/logo.png"
          alt="AI Maven Logo"
          width={28}
          height={28}
          className="rounded-full"
        />
        <span>AI Maven</span>
      </Link>
    );
  }

  // 2) Otherwise, fetch the user's credits and display them
  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setCredits(0);
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("credits")
        .eq("id", user.id)
        .single<{ credits: number }>();

      setCredits(profile?.credits ?? 0);
    })();
  }, [pathname, supabase]);

  return (
    <div className="text-sm font-semibold">
      {credits === null ? "… Credits" : `${credits} Credits`}
    </div>
  );
}

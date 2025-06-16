// components/LogoOrCredits.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";

export default function LogoOrCredits() {
  const pathname = usePathname();
  const [credits, setCredits] = useState<number | null>(null);

  // 1️⃣ Home page shows logo + name
  if (pathname === "/") {
    return (
      <Link
        href="/"
        className="flex items-center gap-2 text-lg font-semibold"
      >
        <Image
          src="/newlogo.png"
          alt="AI Maven Logo"
          width={28}
          height={28}
          className="rounded-full"
        />
        <span>AI Maven</span>
      </Link>
    );
  }

  // 2️⃣ Everything else: fetch the up-to-date credits count
  useEffect(() => {
    let mounted = true;

    async function loadCredits() {
      // bail if we don’t have our PUBLIC keys
      console.log(
        "[LogoOrCredits] NEXT_PUBLIC_SUPABASE_URL:",
        process.env.NEXT_PUBLIC_SUPABASE_URL
      );
      console.log(
        "[LogoOrCredits] NEXT_PUBLIC_SUPABASE_ANON_KEY:",
           process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0,8) + "…"
          );
          if (
                  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
               !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
             ) {
              console.warn("[LogoOrCredits] missing public env, defaulting to 0");
             if (mounted) setCredits(0);
             return;
              }






      const supabase = createPagesBrowserClient();

      // get the logged-in user
      const { data: sessionData, error: sessionErr } =
             await supabase.auth.getUser();
            console.log("[LogoOrCredits] getUser →", sessionData, sessionErr);
            const user = sessionData.user;
            if (sessionErr || !user) {
             console.warn("[LogoOrCredits] no logged-in user, defaulting to 0");
             if (mounted) setCredits(0);
              return;
            }

      // pull their credits from your users table
      const { data: profile, error: profileErr } = await supabase
              .from("users")
              .select("credits")
              .eq("id", user.id)
              .single<{ credits: number }>();
           console.log("[LogoOrCredits] profile row →", profile, profileErr);
           if (profileErr) {
                   console.error("[LogoOrCredits] error selecting credits:", profileErr);
               }
               if (mounted) {
                  console.log(
                     "[LogoOrCredits] setting credits to",
                    profile?.credits ?? 0
                 );
                 setCredits(profile?.credits ?? 0);
                }


    }

    loadCredits();
    return () => {
      mounted = false;
    };
  }, [pathname]);

  // loading state
  if (credits === null) {
    return <div className="text-sm font-semibold">… Credits</div>;
  }

  // finally render
  return <div className="text-sm font-semibold">{credits} Credits</div>;
}

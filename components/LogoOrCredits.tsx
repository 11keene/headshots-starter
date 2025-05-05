"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// We’ll only import the browser client at runtime inside the effect:
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

  // 2️⃣ Everything else: attempt to fetch credits
  useEffect(() => {
    let mounted = true;
    (async () => {
      // bail if we don’t have our PUBLIC keys
      if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ) {
        console.warn("Missing Supabase anon key or URL");
        if (mounted) setCredits(0);
        return;
      }

      let supabase;
      try {
        // dynamically import so we can catch if it fails
        const { createPagesBrowserClient } = await import(
          "@supabase/auth-helpers-nextjs"
        );
        supabase = createPagesBrowserClient();
      } catch (e) {
        console.error("Failed to init Supabase client:", e);
        if (mounted) setCredits(0);
        return;
      }

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          if (mounted) setCredits(0);
          return;
        }
        const { data: profile } = await supabase
          .from("users")
          .select("credits")
          .eq("id", user.id)
          .single<{ credits: number }>();
        if (mounted) setCredits(profile?.credits ?? 0);
      } catch (e) {
        console.error("Error fetching profile:", e);
        if (mounted) setCredits(0);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [pathname]);

  // while loading
  if (credits === null) return <div className="text-sm font-semibold">… Credits</div>;

  return <div className="text-sm font-semibold">{credits} Credits</div>;
}

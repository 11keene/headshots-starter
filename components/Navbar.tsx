// File: components/Navbar.tsx
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { FiGlobe } from "react-icons/fi";
import LoginDropdown from "./LoginDropdown";
import { ThemeToggle } from "@/components/homepage/theme-toggle";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useSupabaseClient();
  const session = useSession();
  const [credits, setCredits] = useState<number>(0);

  // Fetch credits client‐side once session is available
  useEffect(() => {
    if (!session?.user) return;
    supabase
      .from("users")
      .select("credits")
      .eq("id", session.user.id)
      .single()
      .then(({ data, error }) => {
        if (data && !error) setCredits(data.credits);
      });
  }, [session, supabase]);

  const isBackend = Boolean(session?.user);
  const packsIsEnabled = process.env.NEXT_PUBLIC_TUNE_TYPE === "packs";

  // Supported locales
  const locales = [
    { code: "en", label: "English" },
    { code: "de", label: "Deutsch" },
    { code: "fr", label: "Français" },
    { code: "pt", label: "Português" },
    { code: "es", label: "Español" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {isBackend ? (
          <div className="text-sm text-charcoal font-semibold">Credits: {credits}</div>
        ) : (
          <Link
            href="/"
            className="flex items-center gap-2 text-charcoal font-semibold text-base"
          >
            <Image
              src="/logo.png"
              alt="AI Maven Logo"
              width={24}
              height={24}
              className="rounded-full text-charcoal "
            />
            <span>AI Maven</span>
          </Link>
        )}

        {isBackend && (
          <nav className="flex gap-6 text-charcoal text-sm font-semibold">
            <Link href="/overview" className="hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/get-credits" className="hover:text-primary transition-colors">
              Get Credits
            </Link>
          </nav>
        )}

        <div className="flex items-center gap-4">
          {isBackend ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 p-0">
                  <HamburgerMenuIcon className="h-6 w-6 text-primary" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 z-50">
                {packsIsEnabled && (
                  <DropdownMenuItem asChild>
                    <Link href="/overview/packs">Packs</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/overview">Create Photos</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex justify-between px-4">
                  <span>Your Credits</span>
                  <span className="font-semibold">{credits}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Button
                    variant="ghost"
                    className="w-full text-left"
                    onClick={async () => {
                      await supabase.auth.signOut();
                      router.push("/");
                    }}
                  >
                    Log out
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : pathname === "/" ? (
            <>
              {/* Language picker on homepage */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                    <FiGlobe className="h-5 w-5 text-charcoal" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" align="start" className="w-40">
                 {locales.map(({ code, label }) => (
  <DropdownMenuItem asChild key={code}>
     <Link href={pathname} locale={code} replace>
       {label}
     </Link>
   </DropdownMenuItem>
 ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Homepage additional dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                    <HamburgerMenuIcon className="h-6 w-6 text-charcoal" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="bottom"
                  align="center"
                  className="w-40 bg-ivory/100 text-charcoal shadow-lg"
                >
                  {/* Center the dark mode toggle */}
                  <DropdownMenuItem className="flex justify-center py-2">
                    <ThemeToggle />
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="border-white/50" />
                  {/* Login button */}
                  <DropdownMenuItem asChild>
                    <Link href="/login">
                      <Button
                        variant="ghost"
                        className="w-full text-left text-charcoal hover:bg-sage-green"
                      >
                        Log in
                      </Button>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : pathname === "/login" ? (
            <ThemeToggle />
          ) : (
            <LoginDropdown />
          )}
        </div>
      </div>
    </header>
  );
}

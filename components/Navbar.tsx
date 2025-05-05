// components/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { AvatarIcon } from "@radix-ui/react-icons";

import ClientSideCredits from "./realtime/ClientSideCredits";
import { ThemeToggle } from "./homepage/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

export default function Navbar() {
  const supabase = createPagesBrowserClient();
  const pathname = usePathname();
  const router = useRouter();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [credits, setCredits] = useState<number>(0);

  // 1) On mount, load the user & their credits
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUserEmail(user.email ?? null);
      supabase
        .from("users")
        .select("credits")
        .eq("id", user.id)
        .single<{ credits: number }>()
        .then(({ data }) => {
          if (data) setCredits(data.credits);
        });
    });
  }, [supabase]);

  // 2) Decide if we’re on a “backend” page
  const isBackend = pathname?.startsWith("/overview");

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left: logo on home, credits on backend */}
        <div className="flex items-center">
          {isBackend && userEmail ? (
            <ClientSideCredits creditsRow={{ credits }} />
          ) : (
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="AI Maven Logo"
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="font-semibold">AI Maven</span>
            </Link>
          )}
        </div>

        {/* Center nav */}
        {userEmail && (
          <nav className="flex gap-4">
            <Link href="/overview" className="hover:text-primary">
              Home
            </Link>
            {process.env.NEXT_PUBLIC_TUNE_TYPE === "packs" && (
              <Link href="/overview/packs" className="hover:text-primary">
                Packs
              </Link>
            )}
            {process.env.NEXT_PUBLIC_STRIPE_IS_ENABLED === "true" && (
              <Link href="/get-credits" className="hover:text-primary">
                Get Credits
              </Link>
            )}
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          {!userEmail ? (
            <Button
              size="sm"
              onClick={() => router.push("/login")}
            >
              Login
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 p-0">
                  <AvatarIcon className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel className="text-center">
                  {userEmail}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex justify-between">
                  <span>Your Credits</span>
                  <span className="font-semibold">{credits}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/overview" className="w-full text-left">
                    Create Photos
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <form action="/auth/sign-out" method="post">
                  <Button type="submit" variant="ghost" className="w-full text-left">
                    Log out
                  </Button>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}

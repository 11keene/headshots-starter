// components/Navbar.tsx

import { AvatarIcon } from "@radix-ui/react-icons";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import LogoOrCredits from "./LogoOrCredits";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import Link from "next/link";
import { Button } from "./ui/button";
import React from "react";
import { Database } from "@/types/supabase";
import { ThemeToggle } from "./homepage/theme-toggle";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const stripeIsConfigured = process.env.NEXT_PUBLIC_STRIPE_IS_ENABLED === "true";
const packsIsEnabled = process.env.NEXT_PUBLIC_TUNE_TYPE === "packs";

export default async function Navbar() {
  const supabase = createServerComponentClient<Database>({ cookies });

  // 1) get the logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2) fetch their "credits" column from the users table
  const { data: profile } = await supabase
    .from("users")
    .select("credits")
    .eq("id", user?.id || "")      // id is a UUID string
    .single<{ credits: number }>();

  const credits = profile?.credits ?? 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* ← logo on /, credits on every other page */}
        <LogoOrCredits />

        {/* center nav links */}
        {user && (
          <nav className="flex flex-nowrap overflow-x-auto gap-3 sm:gap-5 md:gap-6 whitespace-nowrap">
            <Link
              href="/overview"
              className="flex-shrink-0 text-sm sm:text-base font-semibold hover:text-primary transition-colors"
            >
              Home
            </Link>

            {packsIsEnabled && (
              <Link
                href="/overview/packs"
                className="flex-shrink-0 text-sm sm:text-base font-semibold hover:text-primary transition-colors"
              >
                Packs
              </Link>
            )}

            {stripeIsConfigured && (
              <Link
                href="/get-credits"
                className="flex-shrink-0 text-sm sm:text-base font-semibold hover:text-primary transition-colors"
              >
                Get Credits
              </Link>
            )}
          </nav>
        )}

        {/* right side: theme toggle + login/avatar */}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          {!user ? (
            <Link href="/login">
              <Button size="sm">Login</Button>
            </Link>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 p-0">
                  <AvatarIcon className="h-10 w-10 text-primary" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 z-50">
                <DropdownMenuLabel className="text-primary text-center whitespace-nowrap">
                  {user.email}
                </DropdownMenuLabel>

                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-default flex justify-between px-4 py-2">
                  <span>Your Credits</span>
                  <span className="font-semibold">{credits}</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/overview" className="w-full px-4 py-2 text-left">
                    Create Photos
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <form action="/auth/sign-out" method="post">
                  <Button
                    type="submit"
                    variant="ghost"
                    className="w-full text-left whitespace-nowrap"
                  >
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

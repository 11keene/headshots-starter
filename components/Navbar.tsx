// components/Navbar.tsx

import { AvatarIcon } from "@radix-ui/react-icons";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import Link from "next/link";
import { Button } from "./ui/button";
import React from "react";
import { Database } from "@/types/supabase";
import ClientSideCredits from "./realtime/ClientSideCredits";
import { ThemeToggle } from "./homepage/theme-toggle";
import Image from "next/image";

export const dynamic = "force-dynamic";

const stripeIsConfigured = process.env.NEXT_PUBLIC_STRIPE_IS_ENABLED === "true";
const packsIsEnabled = process.env.NEXT_PUBLIC_TUNE_TYPE === "packs";
export const revalidate = 0;

export default async function Navbar() {
  const supabase = createServerComponentClient<Database>({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: credits } = await supabase
    .from("credits")
    .select("*")
    .eq("user_id", user?.id ?? "")
    .single();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo + Site Name */}
        <Link
          href="/"
          className="flex-shrink-0 flex items-center gap-2 font-semibold whitespace-nowrap text-xl sm:text-2xl"
        >
          <Image
            src="/logo.png"
            alt="AI Maven Logo"
            width={24}
            height={24}
            className="rounded-full"
          />
          <span>AI Maven</span>
        </Link>

        {/* Nav – scrollable on small, full gap on larger */}
        {user && (
          <nav className="flex flex-nowrap overflow-x-auto gap-3 sm:gap-5 md:gap-6 whitespace-nowrap">
            <Link
              href="/overview"
              className="flex-shrink-0 text-sm sm:text-base font-medium hover:text-primary transition-colors"
            >
              Home
            </Link>

            {packsIsEnabled && (
              <Link
                href="/overview/packs"
                className="flex-shrink-0 text-sm sm:text-base font-medium hover:text-primary transition-colors"
              >
                Packs
              </Link>
            )}

            {stripeIsConfigured && (
              <Link
                href="/get-credits"
                className="flex-shrink-0 text-sm sm:text-base font-medium hover:text-primary transition-colors"
              >
                Get Credits
              </Link>
            )}
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          {!user && (
            <>
              <Link
                href="/login"
                className="hidden sm:block text-sm sm:text-base font-medium hover:text-primary transition-colors whitespace-nowrap"
              >
                Login
              </Link>
              <Link href="/login">
                <Button size="sm">Create headshots</Button>
              </Link>
            </>
          )}

          {user && (
            <div className="flex items-center gap-4">
              {stripeIsConfigured && credits && (
                <ClientSideCredits creditsRow={credits} />
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                    <AvatarIcon className="h-6 w-6 text-primary" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 z-50">
                  <DropdownMenuLabel className="text-primary text-center whitespace-nowrap">
                    {user.email}
                  </DropdownMenuLabel>
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
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

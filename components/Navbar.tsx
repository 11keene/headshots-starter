// components/Navbar.tsx
import Image from "next/image";
import Link from "next/link";
import { AvatarIcon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import React from "react";
import { Database } from "@/types/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const stripeIsConfigured = process.env.NEXT_PUBLIC_STRIPE_IS_ENABLED === "true";
const packsIsEnabled = process.env.NEXT_PUBLIC_TUNE_TYPE === "packs";

export default async function Navbar() {
  const supabase = createServerComponentClient<Database>({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // for backend (logged-in) view pull credits
  const { data: profile } = await supabase
  .from("credits")   
    .select("credits")
    .eq("user_id", user?.id ?? "") 
    .single<{ credits: number }>();

  const credits = profile?.credits ?? 0;

  const isBackend = Boolean(user);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      {/* ← add justify-between here */}
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {isBackend ? (
          // BACKEND: credits on the left
<div className="text-sm font-semibold">Credit: {credits}</div>
        ) : (
          // HOMEPAGE: logo + site name on the left
          <Link href="/" className="flex items-center gap-2 font-semibold text-base">
            <Image
              src="/logo.png"
              alt="AI Maven Logo"
              width={24}
              height={24}
              className="rounded-full"
            />
            <span>AI Maven</span>
          </Link>
        )}

        {isBackend && (
          // backend center nav
          <nav className="flex gap-6 text-sm font-semibold">
            <Link href="/overview" className="hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/get-credits" className="hover:text-primary transition-colors">
              Get Credits
            </Link>
          </nav>
        )}

        {/* right side */}
        <div className="flex items-center gap-4">
          {isBackend ? (
            /* hamburger dropdown for backend */
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
                <DropdownMenuLabel className="px-4 text-xs text-gray-500">
                  {user!.email}
                </DropdownMenuLabel>
                <DropdownMenuItem className="flex justify-between px-4">
                  <span>Your Credits</span>
                  <span className="font-semibold">{credits}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <form action="/auth/sign-out" method="post">
                  <DropdownMenuItem asChild>
                    <Button type="submit" variant="ghost" className="w-full text-left">
                      Log out
                    </Button>
                  </DropdownMenuItem>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // homepage login on the right
            <Link href="/login">
              <Button size="sm">Login</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

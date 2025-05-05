import { AvatarIcon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuItem } from "./ui/dropdown-menu";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import React from "react";
import { Database } from "@/types/supabase";
import ClientSideCredits from "./realtime/ClientSideCredits";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const stripeIsConfigured = process.env.NEXT_PUBLIC_STRIPE_IS_ENABLED === "true";
const packsIsEnabled = process.env.NEXT_PUBLIC_TUNE_TYPE === "packs";

export default async function Navbar() {
  const supabase = createServerComponentClient<Database>({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // fetch user credits
  const { data: profile } = await supabase
    .from("users")
    .select("credits")
    .eq("id", user?.id || "")
    .single<{ credits: number }>();
  const credits = profile?.credits ?? 0;

  // Determine if we're on a protected page (user logged in)
  const isProtected = !!user;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center px-4">
        {/* Left: Logo or Credits */}
        <div className="flex-shrink-0">
          {isProtected ? (
            <span className="text-base font-medium">{credits} Credits</span>
          ) : (
            <Link href="/">
              <div className="flex items-center gap-1">
                <Image src="/logo.png" alt="AI Maven Logo" width={24} height={24} />
                <span className="font-semibold text-base">AI Maven</span>
              </div>
            </Link>
          )}
        </div>

        {/* Center: Nav links for authenticated user */}
        {isProtected && (
          <nav className="flex-1 flex justify-center space-x-6">
            <Link href="/overview" className="text-sm font-semibold hover:text-primary">
              Home
            </Link>
            <Link href="/get-credits" className="text-sm font-semibold hover:text-primary">
              Get Credits
            </Link>
          </nav>
        )}

        {/* Right: Menu */}
        <div className="flex-shrink-0 flex items-center">
          {!user ? (
            <Link href="/login">
              <Button size="sm">Login</Button>
            </Link>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <HamburgerMenuIcon className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-medium text-center">
                  {user.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/overview">Home</Link>
                </DropdownMenuItem>
                {packsIsEnabled && (
                  <DropdownMenuItem asChild>
                    <Link href="/overview/packs">Packs</Link>
                  </DropdownMenuItem>
                )}
                {stripeIsConfigured && (
                  <DropdownMenuItem asChild>
                    <Link href="/get-credits">Get Credits</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-default flex justify-between">
                  <span>Your Credits</span>
                  <span className="font-semibold">{credits}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/overview">Create Photos</Link>
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
          )}
        </div>
      </div>
    </header>
  );
}

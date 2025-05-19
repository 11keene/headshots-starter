// File: components/Navbar.tsx
"use client";

import React from "react";
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
import { ThemeToggle } from "@/components/homepage/theme-toggle";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useSupabaseClient();
  const session = useSession();
  const isLoggedIn = Boolean(session?.user);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 text-charcoal font-semibold">
          <Image
            src="/newlogo.png"
            alt="AI Maven Logo"
            width={25}
            height={35}
            className="rounded-full"
          />
          <span>AI Maven</span>

        </Link>
        {/* Signed-in nav links */}
        {isLoggedIn && pathname !== "/" && (
          <nav className="flex items-center space-x-5 text-charcoal font-semibold">
            <Link href="/overview" className="hover:text-primary">
              Home
            </Link>
            <Link href="/overview/packs" className="hover:text-primary">
              Packs
            </Link>
            <Link href="/get-credits" className="hover:text-primary">
              Pricing
            </Link>
          </nav>
        )}

        {/* Hamburger menu (always present) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 p-0">
              <HamburgerMenuIcon className="h-6 w-6 text-charcoal" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-48 z-50">
            {isLoggedIn ? (
              <>
                <DropdownMenuItem asChild>
                  <Link href="/overview/packs">Packs</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/overview">Create Photos</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="mailto:support@aimavenstudio.com">Contact</a>
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
              </>
            ) : (
              <>
                <DropdownMenuItem className="flex justify-center py-2">
                  <ThemeToggle />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/login">
                    <Button variant="ghost" className="w-full text-left">
                      Log in
                    </Button>
                  </Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

// File: components/Navbar.tsx
"use client";

import React, { useState, useEffect } from "react";
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

  // Age-gate state
  const [agreed, setAgreed] = useState(false);
  const [checked, setChecked] = useState(false);

  // Reset age-gate on login
  useEffect(() => {
    if (isLoggedIn) {
      setAgreed(false);
      setChecked(false);
    }
  }, [isLoggedIn]);

  // Prevent navigation until user agrees
  const blockNav = (e: React.MouseEvent) => {
    if (pathname === "/overview" && !agreed) {
      e.preventDefault();
    }
  };

  return (
    <>
      {/* ─── Age Verification Banner at bottom ─── */}
      {isLoggedIn && pathname === "/overview" && !agreed && (
        <div className="fixed bottom-0 left-0 w-full bg-charcoal border-t border-muted-gold p-4 z-50">
          <div className="max-w-screen-md mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <label className="flex items-start sm:items-center gap-2 flex-1">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => setChecked(!checked)}
                className="w-4 h-4 text-muted-gold"
              />
              <span className="text-ivory text-sm">
                I agree that I am the majority age 18/21+ years of age, and acknowledge the{" "}
                <Link href="/terms" className="text-muted-gold underline">
                  terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-muted-gold underline">
                  privacy policy
                </Link>
                .
              </span>
            </label>
            <button
              onClick={() => {
                setAgreed(true);
                router.push("/custom-intake?packType=custom&gender=woman");
              }}
              disabled={!checked}
              className={`py-2 px-6 font-semibold rounded-md transition
                ${
                  checked
                    ? "bg-muted-gold text-ivory hover:opacity-90"
                    : "bg-muted/30 text-ivory cursor-not-allowed"
                }`}
            >
              Create headshots
            </button>
          </div>
        </div>
      )}
       {/* ─── Background “Create headshots” button ─── */}
     {isLoggedIn && pathname === "/overview" && (
       <div className="fixed bottom-0 left-0 w-full bg-muted/70 py-4 px-6 z-40">
         <Link href="/custom-intake">
           <Button className="w-full bg-muted-gold text-ivory">
             Create headshots
           </Button>
         </Link>
       </div>
     )}

      {/* ─── Navbar ─── */}
      <header className="sticky top-0 z-50 w-full border-t-2 border-muted-gold border-b bg-charcoal backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-1 text-ivory font-semibold text-sm"
          >
            <Image
              src="/newlogo.png"
              alt="AI Maven Logo"
              width={25}
              height={35}
              className="rounded-full"
            />
            <span>AI Maven</span>
          </Link>

          {/* Nav links */}
          {isLoggedIn && pathname !== "/" && (
            <nav className="flex justify-start items-center gap-4 -ml-4">
              <Link
                href="/overview"
                onClick={blockNav}
                className="text-ivory font-semibold transition-colors hover:text-muted-gold"
              >
                Home
              </Link>
              <Link
                href="/overview/packs"
                onClick={blockNav}
                className="text-ivory font-semibold transition-colors hover:text-muted-gold"
              >
                Packs
              </Link>
              <Link
                href="/get-credits"
                onClick={blockNav}
                className="text-ivory font-semibold transition-colors hover:text-muted-gold"
              >
                Pricing
              </Link>
            </nav>
          )}

          {/* Hamburger */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 p-0">
                <HamburgerMenuIcon className="h-6 w-6 text-muted-gold" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-48 z-50">
              {/* Dark mode toggle */}
              <DropdownMenuItem className="flex justify-center py-2">
                <ThemeToggle />
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              {isLoggedIn ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/overview" onClick={blockNav}>
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/overview/packs" onClick={blockNav}>
                      Packs
                    </Link>
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
                <DropdownMenuItem asChild>
                  <Link href="/login">
                    <Button variant="ghost" className="w-full text-left">
                      Log in
                    </Button>
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  );
}

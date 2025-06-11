// File: components/Navbar.tsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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

type PackTab = "headshots" | "multi-purpose" | "teams";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useSupabaseClient();
  const session = useSession();
  const isLoggedIn = Boolean(session?.user);

  // Determine current pack tab from ?tab=
  const searchParams = useSearchParams();
  const currentTab = (searchParams.get("tab") as PackTab) || "headshots";
  const tabMap: Record<PackTab, { text: string; href: string }> = {
    headshots: {
      text: "Create Headshots",
      href: "/custom-intake?packType=headshots",
    },
    "multi-purpose": {
      text: "Create Multi-Purpose Headshots",
      href: "/multi-purpose-intake",
    },
    teams: {
    text: "Create Team Headshots",
    href: "/teams-intake",    // ← This is the new page we just created
  },
  };
  const { text: buttonText, href: buttonHref } = tabMap[currentTab];
const SHOW_TEAMS = false; // 👈 Turn this to true later when ready

  // ─── Age-gate state ───────────────────────────────────────────────────────────
  const [agreed, setAgreed] = useState(false);
  const [checked, setChecked] = useState(false);

  // ─── (1) On mount (or whenever isLoggedIn flips to true),
  //           read “ageGateSeen” from localStorage.
  //           If it’s "true", immediately hide the banner.
  useEffect(() => {
    if (isLoggedIn) {
      const seenFlag = localStorage.getItem("ageGateSeen");
      if (seenFlag === "true") {
        setAgreed(true);
      }
    }
  }, [isLoggedIn]);

  // ─── (2) When they first log in, reset only the checkbox.
  //           Do NOT reset `agreed`, so that if they already saw it, it stays hidden.
  useEffect(() => {
    if (isLoggedIn) {
      setChecked(false);
      // Do NOT call setAgreed(false) here! We want to preserve “agreed” if previously stored.
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
      {/* ─── Age Verification Banner at bottom ───────────────────────────────────── */}
      {isLoggedIn && pathname === "/overview" && !agreed && (
        <div className="fixed bottom-0 left-0 w-full bg-charcoal border-t border-muted-gold p-4 z-50">
          <div className="max-w-screen-md mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <label className="flex items-start sm:items-center gap-2 flex-1">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => setChecked((c) => !c)}
                className="w-4 h-4 text-muted-gold"
              />
              <span className="text-ivory text-sm">
                I agree that I am the majority age 18/21+ years of age, and acknowledge the{" "}
                <Link href="/terms" className="text-muted-gold underline">
                  terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy-policy" className="text-muted-gold underline">
                  privacy policy
                </Link>.
              </span>
            </label>
            <button
              onClick={() => {
                // ① Store the “seen” flag so they never see this again:
                localStorage.setItem("ageGateSeen", "true");

                // ② Update state and navigate to the correct intake form:
                setAgreed(true);
                router.push(buttonHref);
              }}
              disabled={!checked}
              className={`py-2 px-6 font-semibold rounded-md transition
                ${
                  checked
                    ? "bg-muted-gold text-ivory hover:opacity-90"
                    : "bg-muted/30 text-ivory cursor-not-allowed"
                }`}
            >
              {buttonText}
            </button>
          </div>
        </div>
      )}

      {/* ─── Background “Create …” button once agreed ───────────────────────────── */}
      {isLoggedIn && pathname === "/overview" && agreed && (
        <div className="fixed bottom-0 left-0 w-full bg-muted/70 py-4 px-6 z-40">
          <Link href={buttonHref}>
            <Button className="w-full bg-muted-gold text-ivory">
              {buttonText}
            </Button>
          </Link>
        </div>
      )}

      {/* ─── Navbar ───────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-t-2 border-muted-gold border-b bg-charcoal backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-1 text-ivory font-semibold text-sm"
          >
            <Image
              src="/glogo.png"
              alt="AI Maven Logo"
              width={25}
              height={35}
              className="rounded-full"
            />
            <span>AI Maven</span>
          </Link>

          {/* Nav links */}
          {isLoggedIn && pathname !== "/" && (
<nav className="flex justify-start items-center gap-2.5 -ml-4">
            {isLoggedIn && (
              <>
                <Link href="/overview" className="text-ivory font-semibold hover:text-muted-gold">
                  Home
                </Link>
                <Link href="/get-credits" className="text-ivory font-semibold hover:text-muted-gold">
                  Pricing
                </Link>
              </>
            )}
       {SHOW_TEAMS && (
  <Link href="/teams" className="text-ivory font-semibold hover:text-muted-gold">
    Teams
  </Link>
)}

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
          <Link href="/get-credits" onClick={blockNav}>
            Pricing
          </Link>
        </DropdownMenuItem>
        {SHOW_TEAMS && (
  <DropdownMenuItem asChild>
    <Link href="/teams" onClick={blockNav}>
      Teams
    </Link>
  </DropdownMenuItem>
)}

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

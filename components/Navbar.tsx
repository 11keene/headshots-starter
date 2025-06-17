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
  const session = useSession();
  const supabase = useSupabaseClient();
  const pathname = usePathname();
  const router = useRouter();
  const isLoggedIn = Boolean(session?.user);

  // Proxy endpoint to avoid CORS: /api/intake-start
  const sendIntakeStarted = async () => {
    if (!session?.user || !session.user.email) return;
    try {
      await fetch("/api/intake-start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email,
          firstName: session.user.user_metadata?.full_name?.split(" ")[0] || "",
          lastName: session.user.user_metadata?.full_name?.split(" ")[1] || "",
        }),
      });
    } catch (error) {
      console.error("Failed to send intake_started proxy request", error);
    }
  };

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
      href: "/teams-intake",
    },
  };
  const { text: buttonText, href: buttonHref } = tabMap[currentTab];
  const SHOW_TEAMS = false;

  // Age-gate state
  const [agreed, setAgreed] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (isLoggedIn && localStorage.getItem("ageGateSeen") === "true") {
      setAgreed(true);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) setChecked(false);
  }, [isLoggedIn]);

  const blockNav = (e: React.MouseEvent) => {
    if (pathname === "/overview" && !agreed) e.preventDefault();
  };

  return (
    <>
      {/* Age Verification Banner */}
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
                I agree that I am 18+ years of age and accept the{" "}
                <Link href="/terms" className="text-muted-gold underline">
                  terms
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy-policy"
                  className="text-muted-gold underline"
                >
                  privacy policy
                </Link>
                .
              </span>
            </label>
            <button
              onClick={async () => {
                localStorage.setItem("ageGateSeen", "true");
                setAgreed(true);
                await sendIntakeStarted();
                router.push(buttonHref);
              }}
              disabled={!checked}
              className={`py-2 px-6 font-semibold rounded-md transition ${
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

      {/* Background “Create …” button once agreed */}
      {isLoggedIn && pathname === "/overview" && agreed && (
        <div className="fixed bottom-0 left-0 w-full bg-muted/70 py-4 px-6 z-40">
          <Button
            className="w-full bg-muted-gold text-ivory"
            onClick={async () => {
              await sendIntakeStarted();
              router.push(buttonHref);
            }}
          >
            {buttonText}
          </Button>
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
              src="/newlogo.png"
              alt="AI Maven Logo"
              width={25}
              height={35}
              className="rounded-full"
            />
            <span>AI Maven</span>
          </Link>

          {/* DESKTOP HOMEPAGE TABS */}
          {pathname === "/" && (
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/#examples"
                className="text-ivory font-semibold hover:text-muted-gold"
              >
                Examples
              </Link>
              <Link
                href="/#pricing"
                className="text-ivory font-semibold hover:text-muted-gold"
              >
                Pricing
              </Link>
              <Link
                href="/#faq"
                className="text-ivory font-semibold hover:text-muted-gold"
              >
                FAQ
              </Link>
            </nav>
          )}

          {/* LOGGED-IN NAV (non-root pages, desktop hidden on mobile) */}
          {isLoggedIn && pathname !== "/" && (
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/overview"
                className="text-ivory font-semibold hover:text-muted-gold"
                onClick={blockNav}
              >
                Home
              </Link>
              <Link
                href="/get-credits"
                className="text-ivory font-semibold hover:text-muted-gold"
                onClick={blockNav}
              >
                Pricing
              </Link>
              {SHOW_TEAMS && (
                <Link
                  href="/teams"
                  className="text-ivory font-semibold hover:text-muted-gold"
                  onClick={blockNav}
                >
                  Teams
                </Link>
              )}
            </nav>
          )}

          {/* RIGHT-HAND GROUP: Hamburger & Dashboard CTA */}
          <div className="flex items-center space-x-2">
            {/* HAMBURGER & DROPDOWN */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 p-0">
                  <HamburgerMenuIcon className="h-6 w-6 text-muted-gold" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-48 z-50">
                {/* ONLY ON MOBILE HOMEPAGE: tabs */}
                {pathname === "/" && (
                  <div className="md:hidden">
                    <DropdownMenuItem asChild>
                      <Link href="/#examples">Examples</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/#pricing">Pricing</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/#faq">FAQ</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </div>
                )}

                {/* Dark mode toggle */}
                <DropdownMenuItem className="flex justify-center py-2">
                  <ThemeToggle />
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                {/* Auth‐aware items */}
                {isLoggedIn ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/overview" onClick={blockNav}>
                        Dashboard
                      </Link>
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

            {/* Dashboard CTA (desktop only) */}
            {isLoggedIn && (
              <Link href="/overview">
                <Button className="hidden md:block bg-muted-gold text-ivory">
                  Go to Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

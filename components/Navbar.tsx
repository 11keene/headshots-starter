// components/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { usePathname } from "next/navigation";
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

  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [credits, setCredits] = useState(0);

  // On mount, fetch the current user + credits
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUser({ id: user.id, email: user.email ?? "" });
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

  // Define which routes count as “backend”
  const isBackend =
    pathname?.startsWith("/overview") ||
    pathname?.startsWith("/get-credits");

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/** LEFT: Logo on public, Credits on backend **/}
        <div className="flex items-center">
          {isBackend && user ? (
            <span className="text-sm font-medium">{credits} Credits</span>
          ) : (
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="AI Maven Logo"
                width={28}
                height={28}
                className="rounded-full"
              />
              <span className="text-lg font-semibold">AI Maven</span>
            </Link>
          )}
        </div>

        {/** CENTER: nav links only when logged in **/}
        {user && (
          <nav className="flex gap-6">
            <Link
              href="/overview"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Home
            </Link>
            <Link
              href="/overview/packs"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Packs
            </Link>
            <Link
              href="/get-credits"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Get Credits
            </Link>
          </nav>
        )}

        {/** RIGHT: theme toggle + avatar/login **/}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          {!user ? (
            <Link href="/login">
              <Button size="sm">Login</Button>
            </Link>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 p-0 text-red-600"
                >
                  <AvatarIcon className="h-10 w-10" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="end" className="w-56">
                <DropdownMenuLabel className="text-center">
                  {user.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex justify-between px-4">
                  <span>Your Credits</span>
                  <span className="font-medium">{credits}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/overview" className="w-full px-4">
                    Create Photos
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <form action="/auth/sign-out" method="post">
                  <Button
                    type="submit"
                    variant="ghost"
                    className="w-full text-left"
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

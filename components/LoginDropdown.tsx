// File: components/LoginDropdown.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu"
import { Button } from "./ui/button"
import { HamburgerMenuIcon } from "@radix-ui/react-icons"
// ← point to where your ThemeToggle actually lives:
import { ThemeToggle } from "@/components/homepage/theme-toggle"

export default function LoginDropdown() {
  const pathname = usePathname()

  // only show the hamburger with toggle when on /login
  if (pathname === "/login") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-10 w-10 p-0">
            <HamburgerMenuIcon className="h-6 w-6 text-primary" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48 z-50">
          {/* 1) your dark/light toggle */}
          <DropdownMenuItem asChild>
            <ThemeToggle />
          </DropdownMenuItem>

          {/* 2) still need a login link in that menu */}
          <DropdownMenuItem asChild>
            <Link href="/login">
              <span>Login</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // everywhere else, just show the normal Login button
  return (
    <Link href="/login">
      <Button size="sm">Login</Button>
    </Link>
  )
}

// components/LocaleSwitcher.tsx
"use client"                              // ← 1) CLIENT COMPONENT

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"  // ← 2) App Router hooks
import i18nConfig from "../i18n.js"                            // ← 3) your locales list

export function LocaleSwitcher() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const queryString = searchParams.toString()
  // rebuild the full href with any existing query
  const href = queryString ? `${pathname}?${queryString}` : pathname

  return (
    <nav className="flex gap-2">
      {i18nConfig.locales.map((loc) => (
        <Link
          key={loc}
          href={href}
          locale={loc}
          className="px-2 py-1 border rounded text-sm hover:bg-sage-green hover:text-white"
        >
          {loc.toUpperCase()}
        </Link>
      ))}
    </nav>
  )
}

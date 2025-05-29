// components/Footer.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname !== "/") return null;

  return (
    <footer className="bg-charcoal border-t py-12 md:py-16">
      <div className="container px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-xl text-ivory"
            >
              <Image
                src="/newlogo.png"
                alt="AI Maven Logo"
                width={40}
                height={24}
                className="rounded-full"
              />
              <span>AI Maven</span>
            </Link>
            <p className="text-sm text-white">
              Professional AI-generated headshots for your online presence.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-gold">Product</h3>
            <ul className="space-y-2">
              {["How It Works","Examples","Pricing"].map((label) => (
                <li key={label}>
                  <Link
                    href={`#${label.toLowerCase().replace(/ /g, "-")}`}
                    className="text-sm text-white hover:text-ivory transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-gold ">Resources</h3>
            <ul className="space-y-2">
              {[
                
                
                { href: "https://www.instagram.com/kammilocs/?igshid=eGl6eXRoODM5OXU4", label: "Instagram" },
              ].map(({ href, label }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-white  hover:text-ivory transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-gold">Legal</h3>
            <ul className="space-y-2">
              {[
                { href: "mailto:support@aimavenstudio.com", label: "Contact" },
                { href: "/LICENSE.md", label: "License" },
                            ].map(({ href, label }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-white hover:text-ivory transition-colors"
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
          <p className="text-sm text-ivory">
            © {new Date().getFullYear()} AI Maven. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

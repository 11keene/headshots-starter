// File: components/homepage/ScrollCTA.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@supabase/auth-helpers-react";
import { ArrowRightIcon } from "@radix-ui/react-icons";

export default function ScrollCTA() {
  const [visible, setVisible] = useState(false);
  const session = useSession();

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  const href = session ? "/overview" : "/login";

  return (
    <div
      className="
        fixed bottom-0 left-0 w-full
        bg-muted/70 py-3
        z-50 pointer-events-none
      "
    >
      <div className="flex justify-center">
        <Link href={href} className="pointer-events-auto">
          <button
            className="
              flex items-center
              bg-muted-gold text-ivory font-semibold
              px-4 py-2 rounded-full shadow-lg
            "
          >
            Create your headshots now
            <ArrowRightIcon className="ml-2 w-5 h-5" />
          </button>
        </Link>
      </div>
    </div>
  );
}

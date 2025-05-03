// File: components/SupabaseProvider.tsx
"use client";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";

import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { useState, type ReactNode } from "react";

export default function SupabaseProvider({ children }: { children: ReactNode }) {
    const [supabaseClient] = useState(() => createPagesBrowserClient());
      return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      {children}
    </SessionContextProvider>
  );
}

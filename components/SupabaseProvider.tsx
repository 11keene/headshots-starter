// File: components/SupabaseProvider.tsx
"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { useState, type ReactNode } from "react";

export default function SupabaseProvider({ children }: { children: ReactNode }) {
  // ← use the App-Router helper, not the Pages-Router one
  const [supabaseClient] = useState(() => createClientComponentClient());

  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      {children}
    </SessionContextProvider>
  );
}

// File: app/layout.tsx

import dynamic from "next/dynamic";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { Suspense } from "react";
import AnnouncementBar from "@/components/homepage/announcement-bar";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/components/homepage/theme-provider";
import { validateConfig } from "@/lib/config";
import Navbar from "@/components/Navbar";

// ← NEW imports for server-side upsert
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

validateConfig();

// Dynamically load the client-only SupabaseProvider (no SSR)
const SupabaseProvider = dynamic(
  () => import("@/components/SupabaseProvider"),
  { ssr: false }
);

export const metadata = {
  title: "AI Maven",
  description: "Generate awesome headshots in minutes using AI",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // — NEW: upsert auth user into public.users —
  const supabaseServer = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabaseServer.auth.getUser();

  if (user) {
    await supabaseServer.from("users").upsert(
      {
        id: user.id,
        email: user.email,
        credits: 0,
      },
      { onConflict: "id", ignoreDuplicates: true }
    );
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon1.ico" type="image/png" />
      </head>
      <body className="min-h-screen flex flex-col bg-background">
        <SupabaseProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AnnouncementBar />
            <Suspense
              fallback={
                <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
                  <div className="container h-16" />
                </div>
              }
            >
              <Navbar />
            </Suspense>
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster />
            <Analytics />
          </ThemeProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}

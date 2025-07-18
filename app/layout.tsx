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
import { UploadProvider } from "@/components/UploadContext";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

validateConfig();

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
  const supabaseServer = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabaseServer.auth.getUser();

  if (user) {
    await supabaseServer
      .from("users")
      .upsert(
        { id: user.id, email: user.email },
        { onConflict: "id", ignoreDuplicates: true }
      );
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* YOUR FAVICON */}
        <link rel="icon" href="/favicon8.ico" type="image/x-icon" />

        {/* Meta Pixel Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '600322572813652'); 
            fbq('track', 'PageView');`,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=600322572813652&ev=PageView&noscript=1"
          />
        </noscript>
        {/* End Meta Pixel Code */}
      </head>
      <body className="min-h-screen flex flex-col bg-background">
        {/*
          ————————————————————————————————————————————————
          50% Off Promo Form (GoHighLevel)
          Clicking the <AnnouncementBar /> link with id="promo-link"
          will trigger this pop-up.
        */}
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
            <UploadProvider packId={""}>
              <main className="flex-1">{children}</main>
            </UploadProvider>
            <Footer />
            <Toaster />
            <Analytics />
          </ThemeProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}

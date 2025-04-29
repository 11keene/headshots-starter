import Footer from "@/components/Footer";
import dynamic from "next/dynamic";
const Navbar = dynamic(() => import("@/components/Navbar"), { ssr: false });
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { Suspense } from "react";
import AnnouncementBar from "@/components/homepage/announcement-bar";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/components/homepage/theme-provider";
import { validateConfig } from "@/lib/config";
import { ErrorBoundary } from "react-error-boundary";
import GlobalError from "./error";

// Validate configuration at app initialization
validateConfig();

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata = {
  title: "AI Maven",
  description: "Generate awesome headshots in minutes using AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        {/* You can use .ico instead if that's your file format */}
        {/* <link rel="icon" href="/favicon.ico" type="image/x-icon" /> */}
      </head>
      <body className="min-h-screen flex flex-col bg-background">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ErrorBoundary 
          FallbackComponent={GlobalError}
          onReset={() => {
            // this will unmount/remount everything under the boundary
            // you could also reset to a specific route: router.push('/')
          }}>
            <AnnouncementBar />
            <Suspense
              fallback={
                <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}


// app/login/page.tsx
import { headers } from "next/headers";
import Login from "./components/Login";

export const dynamic = "force-dynamic";

export default function Page() {
  const host = headers().get("host") ?? "";
  const protocol = host.includes("localhost") ? "http" : "https";
  const redirectTo = `${protocol}://${host}/auth/callback`;

  return (
    <div className="flex min-h-screen">
      {/* Left branding (hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-neutral-100 p-10 flex-col items-center justify-center">
        <img src="/logo.png" alt="AI Maven Logo" className="w-20 h-20 mb-6 rounded-full" />
        <h1 className="text-3xl font-bold mb-4">Welcome to AI Maven</h1>
        <p className="text-center max-w-sm">
          Elevate your brand with stunning AI-generated headshots. Trusted by professionals.
        </p>
      </div>

      {/* Right login pane */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 lg:px-12">
        <Login redirectTo={redirectTo} />
      </div>
    </div>
  );
}


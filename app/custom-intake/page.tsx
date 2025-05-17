// app/custom-intake/page.tsx
export const dynamic = "force-dynamic";  // always render on request
export const runtime = "nodejs";          

import CustomIntakeClient from "./CustomIntakeClient";

interface PageProps {
  searchParams: {
    packId?: string;
    gender?: "man" | "woman";
  };
}

export default function Page({ searchParams }: PageProps) {
  const gender = (searchParams.gender as "man" | "woman") || "man";
  const packId = `custom-intake-${gender}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-gray p-4">
      {/* You can wrap in a container for styling */}
      <div className="w-full max-w-2xl bg-ivory rounded-xl shadow-lg overflow-hidden">
        <header className="px-6 py-4 border-b">
          <h1 className="text-2xl font-semibold">Custom Photoshoot Intake</h1>
        </header>
        <main className="p-6">
          {/* Pass packId down to your client component */}
          <CustomIntakeClient packId={packId} />
        </main>
      </div>
    </div>
  );
}

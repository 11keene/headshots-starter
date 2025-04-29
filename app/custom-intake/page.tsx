// app/custom-intake/page.tsx
export const dynamic = "force-dynamic";  // always render on request
export const runtime = "edge";           // use the Edge runtime

import CustomIntakeClient from "./CustomIntakeClient";

interface PageProps {
  searchParams: {
    packId?: string;
  };
}

export default function Page({ searchParams }: PageProps) {
  // Read packId from the URL (?packId=…) or fall back
  const packId = searchParams.packId ?? "defaultPack";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      {/* You can wrap in a container for styling */}
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden">
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

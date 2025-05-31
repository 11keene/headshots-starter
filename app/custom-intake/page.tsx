// app/custom-intake/page.tsx
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import CustomIntakeClient from "@/components/CustomIntakeClient";

interface PageProps {
  searchParams: {
    gender?: string;
  };
}

export default function Page({ searchParams }: PageProps) {
  // default to “man” unless ?gender=woman
  const gender = searchParams.gender === "woman" ? "woman" : "man";
  const packId = `custom-intake-${gender}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-2xl bg-charcoal rounded-xl shadow-lg overflow-hidden">
        <header className="px-6 py-4 border-b">
          <h1 className="text-2xl text-ivory font-semibold">
            The Professional Intake
          </h1>
        </header>
        <main className="p-6">
          <CustomIntakeClient packId={packId} />
        </main>
      </div>
    </div>
  );
}

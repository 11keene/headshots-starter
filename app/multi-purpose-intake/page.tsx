// File: app/multi-purpose-intake/page.tsx
"use client";
import React from "react";

// ← This path + filename must match exactly (including capitalization).
import MultiPurposeIntakeForm from "@/components/MultiPurposeIntakeForm";

export default function MultiPurposeIntakePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-2xl bg-charcoal rounded-xl shadow-lg overflow-hidden">
        <header className="px-6 py-4 border-b">
          <h1 className="text-2xl text-ivory font-semibold">
            Multi-Purpose Intake
          </h1>
        </header>
        <main className="p-6">
          <MultiPurposeIntakeForm pack="multi-purpose" />
        </main>
      </div>
    </div>
  );
}
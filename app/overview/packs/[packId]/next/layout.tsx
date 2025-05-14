// File: app/overview/packs/[packId]/next/layout.tsx
"use client";

import { UploadProvider } from "../UploadContext";

export default function NextLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { packId: string[] };
}) {
  // pass the current packId into the provider
  const thisPackId = Array.isArray(params.packId)
    ? params.packId[0]
    : params.packId;

  return (
    <UploadProvider packId={thisPackId}>
      {children}
    </UploadProvider>
  );
}

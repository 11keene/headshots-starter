// app/overview/packs/[packId]/layout.tsx
import React from "react";
import { UploadProvider } from "./UploadContext";

export default function PackLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { packId: string };
}) {
  return (
    <UploadProvider packId={params.packId}>
      {children}
    </UploadProvider>
  );
}

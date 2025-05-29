import { ReactNode } from "react";
import { UploadProvider } from "@/components/UploadContext";

interface LayoutProps {
  children: ReactNode;
  params: { packId: string };   // Next.js gives us params.packId
}

export default function PackLayout({ children, params }: LayoutProps) {
  return (
    // We now pass params.packId into our provider
    <UploadProvider packId={params.packId}>
      {children}
    </UploadProvider>
  );
}

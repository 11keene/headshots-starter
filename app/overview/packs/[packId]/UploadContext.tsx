// components/UploadContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

// 1. We’ve added `packId: string` here so the context can carry it around
interface UploadState {
  previewUrls: string[];
  setPreviewUrls: React.Dispatch<React.SetStateAction<string[]>>;
  packId: string;
}

// 2. Our context now knows about that extra `packId`
const UploadCtx = createContext<UploadState | undefined>(undefined);

// 3. UploadProvider signature now explicitly asks for packId:string
export function UploadProvider({
  children,
  packId,           // ← here's our new prop
}: {
  children: ReactNode;
  packId: string;   // ← and its type
}) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  return (
    <UploadCtx.Provider value={{ previewUrls, setPreviewUrls, packId }}>
      {children}
    </UploadCtx.Provider>
  );
}

// 4. No change here—this hook still gives you previewUrls, setPreviewUrls, and now packId
export function useUploadContext(): UploadState {
  const ctx = useContext(UploadCtx);
  if (!ctx) {
    throw new Error("useUploadContext must be used inside UploadProvider");
  }
  return ctx;
}

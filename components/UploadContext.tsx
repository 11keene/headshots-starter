"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

// We extend UploadState to carry packId along with previewUrls.
interface UploadState {
  previewUrls: string[];
  setPreviewUrls: React.Dispatch<React.SetStateAction<string[]>>;
  packId: string;                // ← ADDED
}

const UploadCtx = createContext<UploadState | undefined>(undefined);

export function UploadProvider({
  children,
  packId,                       // ← ADDED
}: {
  children: ReactNode;
  packId: string;               // ← ADDED
}) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  return (
    <UploadCtx.Provider value={{ previewUrls, setPreviewUrls, packId }}>
      {children}
    </UploadCtx.Provider>
  );
}

export function useUploadContext(): UploadState {
  const ctx = useContext(UploadCtx);
  if (!ctx) {
    throw new Error("useUploadContext must be used inside UploadProvider");
  }
  return ctx;
}

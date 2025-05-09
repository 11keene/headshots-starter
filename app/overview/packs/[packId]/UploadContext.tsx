// app/overview/packs/[packId]/UploadContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface UploadState {
  previewUrls: string[];
  setPreviewUrls: (urls: string[]) => void;
}

const UploadCtx = createContext<UploadState | undefined>(undefined);

export function UploadProvider({
  children,
  packId,
}: {
  children: ReactNode;
  packId: string;
}) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Hydrate once
  useEffect(() => {
    const saved = localStorage.getItem(`uploads-${packId}`);
    if (saved) {
      try {
        setPreviewUrls(JSON.parse(saved));
      } catch {}
    }
  }, [packId]);

  // Persist on change
  useEffect(() => {
    localStorage.setItem(`uploads-${packId}`, JSON.stringify(previewUrls));
  }, [packId, previewUrls]);

  return (
    <UploadCtx.Provider value={{ previewUrls, setPreviewUrls }}>
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

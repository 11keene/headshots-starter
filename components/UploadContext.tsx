// components/UploadContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

interface UploadState {
  previewUrls: string[];
  setPreviewUrls: React.Dispatch<React.SetStateAction<string[]>>;
}

const UploadCtx = createContext<UploadState | undefined>(undefined);

export function UploadProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

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

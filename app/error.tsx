// app/error.tsx
"use client";

import { useEffect } from "react";
import type { FallbackProps } from "react-error-boundary";

export default function GlobalError({ error, resetErrorBoundary }: FallbackProps) {
  // Log the error (you could also send this to a logging service)
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">Oops—something went wrong.</h1>
      <p className="mb-6 text-gray-600">{error.message}</p>
      <button
        onClick={() => resetErrorBoundary()}
        className="px-4 py-2 bg-red-600 text-white rounded"
      >
        Try Again
      </button>
    </div>
  );
}

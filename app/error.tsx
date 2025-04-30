"use client"

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  // log to your monitoring service
  useEffect(() => {
    console.error("Uncaught page error:", error);
  }, [error]);

  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
      <p className="mb-6">{error.message}</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-red-600 text-white rounded"
      >
        Try Again
      </button>
    </div>
  );
}

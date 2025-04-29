// components/ui/spinner.tsx
import React from "react";

/**
 * A simple CSS-based spinner using Tailwind’s built-in animate-spin.
 */
export function Spinner() {
  return (
    <div
      className="w-6 h-6 border-2 border-t-transparent border-red-600 rounded-full animate-spin"
      role="status"
      aria-label="Loading…"
    />
  );
}

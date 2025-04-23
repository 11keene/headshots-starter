// app/login/components/WaitingForMagicLink.tsx
"use client";
import { Button } from "@/components/ui/button";

export default function WaitingForMagicLink({ toggleState }: { toggleState: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      <p className="text-center">Check your email for the magic link...</p>
      <Button onClick={toggleState} variant="outline">
        Try Again
      </Button>
    </div>
  );
}

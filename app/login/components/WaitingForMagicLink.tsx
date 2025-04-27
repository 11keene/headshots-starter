// app/login/components/WaitingForMagicLink.tsx
"use client";

import { Button } from "@/components/ui/button";

export default function WaitingForMagicLink({ toggleState }: { toggleState: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center space-y-6 px-6">
      <h2 className="text-2xl font-bold text-green-600">Check Your Email!</h2>
      <p className="text-gray-600">
        We've sent you a magic link. Click the link in your inbox to log in.
      </p>
      <Button onClick={toggleState} variant="secondary">
        Return to Login
      </Button>
    </div>
  );
}

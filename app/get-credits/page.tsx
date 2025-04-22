"use client";  // This tells Next.js to treat this as a Client Component

import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function GetCreditsPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <Button onClick={() => setLoading(!loading)}>
        {loading ? "Loading..." : "Get Credits"}
      </Button>
    </div>
  );
}


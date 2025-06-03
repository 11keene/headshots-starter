// File: app/get-credits/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type PlanID = "professional" | "multi-purpose" | "team";

interface Plan {
  id: PlanID;
  name: string;
  description: string;
  price: string;
}

const PLANS: Plan[] = [
  {
    id: "professional",
    name: "The Professional Pack",
    description: "15 fully customized AI-generated images for a single role/brand identity",
    price: "$44.99",
  },
  {
    id: "multi-purpose",
    name: "The Multi-Purpose Pack",
    description: "15 AI images tailored to multiple roles or industries",
    price: "$54.99",
  },

];

export default function PricingPage() {
  const supabase = createPagesBrowserClient();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  // redirect to login if not signed in
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
      else router.push("/login?redirectTo=/get-credits");
    });
  }, [supabase, router]);

  const choosePlan = (planId: PlanID) => {
    switch (planId) {
      case "professional":
        router.push("/custom-intake?packType=professional");
        break;

      case "multi-purpose":
        router.push("/multi-purpose-intake?packType=multi-purpose");
        break;

      case "team":
        router.push("/reference-intake?packType=reference-match");
        break;

      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-charcoal p-8">
      <h1 className="text-3xl text-ivory font-bold mb-6">Pick Your Pack</h1>
      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => (
          <Card
            key={plan.id}
            className="p-6 border-2 border-charcoal rounded-lg transition hover:shadow-lg flex flex-col"
          >
            <h2 className="text-xl font-semibold mb-2">{plan.name}</h2>
            <p className="text-gray-600 mb-4">{plan.description}</p>
            <div className="mt-auto flex items-center justify-between">
              <span className="text-4xl font-extrabold text-muted-gold">
                {plan.price}
              </span>
              <Button
                onClick={() => choosePlan(plan.id)}
                className="bg-muted-gold hover:bg-sage-green text-white px-4 py-2 rounded-md text-sm"
              >
                Choose Pack
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

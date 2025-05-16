// File: components/PromoHandler.tsx
"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { PromoModal } from "@/components/PromoModal";
import { useToast } from "@/components/ui/use-toast";

export default function PromoHandler() {
  const supabase = createClientComponentClient();
  const { toast } = useToast();
  const [showPromo, setShowPromo] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          const id = session.user.id;
          setUserId(id);

          // fetch promo_shown & any orders in parallel
          const [
            { data: user, error: userError },
            { data: orders, error: ordersError },
          ] = await Promise.all([
            supabase.from("users").select("promo_shown").eq("id", id).single(),
            supabase.from("orders").select("id").eq("user_id", id),
          ]);

          const hasBought = (orders ?? []).length > 0;

          if (!userError && !ordersError && user && !hasBought && user.promo_shown === false) {
            setShowPromo(true);
          }
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  // Claim: permanently hide + save code & discount + toast
  const handleClaim = async () => {
    if (userId) {
      await supabase
        .from("users")
        .update({
          promo_shown: true,
          current_promo_code: "WELCOME10",
          promo_discount: 0.1,
        })
        .eq("id", userId);
    }
    toast({ description: "🎉 Promo code WELCOME10 applied at checkout!" });
    setShowPromo(false);
  };

  // Close: just hide for this session
  const handleClose = () => {
    setShowPromo(false);
  };

  if (!showPromo) return null;

  return (
    <PromoModal
      open={showPromo}
      onClaim={handleClaim}
      onClose={handleClose}
    />
  );
}

"use client"
import StripeCheckoutButton from '@/components/StripeCheckoutButton'


import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function GetCreditsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Buy Credits</h1>
      <StripeCheckoutButton priceId="price_1" />  {/* 25 credits */}
      <StripeCheckoutButton priceId="price_3" />  {/* 75 credits */}
      <StripeCheckoutButton priceId="price_5" />  {/* 200 credits */}
      {/* etc… */}
    </div>
  )
}



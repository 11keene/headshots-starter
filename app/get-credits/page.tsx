import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function GetCreditsPage() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (amount: number) => {
    setLoading(true);
    
    // Send a POST request to create the checkout session
    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      body: JSON.stringify({
        amount: amount, // Amount to charge in dollars (12 for 1 credit)
        userId: "USER_ID", // Pass the user ID (from your auth system)
      }),
    });

    const data = await response.json();

    if (data.url) {
      // Redirect the user to Stripe's checkout page
      window.location.href = data.url;
    } else {
      // Handle errors (e.g., failed API call)
      console.error("Something went wrong while creating the checkout session.");
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <h1 className="text-3xl font-semibold">Get Credits</h1>
      <p>Select the number of credits you'd like to purchase:</p>

      <div className="flex gap-4">
        <Button
          onClick={() => handleCheckout(12)} // Amount for 1 credit
          disabled={loading}
        >
          Buy 1 Credit - $12
        </Button>
        <Button
          onClick={() => handleCheckout(30)} // Amount for 3 credits
          disabled={loading}
        >
          Buy 3 Credits - $30
        </Button>
        <Button
          onClick={() => handleCheckout(40)} // Amount for 5 credits
          disabled={loading}
        >
          Buy 5 Credits - $40
        </Button>
      </div>
    </div>
  );
}

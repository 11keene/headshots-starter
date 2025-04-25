import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Debug environment variables (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
}

// Safe environment variable access
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.error("STRIPE_SECRET_KEY is missing!");
}

// Create Stripe instance with error handling
const stripe = new Stripe(stripeSecretKey || "", {
  apiVersion: '2025-03-31.basil',
});

export async function POST(req: Request) {
  // Wrap everything in try-catch to ensure we always return valid JSON
  try {
    // Parse request body with error handling
    const body = await req.json().catch(e => {
      console.error("Failed to parse request body:", e);
      return {};
    });
    
    const { priceId } = body;
    
    if (!priceId) {
      console.error("Missing priceId in request");
      return NextResponse.json(
        { error: "Missing priceId parameter" },
        { status: 400 }
      );
    }
    
    // Extract domain from request
    const YOUR_DOMAIN = req.headers.get("origin") || 
                         req.headers.get("referer")?.replace(/\/[^\/]*$/, '') || 
                         "https://www.aimavenstudio.com";

    console.log("Creating checkout session with:", {
      priceId,
      domain: YOUR_DOMAIN
    });
    
    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card', 'link'],  // You can add 'apple_pay' here too
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${YOUR_DOMAIN}/success`,
      cancel_url: `${YOUR_DOMAIN}/cancel`,
    });
    
    console.log("Session created:", session.id);
    return NextResponse.json({ url: session.url });  // Changed from { sessionId: session.id }
    
  } catch (error: any) {
    // Log the full error for debugging
    console.error("Stripe checkout error details:", error);
    
    // Extract useful information for the response
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const additionalInfo = error?.type || error?.code || "";
    
    // Always return a valid JSON response with helpful error details
    return NextResponse.json(
      { 
        error: errorMessage,
        details: additionalInfo,
        message: "Payment processing failed. Please try again." 
      },
      { status: 500 }
    );
  }
}
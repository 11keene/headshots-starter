import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Debug environment variables (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
}

// Safe environment variable access
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
}

// Create Stripe instance with error handling
const stripe = new Stripe(stripeSecretKey || "", {
  apiVersion: '2025-03-31.basil',
});

export async function POST(req: Request) {
  // Wrap everything in try-catch to ensure we always return valid JSON
  try {
    let body: any;
    try {
      body = await req.json();
    } catch (e: any) {
      console.error("Failed to parse request body:", e);
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const { priceId } = body;

    if (!priceId) {
      return NextResponse.json({ error: 'Missing priceId' }, { status: 400 });
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
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${YOUR_DOMAIN}/get-credits?status=success`,
      cancel_url: `${YOUR_DOMAIN}/get-credits?status=canceled`,
    });
    
    console.log("Session created:", session.id);
    return NextResponse.json({ sessionId: session.id });    
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
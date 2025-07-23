// app/api/stripe-webhook/route.ts

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Readable } from 'stream';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil', // Make sure this matches your Stripe API version
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Helper to convert ReadableStream to Buffersss
async function buffer(readable: ReadableStream<Uint8Array> | null): Promise<Buffer> {
  const reader = readable?.getReader();
  const chunks = [];

  if (!reader) return Buffer.from([]);

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  return Buffer.concat(chunks);
}

export async function POST(req: Request) {
  const rawBody = await buffer(req.body);
  const sig = headers().get('stripe-signature');

  if (!sig) {
    return new NextResponse('Missing Stripe signature', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err: any) {
    console.error('❌ Stripe signature verification failed:', err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle different event types
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(`✅ Checkout session completed for ${session.id}`);
      break;

    case 'payment_intent.succeeded':
      const intent = event.data.object as Stripe.PaymentIntent;
      console.log(`💰 PaymentIntent succeeded: ${intent.id}`);
      break;

    default:
      console.log(`📌 Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

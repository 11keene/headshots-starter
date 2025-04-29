// app/api/stripe/checkout/order/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY!;
const stripe = new Stripe(stripeSecretKey, { apiVersion: '2025-03-31.basil' });

export async function POST(req: Request) {
  try {
    const { priceIds, successUrl, cancelUrl } = await req.json();
    if (!Array.isArray(priceIds) || priceIds.length === 0) {
      return NextResponse.json({ error: 'priceIds required' }, { status: 400 });
    }
    // Build line items out of priceIds
    const line_items = priceIds.map((id: string) => ({
      price: id,
      quantity: 1,
    }));
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

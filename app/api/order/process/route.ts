// File: app/api/order/process/route.ts

import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { OrderDetails } from '@/types/imageGeneration';
import { processOrder } from '@/lib/services/imageGeneration';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  // log the incoming body for easier debugging
  const body = (await request.json()) as Partial<OrderDetails>;
  console.log('🚀 /api/order/process called with:', body);

  // initialize Supabase client in Route Handler context
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  // build the full OrderDetails payload
  const details: OrderDetails = {
    orderId:     body.orderId!,
    userId:      session.user.id,
    userEmail:   session.user.email!,
    packType:    body.packType!,
    extras:      body.extras ?? 0,
    intakeForm:  body.intakeForm
  };

  try {
    await processOrder(details);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error processing order:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

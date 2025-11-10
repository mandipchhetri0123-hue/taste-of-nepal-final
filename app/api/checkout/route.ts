import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" as any });
  const body = await req.json(); // { lines: [{ name, price, qty }], successUrl, cancelUrl }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: body.lines.map((l: any) => ({
      price_data: {
        currency: "aud",
        product_data: { name: l.name },
        unit_amount: Math.round(l.price * 100),
      },
      quantity: l.qty,
    })),
    success_url: body.successUrl,
    cancel_url: body.cancelUrl,
  });

  return NextResponse.json({ url: session.url });
}

import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-10-29.clover",
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 👇 Detect environment dynamically (THIS FIXES YOUR REDIRECT BUG)
    const origin =
      process.env.NEXT_PUBLIC_BASE_URL ||
      req.headers.get("origin") ||
      "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      // 👇 FIXED — dynamic base URL
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,

      customer_email: body.customer.email,

      metadata: {
        userId: body.customer.userId,
        fullName: body.customer.fullName,
        phone: body.customer.phone,
        address: body.customer.address,
        note: body.customer.note ?? "",
        email: body.customer.email,
        items: JSON.stringify(body.items),
      },

      line_items: body.items.map((item: any) => ({
        price_data: {
          currency: "aud",
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.guests,
      })),
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

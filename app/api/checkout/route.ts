import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Simulate payment delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Return fake success response
    return NextResponse.json({
      success: true,
      message: "Payment simulated successfully",
      order: {
        id: Math.floor(Math.random() * 100000),
        items: body.lines,
        customer: body.customer,
      },
    });
  } catch (err: any) {
    console.error("Checkout simulation failed:", err.message);
    return NextResponse.json({ error: "Payment failed" }, { status: 500 });
  }
}

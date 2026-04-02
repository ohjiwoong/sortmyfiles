import { NextRequest, NextResponse } from "next/server";

const SECRET_KEY = process.env.TOSS_SECRET_KEY!;

export async function POST(request: NextRequest) {
  const { paymentKey, orderId, amount } = await request.json();

  // 토스페이먼츠 결제 승인 API 호출
  const res = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(SECRET_KEY + ":").toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });

  const data = await res.json();

  if (res.ok) {
    // 결제 성공
    return NextResponse.json({
      success: true,
      orderId: data.orderId,
      approvedAt: data.approvedAt,
    });
  } else {
    // 결제 실패
    return NextResponse.json(
      { success: false, message: data.message ?? "결제 승인 실패" },
      { status: 400 }
    );
  }
}

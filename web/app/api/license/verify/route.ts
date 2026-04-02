import { NextRequest, NextResponse } from "next/server";
import { verifyLicenseToken } from "../../../lib/license-token";

export async function POST(request: NextRequest) {
  const { token } = await request.json();

  if (!token || typeof token !== "string") {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  const result = verifyLicenseToken(token);
  return NextResponse.json(result);
}

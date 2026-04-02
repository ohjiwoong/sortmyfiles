/**
 * 서버 전용: 결제 확인 후 서명된 라이선스 토큰 발급/검증
 *
 * 토큰 구조: base64(payload).signature
 * payload: { orderId, issuedAt }
 * signature: HMAC-SHA256(payload, SECRET_KEY)
 *
 * 이렇게 하면 서버의 SECRET_KEY를 모르는 이상 토큰을 위조할 수 없음
 */

import { createHmac } from "crypto";

function getSecret(): string {
  // TOSS_SECRET_KEY를 서명용 시크릿으로 재사용 (서버에만 존재)
  const secret = process.env.TOSS_SECRET_KEY;
  if (!secret) throw new Error("TOSS_SECRET_KEY not set");
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function createLicenseToken(orderId: string): string {
  const payload = JSON.stringify({
    orderId,
    issuedAt: Date.now(),
  });
  const encoded = Buffer.from(payload).toString("base64url");
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

export function verifyLicenseToken(token: string): { valid: boolean; orderId?: string } {
  try {
    const [encoded, signature] = token.split(".");
    if (!encoded || !signature) return { valid: false };

    const expectedSig = sign(encoded);
    if (signature !== expectedSig) return { valid: false };

    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString());
    return { valid: true, orderId: payload.orderId };
  } catch {
    return { valid: false };
  }
}

"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { saveLicenseKey } from "../../lib/plan";
import { detectLocale, getSavedLocale } from "../../lib/i18n";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"confirming" | "success" | "error">("confirming");
  const [errorMsg, setErrorMsg] = useState("");

  const locale = getSavedLocale() ?? detectLocale();
  const isKo = locale === "ko";

  useEffect(() => {
    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");

    if (!paymentKey || !orderId || !amount) {
      setStatus("error");
      setErrorMsg(isKo ? "결제 정보가 없습니다." : "Missing payment information.");
      return;
    }

    (async () => {
      try {
        const res = await fetch("/api/payment/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: Number(amount),
          }),
        });

        const data = await res.json();

        if (data.success) {
          // Pro 활성화: orderId를 라이선스 키로 사용
          saveLicenseKey(orderId);
          setStatus("success");
        } else {
          setStatus("error");
          setErrorMsg(data.message ?? (isKo ? "결제 승인에 실패했습니다." : "Payment confirmation failed."));
        }
      } catch {
        setStatus("error");
        setErrorMsg(isKo ? "서버와 통신할 수 없습니다." : "Could not connect to server.");
      }
    })();
  }, [searchParams, isKo]);

  if (status === "confirming") {
    return (
      <div className="text-center space-y-4">
        <div className="text-4xl animate-spin inline-block">⏳</div>
        <h1 className="text-xl font-semibold text-gray-900">
          {isKo ? "결제 확인 중..." : "Confirming payment..."}
        </h1>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="text-center space-y-4">
        <div className="text-6xl">❌</div>
        <h1 className="text-xl font-semibold text-gray-900">
          {isKo ? "결제 실패" : "Payment Failed"}
        </h1>
        <p className="text-gray-500">{errorMsg}</p>
        <Link
          href="/pricing"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          {isKo ? "다시 시도" : "Try Again"}
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4">
      <div className="text-6xl">🎉</div>
      <h1 className="text-xl font-semibold text-gray-900">
        {isKo ? "Pro 활성화 완료!" : "Pro Activated!"}
      </h1>
      <p className="text-gray-500">
        {isKo
          ? "모든 기능이 잠금 해제되었습니다. 감사합니다!"
          : "All features are now unlocked. Thank you!"}
      </p>
      <Link
        href="/app"
        className="inline-block bg-green-600 text-white px-8 py-3 rounded-xl text-lg font-semibold hover:bg-green-700 transition"
      >
        {isKo ? "파일 정리하러 가기" : "Start Organizing"}
      </Link>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <main className="flex-1 bg-gray-50">
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <Link href="/" className="text-lg font-bold text-gray-900">TidyFiles</Link>
        </div>
      </nav>
      <div className="max-w-lg mx-auto px-6 py-20">
        <Suspense fallback={<div className="text-center text-gray-500">Loading...</div>}>
          <SuccessContent />
        </Suspense>
      </div>
    </main>
  );
}

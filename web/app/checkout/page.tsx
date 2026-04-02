"use client";

import { useEffect, useState } from "react";
import { loadTossPayments, TossPaymentsWidgets } from "@tosspayments/tosspayments-sdk";
import Link from "next/link";
import { detectLocale, getSavedLocale } from "../lib/i18n";

const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;
const AMOUNT = 4900;
const ORDER_NAME = "SortMyFiles Pro";

export default function CheckoutPage() {
  const [widgets, setWidgets] = useState<TossPaymentsWidgets | null>(null);
  const [ready, setReady] = useState(false);
  const [orderId] = useState(() => `sortmyfiles_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);

  const locale = getSavedLocale() ?? detectLocale();
  const isKo = locale === "ko";

  useEffect(() => {
    (async () => {
      const tossPayments = await loadTossPayments(clientKey);
      const w = tossPayments.widgets({ customerKey: orderId });
      await w.setAmount({ currency: "KRW", value: AMOUNT });
      setWidgets(w);
    })();
  }, [orderId]);

  useEffect(() => {
    if (!widgets) return;

    (async () => {
      await widgets.renderPaymentMethods({
        selector: "#payment-methods",
        variantKey: "DEFAULT",
      });
      await widgets.renderAgreement({
        selector: "#agreement",
        variantKey: "AGREEMENT",
      });
      setReady(true);
    })();
  }, [widgets]);

  const handlePayment = async () => {
    if (!widgets) return;

    await widgets.requestPayment({
      orderId,
      orderName: ORDER_NAME,
      successUrl: `${window.location.origin}/checkout/success`,
      failUrl: `${window.location.origin}/pricing`,
    });
  };

  return (
    <main className="flex-1 bg-gray-50">
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-gray-900">SortMyFiles</Link>
          <Link href="/pricing" className="text-sm text-gray-500 hover:text-gray-700">
            {isKo ? "← 요금제로 돌아가기" : "← Back to Pricing"}
          </Link>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            {isKo ? "SortMyFiles Pro 결제" : "SortMyFiles Pro Checkout"}
          </h1>
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>{ORDER_NAME}</span>
            <span className="text-lg font-bold text-gray-900">
              {isKo ? `₩${AMOUNT.toLocaleString()}` : `₩${AMOUNT.toLocaleString()}`}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {isKo ? "1회 결제 · 평생 이용" : "One-time payment · Lifetime access"}
          </p>
        </div>

        {/* 토스페이먼츠 결제 위젯 */}
        <div id="payment-methods" className="mb-4" />
        <div id="agreement" className="mb-6" />

        <button
          onClick={handlePayment}
          disabled={!ready}
          className="w-full bg-blue-600 text-white py-3 rounded-xl text-lg font-semibold hover:bg-blue-700 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {ready
            ? (isKo ? `₩${AMOUNT.toLocaleString()} 결제하기` : `Pay ₩${AMOUNT.toLocaleString()}`)
            : (isKo ? "결제 준비 중..." : "Loading...")}
        </button>

        <p className="text-center text-xs text-gray-400 mt-4">
          {isKo
            ? "결제는 토스페이먼츠를 통해 안전하게 처리됩니다."
            : "Payment is securely processed via TossPayments."}
        </p>
      </div>
    </main>
  );
}

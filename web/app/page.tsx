"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  translations,
  detectLocale,
  getSavedLocale,
  saveLocale,
  LOCALES,
  type Locale,
} from "./lib/i18n";

const FEATURES = [
  { icon: "📂", titleKey: "f1Title", descKey: "f1Desc" },
  { icon: "🔍", titleKey: "f2Title", descKey: "f2Desc" },
  { icon: "↩️", titleKey: "f3Title", descKey: "f3Desc" },
  { icon: "⚡", titleKey: "f4Title", descKey: "f4Desc" },
  { icon: "🔒", titleKey: "f5Title", descKey: "f5Desc" },
  { icon: "🌍", titleKey: "f6Title", descKey: "f6Desc" },
] as const;

const LANDING: Record<string, Record<string, string>> = {
  ko: {
    hero: "지저분한 폴더,\n클릭 한 번으로 정리",
    heroSub: "다운로드, 바탕화면, 카카오톡 받은 파일 — 설치 없이 브라우저에서 바로 정리하세요.",
    cta: "무료로 시작하기",
    howTitle: "어떻게 작동하나요?",
    step1: "폴더 선택",
    step1d: "정리할 폴더를 선택하고 브라우저 접근 권한을 허용하세요.",
    step2: "미리보기 확인",
    step2d: "파일이 어떻게 분류되는지 실행 전에 미리 확인합니다.",
    step3: "정리 완료",
    step3d: "클릭 한 번으로 파일이 카테고리별 폴더로 정리됩니다.",
    featTitle: "주요 기능",
    f1Title: "스마트 파일 분류",
    f1Desc: "12개 카테고리로 자동 분류. 카카오톡, WhatsApp 등 메신저 파일도 자동 감지.",
    f2Title: "중복 파일 탐지",
    f2Desc: "동일한 파일을 찾아서 보존할 파일을 선택하고 나머지를 삭제. 용량을 확보하세요.",
    f3Title: "안전한 되돌리기",
    f3Desc: "정리 후에도 원래 상태로 복원 가능. 기록은 브라우저에 저장되어 나중에도 복원.",
    f4Title: "빠른 처리 속도",
    f4Desc: "move API로 경로만 변경하여 즉시 처리. 5개 파일 병렬 처리로 대량 파일도 빠르게.",
    f5Title: "완전한 프라이버시",
    f5Desc: "모든 처리는 브라우저에서 실행. 파일이 서버로 전송되지 않습니다.",
    f6Title: "10개 언어 지원",
    f6Desc: "한국어, English, 日本語, 中文, Español, Deutsch, Français, Português 등 지원.",
    faq: "자주 묻는 질문",
    q1: "정말 무료인가요?",
    a1: "네, 기본 파일 분류 기능은 완전히 무료입니다.",
    q2: "파일이 서버로 전송되나요?",
    a2: "아닙니다. 모든 처리는 브라우저 안에서만 이루어집니다. 파일이 외부로 나가지 않습니다.",
    q3: "어떤 브라우저에서 사용할 수 있나요?",
    a3: "Chrome과 Edge에서 사용 가능합니다. File System Access API를 지원하는 브라우저가 필요합니다.",
    q4: "파일이 손실될 수 있나요?",
    a4: "아닙니다. 파일은 복사 완료 후 원본을 삭제하므로 도중에 중단되어도 손실이 없으며, 되돌리기 기능으로 원래 상태로 복원할 수 있습니다.",
    bottomCta: "지금 바로 시작하세요",
    bottomSub: "설치도, 회원가입도 필요 없습니다.",
  },
  en: {
    hero: "Messy folders?\nOrganized in one click.",
    heroSub: "Downloads, Desktop, messenger files — sort them instantly in your browser. No install needed.",
    cta: "Start for Free",
    howTitle: "How does it work?",
    step1: "Select Folder",
    step1d: "Choose a folder and grant browser access permission.",
    step2: "Preview Changes",
    step2d: "See exactly how files will be sorted before executing.",
    step3: "Done!",
    step3d: "Files are organized into category folders with one click.",
    featTitle: "Features",
    f1Title: "Smart File Sorting",
    f1Desc: "Auto-sort into 12 categories. Detects KakaoTalk, WhatsApp, LINE, Telegram & more.",
    f2Title: "Duplicate Detection",
    f2Desc: "Find identical files, choose which to keep, and delete the rest to free up space.",
    f3Title: "Safe Undo",
    f3Desc: "Restore files to their original location anytime. History is saved in your browser.",
    f4Title: "Lightning Fast",
    f4Desc: "Uses move API for instant file moves. Processes 5 files in parallel.",
    f5Title: "Complete Privacy",
    f5Desc: "Everything runs in your browser. No files are ever uploaded to any server.",
    f6Title: "10 Languages",
    f6Desc: "Korean, English, Japanese, Chinese, Spanish, German, French, Portuguese & more.",
    faq: "FAQ",
    q1: "Is it really free?",
    a1: "Yes, the basic file sorting feature is completely free.",
    q2: "Are my files uploaded to a server?",
    a2: "No. All processing happens entirely in your browser. Your files never leave your computer.",
    q3: "Which browsers are supported?",
    a3: "Chrome and Edge are supported. The File System Access API is required.",
    q4: "Can I lose my files?",
    a4: "No. Files are copied before originals are removed. Even if interrupted, nothing is lost. You can also undo to restore everything.",
    bottomCta: "Get Started Now",
    bottomSub: "No install, no sign-up required.",
  },
};

function getLanding(locale: Locale): Record<string, string> {
  return LANDING[locale] ?? LANDING["en"];
}

export default function LandingPage() {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    const saved = getSavedLocale();
    setLocale(saved ?? detectLocale());
  }, []);

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
    saveLocale(newLocale);
  };

  const t = translations[locale];
  const l = getLanding(locale);

  return (
    <main className="flex-1 bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">TidyFiles</span>
          <div className="flex items-center gap-4">
            <select
              value={locale}
              onChange={(e) => handleLocaleChange(e.target.value as Locale)}
              className="text-xs text-gray-500 bg-transparent border border-gray-200 rounded px-2 py-1 cursor-pointer"
            >
              {LOCALES.map((loc) => (
                <option key={loc} value={loc}>{translations[loc].langName}</option>
              ))}
            </select>
            <Link
              href="/app"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              {l.cta}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight whitespace-pre-line">
          {l.hero}
        </h1>
        <p className="mt-6 text-lg text-gray-500 max-w-2xl mx-auto">
          {l.heroSub}
        </p>
        <div className="mt-8">
          <Link
            href="/app"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
          >
            {l.cta}
          </Link>
        </div>
        <p className="mt-4 text-sm text-gray-400">{l.bottomSub}</p>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">{l.howTitle}</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: "1", title: l.step1, desc: l.step1d, icon: "📁" },
              { step: "2", title: l.step2, desc: l.step2d, icon: "👀" },
              { step: "3", title: l.step3, desc: l.step3d, icon: "✅" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-4xl mb-3">{item.icon}</div>
                <div className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">{l.featTitle}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.titleKey} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{l[f.titleKey]}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{l[f.descKey]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">{l.faq}</h2>
          <div className="space-y-4">
            {(["1", "2", "3", "4"] as const).map((n) => (
              <details key={n} className="bg-white border border-gray-200 rounded-xl p-5 group">
                <summary className="font-medium text-gray-900 cursor-pointer list-none flex justify-between items-center">
                  {l[`q${n}`]}
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-3 text-sm text-gray-500 leading-relaxed">{l[`a${n}`]}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{l.bottomCta}</h2>
        <p className="text-gray-500 mb-8">{l.bottomSub}</p>
        <Link
          href="/app"
          className="inline-block bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
        >
          {l.cta}
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <span>TidyFiles — {t.footerBrowser}</span>
          <div className="flex items-center gap-4">
            <a href="https://github.com/ohjiwoong/tidyfiles" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

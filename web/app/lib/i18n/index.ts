export type { Locale, Translation } from "./types";

import { ko } from "./ko";
import { en } from "./en";
import { ja } from "./ja";
import { zh } from "./zh";
import { es } from "./es";
import { de } from "./de";
import { fr } from "./fr";
import { pt } from "./pt";
import { vi } from "./vi";
import { th } from "./th";
import type { Locale, Translation } from "./types";

export const translations: Record<Locale, Translation> = {
  ko, en, ja, zh, es, de, fr, pt, vi, th,
};

export const LOCALES: Locale[] = ["ko", "en", "ja", "zh", "es", "de", "fr", "pt", "vi", "th"];

// 브라우저 언어 자동 감지
export function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "en";

  const lang = navigator.language.toLowerCase();

  // 정확히 매칭
  for (const locale of LOCALES) {
    if (lang === locale || lang.startsWith(locale + "-")) return locale;
  }

  // zh-TW, zh-HK 등도 zh로
  if (lang.startsWith("zh")) return "zh";
  // pt-BR 등도 pt로
  if (lang.startsWith("pt")) return "pt";

  return "en"; // 기본값: 영어
}

const LOCALE_STORAGE_KEY = "sortmyfiles-locale";

export function getSavedLocale(): Locale | null {
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (saved && LOCALES.includes(saved as Locale)) return saved as Locale;
  } catch {}
  return null;
}

export function saveLocale(locale: Locale): void {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {}
}

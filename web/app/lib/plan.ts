/**
 * 무료/유료 플랜 관리
 * 서명된 라이선스 토큰을 localStorage에 저장
 * Pro 확인 시 서버에서 토큰 서명을 검증
 */

export type PlanType = "free" | "pro";

export interface PlanLimits {
  maxFiles: number;
  duplicateDelete: boolean;
  includeSubfolders: boolean;
  undoEnabled: boolean;
  monthlySort: boolean;
}

const FREE_LIMITS: PlanLimits = {
  maxFiles: 50,
  duplicateDelete: false,
  includeSubfolders: false,
  undoEnabled: false,
  monthlySort: false,
};

const PRO_LIMITS: PlanLimits = {
  maxFiles: Infinity,
  duplicateDelete: true,
  includeSubfolders: true,
  undoEnabled: true,
  monthlySort: true,
};

const LICENSE_STORAGE_KEY = "tidyfiles-license";

export function getPlanLimits(plan: PlanType): PlanLimits {
  return plan === "pro" ? PRO_LIMITS : FREE_LIMITS;
}

export function saveLicenseKey(token: string): void {
  try {
    localStorage.setItem(LICENSE_STORAGE_KEY, token);
  } catch {}
}

export function loadLicenseKey(): string | null {
  try {
    return localStorage.getItem(LICENSE_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function clearLicenseKey(): void {
  localStorage.removeItem(LICENSE_STORAGE_KEY);
}

// 서버에서 토큰 서명 검증
export async function validateLicenseKey(token: string): Promise<boolean> {
  try {
    const res = await fetch("/api/license/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    return data.valid === true;
  } catch {
    return false;
  }
}

// 서버 검증으로 현재 플랜 확인
export async function getCurrentPlan(): Promise<PlanType> {
  const token = loadLicenseKey();
  if (!token) return "free";

  const valid = await validateLicenseKey(token);
  if (!valid) {
    clearLicenseKey();
    return "free";
  }
  return "pro";
}

// 동기적 확인 (초기 렌더링용 — 토큰 존재 여부만, 이후 서버 검증으로 확정)
export function getCurrentPlanSync(): PlanType {
  return loadLicenseKey() ? "pro" : "free";
}

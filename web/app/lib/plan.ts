/**
 * 무료/유료 플랜 관리
 * 라이선스 키를 localStorage에 저장하여 Pro 기능 잠금 해제
 */

export type PlanType = "free" | "pro";

export interface PlanLimits {
  maxFiles: number;         // 정리 가능 파일 수
  duplicateDelete: boolean; // 중복 파일 삭제 가능
  includeSubfolders: boolean; // 하위 폴더 포함
  undoEnabled: boolean;     // 되돌리기 기능
  monthlySort: boolean;     // 월별 분류
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

export function saveLicenseKey(key: string): void {
  try {
    localStorage.setItem(LICENSE_STORAGE_KEY, key);
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

// Lemon Squeezy 라이선스 키 검증
export async function validateLicenseKey(key: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.lemonsqueezy.com/v1/licenses/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ license_key: key }),
    });
    const data = await res.json();
    return data.valid === true;
  } catch {
    // 오프라인이거나 API 오류 시 — 저장된 키가 있으면 신뢰
    return loadLicenseKey() === key;
  }
}

// 현재 플랜 확인
export async function getCurrentPlan(): Promise<PlanType> {
  const key = loadLicenseKey();
  if (!key) return "free";

  const valid = await validateLicenseKey(key);
  if (!valid) {
    clearLicenseKey();
    return "free";
  }
  return "pro";
}

// 동기적으로 플랜 확인 (저장된 키 존재 여부만)
export function getCurrentPlanSync(): PlanType {
  return loadLicenseKey() ? "pro" : "free";
}

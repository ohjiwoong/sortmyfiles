// 파일 분류 규칙 설정

export const CATEGORIES: Record<string, string[]> = {
  사진: [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg", ".ico", ".tiff", ".heic"],
  문서: [".pdf", ".doc", ".docx", ".hwp", ".hwpx", ".txt", ".rtf", ".odt", ".csv", ".md"],
  스프레드시트: [".xls", ".xlsx", ".ods"],
  프레젠테이션: [".ppt", ".pptx", ".odp"],
  영상: [".mp4", ".avi", ".mkv", ".mov", ".wmv", ".flv", ".webm"],
  음악: [".mp3", ".flac", ".wav", ".aac", ".ogg", ".wma", ".m4a"],
  압축파일: [".zip", ".rar", ".7z", ".tar", ".gz", ".bz2"],
  설치파일: [".exe", ".msi", ".dmg", ".deb", ".rpm"],
  코드: [".py", ".js", ".ts", ".html", ".css", ".java", ".c", ".cpp", ".cs", ".go", ".rs"],
  폰트: [".ttf", ".otf", ".woff", ".woff2"],
  디자인: [".psd", ".ai", ".sketch", ".fig", ".xd"],
  데이터: [".json", ".xml", ".yaml", ".yml", ".sql", ".db", ".sqlite"],
};

export const IGNORE_PATTERNS = [
  "desktop.ini",
  "thumbs.db",
  ".ds_store",
];

// 크롬이 "위험한 파일"로 간주하여 보안 팝업을 띄우는 확장자
// 이 확장자들은 정리 대상에서 제외하고 별도 안내
export const BROWSER_BLOCKED_EXTENSIONS = [
  // 실행 파일
  ".exe", ".msi", ".bat", ".cmd", ".com", ".scr", ".cpl", ".cab",
  // 시스템/라이브러리
  ".dll", ".drv", ".ocx", ".sys",
  // 스크립트
  ".js", ".jse", ".vbs", ".vbe", ".wsf", ".wsh", ".ps1",
  // 설정/데이터 (크롬이 경고)
  ".xml", ".cfg", ".ini", ".inf", ".reg",
  // 바로가기/링크
  ".url", ".website", ".scf", ".lnk",
  // Java
  ".class", ".jar", ".jnlp",
  // 기타
  ".swf", ".xbap", ".manifest", ".local", ".mof", ".sct", ".shb",
];

// 확장자 → 카테고리 역방향 맵 (빠른 조회용)
export const EXT_TO_CATEGORY: Record<string, string> = {};
for (const [category, extensions] of Object.entries(CATEGORIES)) {
  for (const ext of extensions) {
    EXT_TO_CATEGORY[ext] = category;
  }
}

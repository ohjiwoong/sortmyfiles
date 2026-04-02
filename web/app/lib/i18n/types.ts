export type Locale = "ko" | "en" | "ja" | "zh" | "es" | "de" | "fr" | "pt" | "vi" | "th";

export interface Translation {
  // 메타
  locale: Locale;
  langName: string; // 해당 언어로 표기한 이름

  // 헤더
  title: string;
  subtitle: string;

  // 폴더 선택
  selectFolder: string;
  selectFolderDesc: string;
  noUpload: string;
  selectFolderBtn: string;

  // 옵션
  includeSubfolders: string;
  monthlySort: string;
  findDuplicates: string;

  // 스캔
  scanning: string;
  analyzing: (done: number, total: number) => string;

  // 스캔 결과
  scanResult: string;
  totalFiles: string;
  toOrganize: string;
  categories: string;
  totalSize: string;
  selectOtherFolder: string;

  // 보기 모드
  viewList: string;
  viewTree: string;
  previewDesc: string;

  // 테이블
  fileName: string;
  currentLocation: string;
  classification: string;
  targetFolder: string;

  // 실행
  executeBtn: string;
  filesReadyCount: (n: number) => string;
  undoAvailable: string;
  organizing: string;
  undoing: string;
  processed: (done: number, total: number) => string;

  // 완료
  done: string;
  successCount: (n: number) => string;
  failCount: (n: number) => string;
  undoBtn: string;
  organizeAnother: string;
  undoSaved: string;

  // 되돌리기 기록
  previousRecord: string;
  previousRecordDesc: (folder: string, count: number) => string;
  deleteRecord: string;

  // 중복 파일
  duplicateResult: string;
  noDuplicates: string;
  selectToKeep: string;
  group: (n: number) => string;
  identicalFiles: (n: number) => string;
  keep: string;
  remove: string;
  deleteSelected: string;
  toDeleteCount: (n: number, size: string) => string;
  confirmDelete: (n: number, size: string) => string;
  deletingDuplicates: string;
  duplicatesDone: string;
  deletedCount: (n: number) => string;
  freedSpace: (size: string) => string;
  backToStart: string;
  goBack: string;

  // 정리 안 됨
  alreadyOrganized: string;

  // 하단 안내
  footerBrowser: string;
  footerMove: string;
  footerSafe: string;
  footerUndo: string;
  footerSupport: string;

  // 카테고리명
  cat: Record<string, string>;
}

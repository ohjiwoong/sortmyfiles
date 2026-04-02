"""
파일 정리 핵심 엔진
- 1단계: 확장자 기반 분류
- 2단계: 파일명 패턴 분석, 중복 탐지, 날짜별 정리
"""

import os
import shutil
import hashlib
import re
from datetime import datetime
from collections import defaultdict
from config import CATEGORIES, IGNORE_PATTERNS


def get_category(filename: str) -> str:
    """확장자를 기반으로 파일 카테고리를 반환한다."""
    ext = os.path.splitext(filename)[1].lower()
    for category, extensions in CATEGORIES.items():
        if ext in extensions:
            return category
    return "기타"


def should_ignore(filename: str) -> bool:
    """무시해야 할 파일인지 확인한다."""
    return filename.lower() in [p.lower() for p in IGNORE_PATTERNS]


def scan_folder(folder_path: str) -> list[dict]:
    """
    폴더를 스캔하여 파일 정보 리스트를 반환한다.
    하위 폴더는 스캔하지 않는다 (1단계에서는 단일 폴더만).
    """
    files = []
    if not os.path.isdir(folder_path):
        return files

    for filename in os.listdir(folder_path):
        filepath = os.path.join(folder_path, filename)

        # 폴더는 건너뛰기
        if os.path.isdir(filepath):
            continue

        # 무시할 파일 건너뛰기
        if should_ignore(filename):
            continue

        stat = os.stat(filepath)
        files.append({
            "filename": filename,
            "filepath": filepath,
            "extension": os.path.splitext(filename)[1].lower(),
            "category": get_category(filename),
            "size": stat.st_size,
            "modified": datetime.fromtimestamp(stat.st_mtime),
            "created": datetime.fromtimestamp(stat.st_ctime),
        })

    return files


# =============================================================
# 2단계: 파일명 패턴 분석
# =============================================================

# 카카오톡 파일 패턴: KakaoTalk_20240315_내용.ext
KAKAO_PATTERN = re.compile(r"KakaoTalk_(\d{8})_?(.*)")

# 스크린샷 패턴
SCREENSHOT_PATTERNS = [
    re.compile(r"Screenshot[_ ](\d{4}[-_]\d{2}[-_]\d{2})", re.IGNORECASE),
    re.compile(r"스크린샷[_ ](\d{4}[-_]\d{2}[-_]\d{2})", re.IGNORECASE),
    re.compile(r"Capture[_ ](\d{4}[-_]\d{2}[-_]\d{2})", re.IGNORECASE),
]

# 날짜 패턴 (파일명에서 날짜 추출)
DATE_PATTERNS = [
    re.compile(r"(\d{4})[-_]?(\d{2})[-_]?(\d{2})"),
]


def analyze_filename(filename: str) -> dict:
    """파일명을 분석하여 추가 메타데이터를 추출한다."""
    info = {"source": None, "date_from_name": None, "subcategory": None}

    # 카카오톡 파일 감지
    match = KAKAO_PATTERN.match(filename)
    if match:
        info["source"] = "카카오톡"
        date_str = match.group(1)
        try:
            info["date_from_name"] = datetime.strptime(date_str, "%Y%m%d")
        except ValueError:
            pass
        return info

    # 스크린샷 감지
    for pattern in SCREENSHOT_PATTERNS:
        match = pattern.search(filename)
        if match:
            info["subcategory"] = "스크린샷"
            break

    # 날짜 추출
    for pattern in DATE_PATTERNS:
        match = pattern.search(filename)
        if match:
            try:
                year, month, day = int(match.group(1)), int(match.group(2)), int(match.group(3))
                if 2000 <= year <= 2099 and 1 <= month <= 12 and 1 <= day <= 31:
                    info["date_from_name"] = datetime(year, month, day)
                    break
            except (ValueError, IndexError):
                pass

    return info


# =============================================================
# 2단계: 중복 파일 탐지
# =============================================================

def get_file_hash(filepath: str, chunk_size: int = 8192) -> str:
    """파일의 MD5 해시를 반환한다."""
    hasher = hashlib.md5()
    with open(filepath, "rb") as f:
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                break
            hasher.update(chunk)
    return hasher.hexdigest()


def find_duplicates(files: list[dict]) -> dict[str, list[dict]]:
    """
    중복 파일을 탐지한다.
    먼저 파일 크기로 후보를 줄이고, 해시로 최종 확인한다.
    """
    # 크기별 그룹핑
    size_groups = defaultdict(list)
    for f in files:
        size_groups[f["size"]].append(f)

    # 같은 크기 파일만 해시 비교
    duplicates = defaultdict(list)
    for size, group in size_groups.items():
        if len(group) < 2:
            continue
        for f in group:
            file_hash = get_file_hash(f["filepath"])
            duplicates[file_hash].append(f)

    # 실제 중복만 필터링 (2개 이상)
    return {h: files for h, files in duplicates.items() if len(files) >= 2}


# =============================================================
# 정리 계획 생성 및 실행
# =============================================================

def generate_plan(files: list[dict], target_base: str, use_date_folders: bool = False) -> list[dict]:
    """
    파일 정리 계획을 생성한다. 실제 이동은 하지 않는다.
    각 항목: {source, destination, category, reason}
    """
    plan = []

    for f in files:
        # 파일명 분석
        name_info = analyze_filename(f["filename"])

        # 카테고리 결정
        category = f["category"]
        if name_info["subcategory"]:
            category = os.path.join(category, name_info["subcategory"])

        # 대상 폴더 결정
        dest_folder = os.path.join(target_base, category)

        # 날짜 폴더 옵션
        if use_date_folders:
            date = name_info["date_from_name"] or f["modified"]
            date_folder = date.strftime("%Y-%m")
            dest_folder = os.path.join(dest_folder, date_folder)

        dest_path = os.path.join(dest_folder, f["filename"])

        # 같은 위치면 건너뛰기
        if os.path.normpath(f["filepath"]) == os.path.normpath(dest_path):
            continue

        # 파일명 충돌 처리
        dest_path = resolve_conflict(dest_path)

        reason = f"확장자 [{f['extension']}] → {category}"
        if name_info["source"]:
            reason = f"{name_info['source']} 파일 → {category}"

        plan.append({
            "source": f["filepath"],
            "destination": dest_path,
            "category": category,
            "reason": reason,
            "size": f["size"],
        })

    return plan


def resolve_conflict(dest_path: str) -> str:
    """파일명 충돌 시 번호를 붙여 해결한다."""
    if not os.path.exists(dest_path):
        return dest_path

    base, ext = os.path.splitext(dest_path)
    counter = 1
    while os.path.exists(f"{base} ({counter}){ext}"):
        counter += 1
    return f"{base} ({counter}){ext}"


def execute_plan(plan: list[dict], dry_run: bool = False) -> list[dict]:
    """
    정리 계획을 실행한다.
    dry_run=True이면 실제 이동 없이 결과만 반환한다.
    """
    results = []

    for item in plan:
        try:
            if not dry_run:
                os.makedirs(os.path.dirname(item["destination"]), exist_ok=True)
                shutil.move(item["source"], item["destination"])

            results.append({
                **item,
                "status": "success",
            })
        except Exception as e:
            results.append({
                **item,
                "status": "error",
                "error": str(e),
            })

    return results

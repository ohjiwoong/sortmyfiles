# 파일 분류 규칙 설정

# 확장자별 카테고리 매핑
CATEGORIES = {
    "사진": [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg", ".ico", ".tiff", ".heic"],
    "문서": [".pdf", ".doc", ".docx", ".hwp", ".hwpx", ".txt", ".rtf", ".odt", ".csv", ".md"],
    "스프레드시트": [".xls", ".xlsx", ".ods"],
    "프레젠테이션": [".ppt", ".pptx", ".odp"],
    "영상": [".mp4", ".avi", ".mkv", ".mov", ".wmv", ".flv", ".webm"],
    "음악": [".mp3", ".flac", ".wav", ".aac", ".ogg", ".wma", ".m4a"],
    "압축파일": [".zip", ".rar", ".7z", ".tar", ".gz", ".bz2"],
    "설치파일": [".exe", ".msi", ".dmg", ".deb", ".rpm"],
    "코드": [".py", ".js", ".ts", ".html", ".css", ".java", ".c", ".cpp", ".cs", ".go", ".rs"],
    "폰트": [".ttf", ".otf", ".woff", ".woff2"],
    "디자인": [".psd", ".ai", ".sketch", ".fig", ".xd"],
    "데이터": [".json", ".xml", ".yaml", ".yml", ".sql", ".db", ".sqlite"],
}

# 알려진 폴더 경로 (Windows 기준)
import os

USER_HOME = os.path.expanduser("~")

KNOWN_FOLDERS = {
    "다운로드": os.path.join(USER_HOME, "Downloads"),
    "바탕화면": os.path.join(USER_HOME, "Desktop"),
    "문서": os.path.join(USER_HOME, "Documents"),
    "카카오톡": os.path.join(USER_HOME, "Documents", "카카오톡 받은 파일"),
}

# 무시할 파일/폴더
IGNORE_PATTERNS = [
    "desktop.ini",
    "thumbs.db",
    ".DS_Store",
]

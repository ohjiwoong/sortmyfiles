"""
파일 정리 도우미 - GUI 애플리케이션
tkinter 기반 포터블 앱
"""

import os
import sys
import tkinter as tk
from tkinter import ttk, filedialog, messagebox
from threading import Thread

from config import KNOWN_FOLDERS
from organizer import scan_folder, generate_plan, execute_plan, find_duplicates, analyze_filename


class FileCleanerApp:
    def __init__(self, root: tk.Tk):
        self.root = root
        self.root.title("파일 정리 도우미")
        self.root.geometry("800x600")
        self.root.minsize(700, 500)

        # 상태
        self.current_plan = []
        self.scanned_files = []

        self._build_ui()

    def _build_ui(self):
        """UI 구성"""
        # 상단: 폴더 선택
        top_frame = ttk.LabelFrame(self.root, text="정리할 폴더 선택", padding=10)
        top_frame.pack(fill="x", padx=10, pady=(10, 5))

        # 빠른 선택 버튼
        btn_frame = ttk.Frame(top_frame)
        btn_frame.pack(fill="x", pady=(0, 5))

        for name, path in KNOWN_FOLDERS.items():
            exists = os.path.isdir(path)
            btn = ttk.Button(
                btn_frame,
                text=name,
                command=lambda p=path: self._select_folder(p),
                state="normal" if exists else "disabled",
            )
            btn.pack(side="left", padx=2)

        # 직접 선택
        folder_frame = ttk.Frame(top_frame)
        folder_frame.pack(fill="x")

        self.folder_var = tk.StringVar()
        self.folder_entry = ttk.Entry(folder_frame, textvariable=self.folder_var)
        self.folder_entry.pack(side="left", fill="x", expand=True, padx=(0, 5))

        ttk.Button(folder_frame, text="찾아보기...", command=self._browse_folder).pack(side="left")

        # 옵션
        opt_frame = ttk.LabelFrame(self.root, text="옵션", padding=10)
        opt_frame.pack(fill="x", padx=10, pady=5)

        self.date_folder_var = tk.BooleanVar(value=False)
        ttk.Checkbutton(opt_frame, text="날짜별 하위 폴더 생성 (예: 2024-03)", variable=self.date_folder_var).pack(anchor="w")

        self.in_place_var = tk.BooleanVar(value=True)
        ttk.Checkbutton(opt_frame, text="같은 폴더 안에서 정리 (해제 시 별도 위치 선택)", variable=self.in_place_var).pack(anchor="w")

        # 스캔 버튼
        scan_frame = ttk.Frame(self.root)
        scan_frame.pack(fill="x", padx=10, pady=5)

        ttk.Button(scan_frame, text="📋 스캔하기", command=self._scan).pack(side="left", padx=2)
        ttk.Button(scan_frame, text="🔍 중복 파일 찾기", command=self._find_duplicates).pack(side="left", padx=2)
        self.execute_btn = ttk.Button(scan_frame, text="✅ 정리 실행", command=self._execute, state="disabled")
        self.execute_btn.pack(side="right", padx=2)

        # 결과 표시
        result_frame = ttk.LabelFrame(self.root, text="미리보기", padding=10)
        result_frame.pack(fill="both", expand=True, padx=10, pady=(5, 10))

        # 트리뷰
        columns = ("파일명", "분류", "이동 경로")
        self.tree = ttk.Treeview(result_frame, columns=columns, show="headings", selectmode="extended")
        self.tree.heading("파일명", text="파일명")
        self.tree.heading("분류", text="분류")
        self.tree.heading("이동 경로", text="이동 경로")
        self.tree.column("파일명", width=250)
        self.tree.column("분류", width=100)
        self.tree.column("이동 경로", width=350)

        scrollbar = ttk.Scrollbar(result_frame, orient="vertical", command=self.tree.yview)
        self.tree.configure(yscrollcommand=scrollbar.set)

        self.tree.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

        # 하단 상태바
        self.status_var = tk.StringVar(value="폴더를 선택하고 스캔해주세요.")
        status_bar = ttk.Label(self.root, textvariable=self.status_var, relief="sunken", anchor="w", padding=5)
        status_bar.pack(fill="x", side="bottom")

    def _select_folder(self, path: str):
        """빠른 선택 버튼으로 폴더 지정"""
        self.folder_var.set(path)

    def _browse_folder(self):
        """폴더 찾아보기 다이얼로그"""
        folder = filedialog.askdirectory(title="정리할 폴더를 선택하세요")
        if folder:
            self.folder_var.set(folder)

    def _scan(self):
        """선택한 폴더 스캔"""
        folder = self.folder_var.get().strip()
        if not folder or not os.path.isdir(folder):
            messagebox.showwarning("경고", "올바른 폴더를 선택해주세요.")
            return

        self.status_var.set("스캔 중...")
        self.tree.delete(*self.tree.get_children())

        def do_scan():
            self.scanned_files = scan_folder(folder)

            # 정리 대상 폴더 결정
            if self.in_place_var.get():
                target = folder
            else:
                target = filedialog.askdirectory(title="정리 결과를 저장할 폴더를 선택하세요")
                if not target:
                    target = folder

            self.current_plan = generate_plan(
                self.scanned_files,
                target_base=target,
                use_date_folders=self.date_folder_var.get(),
            )

            # UI 업데이트는 메인 스레드에서
            self.root.after(0, self._update_tree)

        Thread(target=do_scan, daemon=True).start()

    def _update_tree(self):
        """트리뷰 업데이트"""
        self.tree.delete(*self.tree.get_children())

        for item in self.current_plan:
            self.tree.insert("", "end", values=(
                os.path.basename(item["source"]),
                item["category"],
                item["destination"],
            ))

        count = len(self.current_plan)
        total = len(self.scanned_files)
        self.status_var.set(f"스캔 완료: 전체 {total}개 파일 중 {count}개 파일 정리 예정")

        if count > 0:
            self.execute_btn.config(state="normal")
        else:
            self.execute_btn.config(state="disabled")
            self.status_var.set(f"전체 {total}개 파일 — 이미 정리되어 있거나 정리할 파일이 없습니다.")

    def _find_duplicates(self):
        """중복 파일 탐지"""
        folder = self.folder_var.get().strip()
        if not folder or not os.path.isdir(folder):
            messagebox.showwarning("경고", "먼저 폴더를 선택해주세요.")
            return

        self.status_var.set("중복 파일 검색 중...")
        self.tree.delete(*self.tree.get_children())

        def do_find():
            files = scan_folder(folder)
            duplicates = find_duplicates(files)

            self.root.after(0, lambda: self._show_duplicates(duplicates))

        Thread(target=do_find, daemon=True).start()

    def _show_duplicates(self, duplicates: dict):
        """중복 파일 결과 표시"""
        self.tree.delete(*self.tree.get_children())
        self.execute_btn.config(state="disabled")

        total_dupes = 0
        for file_hash, files in duplicates.items():
            total_dupes += len(files) - 1  # 원본 제외
            for i, f in enumerate(files):
                label = "원본" if i == 0 else "중복"
                size_mb = f["size"] / (1024 * 1024)
                self.tree.insert("", "end", values=(
                    f["filename"],
                    label,
                    f"({size_mb:.1f} MB) {f['filepath']}",
                ))

        if total_dupes == 0:
            self.status_var.set("중복 파일이 없습니다.")
        else:
            self.status_var.set(f"중복 파일 {total_dupes}개 발견 (총 {len(duplicates)}개 그룹)")

    def _execute(self):
        """정리 실행"""
        if not self.current_plan:
            return

        count = len(self.current_plan)
        confirm = messagebox.askyesno(
            "확인",
            f"{count}개 파일을 정리합니다.\n\n계속하시겠습니까?"
        )
        if not confirm:
            return

        self.status_var.set("정리 중...")
        self.execute_btn.config(state="disabled")

        def do_execute():
            results = execute_plan(self.current_plan)
            success = sum(1 for r in results if r["status"] == "success")
            errors = sum(1 for r in results if r["status"] == "error")

            self.root.after(0, lambda: self._on_complete(success, errors))

        Thread(target=do_execute, daemon=True).start()

    def _on_complete(self, success: int, errors: int):
        """정리 완료 처리"""
        self.current_plan = []
        self.tree.delete(*self.tree.get_children())

        msg = f"정리 완료! 성공: {success}개"
        if errors > 0:
            msg += f", 실패: {errors}개"

        self.status_var.set(msg)
        messagebox.showinfo("완료", msg)


def main():
    root = tk.Tk()
    app = FileCleanerApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()

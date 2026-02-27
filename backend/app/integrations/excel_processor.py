"""
Excel Processor – 엑셀 자동 처리 (Pandas)

config example:
{
    "file_path": "/app/uploads/xxx.xlsx",
    "operations": ["dropna", "summary"],    # 수행할 작업
    "output_path": "/app/uploads/result_xxx.xlsx"
}

operations:
  - dropna      : 빈 행 제거
  - summary     : 기초 통계 요약
  - dedup       : 중복 제거
  - sort        : 첫 번째 컬럼 기준 정렬
"""
import pandas as pd
from typing import List, Dict, Any
import os


def run_excel_process(config: dict, log_lines: List[str]) -> dict:
    file_path = config.get("file_path", "")
    operations = config.get("operations", ["summary"])
    output_path = config.get("output_path", "")

    if not file_path or not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    log_lines.append(f"[시작] 파일: {file_path}")

    # Read excel
    df = pd.read_excel(file_path)
    log_lines.append(f"[읽기] {len(df)}행 x {len(df.columns)}열")

    summary_data = {}

    for op in operations:
        if op == "dropna":
            before = len(df)
            df = df.dropna()
            log_lines.append(f"[dropna] {before - len(df)}행 제거 → {len(df)}행")

        elif op == "dedup":
            before = len(df)
            df = df.drop_duplicates()
            log_lines.append(f"[dedup] {before - len(df)}행 제거 → {len(df)}행")

        elif op == "sort":
            first_col = df.columns[0]
            df = df.sort_values(by=first_col)
            log_lines.append(f"[sort] '{first_col}' 기준 정렬 완료")

        elif op == "summary":
            desc = df.describe(include="all").to_dict()
            summary_data = {col: {k: str(v) for k, v in stats.items()} for col, stats in desc.items()}
            log_lines.append(f"[summary] 통계 요약 생성 완료")

    # Save result
    if not output_path:
        base, ext = os.path.splitext(file_path)
        output_path = f"{base}_result{ext}"

    df.to_excel(output_path, index=False)
    log_lines.append(f"[저장] 결과 파일: {output_path}")

    return {
        "rows": len(df),
        "columns": list(df.columns),
        "output_path": output_path,
        "summary": summary_data,
    }

"""
Playwright Runner – 웹사이트 데이터 수집 (Web Scraping)

config example:
{
    "url": "https://example.com",
    "selector": "table",          # CSS selector to extract
    "wait_for": "table",          # optional: wait for this selector
    "extract": "text"             # "text" | "html" | "table"
}
"""
from playwright.sync_api import sync_playwright
from typing import List, Dict, Any
import json


def run_web_scrape(config: dict, log_lines: List[str]) -> dict:
    url = config.get("url", "")
    selector = config.get("selector", "body")
    wait_for = config.get("wait_for", selector)
    extract_mode = config.get("extract", "text")

    if not url:
        raise ValueError("config.url is required")

    log_lines.append(f"[시작] URL: {url}")
    log_lines.append(f"[설정] selector={selector}, extract={extract_mode}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url, timeout=30000)
        log_lines.append("[브라우저] 페이지 로딩 완료")

        if wait_for:
            page.wait_for_selector(wait_for, timeout=15000)
            log_lines.append(f"[대기] '{wait_for}' 요소 로딩 완료")

        if extract_mode == "html":
            elements = page.query_selector_all(selector)
            data = [el.inner_html() for el in elements]
        elif extract_mode == "table":
            # Extract table data as list of dicts
            data = _extract_table(page, selector)
        else:
            elements = page.query_selector_all(selector)
            data = [el.inner_text() for el in elements]

        log_lines.append(f"[결과] {len(data)}건 수집 완료")
        browser.close()

    return {"count": len(data), "data": data}


def _extract_table(page, selector: str) -> List[Dict[str, str]]:
    """Extract HTML table into list of dicts (header → value)."""
    headers = page.eval_on_selector_all(
        f"{selector} thead th",
        "els => els.map(e => e.innerText.trim())",
    )
    rows = page.eval_on_selector_all(
        f"{selector} tbody tr",
        """rows => rows.map(row => {
            const cells = row.querySelectorAll('td');
            return Array.from(cells).map(c => c.innerText.trim());
        })""",
    )
    if not headers:
        return [{"row": r} for r in rows]
    return [dict(zip(headers, row)) for row in rows]

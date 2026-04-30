#!/usr/bin/env python3
"""Inject SEO meta tags into the Claude-vs-Codex 2026 showcase HTML."""
import re
from pathlib import Path

DECK_DIR = Path(__file__).parent
BASE_URL = "https://pyf-labrary.github.io/marginalia/showcases/claude-vs-codex-2026"
DECK_BLURB = (
    "Claude 与 OpenAI Codex 2026 年订阅计划深度对比——价格、用量限制、Token/配额机制、"
    "功能特性、性能基准与选择建议，单页幻灯版。"
)

TITLE_RE = re.compile(r"<title>([^<]+)</title>")
EXISTING_SEO_RE = re.compile(r'<link rel="canonical"|<meta property="og:title"', re.I)


def build_block(title: str, canonical_url: str) -> str:
    desc = DECK_BLURB
    title_attr = title.replace('"', "&quot;")
    desc_attr = desc.replace('"', "&quot;")
    return (
        f'<meta name="description" content="{desc_attr}">\n'
        f'<link rel="canonical" href="{canonical_url}">\n'
        f'<meta property="og:title" content="{title_attr}">\n'
        f'<meta property="og:description" content="{desc_attr}">\n'
        f'<meta property="og:type" content="article">\n'
        f'<meta property="og:url" content="{canonical_url}">\n'
        f'<meta property="og:site_name" content="Marginalia">\n'
        f'<meta property="og:locale" content="zh_CN">\n'
        f'<meta name="twitter:card" content="summary">\n'
        f'<meta name="twitter:title" content="{title_attr}">\n'
        f'<meta name="twitter:description" content="{desc_attr}">\n'
    )


def process(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    if EXISTING_SEO_RE.search(text):
        return False
    m = TITLE_RE.search(text)
    if not m:
        return False
    title = m.group(1).strip()
    canonical = BASE_URL + "/" if path.name == "index.html" else f"{BASE_URL}/{path.name}"
    block = build_block(title, canonical)
    path.write_text(text.replace(m.group(0), m.group(0) + "\n" + block, 1), encoding="utf-8")
    return True


def main():
    for f in sorted(DECK_DIR.glob("*.html")):
        status = "injected" if process(f) else "skipped"
        print(f"  {status}: {f.name}")


if __name__ == "__main__":
    main()

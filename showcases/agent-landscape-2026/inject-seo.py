#!/usr/bin/env python3
"""Inject SEO meta tags into the AI Agent Landscape 2026 showcase HTML."""
import re
from pathlib import Path

DECK_DIR = Path(__file__).parent
BASE_URL = "https://pyf-labrary.github.io/marginalia/showcases/agent-landscape-2026"
DECK_BLURB = (
    "中外 28 款主流 AI agent 软件按 5 条产品线深度对比："
    "终端 CLI（Claude Code / Codex CLI / Qwen Code / Aider / OpenCode）、"
    "IDE 插件（Cursor / Windsurf / Cline / Copilot / 通义灵码 / CodeBuddy / 文心快码 / CodeGeeX）、"
    "桌面通用（Claude Desktop / ChatGPT / Kimi / 豆包 / OpenClaw / QClaw）、"
    "云端自主 agent（Devin / Manus / OpenHands / Replit Agent / Hermes）、"
    "Agent 搭建平台（Coze / Dify）。模型、定价、用量、适合场景与购买建议一份就够。"
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

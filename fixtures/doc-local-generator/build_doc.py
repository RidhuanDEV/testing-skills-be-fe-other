#!/usr/bin/env python3
"""Existing project-local HTML document generator for fixtures/doc-local-generator."""

from __future__ import annotations

import html
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "docs" / "proposal.md"
OUT = ROOT / "dist" / "proposal.html"


def build() -> Path:
    markdown_text = SRC.read_text(encoding="utf-8")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    rendered = (
        "<!doctype html>\n"
        "<html lang=\"en\">\n"
        "<head><meta charset=\"utf-8\" /><title>UAT Delivery Proposal</title></head>\n"
        "<body><main><pre>"
        + html.escape(markdown_text)
        + "</pre></main></body>\n</html>\n"
    )
    OUT.write_text(rendered, encoding="utf-8")
    return OUT


if __name__ == "__main__":
    out_path = build()
    print(f"Generated {out_path}")

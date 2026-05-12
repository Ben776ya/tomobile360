"""Render the first page of a magazine PDF to a JPG cover.

Usage (from the project root):
    python scripts/extract-magazine-cover.py <input.pdf> <output.jpg> [--scale N]

The default scale of 1.5 produces ~900x1270 px from an A4 page, weighing
~150-300 KB at JPG quality 85 — appropriate for the homepage banner cover
displayed at max-w-[130px] with object-cover.

Dependencies: pymupdf (pure pip, no native compile). Install with:
    python -m pip install --user pymupdf
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import fitz  # PyMuPDF — module name stays `fitz` for backwards compat.


def render_cover(pdf_path: Path, output_path: Path, scale: float, quality: int) -> None:
    if not pdf_path.is_file():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    output_path.parent.mkdir(parents=True, exist_ok=True)

    with fitz.open(pdf_path) as doc:
        if doc.page_count == 0:
            raise ValueError(f"PDF has no pages: {pdf_path}")
        page = doc[0]
        matrix = fitz.Matrix(scale, scale)
        pixmap = page.get_pixmap(matrix=matrix, alpha=False)
        pixmap.save(str(output_path), jpg_quality=quality)

    size_kb = output_path.stat().st_size / 1024
    print(f"Wrote {output_path} ({pixmap.width}x{pixmap.height} px, {size_kb:.0f} KB)")


def main() -> int:
    parser = argparse.ArgumentParser(description="Render the first page of a PDF to a JPG cover.")
    parser.add_argument("pdf", type=Path, help="Source PDF path")
    parser.add_argument("output", type=Path, help="Destination JPG path")
    parser.add_argument(
        "--scale",
        type=float,
        default=1.5,
        help="Render scale (1.0 = 72 DPI, 1.5 = 108 DPI, 2.0 = 144 DPI). Default: 1.5.",
    )
    parser.add_argument(
        "--quality",
        type=int,
        default=85,
        help="JPG quality 1-95. Default: 85.",
    )
    args = parser.parse_args()

    try:
        render_cover(args.pdf, args.output, args.scale, args.quality)
    except (FileNotFoundError, ValueError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())

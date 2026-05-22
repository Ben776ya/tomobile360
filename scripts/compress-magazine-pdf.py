"""Compress a large magazine PDF for web delivery by rasterizing each page
to a JPEG at a moderate DPI, then assembling a new PDF.

Usage:
    python scripts/compress-magazine-pdf.py <input.pdf> <output.pdf> [--dpi N] [--quality Q]

Default: 150 DPI, JPEG quality 78 — yields ~0.4-0.8 MB per page for A4 magazine
content. A 126-page magazine compresses from ~445 MB to ~60-100 MB.

This is lossy: vector graphics and selectable text are flattened to images.
For a print magazine intended to be read visually, this is the right trade-off.

Dependencies: pymupdf, Pillow (both pip).
"""

from __future__ import annotations

import argparse
import io
import sys
from pathlib import Path

import fitz  # PyMuPDF
from PIL import Image


def compress(pdf_in: Path, pdf_out: Path, dpi: int, quality: int) -> None:
    if not pdf_in.is_file():
        raise FileNotFoundError(f"Input not found: {pdf_in}")

    pdf_out.parent.mkdir(parents=True, exist_ok=True)

    src = fitz.open(pdf_in)
    dst = fitz.open()

    scale = dpi / 72.0
    matrix = fitz.Matrix(scale, scale)

    total_pages = src.page_count
    for i in range(total_pages):
        page = src[i]
        pix = page.get_pixmap(matrix=matrix, alpha=False)
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=quality, optimize=True, progressive=True)
        buf.seek(0)

        # Insert a new page sized to match the original (in PDF points)
        new_page = dst.new_page(width=page.rect.width, height=page.rect.height)
        new_page.insert_image(new_page.rect, stream=buf.getvalue())

        if (i + 1) % 10 == 0 or i + 1 == total_pages:
            print(f"  rasterized page {i + 1}/{total_pages}")

    dst.save(
        pdf_out,
        garbage=4,
        deflate=True,
        clean=True,
    )
    dst.close()
    src.close()

    size_mb = pdf_out.stat().st_size / (1024 * 1024)
    print(f"Wrote {pdf_out} ({size_mb:.1f} MB, {total_pages} pages)")


def main() -> int:
    parser = argparse.ArgumentParser(description="Compress a PDF by rasterizing pages.")
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--dpi", type=int, default=150)
    parser.add_argument("--quality", type=int, default=78)
    args = parser.parse_args()

    try:
        compress(args.input, args.output, args.dpi, args.quality)
    except FileNotFoundError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())

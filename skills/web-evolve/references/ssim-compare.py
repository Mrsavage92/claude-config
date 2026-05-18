#!/usr/bin/env python3
"""Compute a similarity score between two screenshots for per-iter VOID detection.

Used by per-iter-gates.sh. Returns a 0.0–1.0 similarity number on stdout.
1.0 = identical, 0.0 = completely different. Threshold > 0.985 → VOID (invisible diff).

This is not literal SSIM (requires scipy). It is a perceptual proxy:
1. Open both images, resize to 256x256 grayscale.
2. Compute mean structural similarity via 8x8 block luminance + standard deviation comparison.
3. Combine into a single 0.0–1.0 score using SSIM's structure formula on coarse blocks.

Usage: python3 ssim-compare.py <before.png> <after.png>
Exit 0 with similarity on stdout. Exit 1 on file/PIL error.
"""
import sys
import math
import warnings
from pathlib import Path

warnings.filterwarnings('ignore', category=DeprecationWarning)

try:
    from PIL import Image
except ImportError:
    print('SSIM_COMPARE_FAIL: PIL not installed', file=sys.stderr)
    sys.exit(1)


def to_blocks(img, n=8):
    """Return list of (mean, variance) per n×n grid cell of a 256×256 grayscale image."""
    cell = img.size[0] // n
    blocks = []
    for j in range(n):
        for i in range(n):
            crop = img.crop((i * cell, j * cell, (i + 1) * cell, (j + 1) * cell))
            pixels = list(crop.getdata())
            mean = sum(pixels) / len(pixels)
            var = sum((p - mean) ** 2 for p in pixels) / len(pixels)
            blocks.append((mean, var))
    return blocks


def ssim_block(b1, b2):
    """Single-block SSIM-like score. Constants per SSIM standard."""
    m1, v1 = b1
    m2, v2 = b2
    c1 = (0.01 * 255) ** 2
    c2 = (0.03 * 255) ** 2
    # Estimate covariance from variances (approximation — no joint pixel data here)
    # For identical blocks, m1==m2 and v1==v2 → score 1.0
    cov = math.sqrt(v1 * v2)
    luminance = (2 * m1 * m2 + c1) / (m1 ** 2 + m2 ** 2 + c1)
    contrast = (2 * cov + c2) / (v1 + v2 + c2)
    return luminance * contrast


def compare(p1, p2):
    img1 = Image.open(p1).convert('L').resize((256, 256))
    img2 = Image.open(p2).convert('L').resize((256, 256))
    blocks1 = to_blocks(img1)
    blocks2 = to_blocks(img2)
    scores = [ssim_block(b1, b2) for b1, b2 in zip(blocks1, blocks2)]
    return sum(scores) / len(scores)


if __name__ == '__main__':
    if len(sys.argv) != 3:
        print('USAGE: ssim-compare.py <before.png> <after.png>', file=sys.stderr)
        sys.exit(2)
    p1, p2 = Path(sys.argv[1]), Path(sys.argv[2])
    if not p1.is_file() or not p2.is_file():
        print(f'SSIM_COMPARE_FAIL: missing file {p1 if not p1.is_file() else p2}', file=sys.stderr)
        sys.exit(1)
    try:
        score = compare(p1, p2)
        # Clamp to [0.0, 1.0] (the SSIM-approximation can drift slightly outside)
        score = max(0.0, min(1.0, score))
        print(f'{score:.6f}')
        sys.exit(0)
    except Exception as e:
        print(f'SSIM_COMPARE_FAIL: {e}', file=sys.stderr)
        sys.exit(1)

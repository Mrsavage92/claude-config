#!/usr/bin/env python3
"""
AuditHQ Suite PDF Generator
Generates individual PDFs per suite. Full combined PDF only with --full flag.

Usage:
    python generate_suite_pdfs.py <directory> [suite_numbers...] [--full]

Suite numbers:
    1 = Marketing
    2 = Technical
    3 = GEO
    4 = Security
    5 = Privacy
    6 = Reputation
    7 = Employer Brand
    8 = AI Readiness

Examples:
    python generate_suite_pdfs.py "./outputs/example.com"                 # all 8 individual PDFs
    python generate_suite_pdfs.py "./outputs/example.com" 1 3 4 5        # 4 individual PDFs
    python generate_suite_pdfs.py "./outputs/example.com" --full          # 1 combined full audit PDF
    python generate_suite_pdfs.py "./outputs/example.com" 1 3 4 --full   # 1 combined 3-suite PDF
"""
import sys, os, re

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from audit_pdf_engine import generate

SUITE_MAP = {
    1: "Marketing",
    2: "Technical",
    3: "GEO",
    4: "Security",
    5: "Privacy",
    6: "Reputation",
    7: "Employer Brand",
    8: "AI Readiness",
}

SUITE_SLUG = {
    "Marketing":      "1-MARKETING",
    "Technical":      "2-TECHNICAL",
    "GEO":            "3-GEO",
    "Security":       "4-SECURITY",
    "Privacy":        "5-PRIVACY",
    "Reputation":     "6-REPUTATION",
    "Employer Brand": "7-EMPLOYER",
    "AI Readiness":   "8-AI-READINESS",
}


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    directory = sys.argv[1]
    if not os.path.isdir(directory):
        print(f"Error: directory not found: {directory}")
        sys.exit(1)

    # Parse arguments: suite numbers and optional --full flag
    full_mode = False
    nums = []
    for arg in sys.argv[2:]:
        if arg == "--full":
            full_mode = True
            continue
        try:
            n = int(arg)
            if n in SUITE_MAP:
                nums.append(n)
            else:
                print(f"Warning: suite number {n} out of range (1-8), skipping")
        except ValueError:
            print(f"Warning: '{arg}' is not a valid suite number, skipping")

    if not nums:
        # Default to all 8
        selected_suites = list(SUITE_MAP.values())
    else:
        selected_suites = [SUITE_MAP[n] for n in sorted(nums)]

    mode_label = "FULL combined" if full_mode else f"{len(selected_suites)} individual"
    print(f"\nAuditHQ Suite PDF Generator")
    print(f"Directory : {directory}")
    print(f"Suites    : {', '.join(selected_suites)}")
    print(f"Output    : {mode_label} PDF(s)\n")

    generated = []

    if full_mode:
        # --- Full combined PDF (explicit request only) ---
        all_suite_names = list(SUITE_MAP.values())
        if set(selected_suites) == set(all_suite_names):
            out_name = "FULL-AUDIT-REPORT.pdf"
        else:
            nums_str = "-".join(str(n) for n, s in SUITE_MAP.items() if s in selected_suites)
            out_name = f"COMBINED-AUDIT-{nums_str}.pdf"
        out_path = os.path.join(directory, out_name)
        print(f"  Generating: {out_name} (combined) ...")
        try:
            generate(
                directory=directory,
                output_path=out_path,
                selected_suites=selected_suites,
            )
            size_kb = os.path.getsize(out_path) // 1024
            print(f"  Done: {out_path} ({size_kb} KB)")
            generated.append(out_path)
        except Exception as e:
            print(f"  ERROR generating full audit: {e}")
    else:
        # --- Individual PDFs (one per selected suite) ---
        for suite in selected_suites:
            slug = SUITE_SLUG[suite]
            out_path = os.path.join(directory, f"AUDIT-{slug}.pdf")
            print(f"  Generating: AUDIT-{slug}.pdf ...")
            try:
                generate(
                    directory=directory,
                    output_path=out_path,
                    selected_suites=[suite],
                )
                size_kb = os.path.getsize(out_path) // 1024
                print(f"  Done: {out_path} ({size_kb} KB)")
                generated.append(out_path)
            except Exception as e:
                print(f"  ERROR generating {suite}: {e}")

    print(f"\n{len(generated)} PDF(s) written to: {directory}\n")
    for path in generated:
        print(f"  {os.path.basename(path)}")
    print()


if __name__ == "__main__":
    main()

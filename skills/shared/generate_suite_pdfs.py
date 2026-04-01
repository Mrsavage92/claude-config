#!/usr/bin/env python3
"""
AuditHQ Suite PDF Generator
Generates individual PDFs per suite + one combined PDF.

Usage:
    python generate_suite_pdfs.py <directory> [suite_numbers...]

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
    python generate_suite_pdfs.py "C:/audits/example.com"           # all 8
    python generate_suite_pdfs.py "C:/audits/example.com" 1 2 3    # Marketing, Technical, GEO
    python generate_suite_pdfs.py "C:/audits/example.com" 4 5 6    # Security, Privacy, Reputation
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

    # Parse suite numbers — default to all 8
    if len(sys.argv) > 2:
        nums = []
        for arg in sys.argv[2:]:
            try:
                n = int(arg)
                if n in SUITE_MAP:
                    nums.append(n)
                else:
                    print(f"Warning: suite number {n} out of range (1-8), skipping")
            except ValueError:
                print(f"Warning: '{arg}' is not a valid suite number, skipping")
        if not nums:
            print("No valid suite numbers provided.")
            sys.exit(1)
        selected_suites = [SUITE_MAP[n] for n in sorted(nums)]
    else:
        selected_suites = list(SUITE_MAP.values())

    print(f"\nAuditHQ Suite PDF Generator")
    print(f"Directory : {directory}")
    print(f"Suites    : {', '.join(selected_suites)}")
    print(f"Output    : {len(selected_suites)} individual PDF(s) + 1 combined\n")

    generated = []

    # --- Individual PDFs ---
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

    # --- Combined PDF ---
    nums_str = "".join(str(n) for n, s in SUITE_MAP.items() if s in selected_suites)
    combined_name = f"AUDIT-COMBINED-{nums_str}.pdf"
    combined_path = os.path.join(directory, combined_name)
    print(f"\n  Generating combined: {combined_name} ...")
    try:
        generate(
            directory=directory,
            output_path=combined_path,
            selected_suites=selected_suites,
        )
        size_kb = os.path.getsize(combined_path) // 1024
        print(f"  Done: {combined_path} ({size_kb} KB)")
        generated.append(combined_path)
    except Exception as e:
        print(f"  ERROR generating combined PDF: {e}")

    print(f"\n{len(generated)} PDF(s) written to: {directory}\n")
    for path in generated:
        print(f"  {os.path.basename(path)}")
    print()


if __name__ == "__main__":
    main()

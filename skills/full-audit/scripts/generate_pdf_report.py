#!/usr/bin/env python3
"""
Full Digital Audit PDF Report (all 8 suites)
Thin wrapper - delegates to shared AuditHQ PDF engine.

The shared engine (shared/audit_pdf_engine.py) is the single source of truth
for all AuditHQ PDF generation. The original full generator is preserved as
generate_pdf_report_original.py for reference.

Usage: py generate_pdf_report.py "C:\path\to\audit\folder"
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'shared'))
from audit_pdf_engine import generate

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print('Usage: py generate_pdf_report.py "C:\path\to\audit\folder"')
        sys.exit(1)
    # No selected_suites = all 8 suites (full audit)
    generate(sys.argv[1])

#!/usr/bin/env python3
"""
Marketing Audit PDF Report
Thin wrapper - delegates to shared AuditHQ PDF engine.
Usage: py generate_pdf_report.py "C:\path\to\audit\folder"
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'shared'))
from audit_pdf_engine import generate

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print('Usage: py generate_pdf_report.py "C:\path\to\audit\folder"')
        sys.exit(1)
    generate(sys.argv[1], selected_suites=["Marketing"])

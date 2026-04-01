#!/usr/bin/env python3
"""
Full Digital Audit — Enterprise PDF Report Generator v2
Reads all 9 suite markdown reports and produces a premium, client-ready PDF.
Usage: py generate_pdf_report.py "C:\\path\\to\\audit\\folder"
"""
import sys, os, re, math
from datetime import datetime

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import cm, mm
    from reportlab.lib.colors import HexColor, Color, white, black
    from reportlab.lib.styles import ParagraphStyle
    from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
    from reportlab.platypus import (
        BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer,
        Table, TableStyle, PageBreak, Flowable, NextPageTemplate, KeepTogether
    )
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
except ImportError:
    print("ERROR: reportlab required. Run: py -m pip install reportlab")
    sys.exit(1)

# ─── FONT SETUP ──────────────────────────────────────────────────────────────

_FONT_CANDIDATES = [
    # Windows system
    ("SegoeUI",          "C:/Windows/Fonts/segoeui.ttf"),
    ("SegoeUI-SemiBold", "C:/Windows/Fonts/seguisb.ttf"),
    ("SegoeUI-Bold",     "C:/Windows/Fonts/segoeuib.ttf"),
    ("SegoeUI-Light",    "C:/Windows/Fonts/segoeuil.ttf"),
    # Cached Inter (cross-platform)
    ("Inter-Regular",  os.path.join(os.path.dirname(__file__), "fonts", "Inter-Regular.ttf")),
    ("Inter-SemiBold", os.path.join(os.path.dirname(__file__), "fonts", "Inter-SemiBold.ttf")),
    ("Inter-Bold",     os.path.join(os.path.dirname(__file__), "fonts", "Inter-Bold.ttf")),
]

_loaded = {}
for _name, _path in _FONT_CANDIDATES:
    if os.path.exists(_path):
        try:
            pdfmetrics.registerFont(TTFont(_name, _path))
            _loaded[_name] = True
        except Exception:
            pass

# Resolve font names — prefer Segoe UI, fallback to Helvetica
if "SegoeUI" in _loaded:
    F_LIGHT    = "SegoeUI-Light"    if "SegoeUI-Light"    in _loaded else "SegoeUI"
    F_REGULAR  = "SegoeUI"
    F_SEMIBOLD = "SegoeUI-SemiBold" if "SegoeUI-SemiBold" in _loaded else "SegoeUI-Bold"
    F_BOLD     = "SegoeUI-Bold"     if "SegoeUI-Bold"     in _loaded else "SegoeUI"
    F_XBOLD    = "SegoeUI-Bold"
elif "Inter-Regular" in _loaded:
    F_LIGHT    = "Inter-Regular"
    F_REGULAR  = "Inter-Regular"
    F_SEMIBOLD = "Inter-SemiBold" if "Inter-SemiBold" in _loaded else "Inter-Bold"
    F_BOLD     = "Inter-Bold"
    F_XBOLD    = "Inter-Bold"
else:
    F_LIGHT = F_REGULAR = "Helvetica"
    F_SEMIBOLD = F_BOLD = F_XBOLD = "Helvetica-Bold"

CUSTOM_FONTS = F_REGULAR != "Helvetica"

# ─── DESIGN TOKENS ───────────────────────────────────────────────────────────

C = {
    # Neutrals
    "ink":        HexColor("#0F172A"),
    "ink_soft":   HexColor("#1E293B"),
    "body":       HexColor("#334155"),
    "muted":      HexColor("#64748B"),
    "subtle":     HexColor("#94A3B8"),
    "border":     HexColor("#E2E8F0"),
    "surface":    HexColor("#F8FAFC"),
    "surface_2":  HexColor("#F1F5F9"),
    "white":      HexColor("#FFFFFF"),
    # Brand
    "brand":      HexColor("#1E3A5F"),
    "brand_mid":  HexColor("#2D5BFF"),
    "accent":     HexColor("#E94560"),
    # Severity
    "critical":   HexColor("#DC2626"),
    "critical_bg":HexColor("#FEF2F2"),
    "high":       HexColor("#EA580C"),
    "high_bg":    HexColor("#FFF7ED"),
    "medium":     HexColor("#D97706"),
    "medium_bg":  HexColor("#FFFBEB"),
    "low":        HexColor("#16A34A"),
    "low_bg":     HexColor("#F0FDF4"),
    "info":       HexColor("#2563EB"),
    "info_bg":    HexColor("#EFF6FF"),
    # Score
    "score_good": HexColor("#16A34A"),
    "score_mid":  HexColor("#D97706"),
    "score_bad":  HexColor("#DC2626"),
}

SUITE_COLORS = {
    "Marketing":      HexColor("#7C3AED"),
    "Technical":      HexColor("#0891B2"),
    "GEO":            HexColor("#059669"),
    "Security":       HexColor("#DC2626"),
    "Privacy":        HexColor("#EA580C"),
    "Reputation":     HexColor("#D97706"),
    "Employer Brand": HexColor("#2563EB"),
    "AI Readiness":   HexColor("#6D28D9"),
}

SUITE_ORDER = [
    ("Marketing",      "MARKETING-AUDIT.md"),
    ("Technical",      "TECHNICAL-AUDIT.md"),
    ("GEO",            "GEO-AUDIT-REPORT.md"),
    ("Security",       "SECURITY-AUDIT.md"),
    ("Privacy",        "PRIVACY-AUDIT.md"),
    ("Reputation",     "REPUTATION-AUDIT.md"),
    ("Employer Brand", "EMPLOYER-AUDIT.md"),
    ("AI Readiness",   "AI-READINESS-AUDIT.md"),
]

SUITE_WEIGHTS = {
    "Marketing": 0.20, "Technical": 0.18, "GEO": 0.15, "Security": 0.15,
    "Privacy": 0.12, "Reputation": 0.10, "Employer Brand": 0.05, "AI Readiness": 0.05,
}

PAGE_W, PAGE_H = A4
MARGIN = 1.8 * cm
CONTENT_W = PAGE_W - 2 * MARGIN

# ─── HELPERS ─────────────────────────────────────────────────────────────────

def sc_color(s):
    if s >= 70: return C["score_good"]
    if s >= 40: return C["score_mid"]
    return C["score_bad"]

def grade(s):
    if s >= 85: return "A"
    if s >= 70: return "B"
    if s >= 55: return "C"
    if s >= 40: return "D"
    return "F"

def esc(t):
    return str(t).replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')

def detect_severity(text):
    """Return 'critical'|'high'|'medium'|'low'|None from text."""
    t = text.lower()
    if any(w in t for w in ("critical", "severe", "immediate", "urgent", "breach", "exploit")):
        return "critical"
    if any(w in t for w in ("high", "significant", "major", "serious", "important")):
        return "high"
    if any(w in t for w in ("medium", "moderate", "consider", "recommend")):
        return "medium"
    if any(w in t for w in ("low", "minor", "informational", "note", "enhance")):
        return "low"
    return None

def detect_confidence(text):
    """Returns True if text contains AI-estimated / unverifiable language."""
    t = text.lower()
    return any(w in t for w in (
        "estimated", "could not verify", "not found", "unavailable",
        "could not access", "may be", "appears to", "likely", "unclear",
        "unable to", "not confirmed"
    ))

# ─── CUSTOM FLOWABLES ────────────────────────────────────────────────────────

class AccentBar(Flowable):
    def __init__(self, width=None, height=3, color=None):
        super().__init__()
        self.width  = width or CONTENT_W
        self.height = height
        self.color  = color or C["accent"]
    def draw(self):
        self.canv.setFillColor(self.color)
        self.canv.rect(0, 0, self.width, self.height, fill=1, stroke=0)


class ScoreGauge(Flowable):
    """Circular arc score gauge with grade letter."""
    def __init__(self, score, size=170, label=None):
        super().__init__()
        self.score  = score
        self.size   = size
        self.label  = label
        self.width  = size
        self.height = size + 8

    def draw(self):
        c  = self.canv
        cx = self.size / 2
        cy = self.size / 2 + 4
        r  = self.size / 2 - 14
        col = sc_color(self.score)

        # Track ring
        c.setStrokeColor(C["surface_2"]); c.setLineWidth(18)
        c.arc(cx - r, cy - r, cx + r, cy + r, 0, 360)

        # Score arc (starts at 90°, sweeps proportionally)
        sweep = 360 * self.score / 100
        if sweep > 0:
            c.setStrokeColor(col); c.setLineWidth(18)
            c.arc(cx - r, cy - r, cx + r, cy + r, 90, sweep)

        # White fill circle
        c.setFillColor(C["white"])
        c.circle(cx, cy, r - 18, fill=1, stroke=0)

        # Score number
        fs = 40 if self.score < 100 else 34
        c.setFillColor(C["ink"]); c.setFont(F_BOLD, fs)
        c.drawCentredString(cx, cy + 6, str(int(self.score)))
        c.setFillColor(C["muted"]); c.setFont(F_REGULAR, 9)
        c.drawCentredString(cx, cy - 10, "out of 100")

        # Grade badge
        g = grade(self.score)
        badge_y = cy - 30
        bw, bh = 52, 20
        c.setFillColor(col)
        c.roundRect(cx - bw/2, badge_y - 2, bw, bh, 6, fill=1, stroke=0)
        c.setFillColor(C["white"]); c.setFont(F_BOLD, 10)
        c.drawCentredString(cx, badge_y + 4, f"Grade  {g}")

        if self.label:
            c.setFillColor(C["muted"]); c.setFont(F_REGULAR, 8)
            c.drawCentredString(cx, 4, self.label)


class ScoreBar(Flowable):
    """Horizontal score bar with label and value."""
    def __init__(self, label, score, bar_w=None, color=None, height=30):
        super().__init__()
        self.label  = label
        self.score  = score
        self.bar_w  = bar_w or (CONTENT_W - 5.8 * cm)
        self.width  = CONTENT_W
        self.height = height
        self.color  = color or sc_color(score)

    def draw(self):
        c       = self.canv
        label_w = 2.5 * cm
        bh      = 12
        bx      = label_w + 0.3 * cm
        by      = (self.height - bh) / 2
        fill_w  = max(0, (self.score / 100) * self.bar_w)

        # Label
        c.setFillColor(C["body"]); c.setFont(F_REGULAR, 9)
        c.drawString(0, by + 2, self.label)

        # Track
        c.setFillColor(C["surface_2"])
        c.roundRect(bx, by, self.bar_w, bh, 5, fill=1, stroke=0)

        # Fill
        if fill_w > 10:
            c.setFillColor(self.color)
            c.roundRect(bx, by, fill_w, bh, 5, fill=1, stroke=0)

        # Score label
        c.setFillColor(self.color); c.setFont(F_BOLD, 10)
        c.drawString(bx + self.bar_w + 0.35 * cm, by + 1.5, f"{int(self.score)}/100")


class RadarChart(Flowable):
    """8-axis spider/radar chart for suite scores."""
    AXES = [
        "Marketing", "Technical", "GEO", "Security",
        "Privacy", "Reputation", "Employer Brand", "AI Readiness"
    ]

    def __init__(self, scores, size=200):
        super().__init__()
        self.scores = scores
        self.size   = size
        _LM         = 44          # label margin — extra space on each side for axis labels
        self.width  = size + 2 * _LM
        self.height = size + 2 * _LM
        self._lm    = _LM

    def _pt(self, cx, cy, r, angle_deg, pct):
        rad = math.radians(angle_deg)
        return cx + r * math.cos(rad) * pct, cy + r * math.sin(rad) * pct

    def draw(self):
        c  = self.canv
        cx = self.size / 2 + self._lm   # shifted right so left labels stay inside flowable
        cy = self.size / 2 + self._lm
        r  = self.size / 2 - 20
        n  = len(self.AXES)
        angles = [90 - i * (360 / n) for i in range(n)]

        # Background rings at 25%, 50%, 75%, 100%
        for pct in (0.25, 0.5, 0.75, 1.0):
            pts = [self._pt(cx, cy, r, a, pct) for a in angles]
            c.setStrokeColor(C["border"]); c.setLineWidth(0.5)
            path = c.beginPath()
            path.moveTo(*pts[0])
            for pt in pts[1:]:
                path.lineTo(*pt)
            path.close()
            c.drawPath(path, stroke=1, fill=0)

        # Ring labels at 50 and 100
        for pct, lbl in ((0.5, "50"), (1.0, "100")):
            px, py = self._pt(cx, cy, r, 90, pct)
            c.setFillColor(C["subtle"]); c.setFont(F_REGULAR, 6)
            c.drawString(px + 2, py, lbl)

        # Axis lines
        for a in angles:
            c.setStrokeColor(C["border"]); c.setLineWidth(0.5)
            ex, ey = self._pt(cx, cy, r, a, 1.0)
            c.line(cx, cy, ex, ey)

        # Score polygon (filled)
        score_pts = []
        for i, ax_name in enumerate(self.AXES):
            sc = self.scores.get(ax_name, 50)
            score_pts.append(self._pt(cx, cy, r, angles[i], sc / 100))

        path = c.beginPath()
        path.moveTo(*score_pts[0])
        for pt in score_pts[1:]:
            path.lineTo(*pt)
        path.close()
        fill_col = HexColor("#2D5BFF")
        c.setFillColor(Color(
            fill_col.red, fill_col.green, fill_col.blue, alpha=0.18
        ))
        c.setStrokeColor(HexColor("#2D5BFF")); c.setLineWidth(1.5)
        c.drawPath(path, stroke=1, fill=1)

        # Score dots
        for pt in score_pts:
            c.setFillColor(HexColor("#2D5BFF"))
            c.circle(pt[0], pt[1], 3, fill=1, stroke=0)

        # Axis labels — align by position to avoid bleeding outside the flowable
        for i, ax_name in enumerate(self.AXES):
            ex, ey = self._pt(cx, cy, r + 16, angles[i], 1.0)
            sc = self.scores.get(ax_name, 0)
            short = ax_name.replace("Employer Brand", "Employer").replace("AI Readiness", "AI Ready")
            c.setFillColor(C["ink_soft"]); c.setFont(F_SEMIBOLD, 6.5)
            tw = c.stringWidth(short, F_SEMIBOLD, 6.5)
            cos_a = math.cos(math.radians(angles[i]))
            # Left side: right-align so text ends at ex (stays within flowable)
            # Right side: left-align so text starts at ex
            # Top/bottom: centre
            if cos_a < -0.25:
                lx = ex - tw
            elif cos_a > 0.25:
                lx = ex
            else:
                lx = ex - tw / 2
            c.drawString(lx, ey - 3, short)
            # Score value
            c.setFillColor(sc_color(sc)); c.setFont(F_BOLD, 6)
            sw = c.stringWidth(str(sc), F_BOLD, 6)
            if cos_a < -0.25:
                sx = ex - sw
            elif cos_a > 0.25:
                sx = ex
            else:
                sx = ex - sw / 2
            c.drawString(sx, ey - 11, str(sc))


class SeverityCard(Flowable):
    """Finding card with colored left border and severity badge."""
    SEV_MAP = {
        "critical": (C["critical"], C["critical_bg"], "● CRITICAL"),
        "high":     (C["high"],     C["high_bg"],     "▲ HIGH"),
        "medium":   (C["medium"],   C["medium_bg"],   "◆ MEDIUM"),
        "low":      (C["low"],      C["low_bg"],      "✓ LOW"),
        "info":     (C["info"],     C["info_bg"],     "ℹ INFO"),
    }

    def __init__(self, title, body, severity="medium", width=None, confidence=False):
        super().__init__()
        self.title      = title[:120]
        self.body       = body[:400] if body else ""
        self.severity   = severity or "medium"
        self.width      = width or CONTENT_W
        self.confidence = confidence
        self._calc_height()

    def _calc_height(self):
        lines = max(1, math.ceil(len(self.body) / 90)) if self.body else 0
        self.height = 14 + 13 + lines * 11 + 14  # top pad + title + body lines + bottom pad

    def draw(self):
        c   = self.canv
        col, bg, badge_lbl = self.SEV_MAP.get(self.severity, self.SEV_MAP["medium"])
        h   = self.height
        bw  = 4  # border width

        # Background
        c.setFillColor(bg)
        c.roundRect(bw, 0, self.width - bw, h, 4, fill=1, stroke=0)

        # Left border
        c.setFillColor(col)
        c.roundRect(0, 0, bw + 4, h, 2, fill=1, stroke=0)
        c.setFillColor(bg)
        c.rect(bw, 0, 4, h, fill=1, stroke=0)

        # Severity badge (top right)
        badge_w = c.stringWidth(badge_lbl, F_SEMIBOLD, 7) + 10
        c.setFillColor(col)
        c.roundRect(self.width - badge_w - 8, h - 18, badge_w, 13, 3, fill=1, stroke=0)
        c.setFillColor(C["white"]); c.setFont(F_SEMIBOLD, 7)
        c.drawString(self.width - badge_w - 3, h - 10, badge_lbl)

        # Confidence flag
        if self.confidence:
            c.setFillColor(C["muted"]); c.setFont(F_REGULAR, 6.5)
            c.drawRightString(self.width - badge_w - 14, h - 10, "AI estimate")

        # Title (clip to available width so it never overflows the card)
        c.setFillColor(C["ink"]); c.setFont(F_SEMIBOLD, 9.5)
        title_txt = esc(self.title)
        max_title_w = self.width - (bw + 10) - badge_w - 16
        while len(title_txt) > 4 and c.stringWidth(title_txt, F_SEMIBOLD, 9.5) > max_title_w:
            title_txt = title_txt[:-2] + '\u2026'
        c.drawString(bw + 10, h - 22, title_txt)

        # Body text (wrapped)
        if self.body:
            c.setFillColor(C["body"]); c.setFont(F_REGULAR, 8.5)
            words = self.body.split()
            line, lines_out = [], []
            for w in words:
                test = ' '.join(line + [w])
                if c.stringWidth(test, F_REGULAR, 8.5) < self.width - bw - 22:
                    line.append(w)
                else:
                    if line:
                        lines_out.append(' '.join(line))
                    line = [w]
            if line:
                lines_out.append(' '.join(line))
            y = h - 36
            for ln in lines_out[:4]:
                c.drawString(bw + 10, y, esc(ln))
                y -= 11


class MetricCallout(Flowable):
    """Large number stat card for executive briefing."""
    def __init__(self, value, label, color=None, width=None, height=72):
        super().__init__()
        self.value  = str(value)
        self.label  = label
        self.color  = color or C["brand"]
        self.width  = width or 3.5 * cm
        self.height = height

    def draw(self):
        c = self.canv
        # Card background
        c.setFillColor(C["surface"])
        c.roundRect(0, 0, self.width, self.height, 6, fill=1, stroke=0)
        # Top accent line
        c.setFillColor(self.color)
        c.roundRect(0, self.height - 4, self.width, 4, 2, fill=1, stroke=0)
        # Value
        fs = 28 if len(self.value) <= 3 else 22
        c.setFillColor(self.color); c.setFont(F_BOLD, fs)
        c.drawCentredString(self.width / 2, self.height / 2 - 2, self.value)
        # Label
        c.setFillColor(C["muted"]); c.setFont(F_REGULAR, 7.5)
        c.drawCentredString(self.width / 2, 10, self.label)

# ─── PAGE HEADER / FOOTER ────────────────────────────────────────────────────

def make_hf(brand, title="Full Digital Audit Report"):
    def hf(canvas, doc):
        canvas.saveState()
        # Top rule
        canvas.setStrokeColor(C["border"]); canvas.setLineWidth(0.4)
        canvas.line(MARGIN, PAGE_H - 1.15*cm, PAGE_W - MARGIN, PAGE_H - 1.15*cm)
        canvas.setFillColor(C["muted"]); canvas.setFont(F_REGULAR, 7)
        canvas.drawString(MARGIN, PAGE_H - 0.95*cm, title)
        canvas.setFillColor(C["subtle"]); canvas.setFont(F_SEMIBOLD, 7)
        canvas.drawRightString(PAGE_W - MARGIN, PAGE_H - 0.95*cm, brand)
        # Bottom rule
        canvas.line(MARGIN, 1.35*cm, PAGE_W - MARGIN, 1.35*cm)
        canvas.setFillColor(C["subtle"]); canvas.setFont(F_REGULAR, 6.5)
        canvas.drawString(MARGIN, 0.85*cm, "Confidential — prepared for discussion purposes only. All scores based on publicly observable signals.")
        canvas.setFillColor(C["muted"]); canvas.setFont(F_SEMIBOLD, 7)
        canvas.drawRightString(PAGE_W - MARGIN, 0.85*cm, f"Page {doc.page}")
        canvas.restoreState()
    return hf

def draw_cover_bg(canvas, doc):
    """Full-bleed dark cover background."""
    canvas.saveState()
    canvas.setFillColor(C["brand"])
    canvas.rect(0, PAGE_H * 0.44, PAGE_W, PAGE_H * 0.56, fill=1, stroke=0)
    # Subtle stripe accent
    canvas.setFillColor(C["accent"])
    canvas.rect(0, PAGE_H * 0.44, PAGE_W, 4, fill=1, stroke=0)
    canvas.restoreState()

# ─── STYLES ──────────────────────────────────────────────────────────────────

def mkstyles():
    r = {}
    def s(name, **kw):
        r[name] = ParagraphStyle(name, **kw)

    s("title",      fontName=F_XBOLD,    fontSize=36, textColor=C["white"],       spaceAfter=2,  leading=42)
    s("title_sub",  fontName=F_REGULAR,  fontSize=14, textColor=HexColor("#94A3B8"), spaceAfter=6, leading=20)
    s("cover_url",  fontName=F_REGULAR,  fontSize=11, textColor=HexColor("#64748B"), spaceAfter=4, leading=14)
    s("cover_date", fontName=F_REGULAR,  fontSize=9,  textColor=HexColor("#94A3B8"), spaceAfter=0, leading=12)

    s("h1",         fontName=F_BOLD,     fontSize=22, textColor=C["ink"],         spaceBefore=0, spaceAfter=10, leading=28)
    s("h2",         fontName=F_SEMIBOLD, fontSize=14, textColor=C["brand"],       spaceBefore=14, spaceAfter=6, leading=19)
    s("h3",         fontName=F_SEMIBOLD, fontSize=11, textColor=C["ink"],         spaceBefore=10, spaceAfter=4, leading=15)
    s("h4",         fontName=F_SEMIBOLD, fontSize=9.5, textColor=C["muted"],      spaceBefore=6,  spaceAfter=3, leading=13)

    s("body",       fontName=F_REGULAR,  fontSize=9.5, textColor=C["body"],       spaceAfter=6,  leading=14.5, alignment=TA_JUSTIFY)
    s("body_sm",    fontName=F_REGULAR,  fontSize=8.5, textColor=C["muted"],      spaceAfter=4,  leading=12)
    s("caption",    fontName=F_LIGHT,    fontSize=7.5, textColor=C["subtle"],     spaceAfter=2,  leading=10)
    s("label",      fontName=F_SEMIBOLD, fontSize=8,   textColor=C["muted"],      spaceAfter=2,  leading=11)

    s("ni",         fontName=F_REGULAR,  fontSize=9.5, textColor=C["body"],       spaceAfter=5,  leading=14.5, leftIndent=16, firstLineIndent=-16)
    s("ni_sm",      fontName=F_REGULAR,  fontSize=8.5, textColor=C["muted"],      spaceAfter=4,  leading=12,   leftIndent=16, firstLineIndent=-16)

    s("table_hdr",  fontName=F_SEMIBOLD, fontSize=8,   textColor=C["white"])
    s("table_cell", fontName=F_REGULAR,  fontSize=8.5, textColor=C["body"],       leading=12)

    s("toc_entry",  fontName=F_REGULAR,  fontSize=9,   textColor=C["body"],       spaceAfter=5,  leading=13)
    s("toc_suite",  fontName=F_SEMIBOLD, fontSize=8.5, textColor=C["muted"],      spaceAfter=3,  leading=12)

    s("exec_lead",  fontName=F_REGULAR,  fontSize=10.5, textColor=C["body"],      spaceAfter=10, leading=16.5, alignment=TA_JUSTIFY)
    return r

# ─── PARAGRAPH HELPERS ───────────────────────────────────────────────────────

def p(text, style):
    text = str(text)
    parts = re.split(r'(\*\*[^*\n]{1,300}?\*\*)', text)
    safe = []
    for part in parts:
        if part.startswith('**') and part.endswith('**') and len(part) > 4:
            safe.append(f'<b>{esc(part[2:-2])}</b>')
        else:
            for sp in re.split(r'(`[^`\n]{1,100}?`)', part):
                if sp.startswith('`') and sp.endswith('`') and len(sp) > 2:
                    safe.append(f'<i>{esc(sp[1:-1])}</i>')
                else:
                    safe.append(esc(sp))
    return Paragraph(''.join(safe), style)

def hp(html_text, style):
    return Paragraph(str(html_text), style)

def tcell(text, fn=None, fs=8.5, color=None, align=TA_LEFT, bold=False):
    fn  = fn or (F_BOLD if bold else F_REGULAR)
    col = color or C["body"]
    st  = ParagraphStyle("c", fontName=fn, fontSize=fs, textColor=col,
                         leading=int(fs*1.4), spaceAfter=0, spaceBefore=0, alignment=align)
    return p(str(text), st)

# ─── MARKDOWN PARSING UTILITIES ──────────────────────────────────────────────

def extract_meta(content):
    brand, url, date_str = "", "", datetime.now().strftime("%B %Y")
    m = re.search(r'^#\s+Full Digital Audit Report:\s+(.+)$', content, re.MULTILINE)
    if m: brand = m.group(1).strip()
    m = re.search(r'\*\*URL:\*\*\s*(\S+)', content)
    if m: url = re.sub(r'[*_]', '', m.group(1)).strip().rstrip('/')
    m = re.search(r'\*\*Date:\*\*\s*(.+?)$', content, re.MULTILINE)
    if m: date_str = re.sub(r'\*', '', m.group(1)).strip()
    return brand, url, date_str

def extract_score(content):
    for pat in [
        r'(?:Overall|Health|Score)[^:\n]*?:\s*\**(\d+)/100',
        r'\*\*(\d+)/100\b', r'(\d+)/100\s*\(?Grade',
    ]:
        m = re.search(pat, content[:800], re.IGNORECASE)
        if m:
            v = int(m.group(1))
            if 0 <= v <= 100: return v
    return None

def parse_scorecard(content):
    result = {}
    m = re.search(r'^## Suite Scorecard\n(.*?)(?=^##\s|\Z)', content, re.MULTILINE | re.DOTALL)
    if not m: return result
    for line in m.group(1).split('\n'):
        if not line.strip().startswith('|'): continue
        if re.match(r'^\s*\|[\s\-:|]+\|\s*$', line): continue
        cols = [c.strip() for c in line.strip().strip('|').split('|')]
        if len(cols) < 2: continue
        name = re.sub(r'\*+', '', cols[0]).strip()
        sm = re.search(r'(\d+)', cols[1])
        issue = cols[4] if len(cols) > 4 else (cols[-1] if cols else "")
        if name and name not in ("Suite", "Overall", "") and sm:
            result[name] = {"score": int(sm.group(1)), "issue": re.sub(r'[🟢🟡🔴]', '', issue).strip()}
    return result

def split_sections(content):
    parts = re.split(r'^(##\s+.+)$', content, flags=re.MULTILINE)
    sections = []
    i = 1
    while i < len(parts) - 1:
        header = parts[i].lstrip('#').strip()
        body = parts[i + 1]
        sections.append((header, body))
        i += 2
    return sections

def count_action_items(content, section_kw):
    """Count numbered items in a section."""
    m = re.search(rf'{section_kw}.*?\n(.*?)(?:\n###|\n##|\Z)', content, re.IGNORECASE | re.DOTALL)
    if not m: return 0
    return len(re.findall(r'^\s*\d+\.', m.group(1), re.MULTILINE))

def extract_quick_wins_count(content):
    m = re.search(r'quick wins?[:\s]*\n(.*?)(?:\n#|\Z)', content, re.IGNORECASE | re.DOTALL)
    if not m: return 0
    return len(re.findall(r'^\s*[-*\d]', m.group(1), re.MULTILINE))

def build_md_table(lines, st):
    rows = []
    for line in lines:
        if re.match(r'^\s*\|[\s\-:|]+\|\s*$', line): continue
        cols = [c.strip() for c in line.strip().strip('|').split('|')]
        if any(cols): rows.append(cols)
    if not rows: return None
    ncols = max(len(r) for r in rows)
    for r in rows:
        while len(r) < ncols: r.append("")
    col_lens = [max(len(str(r[ci])) if ci < len(r) else 0 for r in rows) or 4 for ci in range(ncols)]
    total = sum(col_lens)
    col_w = [max(CONTENT_W * (cl / total), 2.2*cm) for cl in col_lens]
    ratio = CONTENT_W / sum(col_w)
    col_w = [w * ratio for w in col_w]
    fmt = []
    for ri, row in enumerate(rows):
        fn = F_SEMIBOLD if ri == 0 else F_REGULAR
        fmt.append([p(col, ParagraphStyle("tc", fontName=fn, fontSize=8, textColor=C["body"],
                                          leading=11, spaceAfter=0, spaceBefore=0)) for col in row])
    t = Table(fmt, colWidths=col_w, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND",     (0, 0), (-1, 0), C["ink"]),
        ("LINEBELOW",      (0, 0), (-1, 0), 0.4, C["border"]),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [C["white"], C["surface"]]),
        ("TOPPADDING",     (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING",  (0, 0), (-1, -1), 6),
        ("LEFTPADDING",    (0, 0), (-1, -1), 7),
        ("RIGHTPADDING",   (0, 0), (-1, -1), 7),
        ("GRID",           (0, 0), (-1, -1), 0.3, C["border"]),
        ("VALIGN",         (0, 0), (-1, -1), "TOP"),
    ]))
    return t

def render_md_body(text, st, use_severity_cards=False, current_section=""):
    """Render markdown body in document order. Optionally emit SeverityCards for bullet items."""
    el = []
    lines = text.split('\n')
    i = 0

    # Detect section severity from header
    section_sev = detect_severity(current_section)

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        if not stripped or re.match(r'^[-*_]{3,}$', stripped):
            i += 1; continue

        if stripped.startswith('### '):
            title = re.sub(r'[*#\s]+$', '', stripped[4:]).strip()
            el.append(p(title, st["h3"]))
            current_section = title
            section_sev = detect_severity(title)
            i += 1; continue

        if stripped.startswith('## '):
            el.append(p(stripped[3:].strip(), st["h2"]))
            i += 1; continue

        if stripped.startswith('# '):
            i += 1; continue

        if stripped.startswith('|'):
            tbl_lines = []
            while i < len(lines) and lines[i].strip().startswith('|'):
                tbl_lines.append(lines[i]); i += 1
            tbl = build_md_table(tbl_lines, st)
            if tbl:
                el.append(KeepTogether([tbl, Spacer(1, 0.25*cm)]))
            continue

        if re.match(r'^\s*-\s+\[[ xX]\]\s+', line):
            items = []
            while i < len(lines) and re.match(r'^\s*-\s+\[[ xX]\]', lines[i]):
                m = re.match(r'^\s*-\s+\[[ xX]\]\s+(.+)', lines[i])
                items.append(m.group(1).strip() if m else ""); i += 1
            for item in items:
                if item: el.append(p(f"\u2610  {item}", st["ni_sm"]))
            continue

        if re.match(r'^\s*[-*\u2022]\s+(?!\[)', line):
            items = []
            while i < len(lines) and re.match(r'^\s*[-*\u2022]\s+(?!\[)', lines[i]):
                m = re.match(r'^\s*[-*\u2022]\s+(.+)', lines[i])
                items.append(m.group(1).strip() if m else ""); i += 1
            for item in items:
                if not item: continue
                if use_severity_cards and len(item) > 30:
                    sev = detect_severity(item) or section_sev or "medium"
                    conf = detect_confidence(item)
                    # Split into title + body if long enough
                    if '.' in item and len(item) > 80:
                        dot = item.index('.')
                        title_part = item[:dot+1].strip()
                        body_part  = item[dot+1:].strip()
                    else:
                        title_part = item[:80]
                        body_part  = item[80:].strip() if len(item) > 80 else ""
                    el.append(SeverityCard(title_part, body_part, sev, confidence=conf))
                    el.append(Spacer(1, 0.15*cm))
                else:
                    el.append(p(f"\u2022  {item}", st["ni"]))
            continue

        if re.match(r'^\s*\d+\.\s+', line):
            items = []
            while i < len(lines) and re.match(r'^\s*\d+\.\s+', lines[i]):
                m = re.match(r'^\s*(\d+)\.\s+(.+)', lines[i])
                if m: items.append((int(m.group(1)), m.group(2).strip()))
                i += 1
            for num, item in items:
                if not item: continue
                if use_severity_cards and len(item) > 20:
                    sev = detect_severity(item) or section_sev or "medium"
                    conf = detect_confidence(item)
                    title_part = re.sub(r'\s*\*\([^)]+\)\*$', '', item).strip()
                    title_part = re.sub(r'\*\*([^*]+)\*\*', r'\1', title_part).strip('*').strip()
                    el.append(SeverityCard(f"{num}. {title_part}", "", sev, confidence=conf))
                    el.append(Spacer(1, 0.12*cm))
                else:
                    el.append(p(f"<b>{num}.</b>  {esc(item)}", st["ni"]))
            continue

        para_lines = []
        while i < len(lines):
            l = lines[i]; ls = l.strip()
            if not ls: break
            if ls.startswith('|') or re.match(r'^#{1,6}\s', ls): break
            if re.match(r'^\s*[-*\u2022]\s', l) or re.match(r'^\s*\d+\.\s', l): break
            if re.match(r'^\s*-\s+\[[ xX]\]', l) or re.match(r'^[-*_]{3,}$', ls): break
            para_lines.append(ls); i += 1
        if para_lines:
            el.append(p(' '.join(para_lines), st["body"]))

    return el

# ─── SUITE HEADER ─────────────────────────────────────────────────────────────

def suite_header(suite_name, score, color):
    g = grade(score) if score else ""
    score_label = f"{score}/100  ·  Grade {g}" if score else ""
    data = [[
        hp(f'<font color="#FFFFFF"><b>{esc(suite_name)}</b></font>',
           ParagraphStyle("sh", fontName=F_BOLD, fontSize=15, textColor=C["white"], leading=20)),
        hp(f'<font color="#FFFFFF">{esc(score_label)}</font>',
           ParagraphStyle("ss", fontName=F_SEMIBOLD, fontSize=11, textColor=C["white"],
                          leading=18, alignment=TA_RIGHT)),
    ]]
    t = Table(data, colWidths=[CONTENT_W * 0.6, CONTENT_W * 0.4])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), color),
        ("TOPPADDING",    (0, 0), (-1, -1), 14),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 14),
        ("LEFTPADDING",   (0, 0), (-1, -1), 16),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 16),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
    ]))
    return t

# ─── SECTION BUILDERS ────────────────────────────────────────────────────────

def build_cover(master_content, suite_scores, suite_status, st):
    el = []
    brand, url, date_str = ("", "", datetime.now().strftime("%d %B %Y"))
    if master_content:
        brand, url, date_str = extract_meta(master_content)
    try:
        date_str = datetime.now().strftime("%d %B %Y")
    except Exception:
        pass

    overall = None
    if master_content: overall = extract_score(master_content)
    if overall is None:
        overall = int(sum(suite_scores.get(s, 50) * w for s, w in SUITE_WEIGHTS.items()))

    # White space pushes content into the dark zone
    el.append(Spacer(1, 5.5 * cm))

    # Title block (renders on dark background)
    el.append(hp(f'<font color="#FFFFFF"><b>Full Digital Audit</b></font>',
                 ParagraphStyle("t1", fontName=F_XBOLD, fontSize=34, textColor=C["white"],
                                spaceAfter=0, leading=40)))
    el.append(hp(f'<font color="#94A3B8">Report</font>',
                 ParagraphStyle("t2", fontName=F_BOLD, fontSize=34, textColor=HexColor("#94A3B8"),
                                spaceAfter=16, leading=40)))

    if brand:
        el.append(hp(f'<font color="#E2E8F0"><b>{esc(brand)}</b></font>',
                     ParagraphStyle("bn", fontName=F_BOLD, fontSize=18, textColor=HexColor("#E2E8F0"),
                                    spaceAfter=4)))
    if url:
        el.append(hp(f'<font color="#94A3B8">{esc(url)}</font>',
                     ParagraphStyle("url", fontName=F_REGULAR, fontSize=11, textColor=HexColor("#94A3B8"),
                                    spaceAfter=4)))
    el.append(hp(f'<font color="#94A3B8">{esc(date_str)}  ·  8-Suite Digital Audit</font>',
                 ParagraphStyle("dt", fontName=F_REGULAR, fontSize=9, textColor=HexColor("#94A3B8"),
                                spaceAfter=0)))

    # Transition spacer to white section
    el.append(Spacer(1, 1.2 * cm))

    # Score gauge — centred
    gauge_row = Table([[ScoreGauge(overall, size=180, label="Overall Digital Health Score")]],
                      colWidths=[CONTENT_W])
    gauge_row.setStyle(TableStyle([("ALIGN", (0, 0), (-1, -1), "CENTER"),
                                   ("TOPPADDING", (0, 0), (-1, -1), 0),
                                   ("BOTTOMPADDING", (0, 0), (-1, -1), 0)]))
    el.append(gauge_row)
    el.append(Spacer(1, 0.6 * cm))

    # Mini scorecard (2-column layout)
    hdr = [tcell("Suite", F_SEMIBOLD, 8, C["white"], bold=True),
           tcell("Score", F_SEMIBOLD, 8, C["white"], TA_CENTER, bold=True),
           tcell("", F_SEMIBOLD, 8, C["white"], bold=True),
           tcell("Suite", F_SEMIBOLD, 8, C["white"], bold=True),
           tcell("Score", F_SEMIBOLD, 8, C["white"], TA_CENTER, bold=True)]
    rows = [hdr]
    suite_list = list(SUITE_ORDER)
    mid = (len(suite_list) + 1) // 2
    for i in range(mid):
        left  = suite_list[i]
        right = suite_list[i + mid] if i + mid < len(suite_list) else None
        def mk_row_cells(name, fname):
            sc = suite_scores.get(name, 0)
            g  = grade(sc)
            return [tcell(name, F_REGULAR, 8.5, C["body"]),
                    tcell(f"{sc}/100", F_BOLD, 8.5, sc_color(sc), TA_CENTER)]
        left_cells  = mk_row_cells(*left)
        sep         = [tcell("")]
        right_cells = mk_row_cells(*right) if right else [tcell(""), tcell("")]
        rows.append(left_cells + sep + right_cells)

    tbl = Table(rows, colWidths=[4.0*cm, 2.0*cm, 0.4*cm, 4.0*cm, 2.0*cm])
    tbl.setStyle(TableStyle([
        ("BACKGROUND",     (0, 0), (-1, 0), C["brand"]),
        ("LINEBELOW",      (0, 0), (-1, 0), 0.4, C["border"]),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [C["white"], C["surface"]]),
        ("TOPPADDING",     (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING",  (0, 0), (-1, -1), 6),
        ("LEFTPADDING",    (0, 0), (-1, -1), 8),
        ("RIGHTPADDING",   (0, 0), (-1, -1), 8),
        ("GRID",           (0, 0), (-1, -1), 0.3, C["border"]),
        ("ALIGN",          (1, 0), (1, -1), "CENTER"),
        ("ALIGN",          (4, 0), (4, -1), "CENTER"),
        ("LEFTPADDING",    (2, 0), (2, -1), 0),
        ("RIGHTPADDING",   (2, 0), (2, -1), 0),
    ]))
    el.append(tbl)
    el.append(Spacer(1, 0.5 * cm))
    el.append(AccentBar(height=1, color=C["border"]))
    el.append(NextPageTemplate("content"))
    el.append(PageBreak())
    return el, overall


def build_toc(suite_scores, st):
    """Clean table of contents."""
    el = []
    el.append(hp("Contents", ParagraphStyle("toch", fontName=F_BOLD, fontSize=22,
                                             textColor=C["ink"], spaceAfter=10, leading=28)))
    el.append(AccentBar(height=2))
    el.append(Spacer(1, 0.5 * cm))

    sections = [
        ("Executive Briefing",    "The one-page view for decision-makers",            "3"),
        ("Overall Scorecard",     "All 8 suite scores, weights and radar chart",       "4"),
        ("Cross-Suite Issues",    "Problems that compound across multiple dimensions", "5"),
        ("Integrated Action Plan","Prioritised remediation — Critical / High / Strategic", "6"),
    ]
    for i, (name, _) in enumerate(SUITE_ORDER):
        pg = str(7 + i)
        sections.append((f"{name} Audit", f"Score: {suite_scores.get(name, 0)}/100", pg))
    sections.append(("Methodology", "Scoring framework, confidence levels, disclaimer", str(7 + len(SUITE_ORDER))))

    rows = []
    for sec_name, sec_desc, pg in sections:
        rows.append([
            tcell(sec_name,  F_SEMIBOLD, 9.5, C["ink"]),
            tcell(sec_desc,  F_REGULAR,  8.5, C["muted"]),
            tcell(pg,        F_SEMIBOLD, 9.5, C["brand"], TA_RIGHT),
        ])
    tbl = Table(rows, colWidths=[4.8*cm, CONTENT_W - 6.8*cm, 2.0*cm])
    tbl.setStyle(TableStyle([
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [C["white"], C["surface"]]),
        ("TOPPADDING",     (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING",  (0, 0), (-1, -1), 8),
        ("LEFTPADDING",    (0, 0), (-1, -1), 10),
        ("RIGHTPADDING",   (0, 0), (-1, -1), 10),
        ("LINEBELOW",      (0, 0), (-1, -1), 0.3, C["border"]),
        ("VALIGN",         (0, 0), (-1, -1), "MIDDLE"),
    ]))
    el.append(tbl)
    el.append(NextPageTemplate("content"))
    el.append(PageBreak())
    return el


def build_executive_briefing(master_content, suite_scores, overall, st):
    """One-page executive briefing — metrics + top risks + top opportunities."""
    el = []
    el.append(hp("Executive Briefing",
                 ParagraphStyle("ebh", fontName=F_BOLD, fontSize=22, textColor=C["ink"],
                                spaceAfter=4, leading=28)))
    el.append(p("The one-page view for decision-makers.", st["body_sm"]))
    el.append(AccentBar(height=2))
    el.append(Spacer(1, 0.4*cm))

    # Count stats from master content
    critical_count = 0
    quick_wins_count = 0
    if master_content:
        critical_count    = count_action_items(master_content, "Critical")
        quick_wins_count  = count_action_items(master_content, "High Impact") + \
                            count_action_items(master_content, "Quick Win")
        quick_wins_count  = max(quick_wins_count, 3)

    # 4 metric callouts
    card_w = (CONTENT_W - 0.6*cm) / 4
    cards = [
        MetricCallout(f"{overall}", "Overall Score /100", sc_color(overall), width=card_w),
        MetricCallout("8",          "Suites Audited",      C["brand"],         width=card_w),
        MetricCallout(str(max(critical_count, 1)), "Critical Issues", C["critical"], width=card_w),
        MetricCallout(f"{grade(overall)}", "Grade",       sc_color(overall),  width=card_w),
    ]
    metric_tbl = Table([cards], colWidths=[card_w]*4, rowHeights=[72])
    metric_tbl.setStyle(TableStyle([
        ("TOPPADDING",    (0,0),(-1,-1), 0),
        ("BOTTOMPADDING", (0,0),(-1,-1), 0),
        ("LEFTPADDING",   (0,0),(-1,-1), 4),
        ("RIGHTPADDING",  (0,0),(-1,-1), 4),
    ]))
    el.append(metric_tbl)
    el.append(Spacer(1, 0.5*cm))

    # Executive summary text
    if master_content:
        for header, body in split_sections(master_content):
            if "executive summary" in header.lower():
                paras = [blk.strip().replace('\n', ' ')
                         for blk in re.split(r'\n{2,}', body)
                         if blk.strip() and not blk.strip().startswith('|')
                         and not blk.strip().startswith('#')
                         and not re.match(r'^[-*_]{3,}$', blk.strip())]
                for para in paras[:2]:
                    # Truncate very long paragraphs to 3 sentences for executive readability
                    sentences = re.split(r'(?<=\.)\s+', para)
                    short = ' '.join(sentences[:3])
                    el.append(p(short, st["exec_lead"]))
                break

    el.append(Spacer(1, 0.3*cm))

    # Two columns: Top Risks + Top Opportunities
    left_el  = []
    right_el = []

    left_el.append(p("Top Risks", ParagraphStyle("rh", fontName=F_BOLD, fontSize=11,
                                                  textColor=C["critical"], spaceAfter=6, leading=14)))

    # Extract cross-suite issues as top risks
    if master_content:
        m = re.search(r'## Cross-Suite Issues.*?\n(.*?)(?=^##|\Z)', master_content, re.MULTILINE|re.DOTALL)
        if m:
            risks = re.findall(r'^###\s+(.+)$', m.group(1), re.MULTILINE)
            for risk in risks[:3]:
                left_el.append(SeverityCard(risk, "", "critical", width=(CONTENT_W/2 - 0.5*cm)))
                left_el.append(Spacer(1, 0.15*cm))

    # Bottom 3 scoring suites as risks if no cross-suite issues found
    if len(left_el) < 3:
        sorted_suites = sorted(suite_scores.items(), key=lambda x: x[1])
        for name, sc in sorted_suites[:3]:
            sev = "critical" if sc < 40 else "high"
            left_el.append(SeverityCard(f"{name}: {sc}/100 — {grade(sc)}",
                                        "Needs attention.", sev,
                                        width=(CONTENT_W/2 - 0.5*cm)))
            left_el.append(Spacer(1, 0.15*cm))

    right_el.append(p("Top Opportunities", ParagraphStyle("oh", fontName=F_BOLD, fontSize=11,
                                                           textColor=C["low"], spaceAfter=6, leading=14)))

    # Extract quick wins from master action plan
    if master_content:
        m = re.search(r'High Impact.*?\n(.*?)(?=###|##|\Z)', master_content, re.IGNORECASE|re.DOTALL)
        if m:
            wins = re.findall(r'^\d+\.\s+(.+)$', m.group(1), re.MULTILINE)
            for win in wins[:3]:
                # Strip markdown bold/italic and trailing suite refs like *(GEO, Marketing)*
                clean = re.sub(r'\*\*([^*]+)\*\*', r'\1', win)
                clean = re.sub(r'\*([^*]*)\*', '', clean).strip()
                clean = clean.strip('*').strip()
                right_el.append(SeverityCard(clean[:80], "", "low", width=(CONTENT_W/2 - 0.5*cm)))
                right_el.append(Spacer(1, 0.15*cm))

    col_tbl = Table([[left_el, right_el]],
                    colWidths=[CONTENT_W/2 - 0.2*cm, CONTENT_W/2 - 0.2*cm])
    col_tbl.setStyle(TableStyle([
        ("VALIGN",        (0,0),(-1,-1), "TOP"),
        ("TOPPADDING",    (0,0),(-1,-1), 0),
        ("BOTTOMPADDING", (0,0),(-1,-1), 0),
        ("LEFTPADDING",   (0,0),(-1,-1), 0),
        ("RIGHTPADDING",  (0,0),(-1,-1), 8),
    ]))
    el.append(col_tbl)
    el.append(Spacer(1, 0.4*cm))
    el.append(AccentBar(height=1, color=C["border"]))
    el.append(NextPageTemplate("content"))
    el.append(PageBreak())
    return el


def build_scorecard(suite_scores, suite_status, overall, st):
    el = []
    el.append(hp("Overall Scorecard",
                 ParagraphStyle("sch", fontName=F_BOLD, fontSize=22, textColor=C["ink"],
                                spaceAfter=4, leading=28)))
    el.append(AccentBar(height=2))
    el.append(Spacer(1, 0.4*cm))

    # Two-column: bars (left) + radar (right)
    bars_el = []
    for suite_name, _ in SUITE_ORDER:
        sc = suite_scores.get(suite_name, 0)
        bars_el.append(ScoreBar(suite_name, sc, bar_w=(CONTENT_W*0.46 - 4.8*cm),
                                color=SUITE_COLORS.get(suite_name)))
        bars_el.append(Spacer(1, 0.1*cm))

    radar_chart = RadarChart(suite_scores, size=int(CONTENT_W * 0.30))

    layout = Table(
        [[bars_el, Spacer(0.2*cm, 1), radar_chart]],
        colWidths=[CONTENT_W*0.46, 0.2*cm, CONTENT_W*0.51]
    )
    layout.setStyle(TableStyle([
        ("VALIGN",        (0,0),(-1,-1), "TOP"),
        ("TOPPADDING",    (0,0),(-1,-1), 0),
        ("BOTTOMPADDING", (0,0),(-1,-1), 0),
        ("LEFTPADDING",   (0,0),(-1,-1), 0),
        ("RIGHTPADDING",  (0,0),(-1,-1), 0),
    ]))
    el.append(layout)
    el.append(Spacer(1, 0.5*cm))

    # Detailed score table
    hdr = [tcell("Suite",          F_SEMIBOLD, 8, C["white"], bold=True),
           tcell("Score",          F_SEMIBOLD, 8, C["white"], TA_CENTER, bold=True),
           tcell("Grade",          F_SEMIBOLD, 8, C["white"], TA_CENTER, bold=True),
           tcell("Weight",         F_SEMIBOLD, 8, C["white"], TA_CENTER, bold=True),
           tcell("Primary Finding",F_SEMIBOLD, 8, C["white"], bold=True)]
    rows = [hdr]
    for suite_name, _ in SUITE_ORDER:
        sc    = suite_scores.get(suite_name, 0)
        g     = grade(sc)
        w     = f"{int(SUITE_WEIGHTS[suite_name]*100)}%"
        issue = suite_status.get(suite_name, {}).get("issue", "")
        rows.append([
            tcell(suite_name, F_REGULAR,  8.5, C["body"]),
            tcell(f"{sc}/100",F_BOLD,     8.5, sc_color(sc), TA_CENTER),
            tcell(g,          F_BOLD,     8.5, sc_color(sc), TA_CENTER),
            tcell(w,          F_REGULAR,  8.5, C["muted"], TA_CENTER),
            tcell(issue,      F_REGULAR,  8,   C["body"]),
        ])
    overall_int = int(sum(suite_scores.get(s, 0)*w for s, w in SUITE_WEIGHTS.items()))
    rows.append([
        tcell("OVERALL SCORE", F_BOLD,  8.5, C["body"]),
        tcell(f"{overall_int}/100", F_BOLD, 9, sc_color(overall_int), TA_CENTER),
        tcell(grade(overall_int), F_BOLD, 9, sc_color(overall_int), TA_CENTER),
        tcell("—",             F_REGULAR, 8.5, C["muted"], TA_CENTER),
        tcell("",              F_REGULAR, 8,   C["body"]),
    ])
    cw = [3.8*cm, 1.9*cm, 1.6*cm, 1.5*cm, CONTENT_W - 8.8*cm]
    tbl = Table(rows, colWidths=cw, repeatRows=1)
    tbl.setStyle(TableStyle([
        ("BACKGROUND",     (0, 0), (-1, 0), C["brand"]),
        ("ROWBACKGROUNDS", (0, 1), (-1, -2), [C["white"], C["surface"]]),
        ("BACKGROUND",     (0, -1), (-1, -1), HexColor("#FEF3C7")),
        ("TOPPADDING",     (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING",  (0, 0), (-1, -1), 8),
        ("LEFTPADDING",    (0, 0), (-1, -1), 8),
        ("RIGHTPADDING",   (0, 0), (-1, -1), 8),
        ("GRID",           (0, 0), (-1, -1), 0.3, C["border"]),
        ("VALIGN",         (0, 0), (-1, -1), "MIDDLE"),
        ("LINEABOVE",      (0, -1), (-1, -1), 1.5, C["medium"]),
    ]))
    el.append(tbl)
    el.append(PageBreak())
    return el


def build_master_sections(master_content, st):
    """Cross-suite issues + action plan — with severity cards."""
    el = []
    if not master_content: return el

    SKIP = {"executive summary", "suite scorecard", "suite summaries", "detailed reports"}

    for header, body in split_sections(master_content):
        if any(s in header.lower() for s in SKIP): continue

        el.append(KeepTogether([
            hp(esc(header),
               ParagraphStyle("msh", fontName=F_BOLD, fontSize=16, textColor=C["ink"],
                               spaceBefore=14, spaceAfter=6, leading=22)),
            AccentBar(height=2),
            Spacer(1, 0.3*cm),
        ]))

        is_action = any(w in header.lower() for w in ("action", "plan", "recommendation", "issue"))
        el += render_md_body(body, st, use_severity_cards=is_action, current_section=header)
        el.append(Spacer(1, 0.3*cm))

    el.append(PageBreak())
    return el


def build_suite_section(suite_name, filename, directory, suite_scores, st):
    score = suite_scores.get(suite_name, 0)
    color = SUITE_COLORS.get(suite_name, C["brand"])
    path  = os.path.join(directory, filename)
    el    = []

    el.append(suite_header(suite_name, score, color))
    el.append(Spacer(1, 0.4*cm))

    if not os.path.exists(path):
        el.append(p(f"Report file not found: {filename}", st["body_sm"]))
        el.append(PageBreak())
        return el

    with open(path, encoding="utf-8") as f:
        content = f.read()

    # Score bar
    if score:
        el.append(ScoreBar(suite_name, score, color=color))
        el.append(Spacer(1, 0.4*cm))

    SKIP = {
        "when this skill is invoked", "output directory", "commands",
        "routing logic", "usage examples", "error handling", "cross-skill integration",
        "quality gates", "business-type-specific audit adjustments",
    }

    for header, body in split_sections(content):
        if any(s in header.lower() for s in SKIP): continue

        is_findings = any(w in header.lower() for w in
                          ("finding", "issue", "risk", "problem", "gap", "fail",
                           "critical", "recommendation", "quick win"))
        el.append(KeepTogether([
            p(header, st["h2"]),
            AccentBar(height=1, color=C["border"]),
            Spacer(1, 0.2*cm),
        ]))
        el += render_md_body(body, st, use_severity_cards=is_findings, current_section=header)
        el.append(Spacer(1, 0.25*cm))

    el.append(PageBreak())
    return el


def build_methodology(st):
    el = []
    el.append(hp("Methodology & Confidence Framework",
                 ParagraphStyle("mh", fontName=F_BOLD, fontSize=22, textColor=C["ink"],
                                spaceAfter=4, leading=28)))
    el.append(AccentBar(height=2))
    el.append(Spacer(1, 0.4*cm))
    el.append(p(
        "This audit evaluates eight dimensions of digital presence using publicly observable signals — "
        "website HTML, HTTP headers, DNS records, third-party review platforms, and search engine results. "
        "No authenticated access or internal data was used. Each suite is scored 0–100 by an AI analyst "
        "calibrated against industry benchmarks.",
        st["body"]
    ))
    el.append(Spacer(1, 0.3*cm))

    meth_rows = [
        [tcell("Suite", F_SEMIBOLD, 8, C["white"], bold=True),
         tcell("Weight", F_SEMIBOLD, 8, C["white"], TA_CENTER, bold=True),
         tcell("What It Measures", F_SEMIBOLD, 8, C["white"], bold=True)],
        *[
            [tcell(n, F_REGULAR, 8.5), tcell(f"{int(w*100)}%", F_REGULAR, 8.5, align=TA_CENTER),
             tcell(desc, F_REGULAR, 8.5)]
            for n, w, desc in [
                ("Marketing",      0.20, "Content quality, CTAs, SEO, competitive positioning, brand trust"),
                ("Technical",      0.18, "Page speed, mobile, SSL, accessibility, structured data, Core Web Vitals"),
                ("GEO",            0.15, "AI citability, E-E-A-T, llms.txt, schema markup, brand authority, AI platform presence"),
                ("Security",       0.15, "HTTPS, security headers, SPF/DKIM/DMARC, cookie security, info disclosure"),
                ("Privacy",        0.12, "GDPR/PECR compliance, cookie consent, privacy policy, data transparency"),
                ("Reputation",     0.10, "Review ratings & volume, response strategy, brand mentions, press coverage"),
                ("Employer Brand", 0.05, "Careers page, EVP clarity, Glassdoor rating, LinkedIn presence, D&I signals"),
                ("AI Readiness",   0.05, "AI adoption signals, automation opportunity, competitive positioning, AI search readiness"),
            ]
        ]
    ]
    cw = [3.0*cm, 1.8*cm, CONTENT_W - 4.8*cm]
    t  = Table(meth_rows, colWidths=cw, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND",     (0, 0), (-1, 0), C["brand"]),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [C["white"], C["surface"]]),
        ("TOPPADDING",     (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING",  (0, 0), (-1, -1), 7),
        ("LEFTPADDING",    (0, 0), (-1, -1), 7),
        ("RIGHTPADDING",   (0, 0), (-1, -1), 7),
        ("GRID",           (0, 0), (-1, -1), 0.3, C["border"]),
        ("VALIGN",         (0, 0), (-1, -1), "TOP"),
    ]))
    el.append(t)
    el.append(Spacer(1, 0.5*cm))

    # Severity legend
    el.append(p("Finding Severity Key", st["h3"]))
    sev_rows = [
        [tcell("Level", F_SEMIBOLD, 8, C["white"], bold=True),
         tcell("What It Means", F_SEMIBOLD, 8, C["white"], bold=True),
         tcell("Action", F_SEMIBOLD, 8, C["white"], bold=True)],
        *[
            [tcell(lbl, F_BOLD, 8.5, col), tcell(desc, F_REGULAR, 8.5), tcell(act, F_REGULAR, 8.5)]
            for lbl, col, desc, act in [
                ("CRITICAL", C["critical"], "Active risk, legal exposure, or broken functionality", "Fix this week"),
                ("HIGH",     C["high"],     "Significant gap hurting revenue or user trust",        "Fix this month"),
                ("MEDIUM",   C["medium"],   "Improvement opportunity with clear ROI",               "Plan for quarter"),
                ("LOW",      C["low"],      "Enhancement — nice to have, minor impact",             "Backlog"),
                ("INFO",     C["info"],     "Observation or unverifiable finding (AI estimate)",    "Review"),
            ]
        ]
    ]
    st2 = Table(sev_rows, colWidths=[2.2*cm, CONTENT_W - 6.2*cm, 4.0*cm])
    st2.setStyle(TableStyle([
        ("BACKGROUND",     (0, 0), (-1, 0), C["ink"]),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [C["white"], C["surface"]]),
        ("TOPPADDING",     (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING",  (0, 0), (-1, -1), 6),
        ("LEFTPADDING",    (0, 0), (-1, -1), 8),
        ("GRID",           (0, 0), (-1, -1), 0.3, C["border"]),
        ("VALIGN",         (0, 0), (-1, -1), "MIDDLE"),
    ]))
    el.append(st2)
    el.append(Spacer(1, 0.5*cm))
    el.append(AccentBar(height=1, color=C["border"]))
    el.append(Spacer(1, 0.3*cm))
    el.append(p(
        "DISCLAIMER: All scores are based on publicly observable signals only. This report does not "
        "constitute legal advice, a security penetration test, or professional compliance assurance. "
        "Professional review is recommended for Security, Privacy, and Legal findings before taking action. "
        "AI-estimated findings are flagged throughout the report.",
        st["caption"]
    ))
    return el

# ─── MAIN ────────────────────────────────────────────────────────────────────

def generate(directory, output_path=None):
    if not output_path:
        output_path = os.path.join(directory, "FULL-AUDIT-REPORT.pdf")

    print(f"Loading reports from: {directory}")
    print(f"Fonts: {F_REGULAR} / {F_BOLD} {'(custom)' if CUSTOM_FONTS else '(fallback)'}")

    master_path = os.path.join(directory, "FULL-AUDIT-REPORT.md")
    master_content = None
    if os.path.exists(master_path):
        with open(master_path, encoding="utf-8") as f:
            master_content = f.read()

    # Extract suite scores
    suite_scores = {}
    for suite_name, filename in SUITE_ORDER:
        path = os.path.join(directory, filename)
        if os.path.exists(path):
            with open(path, encoding="utf-8") as f:
                content = f.read()
            sc = extract_score(content)
            if sc is not None:
                suite_scores[suite_name] = sc

    suite_status = {}
    if master_content:
        suite_status = parse_scorecard(master_content)
        for name, info in suite_status.items():
            if name not in suite_scores:
                suite_scores[name] = info["score"]

    fallback = {"Marketing": 50, "Technical": 50, "GEO": 50, "Security": 50,
                "Privacy": 50, "Reputation": 50, "Employer Brand": 50, "AI Readiness": 50}
    for n, v in fallback.items():
        if n not in suite_scores:
            suite_scores[n] = v

    overall = int(sum(suite_scores.get(s, 50) * w for s, w in SUITE_WEIGHTS.items()))
    if master_content:
        mc_score = extract_score(master_content)
        if mc_score: overall = mc_score

    st = mkstyles()
    brand, _, _ = extract_meta(master_content) if master_content else ("", "", "")
    brand = brand or "Digital Audit Report"

    doc = BaseDocTemplate(
        output_path, pagesize=A4,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=2.0*cm, bottomMargin=2.0*cm,
        title=f"Full Digital Audit — {brand}",
        author="Audit AI",
    )
    body_frame  = Frame(MARGIN, 2.0*cm, CONTENT_W, PAGE_H - 4.5*cm, id="body",  showBoundary=0)
    cover_frame = Frame(MARGIN, 0,       CONTENT_W, PAGE_H - 0.5*cm, id="cover", showBoundary=0)

    doc.addPageTemplates([
        PageTemplate(id="cover",   frames=[cover_frame], onPage=draw_cover_bg),
        PageTemplate(id="content", frames=[body_frame],  onPage=make_hf(brand)),
    ])

    story = []

    print("  Building cover...")
    cover_el, overall = build_cover(master_content, suite_scores, suite_status, st)
    story += cover_el

    print("  Building table of contents...")
    story += build_toc(suite_scores, st)

    print("  Building executive briefing...")
    story += build_executive_briefing(master_content, suite_scores, overall, st)

    print("  Building scorecard + radar chart...")
    story += build_scorecard(suite_scores, suite_status, overall, st)

    print("  Building cross-suite analysis...")
    story += build_master_sections(master_content, st)

    for suite_name, filename in SUITE_ORDER:
        sc = suite_scores.get(suite_name, 0)
        print(f"  Building {suite_name} section ({sc}/100)...")
        story += build_suite_section(suite_name, filename, directory, suite_scores, st)

    print("  Building methodology...")
    story += build_methodology(st)

    print("Rendering PDF...")
    doc.build(story)
    size_kb = os.path.getsize(output_path) // 1024
    print(f"\nDone: {output_path} ({size_kb} KB)")
    return output_path


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print('Usage: py generate_pdf_report.py "C:\\path\\to\\audit\\folder"')
        sys.exit(1)
    generate(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else None)

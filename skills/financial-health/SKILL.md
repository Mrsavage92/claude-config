---
name: financial-health
description: "Run financial ratio analysis, DCF valuation, budget variance, and rolling forecasts from JSON data. Use when analysing business financials, preparing investor reports, or stress-testing financial models."
---

# /financial-health

Analyze financial statements, build valuation models, assess budget variances, and construct forecasts.

## Quick Start

```bash
/financial-health ratios quarterly_financials.json
/financial-health dcf acme_valuation.json
/financial-health budget q1_budget.json --format json
```

## Usage

```
/financial-health ratios <financial_data.json> [--format json|text]
/financial-health dcf <valuation_data.json> [--format json|text]
/financial-health budget <budget_data.json> [--format json|text]
/financial-health forecast <forecast_data.json> [--format json|text]
```

## Scripts

Scripts are optional — if unavailable, Claude will calculate ratios, build DCF models, and perform variance analysis directly from the input data.

- `finance/financial-analyst/scripts/ratio_calculator.py` — Profitability, liquidity, leverage, efficiency, valuation ratios (optional)
- `finance/financial-analyst/scripts/dcf_valuation.py` — DCF enterprise and equity valuation with sensitivity analysis (optional)
- `finance/financial-analyst/scripts/budget_variance_analyzer.py` — Actual vs budget vs prior year variance analysis (optional)
- `finance/financial-analyst/scripts/forecast_builder.py` — Driver-based revenue forecasting with scenario modeling (optional)

**Fallback (no script):** Parse the JSON input directly and compute the requested analysis using standard financial formulas.

## Skill Reference

`finance/financial-analyst/SKILL.md`

## Related Skills

- `/saas-health` — SaaS-specific metrics (ARR, MRR, churn, CAC, LTV, Quick Ratio)
- `/project-health` — Budget tracking and forecast variance at the project level
- `/okr` — Translate financial targets into measurable key results

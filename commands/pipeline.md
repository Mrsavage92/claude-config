---
name: pipeline
description: "Detect project stack and generate production-ready CI/CD pipeline configs for GitHub Actions or GitLab CI. Use when setting up CI/CD from scratch, migrating pipelines, or adding automated testing/deployment stages."
---

# /pipeline

Detect project stack and generate CI/CD pipeline configurations for GitHub Actions or GitLab CI.

## Quick Start

```bash
/pipeline detect --repo .
/pipeline generate --platform github --repo .
/pipeline generate --platform gitlab --repo .
```

## Usage

```
/pipeline detect [--repo <project-dir>]               Detect stack, tools, and services
/pipeline generate --platform github|gitlab [--repo <project-dir>]  Generate pipeline YAML
```

## Scripts

Scripts are optional — if unavailable, Claude will inspect `package.json`, `Dockerfile`, `requirements.txt`, and other config files to detect the stack and generate pipeline YAML manually.

- `engineering/ci-cd-pipeline-builder/scripts/stack_detector.py` — Detect stack and tooling (optional): `--repo <path>`, `--format text|json`
- `engineering/ci-cd-pipeline-builder/scripts/pipeline_generator.py` — Generate pipeline YAML (optional): `--platform github|gitlab`, `--repo <path>`, `--input <stack.json>`, `--output <file>`

**Fallback (no script):** Read key project files (package.json, Dockerfile, .nvmrc, requirements.txt) to identify language, test framework, build tool, and deployment target. Then write a pipeline YAML appropriate for the detected stack.

## Skill Reference

`engineering/ci-cd-pipeline-builder/SKILL.md`

## Related Skills

- `/changelog` — Automate changelog generation as a CI/CD step
- `/tdd` — Add test coverage gates to the generated pipeline
- `/tech-debt` — Include debt scanning as a pipeline quality gate

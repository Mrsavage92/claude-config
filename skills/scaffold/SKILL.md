Scaffold a new project, feature, or module with production-ready structure.

## Phase 0.0 — Product Validation Gate (MANDATORY for new PRODUCTS only)

Before scaffolding a new PRODUCT (a whole SaaS, site, or standalone tool), HALT unless a fresh BUILD verdict exists at `~/Documents/Claude/outputs/product-validation-{slug}.md`.

- Missing file → HALT, run `/product-validator` first
- KILL verdict → HALT
- VALIDATE-FIRST → HALT, surface interview protocol
- BUILD (<30 days) → proceed
- BUILD (>30 days) → STALE, re-run `/product-validator`

**Gate does NOT apply to:**
- Scaffolding a feature/module inside a validated product listed in `~/Documents/Claude/outputs/active-revenue-projects.md`
- Client project scaffolding (MuleSoft at BDR, etc.)
- Helper script, CLI, or utility that is not itself a product

If unclear, check the active-revenue-projects registry. Plugs into a listed project = feature. Otherwise = new product, needs gate.

See `~/Documents/Claude/retrospectives/validator-learnings.md` for Tender Writer retrospective.

---

Based on the provided description or arguments, generate:
1. **Directory structure** — full folder and file layout
2. **Boilerplate files** — entry points, config files, package definitions
3. **Core module stubs** — key files with proper structure but placeholder implementations
4. **Configuration** — environment setup, linting, formatting configs
5. **CI/CD** — basic GitHub Actions or equivalent pipeline
6. **README** — setup instructions, development commands, architecture overview

Detect the appropriate stack from context or ask:
- Language/runtime (Node.js, Python, Go, etc.)
- Framework (Next.js, FastAPI, Express, etc.)
- Database (if applicable)
- Deployment target (Vercel, AWS, Docker, etc.)

Follow conventions:
- Use the stack's idiomatic structure (not generic)
- Include .gitignore and .env.example
- Add type definitions where applicable (TypeScript, Python type hints)
- Include basic error handling patterns
- Set up test directory structure

If no project type is specified in the arguments, ask what to scaffold.

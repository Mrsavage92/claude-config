Scaffold a new project, feature, or module with production-ready structure.

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

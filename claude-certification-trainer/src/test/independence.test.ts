import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Standalone-independence guard: no application source may reference the source
 * guide repository at runtime. References to the upstream repo name are allowed
 * only in attribution/documentation/source metadata (data/sources).
 */

const here = dirname(fileURLToPath(import.meta.url));
const srcRoot = resolve(here, '..');

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    // Scan application source only, not the test files themselves.
    else if (/\.(ts|tsx|css)$/.test(entry) && !/\.(test|spec)\./.test(entry)) out.push(full);
  }
  return out;
}

// Attribution surfaces are allowed to name the upstream repo.
const ATTRIBUTION_ALLOWED = [join('data', 'sources'), join('pages', 'SourcesPage')];

describe('standalone independence', () => {
  const files = walk(srcRoot);

  it('finds source files to scan', () => {
    expect(files.length).toBeGreaterThan(20);
  });

  it('no application source references ../source-guide at runtime', () => {
    const offenders = files.filter((f) => readFileSync(f, 'utf8').includes('../source-guide'));
    expect(offenders).toEqual([]);
  });

  it('only names the upstream repo slug inside attribution/source metadata', () => {
    const slug = 'evggzzz/ccao-f-guide';
    const offenders = files.filter((f) => {
      if (!readFileSync(f, 'utf8').includes(slug)) return false;
      return !ATTRIBUTION_ALLOWED.some((allowed) => f.includes(allowed));
    });
    expect(offenders).toEqual([]);
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { loadState, saveState, clearState, buildExport, parseImport, STORAGE_KEY } from './storage';
import { makeDefaultState } from './defaults';
import { migrate } from './migrations';
import { CURRENT_STATE_VERSION } from '@/schemas';

describe('storage round-trip', () => {
  beforeEach(() => {
    clearState();
    localStorage.clear();
  });

  it('returns defaults when nothing is stored', () => {
    const { state, recovered } = loadState();
    expect(recovered).toBe(false);
    expect(state.version).toBe(CURRENT_STATE_VERSION);
    expect(state.attempts).toEqual([]);
  });

  it('persists and reloads state', () => {
    const s = makeDefaultState();
    s.settings.reduceMotion = true;
    expect(saveState(s)).toBe(true);
    const { state } = loadState();
    expect(state.settings.reduceMotion).toBe(true);
  });

  it('recovers from corrupt JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json');
    const { state, recovered, reason } = loadState();
    expect(recovered).toBe(true);
    expect(reason).toBeTruthy();
    expect(state.attempts).toEqual([]);
  });

  it('recovers from structurally-invalid state', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, nonsense: true }));
    const { recovered } = loadState();
    expect(recovered).toBe(true);
  });
});

describe('migrations', () => {
  it('leaves current-version state unchanged', () => {
    const s = makeDefaultState() as unknown as Record<string, unknown>;
    expect(migrate(s).version).toBe(CURRENT_STATE_VERSION);
  });
  it('does not loop forever on an unknown future version', () => {
    const migrated = migrate({ version: 999 });
    expect(migrated.version).toBe(999);
  });
});

describe('import validation', () => {
  it('accepts a valid export envelope', () => {
    const env = buildExport(makeDefaultState(), 123);
    const result = parseImport(JSON.stringify(env));
    expect(result.ok).toBe(true);
    expect(result.state?.version).toBe(CURRENT_STATE_VERSION);
  });

  it('accepts a bare valid state object', () => {
    const result = parseImport(JSON.stringify(makeDefaultState()));
    expect(result.ok).toBe(true);
  });

  it('rejects invalid JSON', () => {
    const result = parseImport('nope');
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/JSON/i);
  });

  it('rejects a foreign object', () => {
    const result = parseImport(JSON.stringify({ hello: 'world' }));
    expect(result.ok).toBe(false);
  });

  it('rejects an envelope whose state fails validation', () => {
    const bad = { app: 'claude-certification-trainer', exportedAt: 1, state: { version: 1, junk: true } };
    const result = parseImport(JSON.stringify(bad));
    expect(result.ok).toBe(false);
  });
});

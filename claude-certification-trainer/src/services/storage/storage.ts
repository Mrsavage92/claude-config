import {
  PersistedStateSchema,
  ProgressExportSchema,
  type PersistedState,
  type ProgressExport,
} from '@/schemas';
import { makeDefaultState } from './defaults';
import { migrate, type AnyState } from './migrations';

export const STORAGE_KEY = 'cct.state.v1';

/**
 * Result of loading persisted state, including whether recovery happened so the
 * UI can warn the learner that a corrupt store was reset.
 */
export interface LoadResult {
  state: PersistedState;
  recovered: boolean;
  reason?: string;
}

function safeLocalStorage(): Storage | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    // Probe access (throws in some privacy modes).
    const k = '__cct_probe__';
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Load and validate persisted state. Falls back to defaults on any problem. */
export function loadState(): LoadResult {
  const ls = safeLocalStorage();
  if (!ls) return { state: makeDefaultState(), recovered: false };

  const raw = ls.getItem(STORAGE_KEY);
  if (!raw) return { state: makeDefaultState(), recovered: false };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { state: makeDefaultState(), recovered: true, reason: 'Stored data was not valid JSON.' };
  }

  const migrated = migrate(parsed as AnyState);
  const result = PersistedStateSchema.safeParse(migrated);
  if (!result.success) {
    return {
      state: makeDefaultState(),
      recovered: true,
      reason: 'Stored data did not match the expected shape and was reset.',
    };
  }
  return { state: result.data, recovered: false };
}

/** Persist state. Returns false if writing failed (e.g. quota, private mode). */
export function saveState(state: PersistedState): boolean {
  const ls = safeLocalStorage();
  if (!ls) return false;
  try {
    ls.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

/** Remove all persisted state (hard reset). */
export function clearState(): void {
  const ls = safeLocalStorage();
  if (!ls) return;
  try {
    ls.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** Build the export envelope for download. */
export function buildExport(state: PersistedState, now = Date.now()): ProgressExport {
  return { app: 'claude-certification-trainer', exportedAt: now, state };
}

export interface ImportResult {
  ok: boolean;
  state?: PersistedState;
  error?: string;
}

/** Validate and unwrap an imported progress file before it is applied. */
export function parseImport(raw: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: 'The file is not valid JSON.' };
  }

  const envelope = ProgressExportSchema.safeParse(parsed);
  if (envelope.success) {
    const migrated = migrate(envelope.data.state as unknown as AnyState);
    const validated = PersistedStateSchema.safeParse(migrated);
    if (!validated.success) return { ok: false, error: 'The progress data failed validation.' };
    return { ok: true, state: validated.data };
  }

  // Allow importing a bare state object too.
  const bare = PersistedStateSchema.safeParse(migrate(parsed as AnyState));
  if (bare.success) return { ok: true, state: bare.data };

  return { ok: false, error: 'This does not look like a Claude Certification Trainer export.' };
}

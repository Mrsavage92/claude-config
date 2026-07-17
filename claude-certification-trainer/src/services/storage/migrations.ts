import { CURRENT_STATE_VERSION } from '@/schemas';

/**
 * Migrations transform a persisted blob of an older version up to the current
 * version. Each migration is keyed by the version it upgrades FROM.
 *
 * There is only one shipped version so far (v1). When the persisted shape
 * changes, bump CURRENT_STATE_VERSION in schemas/progress.ts and add an entry
 * here, e.g. `1: (s) => ({ ...s, version: 2, newField: default })`.
 */

export type AnyState = Record<string, unknown> & { version?: number };

export const migrations: Record<number, (state: AnyState) => AnyState> = {
  // 1: (state) => ({ ...state, version: 2 }),
};

/** Apply migrations sequentially until the state reaches the current version. */
export function migrate(state: AnyState): AnyState {
  let current = state;
  let guard = 0;
  while (
    typeof current.version === 'number' &&
    current.version < CURRENT_STATE_VERSION &&
    migrations[current.version] &&
    guard < 50
  ) {
    current = migrations[current.version](current);
    guard += 1;
  }
  return current;
}

/**
 * Deterministic, seedable pseudo-random utilities.
 *
 * Answer-order randomisation must be reproducible within a session (so a
 * question shows the same option order until answered) yet vary across
 * sessions. We use a small mulberry32 PRNG seeded from a string.
 */

export function hashSeed(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Return a new shuffled copy using the provided rng (Fisher–Yates). */
export function shuffleWith<T>(items: readonly T[], rng: () => number): T[] {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Shuffle deterministically from a string seed. */
export function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  return shuffleWith(items, mulberry32(hashSeed(seed)));
}

/** Shuffle using Math.random (non-deterministic). */
export function shuffle<T>(items: readonly T[]): T[] {
  return shuffleWith(items, Math.random);
}

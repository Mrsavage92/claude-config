import { describe, it, expect } from 'vitest';
import { seededShuffle, shuffle } from './shuffle';

describe('answer-order randomisation', () => {
  const items = ['a', 'b', 'c', 'd'];

  it('preserves the exact set of items (correctness is not lost)', () => {
    const out = seededShuffle(items, 'seed-1');
    expect([...out].sort()).toEqual([...items].sort());
    expect(out).toHaveLength(items.length);
  });

  it('is deterministic for a given seed', () => {
    expect(seededShuffle(items, 'seed-1')).toEqual(seededShuffle(items, 'seed-1'));
  });

  it('varies across seeds', () => {
    const orders = new Set<string>();
    for (const s of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
      orders.add(seededShuffle(['1', '2', '3', '4', '5'], s).join(''));
    }
    // At least some seeds produce different orderings.
    expect(orders.size).toBeGreaterThan(1);
  });

  it('does not mutate the input', () => {
    const copy = [...items];
    seededShuffle(items, 'x');
    shuffle(items);
    expect(items).toEqual(copy);
  });
});

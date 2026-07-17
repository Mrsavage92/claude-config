import type { Certification, Domain, Question } from '@/schemas';
import { seededShuffle, shuffle } from '@/utils/shuffle';

/**
 * Build a mock exam whose domain composition follows the blueprint weightings
 * as closely as the available enabled question bank allows.
 *
 * If the bank is smaller than the official question count, the mock is a
 * clearly-labelled shorter mock — questions are never duplicated to pad it.
 */

export interface MockPlan {
  questionIds: string[];
  requestedCount: number;
  actualCount: number;
  isShortMock: boolean;
  domainComposition: { domainId: string; title: string; count: number; targetShare: number }[];
  provenanceComposition: Record<string, number>;
}

/**
 * Largest-remainder apportionment of `total` items across domains by weight,
 * clamped to how many questions each domain actually has available.
 */
function apportion(
  domains: Domain[],
  available: Record<string, number>,
  total: number,
): Record<string, number> {
  const result: Record<string, number> = {};
  const remainders: { id: string; frac: number }[] = [];
  let assigned = 0;

  for (const d of domains) {
    const ideal = total * d.weighting;
    const base = Math.min(Math.floor(ideal), available[d.id] ?? 0);
    result[d.id] = base;
    assigned += base;
    remainders.push({ id: d.id, frac: ideal - Math.floor(ideal) });
  }

  // Distribute leftovers by largest remainder, respecting availability.
  remainders.sort((a, b) => b.frac - a.frac);
  let leftover = total - assigned;
  let guard = 0;
  while (leftover > 0 && guard < 1000) {
    let progressed = false;
    for (const r of remainders) {
      if (leftover <= 0) break;
      if (result[r.id] < (available[r.id] ?? 0)) {
        result[r.id] += 1;
        leftover -= 1;
        progressed = true;
      }
    }
    if (!progressed) break; // no domain can take more
    guard += 1;
  }
  return result;
}

export function buildMockPlan(
  certification: Certification,
  domains: Domain[],
  questionBank: Question[],
  opts?: { seed?: string; count?: number },
): MockPlan {
  const enabled = questionBank.filter((q) => q.enabled && q.certificationId === certification.id);
  const requestedCount = opts?.count ?? certification.questionCount;

  const byDomain: Record<string, Question[]> = {};
  for (const q of enabled) (byDomain[q.domainId] ??= []).push(q);

  const available: Record<string, number> = {};
  for (const d of domains) available[d.id] = byDomain[d.id]?.length ?? 0;

  const totalAvailable = enabled.length;
  const target = Math.min(requestedCount, totalAvailable);

  const perDomain = apportion(domains, available, target);

  const questionIds: string[] = [];
  const domainComposition = domains.map((d) => {
    const pool = byDomain[d.id] ?? [];
    const take = perDomain[d.id] ?? 0;
    const picked = (opts?.seed ? seededShuffle(pool, `${opts.seed}:${d.id}`) : shuffle(pool)).slice(0, take);
    picked.forEach((q) => questionIds.push(q.id));
    return { domainId: d.id, title: d.title, count: picked.length, targetShare: d.weighting };
  });

  // Final shuffle so domains are interleaved, not blocked.
  const orderedIds = opts?.seed ? seededShuffle(questionIds, `${opts.seed}:order`) : shuffle(questionIds);

  const provenanceComposition: Record<string, number> = {};
  for (const id of orderedIds) {
    const q = enabled.find((x) => x.id === id)!;
    provenanceComposition[q.provenance] = (provenanceComposition[q.provenance] ?? 0) + 1;
  }

  return {
    questionIds: orderedIds,
    requestedCount,
    actualCount: orderedIds.length,
    isShortMock: orderedIds.length < requestedCount,
    domainComposition,
    provenanceComposition,
  };
}

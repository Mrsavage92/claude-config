import { describe, it, expect } from 'vitest';
import { buildMockPlan } from './mockExam';
import { certifications, domains, questions } from '@/data';

const cert = certifications[0];
const ccaoDomains = domains.filter((d) => d.certificationId === cert.id);

describe('buildMockPlan', () => {
  it('builds a full-length plan when the bank is large enough, else a labelled short mock', () => {
    const plan = buildMockPlan(cert, ccaoDomains, questions, { seed: 'test' });
    expect(plan.actualCount).toBeGreaterThan(0);
    expect(plan.actualCount).toBeLessThanOrEqual(cert.questionCount);
    // With the shipped bank (~60), a 60-question exam is expected to be short.
    expect(plan.isShortMock).toBe(plan.actualCount < cert.questionCount);
  });

  it('never includes a disabled question', () => {
    const withDisabled = questions.map((q, i) => (i === 0 ? { ...q, enabled: false } : q));
    const disabledId = withDisabled[0].id;
    const plan = buildMockPlan(cert, ccaoDomains, withDisabled, { seed: 'x' });
    expect(plan.questionIds).not.toContain(disabledId);
  });

  it('never repeats a question within one exam', () => {
    const plan = buildMockPlan(cert, ccaoDomains, questions, { seed: 'y' });
    expect(new Set(plan.questionIds).size).toBe(plan.questionIds.length);
  });

  it('is deterministic for a given seed', () => {
    const a = buildMockPlan(cert, ccaoDomains, questions, { seed: 'same' });
    const b = buildMockPlan(cert, ccaoDomains, questions, { seed: 'same' });
    expect(a.questionIds).toEqual(b.questionIds);
  });

  it('apportions questions toward the blueprint weightings', () => {
    // Ask for a small exam and confirm the higher-weighted domain gets >= the
    // lower-weighted one when both have ample questions.
    const plan = buildMockPlan(cert, ccaoDomains, questions, { seed: 'w', count: 14 });
    const d2 = plan.domainComposition.find((d) => d.domainId === 'd2')!; // 21%
    const d7 = plan.domainComposition.find((d) => d.domainId === 'd7')!; // 10%
    expect(d2.count).toBeGreaterThanOrEqual(d7.count);
  });

  it('reports provenance composition covering all selected questions', () => {
    const plan = buildMockPlan(cert, ccaoDomains, questions, { seed: 'p' });
    const total = Object.values(plan.provenanceComposition).reduce((a, b) => a + b, 0);
    expect(total).toBe(plan.actualCount);
  });
});

import { describe, it, expect } from 'vitest';
import {
  certifications,
  domains,
  taskStatements,
  lessons,
  questions,
  flashFire,
  labs,
  sources,
} from '@/data';
import { validateContent, errorsOnly } from '@/services/validateContent';

const bundle = { certifications, domains, taskStatements, lessons, questions, flashFire, labs, sources };

describe('content validation', () => {
  it('has zero validation errors across the whole content graph', () => {
    const issues = validateContent(bundle);
    const errors = errorsOnly(issues);
    if (errors.length > 0) {
      // Surface details on failure.
      console.error(errors.map((e) => `${e.code} @ ${e.entity}: ${e.message}`).join('\n'));
    }
    expect(errors).toEqual([]);
  });

  it('has the seven CCAO-F domains with weightings summing to 1.0', () => {
    const ccaoDomains = domains.filter((d) => d.certificationId === 'ccao-f');
    expect(ccaoDomains).toHaveLength(7);
    const sum = ccaoDomains.reduce((s, d) => s + d.weighting, 0);
    expect(sum).toBeCloseTo(1.0, 5);
  });

  it('has at least 5 enabled questions per domain', () => {
    for (const d of domains) {
      const count = questions.filter((q) => q.domainId === d.id && q.enabled).length;
      expect(count, `domain ${d.id}`).toBeGreaterThanOrEqual(5);
    }
  });

  it('has between 50 and 80 total questions (quality over quantity)', () => {
    expect(questions.length).toBeGreaterThanOrEqual(50);
    expect(questions.length).toBeLessThanOrEqual(80);
  });

  it('has 20–30 flash-fire items', () => {
    expect(flashFire.length).toBeGreaterThanOrEqual(20);
    expect(flashFire.length).toBeLessThanOrEqual(30);
  });

  it('includes both single-choice and multiple-response questions', () => {
    expect(questions.some((q) => q.questionType === 'single-choice')).toBe(true);
    expect(questions.some((q) => q.questionType === 'multiple-response')).toBe(true);
  });

  it('only labels genuinely official questions as official provenance', () => {
    const official = questions.filter(
      (q) => q.provenance === 'official-sample' || q.provenance === 'official-blueprint-derived',
    );
    // The three official sample questions from the exam guide.
    expect(official.length).toBeGreaterThanOrEqual(3);
    official.forEach((q) => expect(q.sourceIds.length).toBeGreaterThan(0));
  });

  it('every question option has an explanation', () => {
    for (const q of questions) {
      for (const opt of q.answerOptions) {
        expect(q.explanationForEachOption[opt.id], `${q.id}/${opt.id}`).toBeTruthy();
      }
    }
  });

  it('has a lab and lesson for every domain', () => {
    for (const d of domains) {
      expect(lessons.some((l) => l.domainId === d.id), `lesson for ${d.id}`).toBe(true);
      expect(labs.some((l) => l.domainIds.includes(d.id)), `lab for ${d.id}`).toBe(true);
    }
  });
});

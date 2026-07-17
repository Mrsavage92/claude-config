import type { Certification } from '@/schemas';

/**
 * Certification metadata. Every value here is supported by the CCAO-F Exam
 * Guide (v1.0) as reproduced in the adapted source guide. No value is invented.
 */
export const certifications: Certification[] = [
  {
    id: 'ccao-f',
    code: 'CCAO-F',
    name: 'Claude Certified Associate – Foundations',
    description:
      'Recognizes the ability to use Claude to complete business and productivity tasks with minimal support — streamlining workflows with built-in platform features, choosing approaches that balance quality, efficiency, and cost, and recognizing limits well enough to escalate more complex or technical work.',
    blueprintVersion: 'v1.0',
    effectiveDate: 'July 2026',
    questionCount: 60,
    timeLimitMinutes: 120,
    passingScore: '720 out of 1000 (scaled score)',
    scoringNotes:
      'Pass/fail is determined by the total scaled score (100–1000); 720 is the threshold. Results also report per-domain accuracy as reference information. This trainer does not reproduce the official scaled-score formula — practice results are an estimate only.',
    status: 'active',
    sourceIds: ['exam-guide'],
    lastVerifiedAt: '2026-07-17',
  },
];

export const activeCertificationId = 'ccao-f';
export const defaultCertification = certifications[0];

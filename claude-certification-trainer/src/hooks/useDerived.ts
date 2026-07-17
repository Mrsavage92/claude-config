import { useMemo } from 'react';
import { useStore } from './store';
import {
  certificationById,
  getDomains,
  getQuestions,
  defaultCertification,
} from '@/data';
import { computeReadiness } from '@/services/readiness';
import type { Attempt } from '@/schemas';

export function useActiveCertification() {
  const { state } = useStore();
  const cert = certificationById[state.settings.activeCertificationId] ?? defaultCertification;
  const domains = useMemo(() => getDomains(cert.id), [cert.id]);
  return { cert, domains };
}

/** Attempts scoped to the active certification. */
export function useCertAttempts(): Attempt[] {
  const { state } = useStore();
  const certId = state.settings.activeCertificationId;
  return useMemo(() => state.attempts.filter((a) => a.certificationId === certId), [state.attempts, certId]);
}

export function useReadiness(now = Date.now()) {
  const { state } = useStore();
  const { cert, domains } = useActiveCertification();
  return useMemo(() => {
    const attempts = state.attempts.filter((a) => a.certificationId === cert.id);
    const reviewItems = Object.values(state.reviewItems).filter((r) => r.certificationId === cert.id);
    const mockResults = state.mockResults.filter((m) => m.certificationId === cert.id);
    return computeReadiness({ attempts, domains, reviewItems, mockResults, now });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.attempts, state.reviewItems, state.mockResults, cert.id, domains]);
}

/** Enabled question bank for the active certification. */
export function useQuestionBank() {
  const { cert } = useActiveCertification();
  return useMemo(() => getQuestions(cert.id, { enabledOnly: true }), [cert.id]);
}

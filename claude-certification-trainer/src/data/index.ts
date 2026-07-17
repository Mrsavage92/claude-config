import type {
  Certification,
  Domain,
  FlashFire,
  Lab,
  Lesson,
  Question,
  Source,
  TaskStatement,
} from '@/schemas';

import { certifications, defaultCertification, activeCertificationId } from './certifications';
import { domains, taskStatements, domainById, taskStatementById } from './domains';
import { lessons } from './lessons';
import { questions } from './questions';
import { flashFire } from './flash-fire';
import { labs } from './labs';
import { sources } from './sources';

export {
  certifications,
  defaultCertification,
  activeCertificationId,
  domains,
  taskStatements,
  domainById,
  taskStatementById,
  lessons,
  questions,
  flashFire,
  labs,
  sources,
};

/* ------------------------------------------------------------------ */
/* Lookup maps                                                         */
/* ------------------------------------------------------------------ */

export const certificationById: Record<string, Certification> = Object.fromEntries(
  certifications.map((c) => [c.id, c]),
);
export const lessonById: Record<string, Lesson> = Object.fromEntries(lessons.map((l) => [l.id, l]));
export const questionById: Record<string, Question> = Object.fromEntries(questions.map((q) => [q.id, q]));
export const flashFireById: Record<string, FlashFire> = Object.fromEntries(flashFire.map((f) => [f.id, f]));
export const labById: Record<string, Lab> = Object.fromEntries(labs.map((l) => [l.id, l]));
export const sourceById: Record<string, Source> = Object.fromEntries(sources.map((s) => [s.id, s]));

/* ------------------------------------------------------------------ */
/* Selectors scoped to a certification                                */
/* ------------------------------------------------------------------ */

export function getDomains(certId: string): Domain[] {
  return domains.filter((d) => d.certificationId === certId).sort((a, b) => a.order - b.order);
}

export function getTaskStatements(domainId: string): TaskStatement[] {
  return taskStatements.filter((t) => t.domainId === domainId);
}

export function getLessons(certId: string): Lesson[] {
  return lessons.filter((l) => l.certificationId === certId);
}

export function getLessonsForDomain(domainId: string): Lesson[] {
  return lessons.filter((l) => l.domainId === domainId);
}

export function getQuestions(certId: string, opts?: { enabledOnly?: boolean }): Question[] {
  return questions.filter(
    (q) => q.certificationId === certId && (!opts?.enabledOnly || q.enabled),
  );
}

export function getQuestionsForDomain(domainId: string, enabledOnly = true): Question[] {
  return questions.filter((q) => q.domainId === domainId && (!enabledOnly || q.enabled));
}

export function getFlashFire(certId: string, enabledOnly = true): FlashFire[] {
  return flashFire.filter((f) => f.certificationId === certId && (!enabledOnly || f.enabled));
}

export function getLabs(certId: string): Lab[] {
  return labs.filter((l) => l.certificationId === certId);
}

export function getLabsForDomain(domainId: string): Lab[] {
  return labs.filter((l) => l.domainIds.includes(domainId));
}

export function getSourcesForIds(ids: string[]): Source[] {
  return ids.map((id) => sourceById[id]).filter((s): s is Source => Boolean(s));
}

/** Related questions for a lesson (explicit links plus same-task/domain fallback). */
export function getRelatedQuestions(lesson: Lesson, enabledOnly = true): Question[] {
  const explicit = lesson.relatedQuestionIds
    .map((id) => questionById[id])
    .filter((q): q is Question => Boolean(q));
  const byTask = questions.filter(
    (q) =>
      q.domainId === lesson.domainId &&
      (lesson.taskStatementId ? q.taskStatementId === lesson.taskStatementId : true) &&
      (!enabledOnly || q.enabled),
  );
  const merged = new Map<string, Question>();
  [...explicit, ...byTask].forEach((q) => merged.set(q.id, q));
  return [...merged.values()];
}

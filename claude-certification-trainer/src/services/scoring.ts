import type { Question } from '@/schemas';

/**
 * Scoring for single-choice and multiple-response questions.
 *
 * A question is correct only when the set of selected option ids exactly equals
 * the set of correct option ids — no partial credit, matching the exam model
 * where multiple-response items require the exact set.
 */
export function isAnswerCorrect(question: Question, selectedIds: readonly string[]): boolean {
  const correct = new Set(question.correctAnswerIds);
  const selected = new Set(selectedIds);
  if (correct.size !== selected.size) return false;
  for (const id of correct) if (!selected.has(id)) return false;
  return true;
}

/** How many selections a question requires (for the "select N" hint). */
export function requiredSelections(question: Question): number {
  return question.correctAnswerIds.length;
}

/**
 * Whether a selection is a valid submission: single-choice needs exactly one,
 * multiple-response needs the exact required count (matching "select two" etc.).
 */
export function isSubmittable(question: Question, selectedIds: readonly string[]): boolean {
  if (question.questionType === 'single-choice') return selectedIds.length === 1;
  return selectedIds.length === requiredSelections(question);
}

/** Toggle an option id in a selection, enforcing the question's cardinality. */
export function toggleSelection(
  question: Question,
  current: readonly string[],
  optionId: string,
): string[] {
  const has = current.includes(optionId);
  if (question.questionType === 'single-choice') {
    return has ? [] : [optionId];
  }
  if (has) return current.filter((id) => id !== optionId);
  const max = requiredSelections(question);
  if (current.length >= max) {
    // Replace the oldest selection to stay within the required count.
    return [...current.slice(1), optionId];
  }
  return [...current, optionId];
}

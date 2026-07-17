import { useMemo } from 'react';
import { Check, X, Circle, CheckCircle2, Lightbulb, Target, BookOpen, FlaskConical } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { AnswerConfidence, Question } from '@/schemas';
import { seededShuffle } from '@/utils/shuffle';
import { isSubmittable, requiredSelections, toggleSelection } from '@/services/scoring';
import { cn } from '@/utils/cn';
import { Badge } from './ui';
import { DifficultyBadge, ProvenanceBadge } from './ProvenanceBadge';
import { SourceLinks } from './SourceLinks';
import { lessonById, labById } from '@/data';

const CONFIDENCE_OPTIONS: { value: AnswerConfidence; label: string }[] = [
  { value: 'certain', label: 'Certain' },
  { value: 'fairly-sure', label: 'Fairly sure' },
  { value: 'unsure', label: 'Unsure' },
  { value: 'guess', label: 'Guess' },
];

export function ConfidencePicker({
  value,
  onChange,
}: {
  value: AnswerConfidence | null;
  onChange: (v: AnswerConfidence) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-ink">How confident are you?</legend>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Confidence">
        {CONFIDENCE_OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
              value === o.value
                ? 'border-brand bg-brand/10 text-brand'
                : 'border-line bg-surface-raised text-ink-muted hover:text-ink',
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export interface QuestionOptionsProps {
  question: Question;
  orderSeed: string;
  selected: string[];
  onToggle: (optionId: string) => void;
  revealed: boolean;
  disabled?: boolean;
}

/** Renders the answer options with selection and (post-submit) reveal states. */
export function QuestionOptions({ question, orderSeed, selected, onToggle, revealed, disabled }: QuestionOptionsProps) {
  const ordered = useMemo(
    () => seededShuffle(question.answerOptions, `${question.id}:${orderSeed}`),
    [question, orderSeed],
  );
  const correctSet = new Set(question.correctAnswerIds);
  const multi = question.questionType === 'multiple-response';

  return (
    <ul className="space-y-2" role={multi ? 'group' : 'radiogroup'} aria-label="Answer options">
      {ordered.map((opt, idx) => {
        const isSelected = selected.includes(opt.id);
        const isCorrect = correctSet.has(opt.id);
        let stateClass = 'border-line bg-surface-raised hover:border-brand/40';
        if (revealed) {
          if (isCorrect) stateClass = 'border-success/50 bg-success/10';
          else if (isSelected) stateClass = 'border-danger/50 bg-danger/10';
          else stateClass = 'border-line bg-surface-raised opacity-70';
        } else if (isSelected) {
          stateClass = 'border-brand bg-brand/10';
        }
        return (
          <li key={opt.id}>
            <button
              type="button"
              disabled={disabled || revealed}
              onClick={() => onToggle(opt.id)}
              role={multi ? 'checkbox' : 'radio'}
              aria-checked={isSelected}
              className={cn(
                'flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                'disabled:cursor-default',
                stateClass,
              )}
            >
              <span
                className={cn(
                  'mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                  revealed && isCorrect
                    ? 'border-success bg-success text-white'
                    : revealed && isSelected
                      ? 'border-danger bg-danger text-white'
                      : isSelected
                        ? 'border-brand bg-brand text-white'
                        : 'border-ink-subtle text-ink-subtle',
                )}
                aria-hidden="true"
              >
                {revealed && isCorrect ? (
                  <Check className="h-3 w-3" />
                ) : revealed && isSelected ? (
                  <X className="h-3 w-3" />
                ) : (
                  String.fromCharCode(65 + idx)
                )}
              </span>
              <span className="text-ink">{opt.text}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** The full explanation shown after submitting. */
export function ExplanationPanel({ question, selected }: { question: Question; selected: string[] }) {
  const correctSet = new Set(question.correctAnswerIds);
  const ordered = question.answerOptions;
  return (
    <div className="mt-5 space-y-4 rounded-xl border border-line bg-surface-sunken p-4 animate-fade-in">
      <div>
        <h3 className="mb-1 text-sm font-semibold text-ink">Why</h3>
        <p className="text-sm text-ink-muted">{question.explanation}</p>
      </div>

      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-subtle">Every option</h4>
        <ul className="space-y-1.5">
          {ordered.map((opt) => {
            const isCorrect = correctSet.has(opt.id);
            const wasSelected = selected.includes(opt.id);
            return (
              <li key={opt.id} className="flex items-start gap-2 text-sm">
                {isCorrect ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" aria-hidden="true" />
                ) : (
                  <Circle className={cn('mt-0.5 h-4 w-4 flex-shrink-0', wasSelected ? 'text-danger' : 'text-ink-subtle')} aria-hidden="true" />
                )}
                <span className="text-ink-muted">
                  <span className="font-medium text-ink">{opt.text}</span> — {question.explanationForEachOption[opt.id]}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-start gap-2 rounded-lg border border-line bg-surface-raised p-3">
          <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning" aria-hidden="true" />
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">Key exam clue</div>
            <p className="text-sm text-ink">{question.keyExamClue}</p>
          </div>
        </div>
        <div className="flex items-start gap-2 rounded-lg border border-line bg-surface-raised p-3">
          <Target className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand" aria-hidden="true" />
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">Learning objective</div>
            <p className="text-sm text-ink">{question.learningObjective}</p>
          </div>
        </div>
      </div>

      {(question.relatedLessonIds.length > 0 || question.relatedLabIds.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {question.relatedLessonIds.map((id) => {
            const lesson = lessonById[id];
            if (!lesson) return null;
            return (
              <Link
                key={id}
                to={`/learn/${lesson.domainId}#${lesson.id}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-raised px-2.5 py-1 text-xs text-ink-muted hover:border-brand/40 hover:text-brand"
              >
                <BookOpen className="h-3 w-3" aria-hidden="true" /> {lesson.title}
              </Link>
            );
          })}
          {question.relatedLabIds.map((id) => {
            const lab = labById[id];
            if (!lab) return null;
            return (
              <Link
                key={id}
                to={`/labs/${lab.id}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-raised px-2.5 py-1 text-xs text-ink-muted hover:border-brand/40 hover:text-brand"
              >
                <FlaskConical className="h-3 w-3" aria-hidden="true" /> {lab.title}
              </Link>
            );
          })}
        </div>
      )}

      <div>
        <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-subtle">Sources</div>
        <SourceLinks sourceIds={question.sourceIds} />
      </div>
    </div>
  );
}

/** Header row: badges + required-selection hint. */
export function QuestionMetaRow({ question, showProvenance = true }: { question: Question; showProvenance?: boolean }) {
  const required = requiredSelections(question);
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <DifficultyBadge difficulty={question.difficulty} />
      {question.questionType === 'multiple-response' ? (
        <Badge tone="info">Select {required}</Badge>
      ) : (
        <Badge tone="neutral">Single answer</Badge>
      )}
      {showProvenance && <ProvenanceBadge provenance={question.provenance} />}
    </div>
  );
}

export { isSubmittable, toggleSelection };

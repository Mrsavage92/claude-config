import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, Check, CheckCircle2, Clock, Copy, HelpCircle, ShieldAlert } from 'lucide-react';
import { PageHeader, Card, CardHeader, Badge, Button, EmptyState, ProgressBar } from '@/components/ui';
import { SourceLinks } from '@/components/SourceLinks';
import { useStore } from '@/hooks/store';
import { labById, domainById } from '@/data';
import type { LabPrompt } from '@/schemas';

function CopyPromptButton({ prompt, label }: { prompt: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — nothing further we can do.
    }
  }

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={handleCopy}
      aria-label={copied ? `${label} prompt copied to clipboard` : `Copy ${label} prompt`}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" aria-hidden="true" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" aria-hidden="true" />
          Copy
        </>
      )}
    </Button>
  );
}

function PromptBlock({ item, index }: { item: LabPrompt; index: number }) {
  const promptId = `lab-prompt-${index}`;
  return (
    <div className="rounded-lg border border-line bg-surface-sunken p-4">
      <div className="flex items-center justify-between gap-3">
        <h4 id={promptId} className="text-sm font-semibold text-ink">
          {item.label}
        </h4>
        <CopyPromptButton prompt={item.prompt} label={item.label} />
      </div>
      <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-md bg-surface-raised p-3 text-xs text-ink-muted">
        {item.prompt}
      </pre>
    </div>
  );
}

export function LabDetailPage() {
  const { labId } = useParams<{ labId: string }>();
  const { state, patchLab } = useStore();
  const lab = labId ? labById[labId] : undefined;

  if (!lab) {
    return (
      <EmptyState
        title="Lab not found"
        description="This lab doesn't exist for the active certification."
        action={
          <Link to="/labs">
            <Button variant="primary">Back to Labs</Button>
          </Link>
        }
      />
    );
  }

  const progress = state.labProgress[lab.id];
  const completedIndices = progress?.completedStepIndices ?? [];
  const completed = progress?.completed ?? false;
  const note = progress?.note ?? '';
  const noteId = `lab-note-${lab.id}`;

  const currentLabId = lab.id;
  const toggleStep = (index: number) => {
    const set = new Set(completedIndices);
    if (set.has(index)) {
      set.delete(index);
    } else {
      set.add(index);
    }
    patchLab(currentLabId, { completedStepIndices: [...set].sort((a, b) => a - b) });
  };

  const stepsDone = completedIndices.length;
  const stepsTotal = lab.steps.length;
  const stepProgress = stepsTotal > 0 ? stepsDone / stepsTotal : 0;

  return (
    <div>
      <PageHeader
        title={lab.title}
        description={lab.objective}
        actions={
          <Link to="/labs">
            <Button variant="ghost">Back to Labs</Button>
          </Link>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {lab.domainIds.map((id) => {
          const domain = domainById[id];
          return domain ? (
            <Badge key={id} tone="neutral">
              {domain.title}
            </Badge>
          ) : null;
        })}
        <span className="inline-flex items-center gap-1.5 text-xs text-ink-subtle">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          {lab.estimatedMinutes} min
        </span>
      </div>

      {lab.requiresPaidFeature && lab.paidFeatureNote && (
        <Card className="mb-6 border-warning/30 bg-warning/5 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-warning" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-ink">Requires a paid feature</p>
              <p className="mt-1 text-sm text-ink-muted">{lab.paidFeatureNote}</p>
            </div>
          </div>
        </Card>
      )}

      <Card className="mb-6 border-info/30 bg-info/5 p-4">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 flex-shrink-0 text-info" aria-hidden="true" />
          <p className="text-sm text-ink-muted">
            Use safe, fictional data only. Do not paste real personal, customer, or regulated data.
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {lab.prerequisites.length > 0 && (
            <Card>
              <CardHeader title="Prerequisites" />
              <div className="p-5">
                <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-muted">
                  {lab.prerequisites.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            </Card>
          )}

          {lab.setup.length > 0 && (
            <Card>
              <CardHeader title="Setup" />
              <div className="p-5">
                <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-muted">
                  {lab.setup.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </Card>
          )}

          <Card>
            <CardHeader
              title="Steps"
              subtitle={`${stepsDone} of ${stepsTotal} steps done`}
              action={<Badge tone={stepsDone === stepsTotal && stepsTotal > 0 ? 'success' : 'neutral'}>{Math.round(stepProgress * 100)}%</Badge>}
            />
            <div className="p-5">
              <ProgressBar value={stepProgress} label={`${lab.title} step progress`} className="mb-4" />
              <ol className="space-y-3">
                {lab.steps.map((step, i) => {
                  const stepDone = completedIndices.includes(i);
                  const checkboxId = `lab-step-${lab.id}-${i}`;
                  return (
                    <li key={i} className="flex gap-3 rounded-lg border border-line bg-surface-sunken p-3">
                      <input
                        id={checkboxId}
                        type="checkbox"
                        checked={stepDone}
                        onChange={() => toggleStep(i)}
                        className="mt-1 h-4 w-4 flex-shrink-0 rounded border-line text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                      />
                      <label htmlFor={checkboxId} className="text-sm">
                        <span className="font-semibold text-ink">
                          {i + 1}. {step.title}
                        </span>
                        <span className="mt-0.5 block text-ink-muted">{step.detail}</span>
                      </label>
                    </li>
                  );
                })}
              </ol>
            </div>
          </Card>

          {lab.prompts.length > 0 && (
            <Card>
              <CardHeader title="Copyable prompts" subtitle="Paste these into Claude and adapt as needed." />
              <div className="space-y-3 p-5">
                {lab.prompts.map((item, i) => (
                  <PromptBlock key={i} item={item} index={i} />
                ))}
              </div>
            </Card>
          )}

          <Card>
            <CardHeader title="Expected outcome" />
            <div className="p-5 text-sm text-ink-muted">{lab.expectedOutcome}</div>
          </Card>

          {lab.whatToObserve.length > 0 && (
            <Card>
              <CardHeader title="What to observe" />
              <div className="p-5">
                <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-muted">
                  {lab.whatToObserve.map((o, i) => (
                    <li key={i}>{o}</li>
                  ))}
                </ul>
              </div>
            </Card>
          )}

          <Card>
            <CardHeader title="Why it matters" />
            <div className="p-5 text-sm text-ink-muted">{lab.whyItMatters}</div>
          </Card>

          {lab.troubleshooting.length > 0 && (
            <Card>
              <CardHeader title="Troubleshooting" />
              <div className="space-y-3 p-5">
                {lab.troubleshooting.map((t, i) => (
                  <div key={i} className="rounded-lg border border-line bg-surface-sunken p-3 text-sm">
                    <p className="font-semibold text-ink">{t.problem}</p>
                    <p className="mt-1 text-ink-muted">{t.fix}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {lab.cleanup.length > 0 && (
            <Card>
              <CardHeader title="Cleanup" />
              <div className="p-5">
                <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-muted">
                  {lab.cleanup.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-ink">Completion</h3>
            <p className="mt-1 text-sm text-ink-muted">
              {stepsDone} of {stepsTotal} steps done
            </p>
            <ProgressBar value={stepProgress} label={`${lab.title} step progress`} className="mt-2" />
            <Button
              variant={completed ? 'primary' : 'secondary'}
              className="mt-4 w-full"
              onClick={() => patchLab(lab.id, { completed: !completed })}
              aria-pressed={completed}
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              {completed ? 'Lab complete' : 'Mark lab complete'}
            </Button>
          </Card>

          <Card className="p-5">
            <label htmlFor={noteId} className="mb-1.5 block text-sm font-medium text-ink">
              Your notes
            </label>
            <textarea
              id={noteId}
              value={note}
              onChange={(e) => patchLab(lab.id, { note: e.target.value })}
              rows={4}
              placeholder="Jot down anything worth remembering about this lab…"
              className="w-full rounded-lg border border-line bg-surface-raised px-3 py-2 text-sm text-ink placeholder:text-ink-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            />
          </Card>

          {lab.sourceIds.length > 0 && (
            <Card className="p-5">
              <h3 className="mb-2 text-sm font-semibold text-ink">Sources</h3>
              <SourceLinks sourceIds={lab.sourceIds} />
            </Card>
          )}

          {lab.relatedQuestionIds.length > 0 && (
            <Card className="p-5">
              <Link
                to="/practice"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
              >
                <HelpCircle className="h-4 w-4" aria-hidden="true" />
                {lab.relatedQuestionIds.length} related question{lab.relatedQuestionIds.length === 1 ? '' : 's'}
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

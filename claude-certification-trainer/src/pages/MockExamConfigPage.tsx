import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Clock, ListChecks, AlertTriangle, Play } from 'lucide-react';
import { useActiveCertification, useQuestionBank } from '@/hooks/useDerived';
import { useStore } from '@/hooks/store';
import { buildMockPlan } from '@/services/mockExam';
import { questionById } from '@/data';
import { Button, Card, PageHeader, StatTile, Badge } from '@/components/ui';
import { PROVENANCE_META } from '@/components/ProvenanceBadge';
import { seededShuffle } from '@/utils/shuffle';
import { makeId } from '@/utils/format';
import type { Provenance } from '@/schemas';

export function MockExamConfigPage() {
  const { cert, domains } = useActiveCertification();
  const bank = useQuestionBank();
  const store = useStore();
  const navigate = useNavigate();

  const plan = useMemo(() => buildMockPlan(cert, domains, bank), [cert, domains, bank]);
  const hasActive = store.state.activeMockSession != null;

  const startExam = () => {
    const sessionId = makeId('mock');
    const optionOrder: Record<string, string[]> = {};
    for (const qid of plan.questionIds) {
      const q = questionById[qid];
      if (q) optionOrder[qid] = seededShuffle(q.answerOptions.map((o) => o.id), `${sessionId}:${qid}`);
    }
    store.startMock({
      id: sessionId,
      certificationId: cert.id,
      startedAt: Date.now(),
      timeLimitMinutes: cert.timeLimitMinutes,
      questionIds: plan.questionIds,
      answers: {},
      flagged: [],
      currentIndex: 0,
      optionOrder,
    });
    navigate('/mock-exam/session');
  };

  return (
    <div>
      <PageHeader
        title="Mock Exam"
        description="A timed, full-length practice exam that follows the blueprint domain weightings. Practice mock exam based on the available verified question bank — not the official exam."
      />

      {hasActive && (
        <Card className="mb-6 border-info/30 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-ink">
              <AlertTriangle className="h-4 w-4 text-info" />
              You have an exam in progress. Starting a new one will discard it.
            </div>
            <Button variant="primary" onClick={() => navigate('/mock-exam/session')}>
              Resume exam
            </Button>
          </div>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Questions" value={plan.actualCount} hint={plan.isShortMock ? `of ${cert.questionCount} official` : 'full length'} tone="brand" />
        <StatTile label="Time limit" value={`${cert.timeLimitMinutes} min`} hint="auto-submits at 0:00" />
        <StatTile label="Pass mark" value={cert.passingScore.split(' ')[0]} hint="scaled — estimate only" />
      </div>

      {plan.isShortMock && (
        <Card className="mt-4 border-warning/30 bg-warning/5 p-4">
          <div className="flex items-start gap-2 text-sm text-ink">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning" />
            <p>
              The verified question bank ({plan.actualCount}) is smaller than the official count ({cert.questionCount}).
              This is a clearly-labelled <strong>shorter mock</strong> — questions are never duplicated to pad the length.
            </p>
          </div>
        </Card>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
            <ListChecks className="h-4 w-4 text-brand" /> Domain composition
          </h2>
          <ul className="space-y-2 text-sm">
            {plan.domainComposition.map((d) => (
              <li key={d.domainId} className="flex items-center justify-between">
                <span className="text-ink">{d.title}</span>
                <span className="tabular-nums text-ink-muted">
                  {d.count} · target {Math.round(d.targetShare * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
            <GraduationCap className="h-4 w-4 text-brand" /> Provenance composition
          </h2>
          <p className="mb-3 text-xs text-ink-muted">
            Shown before you begin so you know exactly what mix of official and authored questions you are practising.
          </p>
          <ul className="flex flex-wrap gap-2">
            {Object.entries(plan.provenanceComposition).map(([prov, n]) => (
              <li key={prov}>
                <Badge tone={PROVENANCE_META[prov as Provenance].tone}>
                  {PROVENANCE_META[prov as Provenance].label}: {n}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Button variant="primary" onClick={startExam}>
          <Play className="h-4 w-4" /> {hasActive ? 'Start new exam' : 'Start mock exam'}
        </Button>
        <span className="flex items-center gap-1.5 text-sm text-ink-muted">
          <Clock className="h-4 w-4" /> Your progress is saved and survives a refresh.
        </span>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, Lock } from 'lucide-react';
import { PageHeader, Card, Badge, Segmented, EmptyState } from '@/components/ui';
import { useStore } from '@/hooks/store';
import { useActiveCertification } from '@/hooks/useDerived';
import { getLabs, domainById } from '@/data';
import type { Lab } from '@/schemas';

function LabCard({ lab }: { lab: Lab }) {
  const { state } = useStore();
  const completed = state.labProgress[lab.id]?.completed ?? false;

  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base font-semibold tracking-tight text-ink">{lab.title}</h2>
        {completed && (
          <span className="inline-flex flex-shrink-0 items-center text-success" title="Lab completed">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Completed</span>
          </span>
        )}
      </div>

      <p className="mt-1.5 flex-1 text-sm text-ink-muted">{lab.objective}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {lab.domainIds.map((id) => {
          const domain = domainById[id];
          return domain ? (
            <Badge key={id} tone="neutral">
              {domain.title}
            </Badge>
          ) : null;
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-ink-subtle">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          {lab.estimatedMinutes} min
        </span>
      </div>

      {lab.requiresPaidFeature && (
        <Badge tone="warning" className="mt-3 w-fit">
          <Lock className="h-3 w-3" aria-hidden="true" />
          Requires a paid feature
        </Badge>
      )}

      <Link
        to={`/labs/${lab.id}`}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
      >
        Open lab
      </Link>
    </Card>
  );
}

export function LabsPage() {
  const { cert, domains } = useActiveCertification();
  const [filter, setFilter] = useState<string>('all');

  const allLabs = getLabs(cert.id);
  const labs = filter === 'all' ? allLabs : allLabs.filter((l) => l.domainIds.includes(filter));

  const options: { label: string; value: string }[] = [
    { label: 'All', value: 'all' },
    ...domains.map((d) => ({ label: d.title, value: d.id })),
  ];

  return (
    <div>
      <PageHeader
        title="Labs"
        description="Hands-on exercises that build CCAO-F skills against safe, fictional data."
      />

      <div className="mb-4">
        <Segmented ariaLabel="Filter labs by domain" options={options} value={filter} onChange={setFilter} />
      </div>

      <p className="mb-4 text-sm text-ink-muted">
        {labs.length} lab{labs.length === 1 ? '' : 's'}
      </p>

      {labs.length === 0 ? (
        <EmptyState title="No labs in this domain" description="Try a different filter above." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {labs.map((lab) => (
            <LabCard key={lab.id} lab={lab} />
          ))}
        </div>
      )}
    </div>
  );
}

import { Link } from "react-router-dom";
import { BookOpen, ListChecks, ArrowRight } from "lucide-react";
import { PageHeader, Card, Badge, ProgressBar } from "@/components/ui";
import { useActiveCertification } from "@/hooks/useDerived";
import { useStore } from "@/hooks/store";
import { getLessonsForDomain } from "@/data";

function DomainCard({ domainId }: { domainId: string }) {
  const { domains } = useActiveCertification();
  const { state } = useStore();
  const domain = domains.find((d) => d.id === domainId);
  if (!domain) return null;

  const lessons = getLessonsForDomain(domain.id);
  const completedCount = lessons.filter(
    (l) => state.lessonProgress[l.id]?.completed,
  ).length;
  const progress = lessons.length > 0 ? completedCount / lessons.length : 0;
  const weightingPct = Math.round(domain.weighting * 100);

  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base font-semibold tracking-tight text-ink">
          {domain.title}
        </h2>
        <Badge tone="brand" className="flex-shrink-0">
          {weightingPct}%
        </Badge>
      </div>
      <p className="mt-1.5 flex-1 text-sm text-ink-muted">
        {domain.description}
      </p>

      <div className="mt-4 flex items-center gap-4 text-xs text-ink-subtle">
        <span className="inline-flex items-center gap-1.5">
          <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
          {domain.taskStatementIds.length} task statement
          {domain.taskStatementIds.length === 1 ? "" : "s"}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
          {lessons.length} lesson{lessons.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-xs text-ink-muted">
          <span>Completion</span>
          <span className="tabular-nums">
            {completedCount}/{lessons.length}
          </span>
        </div>
        <ProgressBar value={progress} label={`${domain.title} completion`} />
      </div>

      <Link
        to={`/learn/${domain.id}`}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
      >
        Open domain
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </Card>
  );
}

export function LearnPage() {
  const { domains } = useActiveCertification();
  const sortedDomains = [...domains].sort((a, b) => a.order - b.order);

  return (
    <div>
      <PageHeader
        title="Learn"
        description="Work through each exam domain: lessons, decision rules, diagrams and sources, organised by the official task statements."
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {sortedDomains.map((domain) => (
          <DomainCard key={domain.id} domainId={domain.id} />
        ))}
      </div>
    </div>
  );
}

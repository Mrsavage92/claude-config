import { useParams, Link } from "react-router-dom";
import { Bookmark, CheckCircle2, FlaskConical, HelpCircle } from "lucide-react";
import {
  PageHeader,
  Card,
  CardHeader,
  Badge,
  Button,
  EmptyState,
  Segmented,
  Toggle,
} from "@/components/ui";
import { Markdown } from "@/components/Markdown";
import { MermaidDiagram } from "@/components/MermaidDiagram";
import { SourceLinks } from "@/components/SourceLinks";
import { useStore } from "@/hooks/store";
import { useActiveCertification } from "@/hooks/useDerived";
import {
  getLessonsForDomain,
  getTaskStatements,
  getRelatedQuestions,
  labById,
} from "@/data";
import type { Lesson, TaskStatement } from "@/schemas";
import type { Understanding } from "@/schemas/enums";

const UNDERSTANDING_OPTIONS: { label: string; value: Understanding }[] = [
  { label: "New", value: "new" },
  { label: "Learning", value: "learning" },
  { label: "Understood", value: "understood" },
  { label: "Needs revision", value: "needs-revision" },
];

/** Strip characters that would break a quoted mermaid node label. */
function sanitiseTitle(title: string): string {
  return title.replace(/"/g, "");
}

/** Keep node labels short: task code plus the first few words of the title. */
function shortLabel(ts: TaskStatement): string {
  const words = sanitiseTitle(ts.title).split(/\s+/).slice(0, 4).join(" ");
  return `${ts.code} ${words}`;
}

function buildTaskStatementChart(taskStatements: TaskStatement[]): string {
  const nodes = taskStatements.map((ts, i) => `  n${i}["${shortLabel(ts)}"]`);
  const edges = taskStatements.slice(1).map((_, i) => `  n${i} --> n${i + 1}`);
  return ["flowchart TB", ...nodes, ...edges].join("\n");
}

function LessonSection({
  lesson,
  domainId,
}: {
  lesson: Lesson;
  domainId: string;
}) {
  const { state, patchLesson } = useStore();
  const progress = state.lessonProgress[lesson.id];
  const completed = progress?.completed ?? false;
  const bookmarked = progress?.bookmarked ?? false;
  const understanding: Understanding = progress?.understanding ?? "new";
  const note = progress?.note ?? "";

  const relatedLabs = lesson.relatedLabIds
    .map((id) => labById[id])
    .filter((l): l is NonNullable<typeof l> => Boolean(l));
  const relatedQuestions = getRelatedQuestions(lesson);
  const noteId = `lesson-note-${lesson.id}`;

  return (
    <div id={lesson.id} className="scroll-mt-4">
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-ink">
              {lesson.title}
            </h2>
            <p className="mt-1 text-sm text-ink-muted">{lesson.summary}</p>
          </div>
          <Badge tone="neutral" className="flex-shrink-0">
            {lesson.estimatedMinutes} min
          </Badge>
        </div>

        <Markdown className="mt-4">{lesson.content}</Markdown>

        {lesson.keyPrinciples.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-ink">Key principles</h3>
            <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-ink-muted">
              {lesson.keyPrinciples.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
        )}

        {lesson.decisionRules.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-ink">Decision rules</h3>
            <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-ink-muted">
              {lesson.decisionRules.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        {lesson.commonPitfalls.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-ink">Common pitfalls</h3>
            <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-ink-muted">
              {lesson.commonPitfalls.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
        )}

        {lesson.sourceIds.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-ink">Sources</h3>
            <div className="mt-1.5">
              <SourceLinks sourceIds={lesson.sourceIds} />
            </div>
          </div>
        )}

        {relatedLabs.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-ink">Related labs</h3>
            <ul className="mt-1.5 flex flex-wrap gap-2">
              {relatedLabs.map((lab) => (
                <li key={lab.id}>
                  <Link
                    to={`/labs/${lab.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-raised px-2.5 py-1 text-xs text-ink-muted hover:border-brand/40 hover:text-brand"
                  >
                    <FlaskConical className="h-3 w-3" aria-hidden="true" />
                    {lab.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {relatedQuestions.length > 0 && (
          <div className="mt-4">
            <Link
              to={`/practice?domain=${domainId}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
            >
              <HelpCircle className="h-4 w-4" aria-hidden="true" />
              {relatedQuestions.length} related question
              {relatedQuestions.length === 1 ? "" : "s"} in Practice
            </Link>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-4">
          <Button
            variant={completed ? "primary" : "secondary"}
            onClick={() => patchLesson(lesson.id, { completed: !completed })}
            aria-pressed={completed}
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {completed ? "Completed" : "Mark complete"}
          </Button>

          <label
            className="inline-flex items-center gap-2 text-sm text-ink-muted"
            htmlFor={`bookmark-${lesson.id}`}
          >
            <Toggle
              id={`bookmark-${lesson.id}`}
              checked={bookmarked}
              onChange={(v) => patchLesson(lesson.id, { bookmarked: v })}
              label={`Bookmark ${lesson.title}`}
            />
            <Bookmark className="h-4 w-4" aria-hidden="true" />
            Bookmark
          </label>

          <Segmented
            ariaLabel={`Understanding level for ${lesson.title}`}
            options={UNDERSTANDING_OPTIONS}
            value={understanding}
            onChange={(v) => patchLesson(lesson.id, { understanding: v })}
          />
        </div>

        <div className="mt-4">
          <label
            htmlFor={noteId}
            className="mb-1.5 block text-sm font-medium text-ink"
          >
            Your notes
          </label>
          <textarea
            id={noteId}
            value={note}
            onChange={(e) => patchLesson(lesson.id, { note: e.target.value })}
            rows={3}
            placeholder="Jot down anything worth remembering about this lesson…"
            className="w-full rounded-lg border border-line bg-surface-raised px-3 py-2 text-sm text-ink placeholder:text-ink-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          />
        </div>
      </Card>
    </div>
  );
}

export function LearnDomainPage() {
  const { domainId } = useParams<{ domainId: string }>();
  const { domains } = useActiveCertification();
  const domain = domains.find((d) => d.id === domainId);

  if (!domain) {
    return (
      <EmptyState
        title="Domain not found"
        description="This domain doesn't exist for the active certification."
        action={
          <Link to="/learn">
            <Button variant="primary">Back to Learn</Button>
          </Link>
        }
      />
    );
  }

  const taskStatements = getTaskStatements(domain.id);
  const lessons = getLessonsForDomain(domain.id);
  const chart = buildTaskStatementChart(taskStatements);
  const weightingPct = Math.round(domain.weighting * 100);

  return (
    <div>
      <PageHeader
        title={domain.title}
        description={domain.description}
        actions={
          <>
            <Link to={`/practice?domain=${domain.id}`}>
              <Button variant="primary">Practise this domain</Button>
            </Link>
            <Link to="/labs">
              <Button variant="secondary">Related labs</Button>
            </Link>
          </>
        }
      />

      <Card className="mb-6">
        <CardHeader
          title="Domain overview"
          subtitle={`Exam weighting: ${weightingPct}%`}
          action={<Badge tone="brand">{weightingPct}%</Badge>}
        />
        <div className="p-5">
          <h3 className="text-sm font-semibold text-ink">Task statements</h3>
          <ul className="mt-2 space-y-1.5">
            {taskStatements.map((ts) => (
              <li key={ts.id} className="flex gap-2 text-sm text-ink-muted">
                <span className="flex-shrink-0 font-medium text-ink">
                  {ts.code}
                </span>
                <span>{ts.title}</span>
              </li>
            ))}
          </ul>

          {taskStatements.length > 0 && (
            <MermaidDiagram
              chart={chart}
              summary="The task statements of this domain in sequence."
            />
          )}
        </div>
      </Card>

      {lessons.length === 0 ? (
        <EmptyState
          title="No lessons yet"
          description="Lessons for this domain haven't been published yet."
        />
      ) : (
        <div className="space-y-5">
          {lessons.map((lesson) => (
            <LessonSection
              key={lesson.id}
              lesson={lesson}
              domainId={domain.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

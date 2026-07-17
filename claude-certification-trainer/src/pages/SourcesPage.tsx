import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { PageHeader, Card, Badge, Segmented, type Tone } from '@/components/ui';
import { sources } from '@/data';
import type { Source } from '@/schemas';
import type { SourceType } from '@/schemas/enums';

type FilterValue = 'all' | 'official' | 'community';

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: 'All', value: 'all' },
  { label: 'Official', value: 'official' },
  { label: 'Community & independent', value: 'community' },
];

const SOURCE_TYPE_META: Record<SourceType, { label: string; tone: Tone }> = {
  'official-certification-guide': { label: 'Official certification guide', tone: 'success' },
  'official-documentation': { label: 'Official documentation', tone: 'success' },
  'official-policy': { label: 'Official policy', tone: 'success' },
  'official-blog': { label: 'Official blog', tone: 'info' },
  'community-study-guide': { label: 'Community study guide', tone: 'warning' },
  'independently-authored': { label: 'Independently authored', tone: 'neutral' },
};

function isOfficial(source: Source): boolean {
  return source.sourceType.startsWith('official');
}

function sortSources(list: Source[]): Source[] {
  return [...list].sort((a, b) => {
    const officialA = isOfficial(a) ? 0 : 1;
    const officialB = isOfficial(b) ? 0 : 1;
    if (officialA !== officialB) return officialA - officialB;
    return a.title.localeCompare(b.title);
  });
}

export function SourcesPage() {
  const [filter, setFilter] = useState<FilterValue>('all');

  const filtered = sources.filter((s) => {
    if (filter === 'official') return isOfficial(s);
    if (filter === 'community') return !isOfficial(s);
    return true;
  });
  const sorted = sortSources(filtered);

  return (
    <div>
      <PageHeader
        title="Sources"
        description="Every citation used to build this trainer, so you can verify claims against the original material yourself."
      />

      <Card className="mb-6 border-brand/30 bg-brand/5 p-5">
        <h2 className="text-sm font-semibold text-ink">Attribution</h2>
        <p className="mt-2 text-sm text-ink-muted">
          This application adapts structured study content from{' '}
          <a
            href="https://github.com/evggzzz/ccao-f-guide"
            target="_blank"
            rel="noreferrer noopener"
            className="font-medium text-brand hover:underline"
          >
            evggzzz/ccao-f-guide
          </a>
          , an independent study guide licensed under{' '}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noreferrer noopener"
            className="font-medium text-brand hover:underline"
          >
            CC BY 4.0
          </a>
          . The original repository is not an official Anthropic product.
        </p>
        <p className="mt-2 text-sm text-ink-muted">
          Anthropic retains ownership of its trademarks and official documentation. This application is
          independent, unofficial study software and is not endorsed by, affiliated with, or sponsored by
          Anthropic.
        </p>
      </Card>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Segmented ariaLabel="Filter sources" options={FILTERS} value={filter} onChange={setFilter} />
        <p className="text-sm text-ink-muted">
          {sorted.length} source{sorted.length === 1 ? '' : 's'}
        </p>
      </div>

      <p className="mb-4 text-xs text-ink-subtle">
        Confidence reflects how directly a source maps to the current exam blueprint (high = official and
        current, medium = official but subject to change or partially adapted, low = uncertain). Last
        verified is when this citation was last checked against the live source, not a guarantee the source
        hasn&apos;t changed since.
      </p>

      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line bg-surface-sunken text-left text-xs uppercase tracking-wide text-ink-subtle">
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Publisher</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Confidence</th>
              <th className="px-4 py-3 font-medium">Last verified</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((source) => {
              const meta = SOURCE_TYPE_META[source.sourceType];
              return (
                <tr key={source.id} className="border-b border-line last:border-b-0">
                  <td className="px-4 py-3 align-top">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-start gap-1.5 font-medium text-brand hover:underline"
                    >
                      <ExternalLink className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                      <span>{source.title}</span>
                    </a>
                    {source.notes && <p className="mt-1 max-w-md text-xs text-ink-muted">{source.notes}</p>}
                  </td>
                  <td className="px-4 py-3 align-top text-ink-muted">{source.publisher}</td>
                  <td className="px-4 py-3 align-top">
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                  </td>
                  <td className="px-4 py-3 align-top capitalize text-ink-muted">{source.confidence}</td>
                  <td className="px-4 py-3 align-top text-ink-muted">{source.lastVerifiedAt}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

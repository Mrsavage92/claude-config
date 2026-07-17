import { ExternalLink } from 'lucide-react';
import { getSourcesForIds } from '@/data';
import { Badge } from './ui';

export function SourceLinks({ sourceIds, compact = false }: { sourceIds: string[]; compact?: boolean }) {
  const sources = getSourcesForIds(sourceIds);
  if (sources.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-2">
      {sources.map((s) => (
        <li key={s.id}>
          <a
            href={s.url}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-raised px-2.5 py-1 text-xs text-ink-muted transition-colors hover:border-brand/40 hover:text-brand"
          >
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
            <span>{s.title}</span>
            {!compact && !s.sourceType.startsWith('official') && (
              <Badge tone="neutral" className="ml-1">
                community
              </Badge>
            )}
          </a>
        </li>
      ))}
    </ul>
  );
}

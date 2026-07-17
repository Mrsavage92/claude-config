import type { Difficulty, Provenance } from '@/schemas';
import { Badge, type Tone } from './ui';

export const PROVENANCE_META: Record<Provenance, { label: string; tone: Tone; official: boolean; blurb: string }> = {
  'official-sample': { label: 'Official sample', tone: 'success', official: true, blurb: 'Reproduced from the official CCAO-F Exam Guide sample questions.' },
  'official-blueprint-derived': { label: 'Blueprint-derived', tone: 'success', official: true, blurb: 'Derived directly from the official exam blueprint.' },
  'official-documentation-derived': { label: 'Docs-derived', tone: 'info', official: true, blurb: 'Derived from official Anthropic documentation.' },
  'repository-authored': { label: 'Study-guide item', tone: 'neutral', official: false, blurb: 'Authored by the community study guide this trainer adapts, grounded in official sources.' },
  'independently-authored': { label: 'Independently authored', tone: 'neutral', official: false, blurb: 'Written for this trainer, grounded in cited official sources. Not an official exam question.' },
  unclear: { label: 'Unclear provenance', tone: 'warning', official: false, blurb: 'Provenance could not be confirmed — treated as unofficial.' },
};

export function ProvenanceBadge({ provenance }: { provenance: Provenance }) {
  const meta = PROVENANCE_META[provenance];
  return (
    <Badge tone={meta.tone}>
      <span title={meta.blurb}>{meta.label}</span>
    </Badge>
  );
}

const DIFFICULTY_META: Record<Difficulty, { label: string; tone: Tone }> = {
  easy: { label: 'Easy', tone: 'success' },
  moderate: { label: 'Moderate', tone: 'info' },
  difficult: { label: 'Difficult', tone: 'warning' },
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const meta = DIFFICULTY_META[difficulty];
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

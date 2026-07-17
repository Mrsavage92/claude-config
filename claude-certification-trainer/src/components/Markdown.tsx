import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/utils/cn';
import { MermaidDiagram } from './MermaidDiagram';

/**
 * Long-form study Markdown renderer. GFM tables and lists are supported; the
 * `.prose-study` class styles the output. Fenced ```mermaid blocks render as
 * interactive diagrams with a text summary derived from a leading
 * `%% summary: ...` comment when present.
 */

function extractSummary(code: string): { chart: string; summary: string } {
  const lines = code.split('\n');
  const first = lines[0]?.trim() ?? '';
  const match = first.match(/^%%\s*summary:\s*(.+?)\s*%%?$/i);
  if (match) {
    return { chart: lines.slice(1).join('\n'), summary: match[1] };
  }
  return { chart: code, summary: 'A flow diagram summarising this concept.' };
}

const components: Components = {
  code({ className, children, ...props }) {
    const text = String(children ?? '');
    if (className?.includes('language-mermaid')) {
      const { chart, summary } = extractSummary(text.replace(/\n$/, ''));
      return <MermaidDiagram chart={chart} summary={summary} />;
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
};

export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn('prose-study', className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}

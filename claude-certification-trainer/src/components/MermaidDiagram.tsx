import { useEffect, useId, useRef, useState } from 'react';
import { useStore } from '@/hooks/store';

/**
 * Lazily-loaded Mermaid diagram. Mermaid is a large dependency, so it is
 * imported dynamically only when a diagram actually renders. A text summary is
 * always provided for screen readers and as a fallback if rendering fails.
 */
export function MermaidDiagram({ chart, summary }: { chart: string; summary: string }) {
  const { state } = useStore();
  const isDark = document.documentElement.classList.contains('dark');
  const [svg, setSvg] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const id = `m${rawId}`;
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    let cancelled = false;
    (async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? 'dark' : 'neutral',
          securityLevel: 'strict',
          fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
        });
        const { svg: out } = await mermaid.render(id, chart);
        if (!cancelled && mounted.current) setSvg(out);
      } catch {
        if (!cancelled && mounted.current) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
      mounted.current = false;
    };
    // Re-render on theme change.
  }, [chart, id, isDark, state.theme.mode]);

  return (
    <figure className="my-4 overflow-x-auto rounded-lg border border-line bg-surface-sunken p-4">
      {svg && !failed ? (
        <div className="flex justify-center [&_svg]:h-auto [&_svg]:max-w-full" dangerouslySetInnerHTML={{ __html: svg }} aria-hidden="true" />
      ) : (
        !failed && <div className="py-6 text-center text-sm text-ink-subtle">Rendering diagram…</div>
      )}
      <figcaption className="mt-2 text-sm text-ink-muted">
        <span className="font-medium text-ink">Diagram: </span>
        {summary}
      </figcaption>
    </figure>
  );
}

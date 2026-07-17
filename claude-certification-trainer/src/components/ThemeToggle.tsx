import { Monitor, Moon, Sun } from 'lucide-react';
import { useStore } from '@/hooks/store';
import type { ThemeMode } from '@/schemas';
import { cn } from '@/utils/cn';

const OPTIONS: { mode: ThemeMode; icon: typeof Sun; label: string }[] = [
  { mode: 'light', icon: Sun, label: 'Light' },
  { mode: 'dark', icon: Moon, label: 'Dark' },
  { mode: 'system', icon: Monitor, label: 'System' },
];

export function ThemeToggle() {
  const { state, setTheme } = useStore();
  return (
    <div className="inline-flex rounded-lg border border-line bg-surface-sunken p-0.5" role="group" aria-label="Theme">
      {OPTIONS.map((o) => {
        const Icon = o.icon;
        const active = state.theme.mode === o.mode;
        return (
          <button
            key={o.mode}
            type="button"
            onClick={() => setTheme(o.mode)}
            aria-pressed={active}
            aria-label={`${o.label} theme`}
            title={`${o.label} theme`}
            className={cn(
              'rounded-md p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
              active ? 'bg-surface-raised text-brand shadow-sm' : 'text-ink-subtle hover:text-ink',
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}

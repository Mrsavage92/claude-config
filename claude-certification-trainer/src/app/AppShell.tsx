import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, X, AlertTriangle, GraduationCap } from 'lucide-react';
import { NAV_ITEMS, GROUP_LABELS, type NavItem } from './nav';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useStore } from '@/hooks/store';
import { useActiveCertification, useReadiness } from '@/hooks/useDerived';
import { readinessLabel } from '@/services/readiness';
import { cn } from '@/utils/cn';
import { Badge } from '@/components/ui';

const GROUPS: NavItem['group'][] = ['study', 'practice', 'insights'];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-6 px-3 py-4" aria-label="Primary">
      {GROUPS.map((group) => (
        <div key={group}>
          <div className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
            {GROUP_LABELS[group]}
          </div>
          <ul className="space-y-0.5">
            {NAV_ITEMS.filter((i) => i.group === group).map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                        isActive ? 'bg-brand/10 text-brand' : 'text-ink-muted hover:bg-surface-sunken hover:text-ink',
                      )
                    }
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                    {item.label}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function CertHeader() {
  const { cert } = useActiveCertification();
  return (
    <div className="flex items-center gap-2.5 border-b border-line px-5 py-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
        <GraduationCap className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-ink">Claude Certification Trainer</div>
        <div className="truncate text-xs text-ink-muted">{cert.code} · {cert.name}</div>
      </div>
    </div>
  );
}

function ReadinessMini() {
  const readiness = useReadiness();
  const { label, tone } = readinessLabel(readiness.score);
  return (
    <div className="border-t border-line px-5 py-4">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-subtle">Practice readiness</span>
        <span className="text-sm font-semibold tabular-nums text-ink">{readiness.hasData ? readiness.score : '—'}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken">
        <div
          className={cn('h-full rounded-full transition-all', {
            'bg-danger': tone === 'danger',
            'bg-warning': tone === 'warning',
            'bg-info': tone === 'info',
            'bg-success': tone === 'success',
          })}
          style={{ width: `${readiness.hasData ? readiness.score : 0}%` }}
        />
      </div>
      <div className="mt-1.5 text-xs text-ink-muted">{readiness.hasData ? label : 'Start practising to see your estimate'}</div>
    </div>
  );
}

export function DisclaimerBanner() {
  return (
    <div className="flex items-center gap-2 bg-warning/10 px-4 py-1.5 text-center text-xs text-warning" role="note">
      <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
      <span className="mx-auto">
        Independent study application. Not affiliated with, authorised by or endorsed by Anthropic.
      </span>
    </div>
  );
}

function RecoveryNotice() {
  const { recovered, recoveryReason, dismissRecovery } = useStore();
  if (!recovered) return null;
  return (
    <div className="flex items-center gap-2 bg-danger/10 px-4 py-2 text-sm text-danger">
      <AlertTriangle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <span className="flex-1">{recoveryReason ?? 'Saved data was reset due to a problem.'}</span>
      <button onClick={dismissRecovery} className="rounded p-1 hover:bg-danger/20" aria-label="Dismiss">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close the mobile drawer on route change.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-full flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to main content
      </a>
      <DisclaimerBanner />
      <RecoveryNotice />

      <div className="flex min-h-0 flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-line bg-surface-raised lg:flex">
          <CertHeader />
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <NavList />
            <ReadinessMini />
          </div>
        </aside>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} aria-hidden="true" />
            <div className="absolute inset-y-0 left-0 flex w-72 max-w-[80%] flex-col bg-surface-raised shadow-xl">
              <CertHeader />
              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                <NavList onNavigate={() => setMobileOpen(false)} />
                <ReadinessMini />
              </div>
            </div>
          </div>
        )}

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-3 border-b border-line bg-surface-raised px-4 py-2.5 lg:justify-end">
            <button
              type="button"
              className="rounded-lg p-2 text-ink-muted hover:bg-surface-sunken lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <Badge tone="brand" className="hidden sm:inline-flex">
                Local-first · no account
              </Badge>
              <ThemeToggle />
            </div>
          </header>

          <main id="main-content" tabIndex={-1} className="min-h-0 flex-1 overflow-y-auto focus:outline-none">
            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

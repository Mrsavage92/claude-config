import { useRef, useState, type ChangeEvent } from 'react';
import { Download, Upload, AlertTriangle, ShieldCheck } from 'lucide-react';
import { PageHeader, Card, CardHeader, Toggle, Segmented, Button } from '@/components/ui';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useStore } from '@/hooks/store';
import { buildExport, parseImport } from '@/services/storage/storage';

const RAPID_FIRE_ROUND_OPTIONS = [5, 10, 20] as const;
const RAPID_FIRE_TIMER_OPTIONS: { label: string; value: number }[] = [
  { label: '15s', value: 15 },
  { label: '30s', value: 30 },
  { label: '45s', value: 45 },
  { label: 'Untimed', value: 0 },
];

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function SettingsPage() {
  const { state, updateSettings, replaceState, reset } = useStore();
  const { settings } = state;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMessage, setImportMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);

  function handleExport() {
    const envelope = buildExport(state);
    const filename = `claude-cert-trainer-progress.json`;
    downloadJson(filename, envelope);
  }

  async function handleImportChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset the input so selecting the same file again still fires change.
    event.target.value = '';
    if (!file) return;

    const text = await file.text();
    const result = parseImport(text);
    if (result.ok && result.state) {
      replaceState(result.state);
      setImportMessage({ ok: true, text: 'Progress imported successfully.' });
    } else {
      setImportMessage({ ok: false, text: result.error ?? 'Import failed.' });
    }
  }

  function handleResetConfirm() {
    reset();
    setConfirmingReset(false);
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Appearance, practice defaults, and local data controls."
      />

      <div className="space-y-6">
        {/* Appearance --------------------------------------------------- */}
        <Card>
          <CardHeader title="Appearance" subtitle="Theme and motion preferences." />
          <div className="space-y-5 px-5 py-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-ink">Theme</div>
                <p className="text-sm text-ink-muted">Choose light, dark, or match your system.</p>
              </div>
              <ThemeToggle />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <label htmlFor="reduce-motion-toggle" className="text-sm font-medium text-ink">
                  Reduce motion
                </label>
                <p className="text-sm text-ink-muted">Minimise animations and transitions across the app.</p>
              </div>
              <Toggle
                id="reduce-motion-toggle"
                checked={settings.reduceMotion}
                onChange={(reduceMotion) => updateSettings({ reduceMotion })}
                label="Reduce motion"
              />
            </div>
          </div>
        </Card>

        {/* Practice defaults --------------------------------------------- */}
        <Card>
          <CardHeader title="Practice defaults" subtitle="Applied when starting new practice sessions." />
          <div className="space-y-5 px-5 py-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <label htmlFor="provenance-badges-toggle" className="text-sm font-medium text-ink">
                  Show provenance badges
                </label>
                <p className="text-sm text-ink-muted">
                  Display a badge indicating whether a question is official, study-guide, or independently authored.
                </p>
              </div>
              <Toggle
                id="provenance-badges-toggle"
                checked={settings.showProvenanceBadges}
                onChange={(showProvenanceBadges) => updateSettings({ showProvenanceBadges })}
                label="Show provenance badges"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <label htmlFor="confirm-mock-submit-toggle" className="text-sm font-medium text-ink">
                  Confirm before mock submit
                </label>
                <p className="text-sm text-ink-muted">Ask for confirmation before finishing a mock exam.</p>
              </div>
              <Toggle
                id="confirm-mock-submit-toggle"
                checked={settings.confirmBeforeMockSubmit}
                onChange={(confirmBeforeMockSubmit) => updateSettings({ confirmBeforeMockSubmit })}
                label="Confirm before mock submit"
              />
            </div>

            <div>
              <div className="mb-2 text-sm font-medium text-ink">Rapid Fire default round length</div>
              <Segmented
                ariaLabel="Rapid Fire default round length"
                value={settings.rapidFireDefaultRound}
                onChange={(rapidFireDefaultRound) => updateSettings({ rapidFireDefaultRound })}
                options={RAPID_FIRE_ROUND_OPTIONS.map((n) => ({ label: `${n}`, value: n }))}
              />
            </div>

            <div>
              <div className="mb-2 text-sm font-medium text-ink">Rapid Fire default timer</div>
              <Segmented
                ariaLabel="Rapid Fire default timer"
                value={settings.rapidFireDefaultTimer}
                onChange={(rapidFireDefaultTimer) => updateSettings({ rapidFireDefaultTimer })}
                options={RAPID_FIRE_TIMER_OPTIONS}
              />
            </div>
          </div>
        </Card>

        {/* Data & progress ------------------------------------------------ */}
        <Card>
          <CardHeader
            title="Data & progress"
            subtitle="All progress is stored locally in your browser (localStorage). Nothing is uploaded."
          />
          <div className="space-y-5 px-5 py-5">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="secondary" onClick={handleExport}>
                <Download className="h-4 w-4" aria-hidden="true" />
                Export progress
              </Button>

              <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4" aria-hidden="true" />
                Import progress
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                aria-label="Import progress file"
                onChange={handleImportChange}
              />
            </div>

            {importMessage && (
              <p
                className={
                  importMessage.ok
                    ? 'flex items-center gap-1.5 text-sm text-success'
                    : 'flex items-center gap-1.5 text-sm text-danger'
                }
                role="status"
              >
                {importMessage.ok ? (
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                )}
                {importMessage.text}
              </p>
            )}

            <div className="border-t border-line pt-5">
              <div className="mb-2 text-sm font-medium text-ink">Reset all progress</div>
              {!confirmingReset ? (
                <Button variant="danger" onClick={() => setConfirmingReset(true)}>
                  Reset progress
                </Button>
              ) : (
                <div className="rounded-lg border border-danger/30 bg-danger/5 p-4">
                  <p className="flex items-center gap-1.5 text-sm font-medium text-danger">
                    <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                    Are you sure? This erases all local progress.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button variant="danger" onClick={handleResetConfirm}>
                      Confirm reset
                    </Button>
                    <Button variant="secondary" onClick={() => setConfirmingReset(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

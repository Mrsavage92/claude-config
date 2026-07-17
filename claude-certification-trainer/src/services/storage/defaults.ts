import type { PersistedState, Settings, Theme } from '@/schemas';
import { CURRENT_STATE_VERSION } from '@/schemas';
import { activeCertificationId } from '@/data/certifications';

export const defaultSettings: Settings = {
  activeCertificationId,
  reduceMotion: false,
  rapidFireDefaultRound: 10,
  rapidFireDefaultTimer: 30,
  showProvenanceBadges: true,
  confirmBeforeMockSubmit: true,
};

export const defaultTheme: Theme = { mode: 'system' };

export function makeDefaultState(): PersistedState {
  return {
    version: CURRENT_STATE_VERSION,
    settings: { ...defaultSettings },
    theme: { ...defaultTheme },
    attempts: [],
    lessonProgress: {},
    labProgress: {},
    questionMeta: {},
    reviewItems: {},
    mockResults: [],
    activeMockSession: null,
  };
}

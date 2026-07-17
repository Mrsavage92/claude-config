import { useEffect } from 'react';
import { useStore } from './store';

/**
 * Applies the current theme mode to <html> and keeps it in sync with the OS
 * preference when mode is 'system'. Also toggles the reduce-motion class.
 */
export function useThemeEffect() {
  const { state } = useStore();
  const mode = state.theme.mode;
  const reduceMotion = state.settings.reduceMotion;

  useEffect(() => {
    const root = document.documentElement;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');

    const apply = () => {
      const dark = mode === 'dark' || (mode === 'system' && mql.matches);
      root.classList.toggle('dark', dark);
    };
    apply();

    if (mode === 'system') {
      mql.addEventListener('change', apply);
      return () => mql.removeEventListener('change', apply);
    }
  }, [mode]);

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reduceMotion);
  }, [reduceMotion]);
}

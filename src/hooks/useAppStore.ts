import { useSyncExternalStore } from 'react';
import { store, AppState } from '@/services/store';

export function useAppStore<T = AppState>(selector?: (state: AppState) => T): T {
  const state = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot
  );

  if (selector) {
    return selector(state);
  }

  return state as unknown as T;
}

// Helpers for formatted currency and numbers
export function formatFCFA(amount: number): string {
  // French locale with non-breaking spaces
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
}

export function formatNumberFR(val: number): string {
  return new Intl.NumberFormat('fr-FR').format(val);
}


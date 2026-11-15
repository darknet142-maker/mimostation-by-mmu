import { useRef, useSyncExternalStore } from 'react';
import { store, AppState } from '@/services/store';

function shallowEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
    return false;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!Object.is(a[i], b[i])) return false;
    }
    return true;
  }
  const objA = a as Record<string, unknown>;
  const objB = b as Record<string, unknown>;
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(objB, key) || !Object.is(objA[key], objB[key])) {
      return false;
    }
  }
  return true;
}

export function useAppStore(): AppState;
export function useAppStore<T>(selector: (state: AppState) => T): T;
export function useAppStore<T = AppState>(selector?: (state: AppState) => T): AppState | T {
  const cachedRef = useRef<{ state: AppState; value: T } | null>(null);

  const getSelectedSnapshot = () => {
    const state = store.getSnapshot();
    if (!selector) {
      return state;
    }
    if (cachedRef.current && Object.is(cachedRef.current.state, state)) {
      return cachedRef.current.value;
    }
    const nextValue = selector(state);
    if (cachedRef.current && shallowEqual(cachedRef.current.value, nextValue)) {
      cachedRef.current.state = state;
      return cachedRef.current.value;
    }
    cachedRef.current = { state, value: nextValue };
    return nextValue;
  };

  return useSyncExternalStore(
    store.subscribe,
    getSelectedSnapshot,
    getSelectedSnapshot
  );
}

// Helpers for formatted currency and numbers
export function formatFCFA(amount: number): string {
  // French locale with non-breaking spaces
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
}

export function formatNumberFR(val: number): string {
  return new Intl.NumberFormat('fr-FR').format(val);
}


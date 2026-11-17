"use client";

import { useSyncExternalStore } from "react";
import { initialState, reducer, type DemoAction, type DemoState } from "@/lib/demo/state";
import { loadState, saveState } from "@/lib/demo/storage";

// One module-level store, so the demo also survives moving between screens when browser
// storage is blocked (the in-memory fallback). Screens read only this hook.
let current: DemoState | null = null;
const listeners = new Set<() => void>();
const serverState = initialState();

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null; // blocked, e.g. a third-party frame or a private window
  }
}

function getSnapshot(): DemoState {
  // First client read: React shows the server snapshot during hydration, then switches to this one.
  if (current === null) current = loadState(storage());
  return current;
}

function getServerSnapshot(): DemoState {
  return serverState;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function dispatch(action: DemoAction): void {
  const next = reducer(getSnapshot(), action);
  if (next === current) return;
  current = next;
  saveState(storage(), next);
  listeners.forEach((l) => l());
}

export function useDemo(): { state: DemoState; dispatch: (a: DemoAction) => void } {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { state, dispatch };
}

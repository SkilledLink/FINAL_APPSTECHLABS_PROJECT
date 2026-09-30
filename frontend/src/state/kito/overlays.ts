import type { KitoOverlay } from './types';

type Fired = Exclude<KitoOverlay, null>;
type Listener = (o: Fired) => void;

const listeners = new Set<Listener>();

export const kitoOverlays = {
  success: () => listeners.forEach((l) => l('success')),
  confused: () => listeners.forEach((l) => l('confused')),
  subscribe: (l: Listener) => {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
};
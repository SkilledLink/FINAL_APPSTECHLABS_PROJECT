import { createContext, useContext } from 'react';
import type { KitoState } from '../../../state/kito/types';

const defaultValue: KitoState = {
  base: 'idle',
  overlay: null,
  cursorX: 0,
  cursorY: 0,
  hand: 'grip',
  mouth: 'smile',
  brows: 'neutral',
};

const KitoContext = createContext<KitoState>(defaultValue);

export const KitoProvider = KitoContext.Provider;
export const useKitoContext = () => useContext(KitoContext);
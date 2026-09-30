import { Kito } from './Kito';
import { KitoProvider } from './rig/KitoContext';
import { useKitoState } from '../../hooks/useKitoState';

export function KitoStage() {
  const state = useKitoState();

  return (
    <div
      aria-hidden="true"
      data-kito-stage
      data-kito-base={state.base}
      data-kito-overlay={state.overlay ?? ''}
      style={{
        position: 'fixed',
        right: '1.25rem',
        bottom: 0,
        zIndex: 50,
        pointerEvents: 'none',
        height: 'clamp(180px, 22vh, 300px)',
        aspectRatio: '400 / 700',
      }}
    >
      <KitoProvider value={state}>
        <Kito />
      </KitoProvider>
    </div>
  );
}
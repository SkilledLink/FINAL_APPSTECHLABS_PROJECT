import { useState } from 'react';
import { Kito } from '../components/mascot/Kito';
import { KitoProvider } from '../components/mascot/rig/KitoContext';
import type {
  KitoBase,
  KitoOverlay,
  KitoState,
  HandVariant,
  MouthVariant,
  BrowVariant,
} from '../state/kito/types';

const BASES: KitoBase[] = [
  'idle', 'look', 'walk', 'fastScroll', 'settle',
  'point', 'search', 'plan', 'work',
];

const OVERLAYS: Exclude<KitoOverlay, null>[] = ['success', 'confused'];

const SIZES = [
  { label: '300px', height: 300 },
  { label: '250px', height: 250 },
  { label: '180px', height: 180 },
];

function deriveSwap(base: KitoBase, overlay: KitoOverlay) {
  if (overlay === 'success') return { hand: 'thumbsup' as HandVariant, mouth: 'open' as MouthVariant, brows: 'raised' as BrowVariant };
  if (overlay === 'confused') return { hand: 'grip' as HandVariant, mouth: 'flat' as MouthVariant, brows: 'furrowed' as BrowVariant };
  if (base === 'point') return { hand: 'point' as HandVariant, mouth: 'smile' as MouthVariant, brows: 'neutral' as BrowVariant };
  return { hand: 'grip' as HandVariant, mouth: 'smile' as MouthVariant, brows: 'neutral' as BrowVariant };
}

export function KitoLab() {
  const [base, setBase] = useState<KitoBase>('idle');
  const [overlay, setOverlay] = useState<KitoOverlay>(null);
  const [cursor, setCursor] = useState({ x: 0.6, y: -0.3 });
  const [size, setSize] = useState(300);

  const swap = deriveSwap(base, overlay);
  const state: KitoState = { base, overlay, cursorX: cursor.x, cursorY: cursor.y, ...swap };

  const btn = (label: string, active: boolean, onClick: () => void) => (
    <button
      key={label}
      onClick={onClick}
      style={{
        padding: '6px 12px',
        borderRadius: 6,
        border: active ? '2px solid #1E40AF' : '1px solid #CBD5E1',
        background: active ? '#DBEAFE' : '#FFFFFF',
        color: '#0F172A',
        fontSize: 13,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif', background: '#F8FAFC', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>Kito Lab</h1>
      <p style={{ color: '#475569', fontSize: 13, marginBottom: 24 }}>
        Phase 2 — manually drive every state.
      </p>

      <section style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 14, marginBottom: 8 }}>Base</h2>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {BASES.map((b) => btn(b, base === b, () => setBase(b)))}
        </div>
      </section>

      <section style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 14, marginBottom: 8 }}>Overlay</h2>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {btn('none', overlay === null, () => setOverlay(null))}
          {OVERLAYS.map((o) => btn(o, overlay === o, () => setOverlay(o)))}
        </div>
      </section>

      <section style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 14, marginBottom: 8 }}>Cursor</h2>
        <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#475569' }}>
          <label>
            x: {cursor.x.toFixed(2)}
            <input
              type="range" min={-1} max={1} step={0.01}
              value={cursor.x}
              onChange={(e) => setCursor((c) => ({ ...c, x: Number(e.target.value) }))}
              style={{ display: 'block' }}
            />
          </label>
          <label>
            y: {cursor.y.toFixed(2)}
            <input
              type="range" min={-1} max={1} step={0.01}
              value={cursor.y}
              onChange={(e) => setCursor((c) => ({ ...c, y: Number(e.target.value) }))}
              style={{ display: 'block' }}
            />
          </label>
        </div>
      </section>

      <section style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 14, marginBottom: 8 }}>Size</h2>
        <div style={{ display: 'flex', gap: 6 }}>
          {SIZES.map((s) => btn(s.label, size === s.height, () => setSize(s.height)))}
        </div>
      </section>

      <section style={{ marginBottom: 20, padding: 12, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 13, fontFamily: 'monospace' }}>
        <div>base: {base}</div>
        <div>overlay: {overlay ?? '—'}</div>
        <div>hand: {swap.hand}</div>
        <div>mouth: {swap.mouth}</div>
        <div>brows: {swap.brows}</div>
      </section>

      <div
        style={{
          height: size,
          aspectRatio: '400 / 700',
          border: '1px dashed #CBD5E1',
          background: '#FFFFFF',
          display: 'inline-block',
        }}
      >
        <KitoProvider value={state}>
          <Kito />
        </KitoProvider>
      </div>

      <h2 style={{ fontSize: 16, marginTop: 40 }}>State grid</h2>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 12 }}>
        {BASES.map((b) => {
          const s = { ...state, base: b, overlay: null, ...deriveSwap(b, null) };
          return (
            <div key={b} style={{ textAlign: 'center' }}>
              <div style={{ height: 180, aspectRatio: '400 / 700', border: '1px dashed #CBD5E1', background: '#FFFFFF' }}>
                <KitoProvider value={s}>
                  <Kito />
                </KitoProvider>
              </div>
              <p style={{ fontSize: 12, color: '#475569', marginTop: 6 }}>{b}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
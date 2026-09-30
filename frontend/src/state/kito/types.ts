export type KitoBase =
  | 'idle'
  | 'look'
  | 'walk'
  | 'fastScroll'
  | 'settle'
  | 'point'
  | 'search'
  | 'plan'
  | 'work';

export type KitoOverlay = 'success' | 'confused' | null;

export type HandVariant = 'grip' | 'point' | 'thumbsup';
export type MouthVariant = 'smile' | 'open' | 'flat';
export type BrowVariant = 'neutral' | 'raised' | 'furrowed';

export interface KitoState {
  base: KitoBase;
  overlay: KitoOverlay;
  hand: HandVariant;
  mouth: MouthVariant;
  brows: BrowVariant;
  cursorX: number;
  cursorY: number;
}
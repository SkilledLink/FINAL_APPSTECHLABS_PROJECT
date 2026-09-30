# Kito — Animation Reference

## Two layers

**Base** — exactly one active. Lower priority number wins.
**Overlay** — interrupts anything, plays once, returns to the base underneath.

## Base states

| State | Trigger | Priority |
|---|---|---|
| walk | scroll velocity above 200 px/s | 3 |
| fastScroll | scroll velocity above 800 px/s | 2 |
| settle | velocity dropped below 50, easing back | 4 |
| point | pricing / CTA section active | 5 |
| search | services / browse section active | 5 |
| plan | how-it-works section active | 5 |
| work | about / trust section active | 5 |
| look | cursor moved within last 2s | 6 |
| idle | fallback | 7 |

## Overlay states

| State | Trigger | Duration |
|---|---|---|
| success | form submit, signup, booking confirmed | 900ms |
| confused | form error, failed search, 404 | 800ms |

## Timings

All values in `src/state/kito/timings.ts`.

- breath: 3200ms cycle
- blink: 2800–5200ms randomised interval, 90ms duration
- lookFollow: 180ms ease-out
- walkCycle: 480ms per full stride
- crossfade: 150ms

## Reduced motion

`prefers-reduced-motion: reduce` → render static idle, skip all listeners.
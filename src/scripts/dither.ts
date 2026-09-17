/**
 * Ordered-dither core.
 *
 * Everything on this site that looks "1-bit" goes through here: source pixels
 * are reduced to luminance, nudged by a Bayer threshold matrix, then snapped to
 * a small palette ramp. Keeping it in one module means the hero field, the
 * imagery and the logo plates all share the same grain.
 */

export type RGB = [number, number, number];

/**
 * Recursive Bayer matrix, flattened and normalised to roughly -0.5..0.5 so it
 * can be added straight onto a 0..1 luminance value.
 */
export function bayerMatrix(size: number): Float32Array {
  let m: number[][] = [[0]];
  let n = 1;

  while (n < size) {
    const next: number[][] = Array.from({ length: n * 2 }, () => new Array<number>(n * 2).fill(0));
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const v = m[y]![x]! * 4;
        next[y]![x] = v;
        next[y]![x + n] = v + 2;
        next[y + n]![x] = v + 3;
        next[y + n]![x + n] = v + 1;
      }
    }
    m = next;
    n *= 2;
  }

  const out = new Float32Array(size * size);
  const denom = size * size;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      out[y * size + x] = (m[y]![x]! + 0.5) / denom - 0.5;
    }
  }
  return out;
}

export const BAYER_SIZE = 8;
export const BAYER = bayerMatrix(BAYER_SIZE);

/** "#6c5cff" | "#fff" -> [r, g, b] */
export function hexToRgb(hex: string): RGB {
  let h = hex.trim().replace('#', '');
  if (h.length === 3) h = h[0]! + h[0]! + h[1]! + h[1]! + h[2]! + h[2]!;
  const int = Number.parseInt(h, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

/**
 * Expand a handful of colour stops into a flat `levels * 3` ramp. Level 0 is
 * the shadow end, the last level is the highlight end.
 */
export function buildRamp(stops: RGB[], levels: number): Uint8ClampedArray {
  const ramp = new Uint8ClampedArray(levels * 3);
  const last = stops.length - 1;

  for (let i = 0; i < levels; i++) {
    const t = levels === 1 ? 0 : (i / (levels - 1)) * last;
    const lo = Math.min(Math.floor(t), last);
    const hi = Math.min(lo + 1, last);
    const f = t - lo;
    const a = stops[lo]!;
    const b = stops[hi]!;
    ramp[i * 3] = a[0] + (b[0] - a[0]) * f;
    ramp[i * 3 + 1] = a[1] + (b[1] - a[1]) * f;
    ramp[i * 3 + 2] = a[2] + (b[2] - a[2]) * f;
  }
  return ramp;
}

/** Pre-built ramps keyed by level count, so hover transitions never allocate. */
export function rampSet(stops: RGB[], levelCounts: readonly number[]): Uint8ClampedArray[] {
  return levelCounts.map((n) => buildRamp(stops, n));
}

export interface DitherParams {
  /** Flat `levels * 3` colour ramp. */
  ramp: Uint8ClampedArray;
  /** Dither strength. 1 = full grain, 0 = hard posterise. */
  spread: number;
  contrast: number;
  brightness: number;
  /** 0..1 blend from the dithered palette back toward the source colour. */
  reveal: number;
  /** Pointer-local reveal, in buffer pixels. */
  focus: { x: number; y: number; radius: number } | null;
}

const LUM_R = 0.2126;
const LUM_G = 0.7152;
const LUM_B = 0.0722;

/**
 * Dither `src` into `dst` in place. Both must be the same dimensions; `dst` is
 * what gets handed to `putImageData`.
 */
export function ditherInto(
  src: Uint8ClampedArray,
  dst: Uint8ClampedArray,
  width: number,
  height: number,
  p: DitherParams,
): void {
  const levels = p.ramp.length / 3;
  const maxIndex = levels - 1;
  const focus = p.focus;
  const focusR2 = focus ? focus.radius * focus.radius : 0;

  for (let y = 0; y < height; y++) {
    const rowThreshold = (y % BAYER_SIZE) * BAYER_SIZE;

    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = src[i]!;
      const g = src[i + 1]!;
      const b = src[i + 2]!;

      let lum = (LUM_R * r + LUM_G * g + LUM_B * b) / 255;
      lum = (lum - 0.5) * p.contrast + 0.5 + p.brightness;

      const threshold = BAYER[rowThreshold + (x % BAYER_SIZE)]! * p.spread;
      let index = Math.round((lum + threshold) * maxIndex);
      if (index < 0) index = 0;
      else if (index > maxIndex) index = maxIndex;

      const o = index * 3;
      let mix = p.reveal;

      if (focus) {
        const dx = x - focus.x;
        const dy = y - focus.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < focusR2) {
          // smoothstep falloff so the cursor reveal has no hard edge
          const t = 1 - Math.sqrt(d2) / focus.radius;
          const local = t * t * (3 - 2 * t);
          if (local > mix) mix = local;
        }
      }

      if (mix > 0) {
        dst[i] = p.ramp[o]! + (r - p.ramp[o]!) * mix;
        dst[i + 1] = p.ramp[o + 1]! + (g - p.ramp[o + 1]!) * mix;
        dst[i + 2] = p.ramp[o + 2]! + (b - p.ramp[o + 2]!) * mix;
      } else {
        dst[i] = p.ramp[o]!;
        dst[i + 1] = p.ramp[o + 1]!;
        dst[i + 2] = p.ramp[o + 2]!;
      }
      dst[i + 3] = src[i + 3]!;
    }
  }
}

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Frame-rate independent easing toward a target. */
export function approach(current: number, target: number, dt: number, speed = 9): number {
  return current + (target - current) * (1 - Math.exp(-speed * dt));
}

export const prefersReducedMotion = (): boolean =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

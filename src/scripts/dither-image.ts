/**
 * Turns an ordinary <img> into a dithered plate that develops as it scrolls
 * into view and resolves toward the real image under the cursor.
 *
 * The source is rasterised once into a small buffer; after that every frame is
 * a pass over that buffer, so the cost is set by the cell size rather than by
 * how large the picture is on screen.
 */

import {
  approach,
  ditherInto,
  hexToRgb,
  lerp,
  prefersReducedMotion,
  rampSet,
  type DitherParams,
  type RGB,
} from './dither';

/** Level counts the plate steps through as it resolves. */
const LEVEL_STEPS = [4, 5, 6, 8] as const;

const DEFAULT_STOPS = '#050508,#6c5cff,#eceae3';

interface PlateConfig {
  cell: number;
  stops: RGB[];
  /** How far the cursor reveal reaches, in CSS pixels. */
  focusRadius: number;
  /** Peak reveal when hovered, away from the cursor. */
  hoverReveal: number;
}

function readConfig(el: HTMLElement): PlateConfig {
  return {
    cell: Number(el.dataset.ditherCell ?? 4),
    stops: (el.dataset.ditherStops ?? DEFAULT_STOPS).split(',').map((s) => hexToRgb(s)),
    focusRadius: Number(el.dataset.ditherFocus ?? 120),
    hoverReveal: Number(el.dataset.ditherReveal ?? 0.35),
  };
}

function mountPlate(figure: HTMLElement, img: HTMLImageElement): void {
  const config = readConfig(figure);
  const canvas = document.createElement('canvas');
  canvas.className = 'dither-plate';
  canvas.setAttribute('role', 'presentation');
  const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
  if (!ctx) return;

  const ramps = rampSet(config.stops, LEVEL_STEPS);
  const still = prefersReducedMotion();

  const scratch = document.createElement('canvas');
  const scratchCtx = scratch.getContext('2d', { willReadFrequently: true });
  if (!scratchCtx) return;

  let width = 0;
  let height = 0;
  let source: Uint8ClampedArray | null = null;
  let output: ImageData | null = null;

  // Animated state.
  let resolve = 0;
  let resolveTarget = 0;
  let intro = still ? 1 : 0;
  let focusX = 0;
  let focusY = 0;
  let hasFocus = false;

  const params: DitherParams = {
    ramp: ramps[0]!,
    spread: 1,
    contrast: 1.1,
    brightness: 0,
    reveal: 0,
    focus: null,
  };

  function rasterise(): boolean {
    const rect = figure.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;

    const w = Math.max(8, Math.round(rect.width / config.cell));
    const h = Math.max(8, Math.round(rect.height / config.cell));
    if (w === width && h === height && source) return true;

    width = w;
    height = h;
    canvas.width = width;
    canvas.height = height;
    scratch.width = width;
    scratch.height = height;

    // Cover-fit the source into the buffer, matching CSS object-fit: cover.
    const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    scratchCtx!.clearRect(0, 0, width, height);
    scratchCtx!.drawImage(img, (width - dw) / 2, (height - dh) / 2, dw, dh);

    source = scratchCtx!.getImageData(0, 0, width, height).data;
    output = ctx!.createImageData(width, height);
    return true;
  }

  function render(): void {
    if (!source || !output) return;

    const step = Math.min(LEVEL_STEPS.length - 1, Math.round(resolve * (LEVEL_STEPS.length - 1)));
    params.ramp = ramps[step]!;
    // Resting grain first, then fold in the develop-on-scroll ramp.
    const grain = lerp(0.78, 0.3, resolve);
    params.spread = lerp(2.5, grain, intro);
    params.brightness = lerp(-0.2, 0.03, intro);
    params.contrast = lerp(1.1, 1.28, resolve);
    params.reveal = resolve * config.hoverReveal * intro;
    params.focus =
      hasFocus && intro > 0.9
        ? { x: focusX, y: focusY, radius: (config.focusRadius / config.cell) * resolve }
        : null;

    ditherInto(source, output.data, width, height, params);
    ctx!.putImageData(output, 0, 0);
  }

  let last = 0;
  let running = false;

  function settled(): boolean {
    return Math.abs(resolve - resolveTarget) < 0.002 && intro > 0.999 && !hasFocus;
  }

  function loop(time: number): void {
    const dt = last === 0 ? 0.016 : Math.min(0.05, (time - last) / 1000);
    last = time;

    resolve = approach(resolve, resolveTarget, dt, 8);
    intro = approach(intro, 1, dt, 3.2);

    render();

    if (settled()) {
      resolve = resolveTarget;
      intro = 1;
      render();
      running = false;
      return;
    }
    requestAnimationFrame(loop);
  }

  function kick(): void {
    if (running) return;
    running = true;
    last = 0;
    requestAnimationFrame(loop);
  }

  function setFocus(event: PointerEvent): void {
    if (still || event.pointerType === 'touch') return;
    const rect = figure.getBoundingClientRect();
    focusX = ((event.clientX - rect.left) / rect.width) * width;
    focusY = ((event.clientY - rect.top) / rect.height) * height;
    hasFocus = true;
    kick();
  }

  // The whole card is the hover target when there is one, so the plate reacts
  // to the same gesture that lights up the heading.
  const trigger = figure.closest<HTMLElement>('[data-dither-trigger]') ?? figure;

  if (!still) {
    trigger.addEventListener('pointerenter', () => {
      resolveTarget = 1;
      kick();
    });
    trigger.addEventListener('pointerleave', () => {
      resolveTarget = 0;
      hasFocus = false;
      kick();
    });
    trigger.addEventListener('focusin', () => {
      resolveTarget = 1;
      kick();
    });
    trigger.addEventListener('focusout', () => {
      resolveTarget = 0;
      kick();
    });
    figure.addEventListener('pointermove', setFocus);
  }

  const resizeObserver = new ResizeObserver(() => {
    source = null;
    if (rasterise()) render();
  });

  const reveal = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        obs.disconnect();
        if (rasterise()) {
          figure.dataset.ditherReady = 'true';
          render();
          if (!still) kick();
        }
        resizeObserver.observe(figure);
      }
    },
    { rootMargin: '120px' },
  );

  figure.append(canvas);
  reveal.observe(figure);
}

export function mountDitherImages(root: ParentNode = document): void {
  const figures = root.querySelectorAll<HTMLElement>('[data-dither]');

  for (const figure of figures) {
    if (figure.dataset.ditherMounted === 'true') continue;
    figure.dataset.ditherMounted = 'true';

    const img = figure.querySelector('img');
    if (!img) continue;

    if (img.complete && img.naturalWidth > 0) mountPlate(figure, img);
    else img.addEventListener('load', () => mountPlate(figure, img), { once: true });
  }
}

/**
 * The hero's animated dither field.
 *
 * A cheap separable plasma (three sine tables, refreshed once per frame rather
 * than per pixel) plus a pointer bump, pushed through the shared ordered
 * ditherer. Renders into a small buffer that CSS blows back up, so the pixels
 * stay chunky and the cost stays flat regardless of viewport size.
 */

import {
  approach,
  buildRamp,
  clamp01,
  ditherInto,
  hexToRgb,
  prefersReducedMotion,
  type DitherParams,
  type RGB,
} from './dither';

interface FieldOptions {
  /** CSS pixels per dithered cell. Bigger = chunkier and cheaper. */
  cell: number;
  stops: string[];
  levels: number;
}

const MAX_BUFFER_WIDTH = 460;

export function mountField(canvas: HTMLCanvasElement, options: FieldOptions): () => void {
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return () => {};

  const stops: RGB[] = options.stops.map(hexToRgb);
  const ramp = buildRamp(stops, options.levels);
  const still = prefersReducedMotion();

  let width = 0;
  let height = 0;
  let source: ImageData | null = null;
  let output: ImageData | null = null;
  let tableA = new Float32Array(0);
  let tableB = new Float32Array(0);
  let tableC = new Float32Array(0);

  // Pointer state, in buffer coordinates. Eased so the bump trails the cursor.
  let pointerX = -1e4;
  let pointerY = -1e4;
  let targetX = -1e4;
  let targetY = -1e4;
  let pointerEnergy = 0;
  let targetEnergy = 0;

  const params: DitherParams = {
    ramp,
    spread: 1,
    contrast: 1.15,
    brightness: 0,
    reveal: 0,
    focus: null,
  };

  function resize(): void {
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const scale = Math.min(1, MAX_BUFFER_WIDTH / (rect.width / options.cell));
    const next = {
      w: Math.max(8, Math.round((rect.width / options.cell) * scale)),
      h: Math.max(8, Math.round((rect.height / options.cell) * scale)),
    };
    if (next.w === width && next.h === height) return;

    width = next.w;
    height = next.h;
    canvas.width = width;
    canvas.height = height;
    source = ctx!.createImageData(width, height);
    output = ctx!.createImageData(width, height);

    const src = source.data;
    for (let i = 3; i < src.length; i += 4) src[i] = 255;

    tableA = new Float32Array(width);
    tableB = new Float32Array(height);
    tableC = new Float32Array(width + height);
  }

  function render(time: number): void {
    if (!source || !output) return;
    const t = time * 0.00045;

    for (let x = 0; x < width; x++) tableA[x] = Math.sin(x * 0.055 + t * 1.6);
    for (let y = 0; y < height; y++) tableB[y] = Math.sin(y * 0.07 - t * 1.1);
    for (let k = 0; k < tableC.length; k++) tableC[k] = Math.sin(k * 0.031 + t * 0.8);

    const src = source.data;
    const radius = 26 + pointerEnergy * 34;
    const radius2 = radius * radius;
    const invHeight = 1 / height;

    for (let y = 0; y < height; y++) {
      const b = tableB[y]!;
      // Horizon gradient: bright at the top, falling away down the canvas.
      const gradient = 0.62 - y * invHeight * 0.55;
      const dy = y - pointerY;
      const dy2 = dy * dy;

      for (let x = 0; x < width; x++) {
        let v = (tableA[x]! + b + tableC[x + y]!) * 0.19 + gradient;

        if (pointerEnergy > 0.001) {
          const dx = x - pointerX;
          const d2 = dx * dx + dy2;
          if (d2 < radius2) {
            const f = 1 - d2 / radius2;
            v += f * f * pointerEnergy * 0.85;
          }
        }

        const g = clamp01(v) * 255;
        const i = (y * width + x) * 4;
        src[i] = g;
        src[i + 1] = g;
        src[i + 2] = g;
      }
    }

    ditherInto(src, output.data, width, height, params);
    ctx!.putImageData(output, 0, 0);
  }

  let frame = 0;
  let last = 0;
  let running = false;

  function loop(time: number): void {
    const dt = last === 0 ? 0.016 : Math.min(0.05, (time - last) / 1000);
    last = time;

    pointerX = approach(pointerX, targetX, dt, 7);
    pointerY = approach(pointerY, targetY, dt, 7);
    pointerEnergy = approach(pointerEnergy, targetEnergy, dt, 4);

    render(time);
    frame = requestAnimationFrame(loop);
  }

  function start(): void {
    if (running || still) return;
    running = true;
    last = 0;
    frame = requestAnimationFrame(loop);
  }

  function stop(): void {
    if (!running) return;
    running = false;
    cancelAnimationFrame(frame);
  }

  function onPointerMove(event: PointerEvent): void {
    const rect = canvas.getBoundingClientRect();
    targetX = ((event.clientX - rect.left) / rect.width) * width;
    targetY = ((event.clientY - rect.top) / rect.height) * height;
    if (pointerEnergy < 0.01) {
      pointerX = targetX;
      pointerY = targetY;
    }
    targetEnergy = 1;
  }

  function onPointerLeave(): void {
    targetEnergy = 0;
  }

  const observer = new ResizeObserver(() => {
    resize();
    if (still || !running) render(performance.now());
  });
  observer.observe(canvas);

  // Only burn frames while the hero is actually on screen.
  const visibility = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) start();
        else stop();
      }
    },
    { threshold: 0 },
  );
  visibility.observe(canvas);

  const onVisibilityChange = (): void => {
    if (document.hidden) stop();
    else if (canvas.isConnected) start();
  };

  resize();
  render(performance.now());

  if (!still) {
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerleave', onPointerLeave);
    document.addEventListener('visibilitychange', onVisibilityChange);
  }

  return () => {
    stop();
    observer.disconnect();
    visibility.disconnect();
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerleave', onPointerLeave);
    document.removeEventListener('visibilitychange', onVisibilityChange);
  };
}

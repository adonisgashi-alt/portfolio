/**
 * The small interactions: a dithered cursor halo, glyph-scramble on links, and
 * scroll-in reveals. All of them no-op under `prefers-reduced-motion` or on
 * touch, where they would be noise rather than feedback.
 */

import { prefersReducedMotion } from './dither';

const GLYPHS = '▓▒░█▚▞▙▟◣◤/\\|-_=+*#%@$&0123456789';

/** Cursor-following halo that punches a soft hole in the page grain. */
export function mountCursor(): () => void {
  if (prefersReducedMotion() || !matchMedia('(pointer: fine)').matches) return () => {};

  const halo = document.createElement('div');
  halo.className = 'cursor-halo';
  halo.setAttribute('aria-hidden', 'true');
  document.body.append(halo);

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let targetX = x;
  let targetY = y;
  let visible = false;
  let frame = 0;

  const loop = (): void => {
    x += (targetX - x) * 0.18;
    y += (targetY - y) * 0.18;
    halo.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
    frame = requestAnimationFrame(loop);
  };

  const onMove = (event: PointerEvent): void => {
    if (event.pointerType !== 'mouse') return;
    targetX = event.clientX;
    targetY = event.clientY;
    if (!visible) {
      visible = true;
      x = targetX;
      y = targetY;
      halo.dataset.visible = 'true';
    }
    const interactive = (event.target as Element | null)?.closest('a, button, [data-dither-trigger]');
    halo.dataset.active = interactive ? 'true' : 'false';
  };

  const onLeave = (): void => {
    visible = false;
    halo.dataset.visible = 'false';
  };

  window.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerleave', onLeave);
  frame = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerleave', onLeave);
    halo.remove();
  };
}

/**
 * Resolve a label left-to-right out of junk glyphs. The element keeps its real
 * text in the DOM until the animation starts, so screen readers and
 * copy-and-paste never see the scramble.
 */
export function mountScramble(root: ParentNode = document): void {
  if (prefersReducedMotion()) return;

  const targets = root.querySelectorAll<HTMLElement>('[data-scramble]');

  for (const el of targets) {
    const original = el.textContent ?? '';
    if (!original.trim()) continue;

    let frame = 0;
    let running = false;

    const run = (): void => {
      if (running) return;
      running = true;

      const start = performance.now();
      const duration = 90 + original.length * 26;

      const tick = (now: number): void => {
        const t = Math.min(1, (now - start) / duration);
        const settled = Math.floor(t * original.length);
        let out = '';

        for (let i = 0; i < original.length; i++) {
          const char = original[i]!;
          if (i < settled || char === ' ') out += char;
          else out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }

        el.textContent = out;

        if (t < 1) {
          frame = requestAnimationFrame(tick);
        } else {
          el.textContent = original;
          running = false;
        }
      };

      frame = requestAnimationFrame(tick);
    };

    const stop = (): void => {
      cancelAnimationFrame(frame);
      running = false;
      el.textContent = original;
    };

    const trigger = el.closest<HTMLElement>('[data-dither-trigger]') ?? el;
    trigger.addEventListener('pointerenter', run);
    trigger.addEventListener('focusin', run);
    trigger.addEventListener('pointerleave', stop);
    trigger.addEventListener('focusout', stop);
  }
}

/** Adds `data-revealed` as sections scroll in, for a staggered fade-up. */
export function mountReveals(root: ParentNode = document): void {
  const targets = root.querySelectorAll<HTMLElement>('[data-reveal]');
  if (targets.length === 0) return;

  if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
    for (const el of targets) el.dataset.revealed = 'true';
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        (entry.target as HTMLElement).dataset.revealed = 'true';
        obs.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );

  for (const el of targets) observer.observe(el);
}

/**
 * Password gate for the whole site (Vercel Routing Middleware).
 *
 * Runs on Vercel before any page, image or file is served. Visitors without
 * a valid cookie get a password form instead of the page they asked for.
 *
 * The password is NOT in this file — the repo is public. Set it in Vercel:
 *   Project → Settings → Environment Variables → SITE_PASSWORD
 * If SITE_PASSWORD is missing, the site stays locked rather than open.
 *
 * The cookie holds an HMAC keyed by the password, never the password itself,
 * so it can't be forged without knowing the password, and changing the
 * password signs everyone out.
 */
import { next } from '@vercel/functions';

export const config = {
  // Everything except the webfonts the login page itself uses.
  matcher: ['/((?!fonts/).*)'],
};

const COOKIE = 'site_auth';
const UNLOCK_PATH = '/__unlock';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const encoder = new TextEncoder();

async function sign(password: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const mac = await crypto.subtle.sign('HMAC', key, encoder.encode('portfolio-auth-v1'));
  return Array.from(new Uint8Array(mac), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Constant-time string comparison, so response timing leaks nothing. */
function safeEqual(a: string, b: string): boolean {
  const x = encoder.encode(a);
  const y = encoder.encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

function readCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get('cookie') ?? '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return undefined;
}

/** Only allow same-site relative paths as the post-login destination. */
function safeNext(value: FormDataEntryValue | string | null): string {
  const path = typeof value === 'string' ? value : '';
  return path.startsWith('/') && !path.startsWith('//') && !path.startsWith('/\\') ? path : '/';
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function page(opts: { next: string; error?: string; status: number; configured?: boolean }): Response {
  const { next: to, error, status, configured = true } = opts;
  const body = configured
    ? `<form method="post" action="${UNLOCK_PATH}">
        <input type="hidden" name="next" value="${escapeHtml(to)}" />
        <label for="pw" class="visually-hidden">Password</label>
        <div class="row${error ? ' is-invalid' : ''}">
          <input id="pw" name="password" type="password" placeholder="Password" autocomplete="current-password" required autofocus
            ${error ? 'aria-invalid="true" aria-describedby="err"' : ''} />
          <button type="submit">Enter</button>
        </div>
        ${error ? `<p id="err" class="error" role="alert">${escapeHtml(error)}</p>` : ''}
      </form>`
    : `<p class="note">Password protection is switched on but no password has been set yet.</p>`;

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>Adonis Gashi — Portfolio</title>
<style>
  @font-face { font-family: Inter; font-weight: 100 900; font-display: swap; src: url('/fonts/inter-latin.woff2') format('woff2'); }
  @font-face { font-family: 'IBM Plex Mono'; font-weight: 400; font-display: swap; src: url('/fonts/ibm-plex-mono-latin-400.woff2') format('woff2'); }
  :root { --ink: #0a0a0a; --muted: #6b6b6b; --line: #e8e8e8; --bg: #fff; --primary: #a9c8e6; --primary-hover: #95badf; --error: #b42318; }
  /* Follows the device setting unless the visitor picked a theme on the site. */
  :root[data-theme="dark"] { --ink: #f2f2f3; --muted: #a1a1a6; --line: #26262a; --bg: #0b0b0c; --error: #f97066; }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) { --ink: #f2f2f3; --muted: #a1a1a6; --line: #26262a; --bg: #0b0b0c; --error: #f97066; }
  }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100dvh; display: grid; place-items: center; padding: 1.5rem;
    background: var(--bg); color: var(--ink); font: 400 1rem/1.5 Inter, system-ui, sans-serif;
    letter-spacing: -0.019em; font-optical-sizing: auto; -webkit-font-smoothing: antialiased; }
  main { width: 100%; max-width: 22rem; text-align: center; }
  .mark { display: block; width: 4.5rem; height: auto; margin: 0 auto; color: var(--ink); }
  .visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
  p { margin: 0; color: var(--muted); }
  form { margin-top: 3.25rem; text-align: left; }
  /* One pill: the input fills it and the Enter button sits inside, right. */
  .row { display: flex; align-items: center; gap: .25rem; height: 3rem; padding: .25rem;
    border: 1px solid var(--line); border-radius: 999px; transition: border-color .2s; }
  .row:focus-within { border-color: var(--primary); box-shadow: 0 0 0 1px var(--primary); }
  .row.is-invalid { border-color: var(--error); box-shadow: none; }
  input { flex: 1; min-width: 0; height: 100%; padding: 0 .75rem; border: 0; border-radius: 999px;
    background: transparent; color: inherit; font: inherit; outline: none; }
  input::placeholder { color: var(--muted); opacity: 1; }
  button { flex: none; height: 100%; padding: 0 1.125rem; border: 0; border-radius: 999px; background: var(--primary);
    color: #0a0a0a; font: inherit; font-weight: 500; cursor: pointer; }
  button:hover { background: var(--primary-hover); }
  button:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }

  /* Logo draw-on — same strokes and timing as the site's nav logo. */
  .logo-intro .mark circle, .logo-intro .mark path {
    stroke-dasharray: 1 1; animation: draw var(--d) cubic-bezier(.65,0,.35,1) var(--delay) both; }
  .logo-intro .a-ring { --d: .6s; --delay: .15s; }
  .logo-intro .a-stem { --d: .3s; --delay: .6s; }
  .logo-intro .g-ring { --d: .6s; --delay: .5s; }
  .logo-intro .g-tail { --d: .65s; --delay: .95s; }
  @keyframes draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
  .error { margin-top: .75rem; color: var(--error); font-size: .875rem; letter-spacing: 0; text-align: center; }
  .note { margin-top: 2rem; }
</style>
<script>
  try {
    var t = localStorage.getItem('theme');
    if (t === 'dark' || t === 'light') document.documentElement.dataset.theme = t;
  } catch (e) {}

  // Same rule and storage key as the site's Layout.astro: play on the first
  // page of a visit or a reload. Playing here marks it as played, so the site
  // is static after sign-in; a wrong-password redraw is static too.
  (function () {
    var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var entry = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    var reload = !!entry && entry.type === 'reload';
    var played;
    try {
      played = sessionStorage.getItem('logo-intro-played') === '1';
      sessionStorage.setItem('logo-intro-played', '1');
    } catch (e) {
      played = document.referrer.indexOf(location.origin) === 0;
    }
    if (!reduced && (reload || !played)) document.documentElement.classList.add('logo-intro');
  })();
</script>
</head>
<body>
<main>
  <svg class="mark" viewBox="0 0 512 362" fill="none" stroke="currentColor" stroke-width="55" aria-hidden="true">
    <circle class="a-ring" cx="120" cy="120" r="92.5" pathLength="1" transform="matrix(1 0 0 -1 0 240)"/>
    <path class="a-stem" d="M212.5 119V240" pathLength="1"/>
    <circle class="g-ring" cx="392" cy="120" r="92.5" pathLength="1" transform="matrix(1 0 0 -1 0 240)"/>
    <path class="g-tail" d="M484.5 119V334.5H185" pathLength="1"/>
  </svg>
  <h1 class="visually-hidden">Private portfolio</h1>
  ${body}
</main>
</body>
</html>`;

  return new Response(html, {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex, nofollow',
    },
  });
}

export default async function middleware(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const password = process.env.SITE_PASSWORD;

  // Fail closed: no password configured means nobody gets in.
  if (!password) return page({ next: '/', status: 503, configured: false });

  const expected = await sign(password);

  if (url.pathname === UNLOCK_PATH && request.method === 'POST') {
    const form = await request.formData().catch(() => null);
    const to = safeNext(form?.get('next') ?? null);
    const attempt = form?.get('password');

    if (typeof attempt === 'string' && safeEqual(await sign(attempt), expected)) {
      return new Response(null, {
        status: 303,
        headers: {
          location: to,
          'cache-control': 'no-store',
          'set-cookie': `${COOKIE}=${expected}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
        },
      });
    }
    return page({ next: to, error: 'That password isn’t right. Try again.', status: 401 });
  }

  const cookie = readCookie(request, COOKIE);
  if (cookie && safeEqual(cookie, expected)) {
    // Signed in: serve the page as normal, but keep it out of search results.
    return next({ headers: { 'x-robots-tag': 'noindex, nofollow' } });
  }

  return page({ next: url.pathname + url.search, status: 401 });
}

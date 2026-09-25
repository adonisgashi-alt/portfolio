# Portfolio — Adonis Gashi

Personal portfolio site for Adonis Gashi, Senior Visual Designer at Commerce
(formerly BigCommerce) in Austin, Texas. The design is modelled on
[designsystems.surf](https://designsystems.surf/): a white page, one centred
column, medium-weight headlines with tightened tracking, pale image tiles and
hairline rules, with a single light-blue accent.

- **Framework:** [Astro](https://astro.build) — a static-site framework for
  content-heavy sites. Pages are mostly plain HTML/CSS with minimal JS, so
  the site is fast and SEO-friendly.
- **Content:** each case study is a Markdown file in `src/content/work/`.
  Frontmatter holds the structure (cover, stats, sections, quote, gallery)
  and the Markdown body holds the overview copy. No CMS or database.
- **Styling:** plain CSS with design tokens (color, type, space, measure)
  defined in `src/styles/global.css`, so the whole site stays consistent.
- **Hosting:** [Vercel](https://vercel.com), connected directly to this
  GitHub repo. Every push to `main` auto-builds and deploys.
- **Version control:** GitHub — pages, components, content and images all
  live in this repo.

## Getting started

1. Install [Node.js](https://nodejs.org) (LTS).
2. Clone the repo and install dependencies:

   ```bash
   git clone https://github.com/adonisgashi-alt/portfolio.git
   cd portfolio
   npm install
   ```

3. Start the dev server:

   ```bash
   npm run dev
   ```

   The site is live at `http://localhost:4321` and reloads as you edit.

## Pages

| Route          | What it is                                              |
| -------------- | ------------------------------------------------------- |
| `/`            | Home — hero, featured work, approach, current role, CTA |
| `/work`        | Every project, largest first, plus a discipline index   |
| `/work/[slug]` | An individual case study                                |
| `/about`       | Bio, experience, capabilities, LinkedIn                 |
| `/contact`     | Email and LinkedIn, and what to get in touch about      |

## Project structure

```
src/
  components/
    Footer.astro       Site footer
    Nav.astro          Sticky translucent nav bar
    Placeholder.astro  Stand-in panel for artwork not shot yet
    WorkCard.astro     Project card used on Home and Work
  content/
    work/              One Markdown file per case study
  content.config.ts    Schema for the "work" collection
  data/
    site.ts            Name, role, location, email, LinkedIn, nav items
  layouts/
    Layout.astro       Page shell (head, nav, footer, scroll reveal)
  pages/
    index.astro        Home
    work/index.astro   Work index
    work/[slug].astro  Case study template
    about.astro        About
    contact.astro      Contact
    404.astro          Not found
  styles/
    global.css         Design tokens, base styles, utility classes
public/
  favicon.svg
```

## Editing the site

**Your details** — name, role, company, location, email and LinkedIn all
come from `src/data/site.ts`. Change them there once.

> The email address in that file (`hello@adonisgashi.com`) is a placeholder.
> Swap it for the address you want published before going live.

**Case study copy** — the projects are real (the Commerce rebrand, BigSummit,
NRF, B2B, CPQ, Catalyst) and the narrative is written from the actual scope of
the role, but the section copy is a starting point, not a record. Read it
through and correct anything that misstates what you did before publishing.

**Adding a project** — copy any file in `src/content/work/` and edit the
frontmatter:

```yaml
title: Project name
client: Commerce
year: '2026'
role: Senior Visual Designer
summary: One sentence, shown on the card and under the title.
disciplines: ['Brand', 'Campaign', 'Web design']
featured: true     # show it on the home page
order: 1           # lower numbers come first on /work
cover:
  label: What this image will be
  ratio: '16 / 9'
  tone: light      # light | mid | dark
scope:             # optional band describing what the work covered
  - value: Web
    label: Templates, landing pages, components
sections:          # narrative sections, in order
  - eyebrow: The brief
    title: Section headline
    body: A paragraph.
    layout: split  # full | split | split-reverse
    image:
      label: What this image will be
      ratio: '4 / 3'
      tone: light
quote:             # optional pull quote
  text: Something someone said.
  attribution: Their role
gallery:           # optional three-up grid
  - label: Detail shot
    ratio: '1 / 1'
    tone: light
---

The Markdown body becomes the overview paragraphs near the top of the page.
```

Set `draft: true` to keep a project out of the build.

**Swapping in real imagery** — every image on the site is a
`<Placeholder />` component with a `label`, `ratio` and `tone`. When the real
artwork exists, drop the file in `public/` and replace the component with a
normal `<img>` (or Astro's `<Image />`) at the same aspect ratio; the
surrounding layout won't move.

## Design notes

- **Type** matches designsystems.surf. Its fonts were identified from the
  glyphs embedded in a saved copy of the page:
  - Inter for all text, self-hosted with its optical-size axis, so headlines
    at 32px and up render in the tighter Inter Display cut. Headlines and
    buttons are weight 500 and body text is 400.
  - IBM Plex Mono, 12px uppercase, for small labels such as "WHERE I'VE
    WORKED".
- **Tracking** was measured per size from the reference and lives in
  `global.css` as `--tracking-*` tokens:

  | Size | Letter-spacing |
  | --- | --- |
  | 56px display | -0.029em |
  | 40px headline | -0.02em |
  | 32px title | -0.01em |
  | 20px subhead | -0.029em |
  | 18px large body | -0.009em |
  | 16px body | -0.019em |
  | 14px small text | 0 |

- **Color** is white and near-black neutrals plus one primary, a light
  desaturated blue (`--color-primary: #a9c8e6`). Text links on that blue use
  a darker ink (`--color-primary-ink: #2d5a84`) so they pass WCAG AA
  contrast. The dark theme comes from the toggle in the nav.
- **Buttons** are pills: light blue for the main action, solid black for the
  second, as in the reference.
- **Layout** is one column 1136px wide under a slim full-width top bar.
  Content is left-aligned, and sections are separated by space and hairlines
  rather than shadows.
- **Motion** is a single fade-and-rise on scroll, and it's turned off when the
  visitor has reduced motion set (`prefers-reduced-motion`).

## Password protection

The whole site sits behind a password, enforced by Vercel Routing Middleware
(`middleware.ts`) before any page, image or file is served. Visitors get a
password form. Once they enter the right password, a signed cookie keeps them
signed in for 30 days.

The password is **not** in the code, because this repo is public. It's read
from the `SITE_PASSWORD` environment variable:

1. In Vercel, open the project → **Settings** → **Environment Variables**.
2. Add `SITE_PASSWORD`, tick **Production** and **Preview**, and save.
3. Redeploy (**Deployments** → latest → **Redeploy**) so it takes effect.

- **Missing password:** if `SITE_PASSWORD` isn't set, the site stays locked
  and says no password has been configured. It never falls open.
- **Changing it:** change the variable and redeploy. This also signs out
  everyone who was signed in.
- **Removing it:** delete `middleware.ts` to take the password off.
- **Local development:** `npm run dev` doesn't run the middleware, so local
  development is unaffected.

## Deploying

This repo is meant to be connected directly to Vercel:

1. In the [Vercel dashboard](https://vercel.com/new), import this GitHub
   repository.
2. Vercel auto-detects Astro — no build settings to change.
3. Every push to `main` deploys to production; other branches get preview
   URLs.

Update `site` in `astro.config.mjs` to the real domain so canonical URLs and
the sitemap are correct.

## Commands

| Command           | Action                                                |
| ----------------- | ----------------------------------------------------- |
| `npm install`     | Install dependencies                                  |
| `npm run dev`     | Start local dev server at `localhost:4321`            |
| `npm run build`   | Type-check and build the production site to `./dist/` |
| `npm run preview` | Preview the production build locally                  |

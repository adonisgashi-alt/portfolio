# Portfolio

Personal portfolio site, built the same way as [SimplySheet](#):

- **Framework:** [Astro](https://astro.build) — a static-site framework for
  content-heavy sites. Pages are mostly plain HTML/CSS with minimal JS, so
  the site is fast and SEO-friendly.
- **Content:** articles live as Markdown (`.md`) or MDX (`.mdx`) files in
  `src/content/articles/` — frontmatter (title, description, tags, publish
  date) plus the article text. No CMS or database.
- **Styling:** plain CSS with design tokens (colors, spacing, type) defined
  in `src/styles/global.css`, so the whole site stays visually consistent.
- **Hosting:** [Vercel](https://vercel.com), connected directly to this
  GitHub repo. Every push to `main` auto-builds and deploys. No manual
  deploy steps.
- **Version control:** GitHub — the whole codebase (pages, components,
  articles, images) lives in this repo. Changes are made on branches and
  merged in.

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

4. Edit or add Markdown files in `src/content/articles/`, or edit the pages
   in `src/pages/`. Push your changes to a branch and open a pull request.

## Project structure

```
src/
  components/
    BrandMark.astro    Brand lockup (placeholder mark + name)
    DitherFigure.astro An <img> that mounts as a dithered canvas plate
    HeroField.astro    The interactive dither field behind the hero
    Marquee.astro      Scrolling capability ticker
    WorkCard.astro     Brand card used on the home and work pages
  content/
    articles/       Markdown/MDX articles (title, description, tags, date)
  content.config.ts Defines the "articles" content collection + schema
  data/
    brands.ts       The brands the work section is built from
  layouts/
    Layout.astro    Shared page shell (head, header, footer)
  pages/
    index.astro     Home page
    about.astro     About page
    projects.astro  Work page (brands + side projects)
    articles/       Articles index + individual article pages
  scripts/
    dither.ts       Bayer matrix, palette ramps, the dither pass
    dither-image.ts Mounts image plates; develop-in and hover-resolve
    field.ts        The animated hero field
    interactions.ts Cursor halo, text scramble, scroll reveals
  styles/
    global.css      Design tokens and base styles
public/
  brands/         Drop real brand logos here (see below)
  work/           Placeholder artwork for the work plates
  favicon.svg
```

## The dither system

Every piece of imagery on the site is rendered through one ordered-dither
pass in `src/scripts/dither.ts`: pixels are reduced to luminance, nudged by
an 8x8 Bayer threshold matrix, then snapped to a short colour ramp. Nothing
is pre-rendered, so changing a colour in `brands.ts` changes the artwork.

Three things use it:

- **The hero field** (`HeroField.astro`) — a cheap procedural plasma with a
  bump that follows your pointer.
- **Image plates** (`DitherFigure.astro`) — each one *develops* out of noise
  as it scrolls into view, and resolves toward the real image while you hover,
  with a softer reveal right under the cursor.
- **The page grain** — CSS rather than canvas: a 50% checkerboard (what a
  Bayer threshold collapses to) plus scanlines, fixed over the whole page.

Everything is rendered into a small buffer and scaled up with
`image-rendering: pixelated`, so cost is set by the cell size rather than by
how big the picture is on screen. Animation loops stop when the element
scrolls off, when the tab is hidden, and when the values settle. Under
`prefers-reduced-motion` the plates render one static frame and the cursor
halo, scramble and marquee switch off entirely.

Tuning knobs, per `<DitherFigure />`:

| Prop      | What it does                                             |
| --------- | -------------------------------------------------------- |
| `cell`    | CSS pixels per dither cell — bigger is chunkier and cheaper |
| `stops`   | Ramp as `shadow,mid,highlight` hex values                 |
| `focus`   | Radius of the cursor reveal, in CSS pixels                |
| `reveal`  | How far the plate resolves on hover, 0–1                  |

## Placeholder assets

The brand logos and the work imagery are **stand-ins, not the real assets**:

- The marks in `BrandMark.astro` are generic 1-bit geometry set next to the
  brand name — they are not the brands' trademarked logos.
- The artwork in `public/work/` is abstract SVG, coloured to sit near each
  brand but carrying none of their content.

To swap in the real thing:

1. Put the logo in `public/brands/` and point the `logo` field in
   `src/data/brands.ts` at it, e.g. `logo: '/brands/commerce.svg'`. The
   built-in mark is then skipped entirely.
2. Replace the matching file in `public/work/` with a real screenshot or
   photograph. Anything the browser can draw works — the ditherer rasterises
   it at runtime. Smooth, tonal images dither best; flat screenshots with
   fine text get chewed up, so raise `cell` or lower the dither `spread` for
   those.

The copy in `src/data/brands.ts` (roles, dates, contribution bullets) is
placeholder too — worth a pass before this goes anywhere public.

## Deploying

This repo is meant to be connected directly to Vercel:

1. In the [Vercel dashboard](https://vercel.com/new), import this GitHub
   repository.
2. Vercel auto-detects Astro — no build settings to change.
3. Every push to `main` deploys to production automatically; pushes to
   other branches get their own preview URL.

## Commands

| Command           | Action                                      |
| ------------------ | -------------------------------------------- |
| `npm install`       | Install dependencies                        |
| `npm run dev`       | Start local dev server at `localhost:4321`  |
| `npm run build`     | Type-check and build the production site to `./dist/` |
| `npm run preview`   | Preview the production build locally        |

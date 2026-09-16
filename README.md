# Portfolio — Adonis Gashi

Personal portfolio site for a visual designer. The design is modelled on
Apple's marketing pages: a monochromatic palette, tight display typography,
large imagery and generous vertical rhythm.

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

**Adding a project** — copy any file in `src/content/work/` and edit the
frontmatter:

```yaml
title: Project name
client: Client
year: '2026'
role: Your role
summary: One sentence, shown on the card and under the title.
disciplines: ['Brand identity', 'Art direction']
featured: true     # show it on the home page
order: 1           # lower numbers come first on /work
cover:
  label: What this image will be
  ratio: '16 / 9'
  tone: light      # light | mid | dark
stats:             # optional band of numbers
  - value: '40+'
    label: Templates shipped
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

- **Color** is monochromatic — white, `#f5f5f7`, `#1d1d1f` and black, with
  grey text at `#6e6e73` / `#86868b`. Dark mode is supported automatically
  via `prefers-color-scheme`.
- **Type** uses the system stack (SF Pro on Apple devices), with a fluid
  display scale and tight negative tracking.
- **Sections** alternate white, `#f5f5f7` and full-black bands. Black bands
  re-map the color tokens, so anything placed inside them inverts on its own.
- **Motion** is a single fade-and-rise on scroll, disabled entirely under
  `prefers-reduced-motion`.

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

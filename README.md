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

## Design

The visual direction takes its cue from [designsystems.surf](https://designsystems.surf/):
a white page, a fixed left index, soft pale cards, minimal shadows and a dark
closing call-to-action.

- **Type:** Inter (variable, self-hosted via `@fontsource-variable/inter`) with
  optical sizing on, so large headings use the tighter Display cut. Tracking
  is tightened everywhere: `-0.011em` body, `-0.018em` → `-0.042em` from
  small headings up to display sizes.
- **Color:** one light, softly desaturated blue (`--color-primary: #a9c8e6`),
  a darker ink version for text links (`--color-primary-ink`), and neutrals.
  Dark mode is included.
- All tokens live in `src/styles/global.css`.

## Sitemap

| Page | Path | Purpose |
| --- | --- | --- |
| Home | `/` | Positioning, selected work, capabilities, process, writing, CTA |
| Work | `/work` | All case studies, filterable by category |
| Case study | `/work/<slug>` | Summary, outcomes, project facts, contents, story, next project |
| About | `/about` | Bio, experience, capabilities, toolkit, CV |
| Writing | `/articles` | Articles list and article pages |

`/projects` redirects to `/work`.

## Editing content

- **Your details** (name, email, socials, stats, experience) are in
  `src/data/site.ts`. Anything marked `PLACEHOLDER` is sample copy.
- **Case studies** are Markdown files in `src/content/work/`. The four
  included projects are placeholders: replace them with real work. Add a
  `cover:` image path (under `/public`) to replace the generated cover.

## Project structure

```
src/
  content/
    articles/       Markdown/MDX articles (title, description, tags, date)
    work/           Case studies (client, role, year, outcomes, cover)
  components/       Sidebar, ProjectCard, Cover, CtaPanel
  data/site.ts      Name, contact, socials, stats, experience
  content.config.ts Defines the "articles" and "work" collections + schemas
  layouts/
    Layout.astro    Page shell: left index, main column, CTA, footer
  pages/
    index.astro     Home page
    about.astro     About page
    work/           Work index + case study pages
    404.astro       Not-found page
    articles/       Articles index + individual article pages
  styles/
    global.css      Design tokens and base styles
public/
  favicon.svg
```

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

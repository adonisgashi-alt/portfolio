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
  content/
    articles/       Markdown/MDX articles (title, description, tags, date)
  content.config.ts Defines the "articles" content collection + schema
  layouts/
    Layout.astro    Shared page shell (head, header, footer)
  pages/
    index.astro     Home page
    about.astro     About page
    projects.astro  Projects list
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

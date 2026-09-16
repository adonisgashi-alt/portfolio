---
title: How this site is built
description: A quick rundown of the stack behind this portfolio — Astro, Markdown content, and Vercel hosting.
publishDate: 2026-09-16
tags: [meta, astro]
---

This site is built with [Astro](https://astro.build), a framework built for
content-heavy sites. Most pages are plain HTML/CSS with very little
JavaScript, which keeps things fast and easy for search engines to index.

Articles like this one live as Markdown files in `src/content/articles/`.
Each file is just frontmatter (title, description, tags, a publish date)
plus the article text — no CMS, no database.

Styling comes from a single set of design tokens (colors, spacing, type) in
`src/styles/global.css`, so the whole site stays visually consistent without
repeating values everywhere.

The site is hosted on [Vercel](https://vercel.com), connected directly to
the GitHub repo. Every push to `main` triggers an automatic build and
deploy — no manual deploy steps.

To run it locally:

```bash
npm install
npm run dev
```

Then edit or add Markdown files, push to a branch, and open a pull request.

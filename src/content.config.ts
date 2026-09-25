import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

// Case studies. Lower `order` shows first; `featured` projects appear on the
// home page. `cover` is a path in /public (e.g. /work/halden/cover.jpg); leave
// it out to get a generated placeholder tinted with `tint`.
const work = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    client: z.string(),
    summary: z.string(),
    year: z.number(),
    category: z.enum(['Brand', 'Product', 'Design System', 'Art Direction']),
    disciplines: z.array(z.string()).default([]),
    role: z.string(),
    team: z.string().optional(),
    duration: z.string().optional(),
    outcomes: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
    cover: z.string().optional(),
    tint: z.string().default('#a9c8e6'),
    order: z.number().default(100),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

export const collections = { articles, work };

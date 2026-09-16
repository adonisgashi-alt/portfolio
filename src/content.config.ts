import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** A slot where real artwork will eventually live. */
const image = z.object({
  label: z.string(),
  /** CSS aspect-ratio, e.g. "16 / 9". */
  ratio: z.string().default('16 / 9'),
  tone: z.enum(['light', 'mid', 'dark']).default('light'),
  caption: z.string().optional(),
});

const work = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    client: z.string(),
    year: z.string(),
    role: z.string(),
    /** One sentence, used on the card and under the project title. */
    summary: z.string(),
    disciplines: z.array(z.string()).default([]),
    cover: image,
    /** Lower numbers come first on /work. */
    order: z.number().default(99),
    featured: z.boolean().default(false),
    /** Short band of what the work covered — words, not invented metrics. */
    scope: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .default([]),
    sections: z
      .array(
        z.object({
          eyebrow: z.string().optional(),
          title: z.string(),
          body: z.string(),
          image: image.optional(),
          layout: z.enum(['full', 'split', 'split-reverse']).default('full'),
        })
      )
      .default([]),
    quote: z.object({ text: z.string(), attribution: z.string() }).optional(),
    gallery: z.array(image).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { work };

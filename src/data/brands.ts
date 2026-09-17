/**
 * The brands the work section is built from.
 *
 * Placeholders, on purpose: the marks in `BrandMark.astro` are generic
 * geometry set alongside the brand name, not the real trademarked logos, and
 * the imagery in `public/work/` is abstract. To use the real assets, drop a
 * file into `public/brands/` and point `logo` at it, and replace the matching
 * file in `public/work/`. Nothing else needs to change.
 */

export interface Brand {
  id: string;
  name: string;
  /** Path to a real logo file, e.g. '/brands/commerce.svg'. Falls back to the built-in mark. */
  logo?: string;
  url: string;
  /** Drives the plate palette and the card's hover accent. */
  accent: string;
  /** Dither ramp: shadow → mid → highlight. */
  stops: string;
  years: string;
  role: string;
  summary: string;
  contributions: string[];
  image: string;
  imageAlt: string;
}

export const brands: Brand[] = [
  {
    id: 'commerce',
    name: 'Commerce',
    url: 'https://www.commerce.com/',
    accent: '#6c5cff',
    stops: '#050508,#8f82ff,#ecebe4',
    years: '2025 — now',
    role: 'Design & front-end',
    summary:
      'The parent brand tying BigCommerce, Feedonomics and Makeswift together. Work here is about making one identity hold up across three products that grew up separately.',
    contributions: [
      'Shared design language and component primitives',
      'Marketing site templates and page systems',
      'Motion and interaction guidelines',
    ],
    image: '/work/commerce.svg',
    imageAlt: 'Abstract placeholder artwork for the Commerce brand.',
  },
  {
    id: 'bigcommerce',
    name: 'BigCommerce',
    url: 'https://www.bigcommerce.com/',
    accent: '#0d52ff',
    stops: '#050508,#3d74ff,#ecebe4',
    years: '2023 — now',
    role: 'Front-end',
    summary:
      'The open SaaS storefront platform. The interesting problems are the ones about scale: templates that thousands of merchants bend in directions nobody planned for.',
    contributions: [
      'Storefront templates and theme work',
      'Conversion-focused landing page builds',
      'Performance and Core Web Vitals passes',
    ],
    image: '/work/bigcommerce.svg',
    imageAlt: 'Abstract placeholder artwork for the BigCommerce brand.',
  },
  {
    id: 'feedonomics',
    name: 'Feedonomics',
    url: 'https://www.feedonomics.com/',
    accent: '#ff8a3d',
    stops: '#050508,#ff8a3d,#ecebe4',
    years: '2023 — now',
    role: 'Front-end',
    summary:
      'Product feed management — catalogue data cleaned up and pushed out to every marketplace worth selling on. Dense, data-heavy interfaces that have to stay readable.',
    contributions: [
      'Data-dense interface patterns',
      'Documentation and reference site work',
      'Campaign and launch pages',
    ],
    image: '/work/feedonomics.svg',
    imageAlt: 'Abstract placeholder artwork for the Feedonomics brand.',
  },
];

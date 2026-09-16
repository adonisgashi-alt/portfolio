/**
 * Single source of truth for the small bits of copy that appear in more than
 * one place. Edit here, not in the pages.
 */
export const site = {
  name: 'Adonis Gashi',
  role: 'Visual Designer',
  company: 'Commerce',
  tagline: 'Visual designer shaping brand, product and campaign work at Commerce.',
  location: 'Kansas City, Missouri',
  /* TODO: swap for the address you want published. */
  email: 'hello@adonisgashi.com',
  linkedin: 'https://www.linkedin.com/in/adonisgashi/',
  linkedinHandle: 'linkedin.com/in/adonisgashi',
  url: 'https://adonisgashi.com',
} as const;

export const nav = [
  { label: 'Home', href: '/' },
  { label: 'Work', href: '/work' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const;

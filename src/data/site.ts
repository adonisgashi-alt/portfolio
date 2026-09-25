// Site-wide content. Everything marked PLACEHOLDER is sample copy — replace
// it with your own details before launch.

export const site = {
  name: 'Adonis Gashi',
  initials: 'AG',
  role: 'Senior Visual Designer',
  location: 'Remote — working worldwide', // PLACEHOLDER
  email: 'hello@example.com', // PLACEHOLDER
  url: 'https://example.com',
  availability: {
    open: true,
    label: 'Available for new projects', // PLACEHOLDER
  },
  description:
    'Senior visual designer working across brand identity, product interfaces and design systems.',
  socials: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/' }, // PLACEHOLDER
    { label: 'Dribbble', href: 'https://dribbble.com/' }, // PLACEHOLDER
    { label: 'Read.cv', href: 'https://read.cv/' }, // PLACEHOLDER
    { label: 'GitHub', href: 'https://github.com/adonisgashi-alt' },
  ],
  resume: '#', // PLACEHOLDER — link a PDF in /public, e.g. '/adonis-gashi-cv.pdf'
};

export const nav = [
  { label: 'Home', href: '/' },
  { label: 'Work', href: '/work', collection: 'work' as const },
  { label: 'About', href: '/about' },
  { label: 'Writing', href: '/articles', collection: 'articles' as const },
];

// PLACEHOLDER numbers — keep them honest and verifiable.
export const stats = [
  { value: '10+', label: 'Years in brand & product' },
  { value: '40+', label: 'Launches shipped' },
  { value: '3', label: 'Design systems built' },
];

export const capabilities = [
  {
    title: 'Brand identity',
    body: 'Positioning-led identities that scale from a favicon to a billboard.',
    items: ['Logo & wordmark', 'Visual language', 'Brand guidelines'],
  },
  {
    title: 'Product & UI',
    body: 'Interfaces with a clear hierarchy and a point of view, built with engineering.',
    items: ['Web & mobile UI', 'Prototyping', 'Marketing sites'],
  },
  {
    title: 'Design systems',
    body: 'Foundations, tokens and components that keep large teams consistent.',
    items: ['Tokens & theming', 'Component libraries', 'Documentation'],
  },
  {
    title: 'Art direction',
    body: 'Campaign, illustration and motion direction that gives a brand its voice.',
    items: ['Campaign concepts', 'Illustration systems', 'Motion principles'],
  },
];

export const process = [
  { title: 'Understand', body: 'Stakeholder interviews, audits and a sharp brief everyone signs off on.' },
  { title: 'Explore', body: 'Wide territories early, then fast convergence on one strong direction.' },
  { title: 'Systemise', body: 'Turn the direction into tokens, rules and components that scale.' },
  { title: 'Ship & steward', body: 'Hand-off, rollout support and measuring what changed.' },
];

// PLACEHOLDER experience — replace with your own.
export const experience = [
  { period: '2023 — Now', role: 'Senior Visual Designer', org: 'Independent', note: 'Brand and product work for startups and scale-ups.' },
  { period: '2020 — 2023', role: 'Lead Visual Designer', org: 'Product studio', note: 'Led visual design across a portfolio of B2B products.' },
  { period: '2017 — 2020', role: 'Visual Designer', org: 'Brand agency', note: 'Identity systems and campaigns for consumer brands.' },
  { period: '2015 — 2017', role: 'Junior Designer', org: 'Design studio', note: 'Editorial, print and early web work.' },
];

export const tools = ['Figma', 'Adobe Illustrator', 'Photoshop', 'After Effects', 'Rive', 'Framer', 'Tokens Studio', 'Blender'];

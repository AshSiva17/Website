/**
 * Personalize this file — swap placeholders with your details.
 * Questions to answer as you fill this in:
 * - What one-line positioning statement belongs in heroDeck?
 * - Which 3–6 projects best represent you (title, role, stack, link)?
 * - What roles, companies, and date ranges define your experience?
 */

export const site = {
  name: 'Your Name',
  /** Lead paragraph on the home page */
  heroDeck:
    "I'm a student and I'm kind of obsessed with technical problems — the kind where you don't really know the answer at first and have to poke at the system until it makes sense. I built this little site to keep my projects, photos, and stuff I've worked on in one place.",

  /** Footer + profile link (e.g. mailto) */
  contact: {
    email: 'you@example.com',
    github: 'https://github.com/yourhandle',
    linkedin: 'https://www.linkedin.com/in/yourhandle',
  },

  /** Replace with your photo: set `profileImage` to `/your-photo.jpg` in `public/` */
  profileImage: '/profile-placeholder.svg',

  photos: [
    {
      src: 'https://picsum.photos/seed/photo-a/900/600',
      alt: 'Placeholder frame A',
      caption: 'Replace with your image — edit `src/content/site.ts`.',
    },
    {
      src: 'https://picsum.photos/seed/photo-b/900/600',
      alt: 'Placeholder frame B',
      caption: 'Outdoor light, 35mm.',
    },
    {
      src: 'https://picsum.photos/seed/photo-c/900/600',
      alt: 'Placeholder frame C',
      caption: 'City geometry.',
    },
    {
      src: 'https://picsum.photos/seed/photo-d/900/600',
      alt: 'Placeholder frame D',
      caption: 'Late afternoon.',
    },
  ],

  projects: [
    {
      kicker: 'Product',
      title: 'Atlas routing console',
      deck: 'Internal tool for ops teams to trace parcel flows with live maps and anomaly flags.',
      href: 'https://example.com',
      year: '2025',
    },
    {
      kicker: 'Open source',
      title: 'streamline-ts',
      deck: 'Typed helpers for resilient fetch pipelines and backoff — fewer boilerplate retries.',
      href: 'https://github.com/example/streamline-ts',
      year: '2024',
    },
    {
      kicker: 'Experiment',
      title: 'Night-reader CLI',
      deck: 'Terminal RSS reader with keyboard-first navigation and offline cache.',
      href: 'https://example.com',
      year: '2023',
    },
  ],

  experience: [
    {
      kicker: 'Full-time',
      title: 'Senior Software Engineer',
      org: 'Northwind Labs',
      location: 'Remote',
      start: '2022',
      end: 'Present',
      bullets: [
        'Led redesign of core billing service; cut p99 latency by 38%.',
        'Mentored two engineers through their first production on-call rotations.',
      ],
    },
    {
      kicker: 'Contract',
      title: 'Frontend Engineer',
      org: 'Riverlight Studio',
      location: 'Toronto',
      start: '2020',
      end: '2022',
      bullets: [
        'Shipped marketing and app surfaces in React with a strict design system.',
        'Built accessibility audits into CI for critical user paths.',
      ],
    },
    {
      kicker: 'Internship',
      title: 'Software Intern',
      org: 'Cedar Analytics',
      location: 'Montreal',
      start: '2019',
      end: '2020',
      bullets: [
        'Implemented ETL monitoring dashboards used by data science stakeholders.',
      ],
    },
  ],
}

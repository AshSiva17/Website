/**
 * Personalize this file — swap placeholders with your details.
 * Questions to answer as you fill this in:
 * - What one-line positioning statement belongs in heroDeck?
 * - Which 3–6 projects best represent you (title, role, stack, link)?
 * - What roles, companies, and date ranges define your experience?
 */

export const site = {
  name: 'Ashwin Sivabalan',
  /** Lead paragraph on the home page */
  heroDeck:
    "I'm a student at McMaster University studying Computer Science and Business. I'm interested in software development and building products that help people. I'm currently working on a project to help people learn about the stock market. Outside of school, I'm a huge sports fan and love to play basketball, soccer, and football. Right now I'm enjoying the NBA playoffs and Champions League semifinals.",

  /** Footer + profile link (e.g. mailto) */
  contact: {
    email: 'sivabalanashwin@example.com',
    github: 'https://github.com/ashsiva17',
    linkedin: 'https://www.linkedin.com/in/ashwin-sivabalan-6559ba329/',
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
      title: 'Local Image Optimizer',
      deck: 'An image optimizer using React, Ruby, and C++, enabling batch processing of 50+ images with a local pipeline.',
      year: 'April 2026',
    },
    {
      title: 'Healthspan',
      deck: ' A full-stack health content platform using Next.js and React, serving articles and videos to 500+ users.',
      year: 'February 2026',
    },
    {
      title: 'JamAI',
      deck: ' A full-stack AI music studio using React and Node.js, enabling users to generate, edit, and export songs.',
      year: 'February 2026',
    },
  ],

  experience: [
    {
      title: 'Full-stack Developer',
      org: 'Crow Report',
      location: 'Remote',
      start: 'January 2026',
      end: 'March 2026',
      bullets: [
        'Built a React aggregation platform integrating 100+ sources via APIs and scraping, enabling automated updates.',
        'Implemented personalized recommendation logic using user behavior tracking, boosting engagement by 25%.',
        'Developed admin dashboards and CMS tools for content moderation and management, reducing manual workload.',
        'Conducted usability testing with 15+ users, identifying UX issues and driving improvements to increase retention.',
        'Optimized API calls, caching, and frontend rendering, reducing latency by 35% and improving overall responsiveness.',
      ],
    },
    {
      title: 'Software Engineer Intern',
      org: 'NewsTruffle',
      location: 'Remote',
      start: 'July 2025',
      end: 'August 2025',
      bullets: [
        'Developed responsive web pages using frontend frameworks, improving accessibility across desktop and mobile devices.',
        'Collaborated with developers to debug frontend issues, reducing user-reported bugs by 15% and improving stability.',
        'Integrated Google Analytics and AdSense, enabling traffic insights and monetization tracking for 10K+ monthly users.',
        'Contributed to feature development and deployment cycles, accelerating release times by 20% through faster iteration.',
      ],
    },
    {
      title: 'Software Engineer',
      org: 'Skool HMW',
      location: 'Brampton',
      start: 'May 2024',
      end: 'August 2024',
      bullets: [
        'Developed core features for an education platform, improving assignment tracking and usability for 200+ active users.',
        'Built backend systems to handle 1K+ student submissions, improving data retrieval efficiency by 30%.',
        'Collaborated with team members on feature design and iteration, improving functionality based on user feedback.',
        'Tested and debugged application components, increasing system reliability and reducing runtime errors by 35%.',
      ],
    },
  ],
}

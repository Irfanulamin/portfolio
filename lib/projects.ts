export type Project = {
  name: string;
  description: string;
  href: string;
  logo: string;
  /** Shown in the cursor pill when hovering the project. [Text] is underlined. */
  cursor: string;
  /** What it's built with. Names with a known icon get one. */
  stack: string[];
  /** Source code, if public. */
  repo?: string;
};

export const projects: Project[] = [
  {
    name: "Chefalio",
    description:
      "A full-stack recipe marketplace for browsing, publishing, and selling recipes and cookbooks. Built and shipped independently, from data model to deployment.",
    href: "https://www.chefalio.xyz/",
    logo: "/projects/chefalio-logo.png",
    cursor: "Visit [chefalio.xyz]",
    stack: ["Next.js", "TypeScript", "Tailwind", "shadcn/ui", "NestJS", "MongoDB", "Stripe", "Socket.IO"],
    repo: "https://github.com/Irfanulamin/chefalio",
  },
  {
    name: "MidnightUX",
    description:
      "A design and development studio building brand-led sites and product interfaces. Worked across the front end, from layout and motion through to production deployment.",
    href: "https://www.midnightux.com/",
    logo: "/projects/midnightux-logo.png",
    cursor: "Visit [midnightux.com]",
    stack: ["Next.js", "TypeScript", "Tailwind", "GSAP", "Motion", "Lenis"],
    repo: "https://github.com/Irfanulamin/midnightux",
  },
];

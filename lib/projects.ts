export type Project = {
  name: string;
  description: string;
  href: string;
  logo: string;
};

export const projects: Project[] = [
  {
    name: "MidnightUX",
    description:
      "A design and development studio building brand-led sites and product interfaces. Worked across the front end, from layout and motion through to production deployment.",
    href: "https://www.midnightux.com/",
    logo: "/projects/midnightux-logo.png",
  },
  {
    name: "Chefalio",
    description:
      "A full-stack recipe marketplace for browsing, publishing, and selling recipes and cookbooks. Built and shipped independently, from data model to deployment.",
    href: "https://www.chefalio.xyz/",
    logo: "/projects/chefalio-logo.png",
  },
];
